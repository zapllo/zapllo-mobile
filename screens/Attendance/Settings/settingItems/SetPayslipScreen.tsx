import { Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, TextInput, Image } from "react-native";
import React, { useState } from "react";
import NavbarTwo from "~/components/navbarTwo";
import { KeyboardAvoidingView } from "react-native";
import * as ImagePicker from 'expo-image-picker';

export default function SetPayslipScreen() {
  // State for company details
  const [companyName, setCompanyName] = useState("Zapllo Technologies Private Limited");
  const [companyAddress, setCompanyAddress] = useState("166A PO - Bangur Avenue - Kolkata");
  const [contactNumber, setContactNumber] = useState("7064267635");
  const [email, setEmail] = useState("support@zapllo.com");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // State for edit modes
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  // Temporary values for editing
  const [tempName, setTempName] = useState(companyName);
  const [tempAddress, setTempAddress] = useState(companyAddress);
  const [tempContact, setTempContact] = useState(contactNumber);
  const [tempEmail, setTempEmail] = useState(email);

  // Handle image picking
  const pickImage = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch the image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCompanyLogo(result.assets[0].uri);
    }
  };

  // Handle edit toggle for company name
  const toggleEditName = () => {
    if (isEditingName) {
      // Save changes
      setCompanyName(tempName);
    } else {
      // Start editing
      setTempName(companyName);
    }
    setIsEditingName(!isEditingName);
  };

  // Handle edit toggle for company address
  const toggleEditAddress = () => {
    if (isEditingAddress) {
      // Save changes
      setCompanyAddress(tempAddress);
    } else {
      // Start editing
      setTempAddress(companyAddress);
    }
    setIsEditingAddress(!isEditingAddress);
  };

  // Handle edit toggle for contact number
  const toggleEditContact = () => {
    if (isEditingContact) {
      // Save changes
      setContactNumber(tempContact);
    } else {
      // Start editing
      setTempContact(contactNumber);
    }
    setIsEditingContact(!isEditingContact);
  };

  // Handle edit toggle for email
  const toggleEditEmail = () => {
    if (isEditingEmail) {
      // Save changes
      setEmail(tempEmail);
    } else {
      // Start editing
      setTempEmail(email);
    }
    setIsEditingEmail(!isEditingEmail);
  };

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Set Payslip" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-[90%] mt-8 flex items-center flex-col">
              <View className="h-44 w-44 rounded-full border border-dashed border-[#815BF5] overflow-hidden justify-center items-center ">
                {companyLogo ? (
                  <Image 
                    source={{ uri: companyLogo }} 
                    className="h-full w-full" 
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-[#787CA5]">Company Logo</Text>
                )}
              </View>
              <TouchableOpacity 
                className="bg-[#37384B] p-3 rounded-full mt-4 px-6"
                onPress={pickImage}
              >
                <Text className="text-white">Change Logo</Text>
              </TouchableOpacity>

              <View className="flex gap-5 items-start w-full mt-12">
                {/* Company Name Field */}
                <View className="flex items-start w-full">
                  <Text className="text-[#787CA5] text-sm mb-5">Company Name</Text>
                  <View className="flex flex-row items-center justify-between w-full">
                    {isEditingName ? (
                      <TextInput
                        className="text-white w-[90%] pb-1"
                        value={tempName}
                        onChangeText={setTempName}
                        autoFocus
                      />
                    ) : (
                      <Text className="text-white w-[90%]">{companyName}</Text>
                    )}
                    <TouchableOpacity className="w-[10%]" onPress={toggleEditName}>
                      <Image 
                        className="w-8 h-8" 
                        source={isEditingName 
                          ? require("../../../../assets/Tasks/isEditing.png") 
                          : require("../../../../assets/Tasks/addto.png")}
                      />
                    </TouchableOpacity>
                  </View>
                  <View className={`h-0.5 w-full ${isEditingName ? 'bg-[#815BF5]' : 'bg-[#37384B]'} mt-6`}></View>
                </View>

                {/* Company Address Field */}
                <View className="flex items-start w-full">
                  <Text className="text-[#787CA5] text-sm mb-5">Company Address</Text>
                  <View className="flex flex-row items-center justify-between w-full">
                    {isEditingAddress ? (
                      <TextInput
                        className="text-white w-[90%] pb-1"
                        value={tempAddress}
                        onChangeText={setTempAddress}
                        autoFocus
                      />
                    ) : (
                      <Text className="text-white w-[90%]">{companyAddress}</Text>
                    )}
                    <TouchableOpacity className="w-[10%]" onPress={toggleEditAddress}>
                      <Image 
                        className="w-8 h-8" 
                        source={isEditingAddress 
                          ? require("../../../../assets/Tasks/isEditing.png") 
                          : require("../../../../assets/Tasks/addto.png")}
                      />
                    </TouchableOpacity>
                  </View>
                  <View className={`h-0.5 w-full ${isEditingAddress ? 'bg-[#815BF5]' : 'bg-[#37384B]'} mt-6`}></View>
                </View>

                {/* Contact Number Field */}
                <View className="flex items-start w-full">
                  <Text className="text-[#787CA5] text-sm mb-5">Contact Number</Text>
                  <View className="flex flex-row items-center justify-between w-full">
                    {isEditingContact ? (
                      <TextInput
                        className="text-white w-[90%] pb-1"
                        value={tempContact}
                        onChangeText={setTempContact}
                        keyboardType="phone-pad"
                        autoFocus
                      />
                    ) : (
                      <Text className="text-white w-[90%]">{contactNumber}</Text>
                    )}
                    <TouchableOpacity className="w-[10%]" onPress={toggleEditContact}>
                      <Image 
                        className="w-8 h-8" 
                        source={isEditingContact 
                          ? require("../../../../assets/Tasks/isEditing.png") 
                          : require("../../../../assets/Tasks/addto.png")}
                      />
                    </TouchableOpacity>
                  </View>
                  <View className={`h-0.5 w-full ${isEditingContact ? 'bg-[#815BF5]' : 'bg-[#37384B]'} mt-6`}></View>
                </View>

                {/* Email Field */}
                <View className="flex items-start w-full">
                  <Text className="text-[#787CA5] text-sm mb-5">Email</Text>
                  <View className="flex flex-row items-center justify-between w-full">
                    {isEditingEmail ? (
                      <TextInput
                        className="text-white w-[90%] pb-1"
                        value={tempEmail}
                        onChangeText={setTempEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoFocus
                      />
                    ) : (
                      <Text className="text-white w-[90%]">{email}</Text>
                    )}
                    <TouchableOpacity className="w-[10%]" onPress={toggleEditEmail}>
                      <Image 
                        className="w-8 h-8" 
                        source={isEditingEmail 
                          ? require("../../../../assets/Tasks/isEditing.png") 
                          : require("../../../../assets/Tasks/addto.png")}
                      />
                    </TouchableOpacity>
                  </View>
                  <View className={`h-0.5 w-full ${isEditingEmail ? 'bg-[#815BF5]' : 'bg-[#37384B]'} mt-6`}></View>
                </View>
              </View>

              <TouchableOpacity className="bg-[#815BF5] p-5 shadow-md rounded-full w-[90%] items-center mt-10 ">
                <Text className="text-white">Save Payslip Details</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}