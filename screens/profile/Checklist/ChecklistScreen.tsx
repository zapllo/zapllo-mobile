import React, { useState } from "react";
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import NavbarTwo from "~/components/navbarTwo";
import CheckboxTwo from "~/components/CheckBoxTwo";

export default function ChecklistScreen() {
  const navigation = useNavigation();
  const totalItems = 14;
  const [checkedItems, setCheckedItems] = useState(Array(totalItems).fill(false));

  const handleCheckboxToggle = (index: number) => {
    const updatedCheckedItems = [...checkedItems];
    updatedCheckedItems[index] = !updatedCheckedItems[index];
    setCheckedItems(updatedCheckedItems);
  };

  const calculateProgress = () => {
    const checkedCount = checkedItems.filter(Boolean).length;
    return (checkedCount / totalItems) * 100;
  };

  const checklistTexts = [
    "Add all your employees as Team members or Managers to that Task app. Go to My Team to manage users.",
    "Connect your own WhatsApp number to send notifications & reminders from your company’s number. Raise a ticket for further support on this.",
    "Set Daily Reminder Time and Weekly Offs. Go to Settings > General and click on Notifications and Reminder.",
    "Enable/Disable WhatsApp and email notifications according to your requirement.",
    "Create at least 5 Task Categories. Go to Settings > Categories to manage them.",
    "Use ZAPLLO AI to create multiple categories as per your business needs",
    "Delegate your first task and update its status. Check your Email and WhatsApp for the notifications.",
    "Try Voice Note feature while assigning a task.",
    "Add attachments/photos while assigning a task.",
    "Add Task Reminders: Set up reminders to alert you before a task’s deadline.",
    "Create Daily/Weekly/Monthly/Periodically/Custom repeating tasks.",
    "Attach the image/attachment/voice note while updating the task for more clarity about the task.",
    "Reopen the task if a user closes the task without completing it.",
    "Analyze team member performance in a single dashboard."
  ];

  return (
    <SafeAreaView className="h-full w-full flex-1 bg-[#05071E]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="w-full">
        <ScrollView className="h-full w-full flex-grow" showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>
          <NavbarTwo title="Checklist" onBackPress={() => navigation.goBack()} />
          <View className="items-center flex flex-col mt-5">
            <View className="w-[90%] my-3 flex h-36 flex-col items-start rounded-3xl border border-[#37384B] bg-opacity-50 px-6 pt-4">
              <Text className="text-2xl pb-4 font-bold text-white" style={{ fontFamily: "LatoBold" }}>Checklist Progress</Text>
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
                <Text className="text-[#787CA5] text-xs mt-1" style={{ fontFamily: "LatoRegular" }}>{calculateProgress().toFixed(0)}% Completed</Text>
              </View>
            </View>

            <View className="flex flex-col bg-[#0A0D28] rounded-xl p-6 shadow-md  gap-7 items-center w-[90%] pr-12 mt-8">
              {checklistTexts.map((text, index) => (
                <View key={index} className="flex w-full flex-row gap-3 items-center">
                  <CheckboxTwo
                    isChecked={checkedItems[index]}
                    onPress={() => handleCheckboxToggle(index)}
                  />
                  <Text className="text-white text-sm pr-1" style={{ fontFamily: "LatoBold" }}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}