import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  StyleSheet,
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
import { Entypo, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FaceRegistrationScreen() {
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [users, setUsers] = useState([]);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([null, null, null]);
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const [registrationStatus, setRegistrationStatus] = useState('Pending'); // 'Pending', 'Approved', 'Rejected'
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter states
  const [filterAll, setFilterAll] = useState(true);
  const [filterPending, setFilterPending] = useState(false);
  const [filterApproved, setFilterApproved] = useState(false);
  const [filterRejected, setFilterRejected] = useState(false);

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
    fetchFaceRegistrationRequests();
  }, []);

  // Function to fetch face registration requests from the API
  const fetchFaceRegistrationRequests = async () => {
    try {
      setIsLoading(true);
      
      // Get the authentication token from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.error('Authentication token not found');
        Alert.alert('Error', 'You are not authenticated. Please login again.');
        return;
      }
      
      // Make the API request with the token in the Authorization header
      const response = await axios.get(`${backend_Host}/face-registration-request`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Process the response data
      if (response.data && response.data.requests) {
        // Map the API response to the format expected by the component
        const formattedFaces = response.data.requests.map(request => ({
          id: request._id,
          userId: request.userId._id,
          name: `${request.userId.firstName} ${request.userId.lastName}`,
          images: request.imageUrls || [],
          status: request.status === 'approved' ? 'Approved' : 
                 request.status === 'rejected' ? 'Rejected' : 'Pending'
        }));
        
        setRegisteredFaces(formattedFaces);
      }
    } catch (error) {
      console.error('Error fetching face registration requests:', error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          Alert.alert('Authentication Error', 'Your session has expired. Please login again.');
        } else {
          Alert.alert('Error', 'Failed to fetch face registration requests. Please try again.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        Alert.alert('Network Error', 'No response received from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (range) => {
    console.log('Selected date range:', range);
  };

  const toggleFilterModal = () => {
    setFilterModalVisible(!isFilterModalVisible);
  };

  const toggleFaceModal = () => {
    setIsFaceModalOpen(!isFaceModalOpen);
  };

  // Handle filter selection for "All"
  const handleAllFilter = () => {
    setFilterAll(!filterAll);
    if (!filterAll) {
      // If turning on "All", turn off other filters
      setFilterPending(false);
      setFilterApproved(false);
      setFilterRejected(false);
    }
  };

  // Handle filter selection for "Pending"
  const handlePendingFilter = () => {
    setFilterPending(!filterPending);
    // If turning on any specific filter, turn off "All"
    if (!filterPending) {
      setFilterAll(false);
    }
    // If all specific filters are off, turn on "All"
    if (filterPending && !filterApproved && !filterRejected) {
      setFilterAll(true);
    }
  };

  // Handle filter selection for "Approved"
  const handleApprovedFilter = () => {
    setFilterApproved(!filterApproved);
    // If turning on any specific filter, turn off "All"
    if (!filterApproved) {
      setFilterAll(false);
    }
    // If all specific filters are off, turn on "All"
    if (!filterPending && filterApproved && !filterRejected) {
      setFilterAll(true);
    }
  };

  // Handle filter selection for "Rejected"
  const handleRejectedFilter = () => {
    setFilterRejected(!filterRejected);
    // If turning on any specific filter, turn off "All"
    if (!filterRejected) {
      setFilterAll(false);
    }
    // If all specific filters are off, turn on "All"
    if (!filterPending && !filterApproved && filterRejected) {
      setFilterAll(true);
    }
  };

  // Apply filters
  const applyFilters = () => {
    console.log('Applied filters:', {
      all: filterAll,
      pending: filterPending,
      approved: filterApproved,
      rejected: filterRejected
    });
    toggleFilterModal();
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilterAll(true);
    setFilterPending(false);
    setFilterApproved(false);
    setFilterRejected(false);
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

      // Function to handle approving a face registration
      const handleApproveFace = async (index) => {
        try {
          const faceId = registeredFaces[index].id;
          
          // Get the authentication token from AsyncStorage
          const token = await AsyncStorage.getItem('authToken');
          
          if (!token) {
            Alert.alert('Error', 'You are not authenticated. Please login again.');
            return;
          }
          
          // Make API call to approve the face registration using the correct endpoint and format
          // Removed '/api' prefix from the URL path to match backend route structure
          await axios.post(
            `${backend_Host}/approve-face-registration/${faceId}`, 
            {
              status: "approved"
            }, 
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          // Update local state
          const updatedFaces = [...registeredFaces];
          updatedFaces[index] = {
            ...updatedFaces[index],
            status: 'Approved'
          };
          
          setRegisteredFaces(updatedFaces);
          Alert.alert('Success', `Face registration for ${updatedFaces[index].name} has been approved`);
        } catch (error) {
          console.error('Error approving face:', error);
          
          // More detailed error handling
          if (error.response) {
            if (error.response.status === 404) {
              Alert.alert('Error', 'The requested resource was not found. Please check the face ID.');
            } else if (error.response.status === 500) {
              Alert.alert('Server Error', 'The server encountered an error. Please try again later.');
            } else if (error.response.status === 401) {
              Alert.alert('Authentication Error', 'Your session has expired. Please login again.');
            } else {
              Alert.alert('Error', `Failed to approve face registration: ${error.response.data?.message || 'Unknown error'}`);
            }
          } else if (error.request) {
            Alert.alert('Network Error', 'No response received from server. Please check your connection.');
          } else {
            Alert.alert('Error', 'Failed to approve face registration. Please try again.');
          }
        }
      };

      // Function to handle rejecting a face registration
      const handleRejectFace = async (index) => {
        try {
          const faceId = registeredFaces[index].id;
          
          // Get the authentication token from AsyncStorage
          const token = await AsyncStorage.getItem('authToken');
          
          if (!token) {
            Alert.alert('Error', 'You are not authenticated. Please login again.');
            return;
          }
          
          // Make API call to reject the face registration using the correct endpoint and format
          // Removed '/api' prefix from the URL path to match backend route structure
          await axios.post(
            `${backend_Host}/approve-face-registration/${faceId}`, 
            {
              status: "rejected"
            }, 
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          // Update local state
          const updatedFaces = [...registeredFaces];
          updatedFaces[index] = {
            ...updatedFaces[index],
            status: 'Rejected'
          };
          
          setRegisteredFaces(updatedFaces);
          Alert.alert('Success', `Face registration for ${updatedFaces[index].name} has been rejected`);
        } catch (error) {
          console.error('Error rejecting face:', error);
          
          // More detailed error handling
          if (error.response) {
            if (error.response.status === 404) {
              Alert.alert('Error', 'The requested resource was not found. Please check the face ID.');
            } else if (error.response.status === 500) {
              Alert.alert('Server Error', 'The server encountered an error. Please try again later.');
            } else if (error.response.status === 401) {
              Alert.alert('Authentication Error', 'Your session has expired. Please login again.');
            } else {
              Alert.alert('Error', `Failed to reject face registration: ${error.response.data?.message || 'Unknown error'}`);
            }
          } else if (error.request) {
            Alert.alert('Network Error', 'No response received from server. Please check your connection.');
          } else {
            Alert.alert('Error', 'Failed to reject face registration. Please try again.');
          }
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
      
        try {
          // Get the authentication token from AsyncStorage
          const token = await AsyncStorage.getItem('authToken');
          
          if (!token) {
            Alert.alert('Error', 'You are not authenticated. Please login again.');
            return;
          }
          
          // Show loading indicator
          setIsLoading(true);
          
          // Create form data for multipart/form-data upload
          const formData = new FormData();
          
          // Add the user ID to the form data
          formData.append('userId', selectedEmployee);
          
          // Append each selected image to the form data with the correct field name 'images'
          selectedImages.forEach((uri, index) => {
            if (uri) {
              // Get file name from URI
              const uriParts = uri.split('/');
              const fileName = uriParts[uriParts.length - 1];
              
              // Append image with the field name 'images' (array of files)
              // Note: React Native's FormData implementation requires this specific format
              formData.append('images', {
                uri: uri,
                type: 'image/jpeg',
                name: fileName,
              } as any); // Type assertion to handle React Native's FormData quirks
            }
          });
          
          // Important: When using FormData, do NOT manually set Content-Type
          // Axios will automatically set the correct boundary for multipart/form-data
          // Setting it manually can cause boundary issues
          const response = await axios.post(
            `${backend_Host}/face-registration-request`, 
            formData, 
            {
              headers: {
                // Let axios set the correct Content-Type with boundary
                // 'Content-Type': 'multipart/form-data', - Remove this line
                'Authorization': `Bearer ${token}`
              },
              timeout: 60000, // Increased timeout to 60 seconds for image processing
            }
          );
      
          console.log('Registration response:', response.data);
          
          // Check if the response is successful
          if (response.data.success) {
            // Extract image URLs from the response
            const imageUrls = response.data.imageUrls || [];
            
            // Get the request ID - in this case it might be in the faceDescriptor object
            // or directly in the response (we'll handle both cases)
            const requestId = response.data._id || 
                              (response.data.faceDescriptor && response.data.faceDescriptor._id);
            
            // Add the registered face to the list with the correct structure
            const newFace = {
              id: requestId,
              userId: selectedEmployee,
              name: selectedEmployeeName,
              images: imageUrls,
              status: 'Pending' // Default status is Pending
            };
            
            setRegisteredFaces(prev => [...prev, newFace]);
            
            // Show success message
            Alert.alert('Success', response.data.message || 'Face registration submitted successfully');
            
            // Reset the form
            toggleFaceModal();
            setSelectedImages([null, null, null]);
            setSelectedEmployee(null);
            setSelectedEmployeeName('');
          } else {
            // Handle unsuccessful response
            Alert.alert('Error', response.data.message || 'Failed to register face');
          }
        } catch (error: any) { // Explicitly type error as any for better error handling
          console.error('Error registering face:', error);
          
          // More detailed error logging
          if (error.response) {
            console.log('Error status:', error.response.status);
            console.log('Error data:', JSON.stringify(error.response.data));
            
            if (error.response.status === 400) {
              Alert.alert('Error', `Bad request: ${error.response.data?.message || 'Please ensure you are providing exactly 3 images in the correct format.'}`);
            } else if (error.response.status === 404) {
              Alert.alert('Error', 'The requested endpoint was not found. Please check the API URL.');
            } else if (error.response.status === 500) {
              Alert.alert('Server Error', `The server encountered an error: ${error.response.data?.message || 'Please try again later.'}`);
            } else if (error.response.status === 401) {
              Alert.alert('Authentication Error', 'Your session has expired. Please login again.');
            } else if (error.response.status === 413) {
              Alert.alert('Error', 'The images you are trying to upload are too large. Please use smaller images.');
            } else {
              Alert.alert('Error', `Failed to register face: ${error.response.data?.message || 'Unknown error'}`);
            }
          } else if (error.request) {
            console.log('No response received:', error.request);
            Alert.alert('Network Error', 'No response received from server. Please check your connection.');
          } else {
            console.log('Error message:', error.message);
            Alert.alert('Error', `Failed to register face: ${error.message || 'Please try again.'}`);
          }
        } finally {
          setIsLoading(false);
        }
      };
    const renderRegisteredFaces = () => {
      // Show loading indicator if data is being fetched
      if (isLoading) {
        return (
          <View className="p-4 border rounded-2xl flex flex-col border-[#37384B] gap-2 items-center">
            <Text className="text-white text-center">Loading face registration requests...</Text>
          </View>
        );
      }
      
      // Filter faces based on active filters
      let filteredFaces = [...registeredFaces];
      
      if (!filterAll) {
        filteredFaces = filteredFaces.filter(face => 
          (filterPending && face.status === 'Pending') ||
          (filterApproved && face.status === 'Approved') ||
          (filterRejected && face.status === 'Rejected')
        );
      }
      
      // Filter by search term if provided
      if (searchUser.trim() !== '') {
        filteredFaces = filteredFaces.filter(face => 
          face.name.toLowerCase().includes(searchUser.toLowerCase())
        );
      }
      


      if (filteredFaces.length === 0) {
        return (
          <View className="p-4 border rounded-2xl flex flex-col border-[#37384B] gap-2">
            <Text className="text-white text-center">No faces registered yet</Text>
          </View>
        );
      }

      return filteredFaces.map((face, index) => (
        <View key={index} className="p-4 border rounded-2xl flex flex-col border-[#37384B] gap-2 mb-4">
          <View className=" rounded-2xl flex flex-row justify-between p-2 items-center">
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
              className="w-4 h-6"
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

          <View className='w-full items-center justify-between flex flex-row'>
            <View className="flex flex-row items-center gap-2">
              {face.images.map((image, imgIndex) => (
                <Image 
                  key={imgIndex}
                  source={{ uri: image }} 
                  className="w-8 h-8 rounded-full"
                />
              ))}
            </View>
            {face.status === 'Pending' && (
              <View className='flex gap-5 flex-row items-center'>
                <TouchableOpacity onPress={() => handleRejectFace(index)}>
                  <Entypo name='cross' size={34} color='#FF5A5A' />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleApproveFace(index)}>
                  <FontAwesome name='check' size={34} color='#06D6A0' />
                </TouchableOpacity>
              </View>
            )}
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
                    isChecked={filterAll}
                    onPress={handleAllFilter}
                  />
                  <Text className='text-white text-lg'>All</Text>
                </View>
                <View className='flex items-center flex-row gap-4'>
                  <CheckRound
                    isChecked={filterPending}
                    onPress={handlePendingFilter}
                  />
                  <Text className='text-white text-lg'>Pending</Text>
                </View>
                <View className='flex items-center flex-row gap-4'>
                  <CheckRound
                    isChecked={filterApproved}
                    onPress={handleApprovedFilter}
                  />
                  <Text className='text-white text-lg'>Approved</Text>
                </View>
                <View className='flex items-center flex-row gap-4'>
                  <CheckRound
                    isChecked={filterRejected}
                    onPress={handleRejectedFilter}
                  />
                  <Text className='text-white text-lg'>Rejected</Text>
                </View>
              </View>
              <View className='flex flex-row items-center justify-center gap-5 mt-8'>
                <TouchableOpacity 
                  className='bg-[#37384B] p-4 rounded-full w-[45%] items-center'
                  onPress={clearAllFilters}
                >
                  <Text className='text-white text-sm'>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className='rounded-full w-[45%] items-center'
                  onPress={applyFilters}
                >
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