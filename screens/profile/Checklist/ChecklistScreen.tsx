
import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, TouchableOpacity, Linking } from "react-native";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import NavbarTwo from "~/components/navbarTwo";
import CheckboxTwo from "~/components/CheckBoxTwo";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import { Entypo, Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

// Define interface for checklist items
interface ChecklistItem {
  _id: string;
  text: string;
  tutorialLink?: string;
}

export default function ChecklistScreen() {
  const navigation = useNavigation();
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { userData, token } = useSelector((state: RootState) => state.auth);
  const userId = userData?.data?._id || "";

  // Fetch user data including checklist progress
  const fetchUserData = async () => {
    try {
      const response = await axios.get("https://zapllo.com/api/get-checklist-progress", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.progress) {
        // Get the user's checked items from the response
        setCheckedItemIds(response.data.progress || []);
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
  const updateChecklistProgress = async (itemId: string, isChecked: boolean) => {
    setUpdating(true);
    try {
      // Update local state immediately for better UX
      const updatedProgress = isChecked
        ? [...checkedItemIds, itemId]
        : checkedItemIds.filter(id => id !== itemId);
      
      setCheckedItemIds(updatedProgress);
      
      // Show confetti if item is being checked
      if (isChecked) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      // Send update to server
      await axios.patch("https://zapllo.com/api/update-checklist-progress", 
        { 
          checklistItemId: itemId,
          isCompleted: isChecked 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error(`Error updating checklist progress:`, error);
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

  const handleCheckboxToggle = (item: ChecklistItem) => {
    if (updating) return; // Prevent multiple clicks while updating
    
    const itemId = item._id;
    const isCurrentlyChecked = checkedItemIds.includes(itemId);
    
    // Toggle the checked state
    updateChecklistProgress(itemId, !isCurrentlyChecked);
  };

  const isItemChecked = (itemId: string) => {
    return checkedItemIds.includes(itemId);
  };

  const calculateProgress = () => {
    if (checklistItems.length === 0) return 0;
    return Math.round((checkedItemIds.length / checklistItems.length) * 100);
  };

  const openTutorialLink = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    }
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
          
          {showConfetti && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}>
              {/* <LottieView
                source={require('~/assets/animations/confetti.json')}
                autoPlay
                loop={false}
                style={{ flex: 1 }}
                resizeMode="cover"
              /> */}
            </View>
          )}
          
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
                  {calculateProgress()}% Completed
                </Text>
              </View>
            </View>

            <View className="flex flex-col bg-[#0A0D28] rounded-xl p-6 shadow-md gap-7 items-center w-[90%] mt-8">
              {loading ? (
                <ActivityIndicator size="large" color="#815BF5" />
              ) : (
                checklistItems.map((item) => (
                  <View key={item._id} className="flex w-full flex-row justify-between items-center">
                    <View className="flex flex-row gap-3 items-center flex-1">
                      <CheckboxTwo
                        isChecked={isItemChecked(item._id)}
                        onPress={() => handleCheckboxToggle(item)}
                      />
                      <Text 
                        className={`text-white text-sm pr-1 flex-1 ${isItemChecked(item._id) ? 'opacity-70 line-through' : ''}`} 
                        style={{ fontFamily: "LatoBold" }}
                      >
                        {item.text}
                      </Text>
                    </View>
                    
                    {item.tutorialLink && (
                      <TouchableOpacity 
                        onPress={() => openTutorialLink(item.tutorialLink)}
                        className="h-8 w-8 rounded-full border border-[#37384B] items-center justify-center"
                      >
                        <Feather name="video" size={16} color="#787CA5" />
                      </TouchableOpacity>
                    )}
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
