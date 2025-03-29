import { Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, TextInput, Image, ActivityIndicator, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import NavbarTwo from "~/components/navbarTwo";
import { KeyboardAvoidingView } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import * as FileSystem from 'expo-file-system';

export default function SetPayslipScreen() {
  // State for company details
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<any>(null);

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

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Get auth token from Redux store
  const { token } = useSelector((state: RootState) => state.auth);

  // Fetch existing payslip details when component mounts
  useEffect(() => {
    fetchPayslipDetails();
  }, []);

  const fetchPayslipDetails = async () => {
    try {
      setFetchingData(true);
      
      const response = await axios.get('https://zapllo.com/api/payslip', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success && response.data.data) {
        const { name, address, contact, emailOrWebsite, logo } = response.data.data;
        
        setCompanyName(name || "");
        setTempName(name || "");
        
        setCompanyAddress(address || "");
        setTempAddress(address || "");
        
        setContactNumber(contact || "");
        setTempContact(contact || "");
        
        setEmail(emailOrWebsite || "");
        setTempEmail(emailOrWebsite || "");
        
        if (logo) {
          setCompanyLogo(logo);
        }
      }
    } catch (error) {
      console.error('Error fetching payslip details:', error);
      setErrorMessage('Failed to load payslip details. Please try again later.');
    } finally {
      setFetchingData(false);
    }
  };

  // Handle image picking
  const pickImage = async () => {
    // Request permission to access the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
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
      const selectedImageUri = result.assets[0].uri;
      setCompanyLogo(selectedImageUri);
      
      // Prepare the file for upload
      try {
        const fileInfo = await FileSystem.getInfoAsync(selectedImageUri);
        
        if (fileInfo.exists) {
          // Create a file object for upload
          const fileType = selectedImageUri.split('.').pop() || 'jpg';
          const fileName = `company_logo_${Date.now()}.${fileType}`;
          
          setLogoFile({
            uri: selectedImageUri,
            name: fileName,
            type: `image/${fileType}`
          });
        }
      } catch (error) {
        console.error('Error preparing logo file:', error);
        Alert.alert('Error', 'Failed to prepare the logo file for upload.');
      }
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

  // Save payslip details
  const savePayslipDetails = async () => {
    // Validate inputs
    if (!companyName || !companyAddress || !contactNumber || !email) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      
      let logoUrl = companyLogo;
      
      // If a new logo is selected, upload it
      if (logoFile) {
        const formData = new FormData();
        formData.append('files', logoFile);
        
        const uploadResponse = await axios.post('https://zapllo.com/api/upload', formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (uploadResponse.data.success && uploadResponse.data.fileUrls && uploadResponse.data.fileUrls.length > 0) {
          logoUrl = uploadResponse.data.fileUrls[0];
        }
      }
      
      // Submit the payslip details
      const payslipData = {
        name: companyName,
        address: companyAddress,
        contact: contactNumber,
        emailOrWebsite: email,
        logo: logoUrl
      };
      
      const response = await axios.post('https://zapllo.com/api/payslip', payslipData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setSuccessMessage('Payslip details saved successfully!');
        Alert.alert('Success', 'Payslip details saved successfully!');
      } else {
        setErrorMessage(response.data.message || 'Failed to save payslip details.');
        Alert.alert('Error', response.data.message || 'Failed to save payslip details.');
      }
    } catch (error) {
      console.error('Error saving payslip details:', error);
      setErrorMessage('An error occurred while saving payslip details.');
      Alert.alert('Error', 'An error occurred while saving payslip details.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <SafeAreaView className="h-full flex-1 bg-primary">
        <NavbarTwo title="Set Payslip" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#815BF5" />
          <Text className="text-white mt-4">Loading payslip details...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                    className="h-full w-full object-scale-down" 
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

              {errorMessage ? (
                <View className="bg-red-500/20 p-3 rounded-lg mt-4 w-full">
                  <Text className="text-red-500 text-center">{errorMessage}</Text>
                </View>
              ) : null}

              {successMessage ? (
                <View className="bg-green-500/20 p-3 rounded-lg mt-4 w-full">
                  <Text className="text-green-500 text-center">{successMessage}</Text>
                </View>
              ) : null}

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
                      <Text className="text-white w-[90%]">{companyName || "Not set"}</Text>
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
                      <Text className="text-white w-[90%]">{companyAddress || "Not set"}</Text>
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
                      <Text className="text-white w-[90%]">{contactNumber || "Not set"}</Text>
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
                  <Text className="text-[#787CA5] text-sm mb-5">Email or Website</Text>
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
                      <Text className="text-white w-[90%]">{email || "Not set"}</Text>
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

              <TouchableOpacity 
                className={`bg-[#815BF5] p-5 shadow-md rounded-full w-[90%] items-center mt-10 ${loading ? 'opacity-70' : 'opacity-100'}`}
                onPress={savePayslipDetails}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white">Save Payslip Details</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
