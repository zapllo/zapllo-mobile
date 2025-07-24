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
import SettingEditableDropdownComponent from "~/components/settings/SettingEditableDropdownComponent";
import { backend_Host } from "~/config";
import CustomSplashScreen from "~/components/CustomSplashScreen";

type RootStackParamList = {
  "(routes)/home/index": undefined;
};
type NavigationProp = StackNavigationProp<RootStackParamList, "(routes)/home/index">;

const industryData = [
  { label: 'Retail/E-Commerce', value: 'Retail/E-Commerce' },
  { label: 'Technology', value: 'Technology' },
  { label: 'Service Provider', value: 'Service Provider' },
  { label: 'Healthcare(Doctors/Clinics/Physicians/Hospital)', value: 'Healthcare(Doctors/Clinics/Physicians/Hospital)' },
  { label: 'Logistics', value: 'Logistics' },
  { label: 'Financial Consultants', value: 'Financial Consultants' },
  { label: 'Trading', value: 'Trading' },
  { label: 'Education', value: 'Education' },
  { label: 'Manufacturing', value: 'Manufacturing' },
  { label: 'Real Estate/Construction/Interior/Architects', value: 'Real Estate/Construction/Interior/Architects' },
  { label: 'Others', value: 'Others' },
];

export default function SettingScreen() {
  const { token } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<NavigationProp>();

  // State for company details
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<{[key: string]: string | number}>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // State for success splash screen
  const [isSplashVisible, setIsSplashVisible] = useState(false);

  // Function to collect field updates
  const updateField = (fieldName: string, value: string | number) => {
    setUpdatedFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setHasChanges(true);
  };

  // Function to handle splash screen completion
  const handleSplashComplete = () => {
    setIsSplashVisible(false);
  };

  // Function to update all company details
  const updateCompanyDetails = async () => {
    if (!hasChanges) return;
    
    setSaving(true);
    try {
      const response = await axios.patch(
        `${backend_Host}/organization/update`,
        updatedFields,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        // Update local state with the response data
        setCompany(response.data.data);
        setUpdatedFields({});
        setHasChanges(false);
        
        // Show success splash screen instead of alert
        setIsSplashVisible(true);
      } else {
        alert("Failed to update organization");
      }
    } catch (error) {
      console.error("Error updating organization:", error);
      alert("An error occurred while updating the organization");
    } finally {
      setSaving(false);
    }
  };

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
          <NavbarTwo title="Settings" />

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
                    <SettingEditableComponent 
                      title={updatedFields.companyName?.toString() || company?.companyName || "N/A"} 
                      onSave={(value) => updateField("companyName", value)}
                      fieldName="company name"
                    />
                  </View>
                  <View className="h-[1px] w-full bg-[#37384B]" />

                  {/* Industry */}
                  <View className="w-full py-3">
                    <Text className="text-[#787CA5] text-xs">Industry</Text>
                    <SettingEditableDropdownComponent 
                      title={updatedFields.industry?.toString() || company?.industry || "N/A"} 
                      onSave={(value) => updateField("industry", value)}
                      fieldName="industry"
                      options={industryData}
                    />
                  </View>
                  <View className="h-[1px] w-full bg-[#37384B]" />

                  {/* Description */}
                  <View className="w-full py-3">
                    <Text className="text-[#787CA5] text-xs">Company Description</Text>
                    <SettingEditableComponent 
                      title={updatedFields.description?.toString() || company?.description || "N/A"} 
                      onSave={(value) => updateField("description", value)}
                      fieldName="description"
                    />
                  </View>
                  <View className="h-[1px] w-full bg-[#37384B]" />

                  {/* Team Size */}
                  <View className="w-full py-3">
                    <Text className="text-[#787CA5] text-xs">Team Size</Text>
                    <SettingEditableForNumberComponent 
                      title={updatedFields.teamSize || company?.teamSize || "N/A"} 
                      onSave={(value) => updateField("teamSize", value)}
                      fieldName="team size"
                    />
                  </View>
                </View>

                {/* Update Button */}
                {hasChanges && (
                  <TouchableOpacity
                    onPress={updateCompanyDetails}
                    className="w-full bg-[#815BF5] rounded-xl py-4 mt-6"
                  >
                    <Text className="text-white text-center font-bold text-base">
                      {saving ? "Updating..." : "Update Organization"}
                    </Text>
                  </TouchableOpacity>
                )}

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

                {saving && (
                  <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center">
                    <ActivityIndicator size="large" color="#FFFFFF" />
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Success Splash Screen */}
      <CustomSplashScreen
        visible={isSplashVisible}
        lottieSource={require("../../assets/Animation/success.json")}
        mainText="Organization Updated Successfully"
        subtitle="Your organization details have been updated"
        onComplete={handleSplashComplete}
        onDismiss={() => setIsSplashVisible(false)}
        duration={3000}
      />
    </SafeAreaView>
  );
}