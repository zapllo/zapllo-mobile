import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import NavbarTwo from '~/components/navbarTwo';
import DateRangeDropdown from '~/components/DateRangeDropdown/DateRangeDropdown';
import Modal from 'react-native-modal';
import CustomDropdownComponentTwo from '~/components/customNavbarTwo';
import axios from 'axios';
import { backend_Host } from '~/config';
import { LinearGradient } from 'expo-linear-gradient';
import CheckRound from '~/components/CheckRound';
import * as ImagePicker from 'expo-image-picker';

export default function FaceRegistrationScreen() {
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [users, setUsers] = useState([]);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [selectedImages, setSelectedImages] = useState([null, null, null]);
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const [registrationStatus, setRegistrationStatus] = useState('Pending'); // 'Pending', 'Approved', 'Rejected'

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${backend_Host}/users/organization`);
        const formattedData = response.data.data.map((user) => ({
          value: user._id,
          label: `${user.firstName} ${user.lastName}`,
        }));
        setUsers(formattedData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDateRangeChange = (range) => {
    console.log('Selected date range:', range);
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!isFilterModalVisible);
  };

  const toggleFaceModal = () => {
    setIsFaceModalOpen(!isFaceModalOpen);
  };

  const handelSelect = () => {
    setIsChecked(!isChecked);
  };

  const renderDropdownItem = (item) => (
    <TouchableOpacity
      style={styles.itemStyle}
      onPress={() => {
        setSelectedEmployee(item.value);
        setSelectedEmployeeName(item.label);
      }}
    >
      <Text style={styles.itemTextStyle}>{item.label}</Text>
    </TouchableOpacity>
  );

  const pickImage = async (index) => {
    try {
      // Request permission to access the media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to select images.');
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Create a new array with the selected image at the specified index
        const newSelectedImages = [...selectedImages];
        newSelectedImages[index] = result.assets[0].uri;
        setSelectedImages(newSelectedImages);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleRegisterFace = async () => {
    // Check if employee is selected
    if (!selectedEmployee) {
      Alert.alert('Error', 'Please select an employee first');
      return;
    }

    // Check if all three images are selected
    if (selectedImages.some(img => img === null)) {
      Alert.alert('Error', 'Please select all three required images');
      return;
    }

    // Here you would implement the API call to register the face
    try {
      // Create form data to send images
      const formData = new FormData();
      formData.append('userId', selectedEmployee);
      
      // Append each selected image to the form data
      selectedImages.forEach((uri, index) => {
        if (uri) {
          const fileNameParts = uri.split('/');
          const fileName = fileNameParts[fileNameParts.length - 1];
          
          formData.append('images', {
            uri: uri,
            name: fileName,
            type: 'image/jpeg',
          });
        }
      });

      // Make API call
      // Uncomment this when ready to implement
      // const response = await axios.post(`${backend_Host}/face-recognition/register`, formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });

      // For now, just log success and close modal
      console.log('Face registration would be sent with:', { selectedEmployee, selectedImages });
      
      // Add the registered face to the list
      setRegisteredFaces([
        ...registeredFaces,
        {
          id: selectedEmployee,
          name: selectedEmployeeName,
          images: [...selectedImages],
          status: 'Approved' // Default status for demo
        }
      ]);
      
      Alert.alert('Success', 'Face registration submitted successfully');
      toggleFaceModal();
      setSelectedImages([null, null, null]);
      setSelectedEmployee(null);
      setSelectedEmployeeName('');
    } catch (error) {
      console.error('Error registering face:', error);
      Alert.alert('Error', 'Failed to register face. Please try again.');
    }
  };

  const renderRegisteredFaces = () => {
    if (registeredFaces.length === 0) {
      return (
        <View className="p-4 border rounded-2xl flex flex-col border-[#37384B] gap-2">
          <Text className="text-white text-center">No faces registered yet</Text>
        </View>
      );
    }

    return registeredFaces.map((face, index) => (
      <View key={index} className="p-4 border rounded-2xl flex flex-col border-[#37384B] gap-2 mb-4">
        <View className="border rounded-2xl flex flex-row justify-between p-2">
          <View className="flex flex-row items-center gap-4">
            <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
              {face.name}
            </Text>
            <Text
              className={`text-white text-xs p-2 rounded-lg px-4 ${
                face.status === 'Approved' 
                  ? 'bg-[#06D6A0]' 
                  : face.status === 'Rejected' 
                  ? 'bg-[#FF5A5A]' 
                  : 'bg-[#FFC107]'
              }`}
              style={{ fontFamily: 'LatoBold' }}
            >
              {face.status}
            </Text>
          </View>
          <TouchableOpacity 
            className="w-5 h-8"
            onPress={() => {
              // Remove this face registration
              const updatedFaces = [...registeredFaces];
              updatedFaces.splice(index, 1);
              setRegisteredFaces(updatedFaces);
            }}
          >
            <Image
              className="w-full h-full"
              source={require('../../../../assets/Tasks/deleteTwo.png')}
            />
          </TouchableOpacity>
        </View>

        <View className="flex flex-row items-center gap-2">
          {face.images.map((image, imgIndex) => (
            <Image 
              key={imgIndex}
              source={{ uri: image }} 
              className="w-8 h-8 rounded-full"
            />
          ))}
        </View>
      </View>
    ));
  };

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Face Register" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-[90%] mt-8 flex">
              <View className="w-full items-start flex flex-row justify-between mb-2">
                <View className="w-[65%]">
                  <DateRangeDropdown
                    onRangeChange={handleDateRangeChange}
                    initialValue="This Week"
                    placeholder="Select Date Range"
                    includeNext={true}
                  />
                </View>
                <TouchableOpacity
                  className="h-14 w-14 rounded-full bg-[#37384B] mt-3"
                  onPress={toggleFilterModal}
                >
                  <Image
                    source={require('~/assets/commonAssets/filter.png')}
                    className="h-full w-full"
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={toggleFaceModal}
                  className="h-14 w-14 rounded-full mt-3">
                  <Image
                    source={require('~/assets/Attendence/faceIdentifier.png')}
                    className="h-full w-full"
                  />
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.input,
                  {
                    height: 57,
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    width: '100%',
                  },
                ]}
              >
                <TextInput
                  multiline
                  style={[
                    styles.inputSome,
                    { textAlignVertical: 'top', paddingTop: 10, width: '100%' },
                  ]}
                  value={searchUser}
                  onChangeText={(value) => setSearchUser(value)}
                  placeholder="Search by employee name"
                  placeholderTextColor="#787CA5"
                />
              </View>

              {renderRegisteredFaces()}
            </View>

            {/* FACE MODAL */}
            <Modal
              isVisible={isFaceModalOpen}
              onBackdropPress={toggleFaceModal}
              style={{ margin: 0, justifyContent: 'flex-end' }}
              animationIn="slideInUp"
              animationOut="slideOutDown"
            >
              <View className="rounded-t-3xl bg-[#0A0D28] p-5 pb-16">
                <View className="mb-5 mt-2 flex w-full flex-row items-center justify-between">
                  <Text
                    className="text-2xl font-semibold text-white"
                    style={{ fontFamily: 'LatoBold' }}
                  >
                    Register Faces
                  </Text>
                  <TouchableOpacity onPress={toggleFaceModal}>
                    <Image
                      source={require('../../../../assets/commonAssets/cross.png')}
                      className="h-8 w-8"
                    />
                  </TouchableOpacity>
                </View>
                <Text className="text-white text-lg" style={{ fontFamily: 'LatoBold' }}>
                  Register New Employee Faces
                </Text>
                <Text className="text-[#787CA5] text-xs mb-7 mt-1" style={{ fontFamily: 'Lato' }}>
                  Upload only 3 Images of Employee and submit those images
                </Text>
                <View style={styles.input}>
                  <CustomDropdownComponentTwo
                    data={users}
                    selectedValue={selectedEmployee}
                    onSelect={(value) => {
                      const selectedUser = users.find(user => user.value === value);
                      setSelectedEmployee(value);
                      setSelectedEmployeeName(selectedUser ? selectedUser.label : '');
                    }}
                    placeholder="Select User"
                    renderItem={renderDropdownItem}
                  />
                </View>
                {/* image selection buttons */}
                <View className='flex flex-row items-center justify-between mt-4'>
                  {[0, 1, 2].map((index) => (
                    <TouchableOpacity 
                      key={index}
                      className='border border-dashed border-[#815BF5] p-8 rounded-xl'
                      onPress={() => pickImage(index)}
                    >
                      {selectedImages[index] ? (
                        <Image 
                          source={{ uri: selectedImages[index] }} 
                          className='h-12 w-12 rounded-md' 
                          style={{ width: 48, height: 48 }}
                        />
                      ) : (
                        <Image 
                          className='h-12 w-12' 
                          source={require("../../../../assets/Attendence/AddImage.png")}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                <Text className='text-[#787CA5] text-xs mt-2'>Click to upload your document.</Text>
                <TouchableOpacity 
                  className='flex h-[4rem] items-center justify-center rounded-full mt-10'
                  onPress={handleRegisterFace}
                >
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={["#815BF5", "#FC8929"]}
                    style={styles.gradient}
                  >
                    <Text className='text-white'>Register New Face</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Modal>

            {/* FACE MODAL */}
            <Modal
              isVisible={isFaceModalOpen}
              onBackdropPress={toggleFaceModal}
              style={{ margin: 0, justifyContent: 'flex-end' }}
              animationIn="slideInUp"
              animationOut="slideOutDown"
            >
              <View className="rounded-t-3xl bg-[#0A0D28] p-5 pb-16">
                <View className="mb-5 mt-2 flex w-full flex-row items-center justify-between">
                  <Text
                    className="text-2xl font-semibold text-white"
                    style={{ fontFamily: 'LatoBold' }}
                  >
                    Register Faces
                  </Text>
                  <TouchableOpacity onPress={toggleFaceModal}>
                    <Image
                      source={require('../../../../assets/commonAssets/cross.png')}
                      className="h-8 w-8"
                    />
                  </TouchableOpacity>
                </View>
                <Text className="text-white text-lg" style={{ fontFamily: 'LatoBold' }}>
                  Register New Employee Faces
                </Text>
                <Text className="text-[#787CA5] text-xs mb-7 mt-1" style={{ fontFamily: 'Lato' }}>
                  Upload only 3 Images of Employee and submit those images
                </Text>
                <View style={styles.input}>
                  <CustomDropdownComponentTwo
                    data={users}
                    selectedValue={selectedEmployee}
                    onSelect={(value) => setSelectedEmployee(value)}
                    placeholder="Select User"
                    renderItem={renderDropdownItem}
                  />
                </View>
                {/* image selection buttons */}
                <View className='flex flex-row items-center justify-between mt-4'>
                  {[0, 1, 2].map((index) => (
                    <TouchableOpacity 
                      key={index}
                      className='border border-dashed border-[#815BF5] p-8 rounded-xl'
                      onPress={() => pickImage(index)}
                    >
                      {selectedImages[index] ? (
                        <Image 
                          source={{ uri: selectedImages[index] }} 
                          className='h-12 w-12 rounded-md' 
                          style={{ width: 48, height: 48 }}
                        />
                      ) : (
                        <Image 
                          className='h-12 w-12' 
                          source={require("../../../../assets/Attendence/AddImage.png")}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                <Text className='text-[#787CA5] text-xs mt-2'>Click to upload your document.</Text>
                <TouchableOpacity className='flex h-[4rem] items-center justify-center rounded-full mt-10'>
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={["#815BF5", "#FC8929"]}
                    style={styles.gradient}
                  >
                    <Text className='text-white'>Register New Face</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Modal>

            {/* FILTER MODAL */}
            <Modal
              isVisible={isFilterModalVisible}
              onBackdropPress={toggleFilterModal}
              style={{ margin: 0, justifyContent: 'flex-end' }}
              animationIn="slideInUp"
              animationOut="slideOutDown"
            >
              <View className="rounded-t-3xl bg-[#0A0D28] p-5 pb-16">
                <View className="mb-5 mt-2 flex w-full flex-row items-center justify-between">
                  <Text
                    className="text-2xl font-semibold text-white"
                    style={{ fontFamily: 'LatoBold' }}
                  >
                    Filters
                  </Text>
                  <TouchableOpacity onPress={toggleFilterModal}>
                    <Image
                      source={require('../../../../assets/commonAssets/cross.png')}
                      className="h-8 w-8"
                    />
                  </TouchableOpacity>
                </View>
                <Text className='text-white mb-7 mt-4'>States</Text>
                <View className='flex flex-col gap-2'>
                  <View className='flex items-center flex-row gap-4'>
                    <CheckRound
                    isChecked={isChecked}
                    onPress={handelSelect}
                    />
                    <Text className='text-white text-lg'>All</Text>
                  </View>
                  <View className='flex items-center flex-row gap-4'>
                    <CheckRound
                    isChecked={isChecked}
                    onPress={handelSelect}
                    />
                    <Text className='text-white text-lg'>Pending</Text>
                  </View>
                  <View className='flex items-center flex-row gap-4'>
                    <CheckRound
                    isChecked={isChecked}
                    onPress={handelSelect}
                    />
                    <Text className='text-white text-lg'>Approved</Text>
                  </View>
                  <View className='flex items-center flex-row gap-4'>
                    <CheckRound
                    isChecked={isChecked}
                    onPress={handelSelect}
                    />
                    <Text className='text-white text-lg'>Rejected</Text>
                  </View>
                </View>
                <View className='flex flex-row items-center justify-center gap-5 mt-8'>
                  <TouchableOpacity className='bg-[#37384B] p-4 rounded-full w-[45%] items-center'>
                    <Text className='text-white text-sm'>Clear All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className=' rounded-full w-[45%]  items-center'>
                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      colors={["#815BF5", "#FC8929"]}
                      style={styles.gradient}
                    >
                      <Text className='text-white text-sm'>Apply</Text>
                    </LinearGradient>                   
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    borderRadius: 35,
    width: '100%',
    height: 57,
    position: 'relative',
    marginBottom: 20,
  },
  
  inputSome: {
    flex: 1,
    padding: 9,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'LatoBold',
  },
  itemStyle: {
    padding: 15,
    borderBottomColor: '#37384B',
    borderBottomWidth: 1,
  },
  itemTextStyle: {
    color: '#787CA5',
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5, 
    flexDirection: "row", 
  },
});