import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import NavbarTwo from "~/components/navbarTwo";
import CheckboxTwo from "~/components/CheckBoxTwo";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";

export default function ChecklistScreen() {
  const navigation = useNavigation();
  const [checklistItems, setChecklistItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useSelector((state: RootState) => state.auth);
  const userId = userData?.data?._id || "anonymous";
  const STORAGE_KEY = `@zapllo_checklist_${userId}`;

  // Load saved checklist state from AsyncStorage
  const loadSavedChecklistState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
      return null;
    } catch (error) {
      console.error("Error loading saved checklist state:", error);
      return null;
    }
  };

  // Save checklist state to AsyncStorage
  const saveChecklistState = async (items, checked) => {
    try {
      const state = {
        items,
        checked,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving checklist state:", error);
    }
  };

  useEffect(() => {
    const fetchChecklistItems = async () => {
      setLoading(true);
      try {
        // First try to load saved state
        const savedState = await loadSavedChecklistState();
        
        // Fetch fresh data from API
        const response = await axios.get("https://zapllo.com/api/checklist/get");
        const apiItems = response.data.checklistItems;
        
        setChecklistItems(apiItems);
        
        // If we have saved state and the number of items matches
        if (savedState && savedState.items.length === apiItems.length) {
          setCheckedItems(savedState.checked);
        } else {
          // Initialize all items as unchecked
          setCheckedItems(Array(apiItems.length).fill(false));
        }
      } catch (error) {
        console.error("Error fetching checklist items:", error);
        // If API fails, try to use saved state as fallback
        const savedState = await loadSavedChecklistState();
        if (savedState) {
          setChecklistItems(savedState.items);
          setCheckedItems(savedState.checked);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChecklistItems();
  }, []);

  // Save state whenever checked items change
  useEffect(() => {
    if (checklistItems.length > 0 && checkedItems.length > 0) {
      saveChecklistState(checklistItems, checkedItems);
    }
  }, [checkedItems, checklistItems]);

  const handleCheckboxToggle = (index: number) => {
    const updatedCheckedItems = [...checkedItems];
    updatedCheckedItems[index] = !updatedCheckedItems[index];
    setCheckedItems(updatedCheckedItems);
  };

  const calculateProgress = () => {
    if (checklistItems.length === 0) return 0;
    const checkedCount = checkedItems.filter(Boolean).length;
    return (checkedCount / checklistItems.length) * 100;
  };

  return (
    <SafeAreaView className="h-full w-full flex-1 bg-[#05071E]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full">
        <ScrollView 
          className="h-full w-full flex-grow" 
          showsVerticalScrollIndicator={false} 
          showsHorizontalScrollIndicator={false}
        >
          <NavbarTwo title="Checklist" onBackPress={() => navigation.goBack()} />
          <View className="items-center flex flex-col mt-5">
            <View className="w-[90%] my-3 flex h-36 flex-col items-start rounded-3xl border border-[#37384B] bg-opacity-50 px-6 pt-4">
              <Text className="text-2xl pb-4 font-bold text-white" style={{ fontFamily: "LatoBold" }}>
                Checklist Progress
              </Text>
              <View className="h-full w-full">
                <View style={{ width: '100%', height: 9, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 5 }}>
                  <LinearGradient
                    colors={['#815BF5', '#FC8929']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: `${calculateProgress()}%`,
                      height: '100%',
                      borderRadius: 5,
                    }}
                  />
                </View>
                <Text className="text-[#787CA5] text-xs mt-1" style={{ fontFamily: "LatoRegular" }}>
                  {calculateProgress().toFixed(0)}% Completed
                </Text>
              </View>
            </View>

            <View className="flex flex-col bg-[#0A0D28] rounded-xl p-6 shadow-md gap-7 items-center w-[90%] pr-12 mt-8">
              {loading ? (
                <Text className="text-white text-center py-4">Loading checklist items...</Text>
              ) : (
                checklistItems.map((item, index) => (
                  <View key={item._id} className="flex w-full flex-row gap-3 items-center">
                    <CheckboxTwo
                      isChecked={checkedItems[index]}
                      onPress={() => handleCheckboxToggle(index)}
                    />
                    <Text className="text-white text-sm pr-1" style={{ fontFamily: "LatoBold" }}>
                      {item.text}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}