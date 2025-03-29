
import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import NavbarTwo from "~/components/navbarTwo";
import CheckboxTwo from "~/components/CheckBoxTwo";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";

export default function ChecklistScreen() {
  const navigation = useNavigation();
  const [checklistItems, setChecklistItems] = useState([]);
  const [checkedItemIds, setCheckedItemIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { userData, token } = useSelector((state: RootState) => state.auth);
  const userId = userData?.data?._id || "";

  // Fetch user data including checklist progress
  const fetchUserData = async () => {
    try {
      const response = await axios.get("https://zapllo.com/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        // Get the user's checked items from the response
        const userCheckedItems = response.data.data.checklistProgress || [];
        setCheckedItemIds(userCheckedItems);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch checklist items
  const fetchChecklistItems = async () => {
    try {
      const response = await axios.get("https://zapllo.com/api/checklist/get");
      if (response.data && response.data.checklistItems) {
        setChecklistItems(response.data.checklistItems);
      }
    } catch (error) {
      console.error("Error fetching checklist items:", error);
    }
  };

  // Update user's checklist progress on the server
  const updateChecklistProgress = async (itemId, isChecked) => {
    setUpdating(true);
    try {
      const endpoint = isChecked 
        ? "https://zapllo.com/api/users/checklist/add" 
        : "https://zapllo.com/api/users/checklist/remove";
      
      await axios.post(endpoint, 
        { checklistItemId: itemId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local state after successful server update
      if (isChecked) {
        setCheckedItemIds(prev => [...prev, itemId]);
      } else {
        setCheckedItemIds(prev => prev.filter(id => id !== itemId));
      }
    } catch (error) {
      console.error(`Error ${isChecked ? 'adding' : 'removing'} checklist item:`, error);
      // Revert the UI change if the server update fails
      await fetchUserData();
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch both user data and checklist items in parallel
        await Promise.all([fetchUserData(), fetchChecklistItems()]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCheckboxToggle = (item) => {
    if (updating) return; // Prevent multiple clicks while updating
    
    const itemId = item._id;
    const isCurrentlyChecked = checkedItemIds.includes(itemId);
    
    // Toggle the checked state
    updateChecklistProgress(itemId, !isCurrentlyChecked);
  };

  const isItemChecked = (itemId) => {
    return checkedItemIds.includes(itemId);
  };

  const calculateProgress = () => {
    if (checklistItems.length === 0) return 0;
    return (checkedItemIds.length / checklistItems.length) * 100;
  };

  return (
    <SafeAreaView className="h-full w-full flex-1 bg-[#05071E]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full">
        <ScrollView 
          className="h-full w-full flex-grow" 
          showsVerticalScrollIndicator={false} 
          showsHorizontalScrollIndicator={false}
        >
          <NavbarTwo title="Checklist" />
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
                <ActivityIndicator size="large" color="#815BF5" />
              ) : (
                checklistItems.map((item) => (
                  <View key={item._id} className="flex w-full flex-row gap-3 items-center">
                    <CheckboxTwo
                      isChecked={isItemChecked(item._id)}
                      onPress={() => handleCheckboxToggle(item)}
                    />
                    <Text 
                      className={`text-white text-sm pr-1 ${isItemChecked(item._id) ? 'opacity-70' : ''}`} 
                      style={{ fontFamily: "LatoBold" }}
                    >
                      {item.text}
                    </Text>
                  </View>
                ))
              )}
              {updating && (
                <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-black bg-opacity-20 rounded-xl">
                  <ActivityIndicator size="small" color="#815BF5" />
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
