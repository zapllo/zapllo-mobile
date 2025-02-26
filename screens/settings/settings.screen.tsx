import { View, Text, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Image, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { StackNavigationProp } from "@react-navigation/stack";
import NavbarTwo from "~/components/navbarTwo";
import { router, useNavigation } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import SettingEditableComponent from "~/components/settings/SettingEditableComponent";
import SettingEditableForNumberComponent from "~/components/settings/SettingEditableForNumberComponent";
import { backend_Host } from "~/config";

type RootStackParamList = {
  "(routes)/home/index": undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList, "(routes)/home/index">;

export default function SettingScreen() {
  const { token } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<NavigationProp>();

  // State for company details
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch company details
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await axios.get(`${backend_Host}/organization/getById`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.data) {
          setCompany(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCompanyDetails();
    }
  }, [token]);

  return (
    <SafeAreaView className="bg-[#05071E] h-full w-full">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {/* Navbar */}
          <NavbarTwo title="Settings" onBackPress={() => navigation.goBack()} />

          <View className="flex items-center w-[90%] self-center mt-3 h-full mb-12">
            {loading ? (
              <ActivityIndicator size="large" color="#FFFFFF" className="mt-10" />
            ) : (
              <>
                {/* Settings List */}
                <View className="w-full rounded-2xl bg-[#0A0D28] p-4 shadow-md">
                  {/* Company Name */}
                  <View className="w-full py-3">
                    <Text className="text-[#787CA5] text-xs">Company Name</Text>
                    <SettingEditableComponent title={company?.companyName || "N/A"} />
                  </View>
                  <View className="h-[1px] w-full bg-[#37384B]" />

                  {/* Industry */}
                  <View className="w-full py-3">
                    <Text className="text-[#787CA5] text-xs">Industry</Text>
                    <SettingEditableComponent title={company?.industry || "N/A"} />
                  </View>
                  <View className="h-[1px] w-full bg-[#37384B]" />

                  {/* Description */}
                  <View className="w-full py-3">
                    <Text className="text-[#787CA5] text-xs">Company Description</Text>
                    <SettingEditableComponent title={company?.description || "N/A"} />
                  </View>
                  <View className="h-[1px] w-full bg-[#37384B]" />

                  {/* Team Size */}
                  <View className="w-full py-3">
                    <Text className="text-[#787CA5] text-xs">Team Size</Text>
                    <SettingEditableForNumberComponent title={company?.teamSize || "N/A"} />
                  </View>
                </View>

                {/* Notifications & Reminders */}
                <View className="w-full rounded-2xl bg-[#0A0D28] p-4 mt-6 shadow-md">
                  <Text className="text-[#787CA5] text-xs mb-2">Notifications & Reminders</Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(routes)/settings/notification" as any)}
                    className="flex flex-row items-center justify-between py-3"
                  >
                    <Text className="text-white text-base">Notifications & Reminders</Text>
                    <Image source={require("../../assets/commonAssets/smallGoto.png")} className="w-3 h-3 mb-1" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
