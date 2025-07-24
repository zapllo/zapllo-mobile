import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator
} from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import NavbarTwo from "~/components/navbarTwo";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from "@react-navigation/stack";
import ToggleSwitch from "~/components/ToggleSwitch";
import WeeklyButtons from "~/components/WeeklyButtons";
import GradientButton from "~/components/GradientButton";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import { backend_Host } from "~/config";
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "react-native-modal";
import CustomSplashScreen from "~/components/CustomSplashScreen";

export default function NotificationScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { token } = useSelector((state: RootState) => state.auth);

  // State for user notification settings
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [emailReminders, setEmailReminders] = useState(false);
  const [whatsappReminders, setWhatsappReminders] = useState(false);
  const [weeklyOffs, setWeeklyOffs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dailyReminderTime, setDailyReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);

  const dayNameMap: { [key: string]: string } = {
    Sun: "Sunday",
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
  };

  // Fetch user notification settings
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await axios.get(`${backend_Host}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = response.data.data;
        setEmailNotifications(user.notifications?.email ?? false);
        setWhatsappNotifications(user.notifications?.whatsapp ?? false);
        setEmailReminders(user.reminders?.email ?? false);
        setWhatsappReminders(user.reminders?.whatsapp ?? false);

        // Convert API time (HH:mm) to Date object correctly
        if (user.reminders?.dailyReminderTime) {
          const [hours, minutes] = user.reminders.dailyReminderTime.split(":").map(Number);
          setDailyReminderTime(new Date(new Date().setHours(hours, minutes, 0, 0)));
        }
        // Convert abbreviated days ["Sun", "Sat"] to full day names
        if (user.weeklyOffs) {
          setWeeklyOffs(user.weeklyOffs.map((day: string) => dayNameMap[day] || day));
        }
      } catch (error) {
        console.error("Error fetching user notification settings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUserSettings();
  }, [token]);

  // Function to update notification settings
  const updateSettings = async () => {
    setSaving(true);
    try {
      const formattedTime = dailyReminderTime
        ? `${dailyReminderTime.getHours().toString().padStart(2, "0")}:${dailyReminderTime.getMinutes().toString().padStart(2, "0")}`
        : "09:00"; // Default fallback

      const shortDayNames = weeklyOffs.map(
        (fullDay) => Object.keys(dayNameMap).find((abbr) => dayNameMap[abbr] === fullDay) || fullDay
      );

      const response = await axios.patch(
        `${backend_Host}/users/update-notifications`,
        {
          notifications: { email: emailNotifications, whatsapp: whatsappNotifications },
          reminders: {
            email: emailReminders,
            whatsapp: whatsappReminders,
            dailyReminderTime: formattedTime,
          },
          weeklyOffs: shortDayNames, // Send short day names to API
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        console.log("Settings updated successfully!");
        // Show success splash screen
        setShowSuccessSplash(true);
      } else {
        console.error("Failed to update settings:", response.data);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="bg-[#05071E] h-full w-full">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>

          {/* Navbar */}
          <NavbarTwo title="Notification Settings" onBackPress={() => navigation.goBack()} />

          <View className="flex items-center flex-col w-full justify-center mb-12 mt-7">
            {loading ? (
              <ActivityIndicator size="large" color="#FFFFFF" className="mt-10" />
            ) : (
              <>
                <ToggleSwitch isOn={emailNotifications} onToggle={setEmailNotifications} title="Email Notification" />
                <ToggleSwitch isOn={whatsappNotifications} onToggle={setWhatsappNotifications} title="WhatsApp Notification" />
                <View className="h-[0.5px] w-[90%] bg-[#37384B] mt-5 mb-5"></View>

                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="flex flex-row justify-between items-center w-[90%] mt-4 py-3 px-4 bg-[#1E2142] rounded-xl"
                >
                  <Text className="text-white text-sm">Daily Reminder Time</Text>
                  <Text className="text-gray-400">
                    {dailyReminderTime instanceof Date && !isNaN(dailyReminderTime.getTime())
                      ? dailyReminderTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
                      : "Select Time"}
                  </Text>
                </TouchableOpacity>

                <Modal isVisible={showTimePicker} onBackdropPress={() => setShowTimePicker(false)}>
                  <View className="bg-[#191B3A] p-4 rounded-xl">
                    <DateTimePicker
                      value={dailyReminderTime}
                      mode="time"
                      textColor="white"
                      display="spinner"
                      is24Hour={false}
                      onChange={(event, selectedTime) => {
                        setShowTimePicker(false);
                        if (selectedTime) setDailyReminderTime(selectedTime);
                      }}
                    />
                  </View>
                </Modal>

                <ToggleSwitch isOn={emailReminders} onToggle={setEmailReminders} title="Email Reminders" />
                <ToggleSwitch isOn={whatsappReminders} onToggle={setWhatsappReminders} title="WhatsApp Reminders" />
                <View className="h-[0.5px] w-[90%] bg-[#37384B] mt-5 mb-5"></View>

                {/* Weekly Offs Selection */}
                <WeeklyButtons selectedDays={weeklyOffs} onSelectDay={(day) => {
                  setWeeklyOffs(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
                }} />

                <GradientButton title={saving ? "Saving..." : "Save Settings"} imageSource={""} onPress={updateSettings} disabled={saving} />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Splash Screen for Success */}
      <CustomSplashScreen
        visible={showSuccessSplash}
        lottieSource={require('../../../assets/Animation/success.json')}
        mainText="Settings Saved!"
        subtitle="Your notification settings have been updated successfully."
        onDismiss={() => setShowSuccessSplash(false)}
        onComplete={() => setShowSuccessSplash(false)}
        duration={3000}
        gradientColors={["#05071E", "#0A0D28"]}
        textGradientColors={["#815BF5", "#FC8929"]}
      />
    </SafeAreaView>
  );
}