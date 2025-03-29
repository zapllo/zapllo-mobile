
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
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { useFocusEffect } from '@react-navigation/native';
import NavbarTwo from '~/components/navbarTwo';
import DateRangeDropdown from '~/components/DateRangeDropdown/DateRangeDropdown';
import Modal from 'react-native-modal';
import CustomDropdownComponentTwo from '~/components/customNavbarTwo';
import axios from 'axios';
import { backend_Host } from '~/config';
import { LinearGradient } from 'expo-linear-gradient';
import CheckRound from '~/components/CheckRound';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign, Entypo, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';

export default function FaceRegistrationScreen() {
  const { token } = useSelector((state: RootState) => state.auth);
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
  const [selectedFaceImages, setSelectedFaceImages] = useState([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedFaceName, setSelectedFaceName] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [faceToDelete, setFaceToDelete] = useState(null);

  // Use useFocusEffect to refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
      fetchFaceRegistrationRequests();
    }, [])
  );

  useEffect(() => {
    fetchUsers();
    fetchFaceRegistrationRequests();
  }, []);

  // Function to fetch users from the API
  const fetchUsers = async () => {
    try {
      if (!token) {
        console.error('Authentication token not found');
        Alert.alert('Error', 'You are not authenticated. Please login again.');
        return;
      }

      const response = await axios.get(`${backend_Host}/users/organization`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const formattedData = response.data.data.map((user) => ({
        value: user._id,
        label: `${user.firstName} ${user.lastName}`,
      }));
      
      setUsers(formattedData);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      if (error.response && error.response.status === 401) {
        Alert.alert('Authentication Error', 'Your session has expired. Please login again.');
      }
    }
  };

  // Function to fetch face registration requests from the API
  const fetchFaceRegistrationRequests = async () => {
    try {
      setIsLoading(true);
      
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
      
      if (!token) {
        Alert.alert('Error', 'You are not authenticated. Please login again.');
        return;
      }
      
      // Make API call to approve the face registration using the correct endpoint and format
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
      
      if (!token) {
        Alert.alert('Error', 'You are not authenticated. Please login again.');
        return;
      }
      
      // Make API call to reject the face registration using the correct endpoint and format
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
      if (!token) {
        Alert.alert('Error', 'You are not authenticated. Please login again.');
        return;
      }
      
      // Show loading indicator
      setIsLoading(true);
      
      // Step 1: Upload images to get URLs
      const formData = new FormData();
      
      // Add each image to the form data
      selectedImages.forEach((uri, index) => {
        if (uri) {
          // Get file name from URI
          const uriParts = uri.split('/');
          const fileName = uriParts[uriParts.length - 1];
          
          // Append to form data
          formData.append('files', {
            uri: uri,
            type: 'image/jpeg',
            name: fileName,
          });
        }
      });
      
      // Upload the images
      const uploadResponse = await axios.post(
        `${backend_Host}/upload`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Check if upload was successful
      if (uploadResponse.data && uploadResponse.data.fileUrls) {
        const imageUrls = uploadResponse.data.fileUrls;
        
        // Step 2: Send the image URLs and user ID to register faces
        const registerResponse = await axios.post(
          `${backend_Host}/register-faces`, 
          {
            userId: selectedEmployee,
            imageUrls: imageUrls
          }, 
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        // Check if registration was successful
        if (registerResponse.data.success) {
          console.log('Registration response:', registerResponse.data);
          
          // Add the registered face to the list
          const newFace = {
            id: registerResponse.data._id || registerResponse.data.requestId,
            userId: selectedEmployee,
            name: selectedEmployeeName,
            images: imageUrls,
            status: 'Pending'
          };
          
          setRegisteredFaces(prev => [...prev, newFace]);
          
          // Show success message
          Alert.alert('Success', registerResponse.data.message || 'Face registration submitted successfully');
          
          // Reset the form
          toggleFaceModal();
          setSelectedImages([null, null, null]);
          setSelectedEmployee(null);
          setSelectedEmployeeName('');
          
          // Refresh the face registration list
          fetchFaceRegistrationRequests();
        } else {
          Alert.alert('Error', registerResponse.data.message || 'Failed to register face');
        }
      } else {
        Alert.alert('Error', 'Failed to upload images');
      }
    } catch (error: any) {
      console.error('Error registering face:', error);
      
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
        } else {
          Alert.alert('Error', `Failed to register face: ${error.response.data?.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        Alert.alert('Network Error', 'No response received from server. Please check your connection.');
      } else {
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
        <View className="p-4 pt-8 rounded-2xl flex flex-col  items-center">
          <LottieView
            source={require('../../../..//assets/Animation/register-face.json')}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
          <Text className="text-white text-center ">No faces registered yet</Text>
        </View>
      );
    }
  
    return filteredFaces.map((face, index) => (
      <View key={index} className="border border-[#37384B] p-5 rounded-xl mb-4 bg-[#10122D]">
        {/* Header with name, status and actions */}
        <View className="flex flex-row items-center justify-between mb-3">
          <View className="flex flex-row items-center gap-3">
            <View 
              className="w-2 h-10 rounded-full" 
              style={{ 
                backgroundColor: face.status === 'Approved' 
                  ? '#06D6A0' 
                  : face.status === 'Rejected' 
                  ? '#FF5A5A' 
                  : '#FDB314' 
              }} 
            />
            <View>
              <Text className="text-white text-lg font-bold" style={{ fontFamily: 'LatoBold' }}>
                {face.name}
              </Text>
              <Text 
                className={
                  face.status === 'Approved' 
                    ? 'text-[#06D6A0] text-xs' 
                    : face.status === 'Rejected' 
                    ? 'text-[#FF5A5A] text-xs' 
                    : 'text-[#FDB314] text-xs'
                }
              >
                {face.status}
              </Text>
            </View>
          </View>
  
          <View className="flex flex-row items-center gap-3">
          <TouchableOpacity 
              className="h-8 w-8 bg-[#37384B] rounded-full items-center justify-center"
              onPress={() => openDeleteModal(face.id, index)}
            >
              <MaterialIcons name="delete-outline" size={18} color="#FF5A5A" />
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Divider */}
        <View className="h-[1px] bg-[#37384B] w-full my-3" />
  
        {/* Face images */}
        <View className="mb-4">
          <Text className="text-[#787CA5] text-xs mb-2">Face Images</Text>
          <TouchableOpacity 
            className="flex-row gap-3"
            onPress={() => openImageModal(face.images, face.name)}
          >
            {face.images.map((image, imgIndex) => (
              <View key={imgIndex} className="relative ">
                <Image 
                  source={{ uri: image }} 
                  className="w-20 h-16 rounded-lg "
                />
                 
                  <View className="absolute bottom-0 w-full items-center rounded-b-lg"style={{ backgroundColor: 'rgba(56, 43, 71, 0.7)'}}>
                    
                    <Text style={{ fontFamily: "Lato"}} className="text-[#8c8484] z-20  font-bold text-xs">Tap to view</Text>
                  </View>
                
              </View>
            ))}
          </TouchableOpacity>
        </View>
  
        {/* Action buttons for pending requests */}
        {face.status === 'Pending' && (
          <View className="flex-row justify-end gap-3 mt-2">
            <TouchableOpacity 
              className="flex-row items-center bg-[rgba(6,214,160,0.15)] border border-[rgba(6,214,160,0.3)] px-4 py-2 rounded-lg"
              onPress={() => handleApproveFace(index)}
            >
            <AntDesign name="checkcircleo" size={16} color="#06D6A0" style={{ marginRight: 8 }} />
              <Text className="text-white ml-2 text-xs ">Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center bg-[rgba(255,90,90,0.15)] border border-[rgba(255,90,90,0.3)] px-4 py-2 rounded-lg"
              onPress={() => handleRejectFace(index)}
            >
              <AntDesign name="closecircleo" size={16} color="#EF4444" style={{ marginRight: 8 }} />
              <Text className="text-white ml-2 text-xs ">Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ));
  };

  const openImageModal = (images, name) => {
    setSelectedFaceImages(images);
    setSelectedFaceName(name);
    setIsImageModalVisible(true);
  };

  const openDeleteModal = (faceId, index) => {
    setFaceToDelete({ id: faceId, index });
    setDeleteModal(true);
  };
  
  const cancelDelete = () => {
    setDeleteModal(false);
    setFaceToDelete(null);
  };

  const confirmDelete = async () => {
    if (!faceToDelete) return;
    
    try {
      // Show loading indicator
      setIsLoading(true);
      
      if (!token) {
        Alert.alert('Error', 'You are not authenticated. Please login again.');
        return;
      }
      
      // Make API call to delete the face registration using the pattern from web implementation
      const response = await axios.delete(
        `${backend_Host}/delete-face-registration/${faceToDelete.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Check if the response is successful
      if (response.status >= 200 && response.status < 300) {
        // Update local state to remove the deleted face
        setRegisteredFaces((prevFaces) => 
          prevFaces.filter((face) => face.id !== faceToDelete.id)
        );
        
        // Provide haptic feedback for successful deletion
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        Alert.alert('Success', 'Face registration has been deleted successfully');
      } else {
        // Handle unsuccessful response
        const errorMessage = response.data?.message || 'Failed to delete face registration.';
        Alert.alert('Error', errorMessage);
        
        // Provide haptic feedback for error
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Error deleting face registration:', error);
      
      // Provide haptic feedback for error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Handle different error scenarios
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        let errorMessage = 'Failed to delete face registration.';
        
        if (statusCode === 401 || statusCode === 403) {
          errorMessage = 'You are not authorized to delete this face registration.';
        } else if (statusCode === 404) {
          errorMessage = 'Face registration not found. It may have been already deleted.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        Alert.alert('Error', errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        Alert.alert('Network Error', 'No response received from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        Alert.alert('Error', 'Failed to delete face registration. Please try again.');
      }
    } finally {
      // Hide loading indicator and reset state
      setIsLoading(false);
      setDeleteModal(false);
      setFaceToDelete(null);
    }
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


    <Modal
      isVisible={isImageModalVisible}
      onBackdropPress={() => setIsImageModalVisible(false)}
      backdropOpacity={0.7}
      style={faceCardStyles.modal}
      animationIn="fadeIn"
      animationOut="fadeOut"
    >
      <BlurView intensity={20} style={faceCardStyles.blurContainer}>
        <View style={faceCardStyles.modalContent}>
          <View style={faceCardStyles.modalHeader}>
            <Text style={faceCardStyles.modalTitle}>Face Registration</Text>
            <TouchableOpacity 
              onPress={() => setIsImageModalVisible(false)}
              style={faceCardStyles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={faceCardStyles.modalSubtitle}>{selectedFaceName}</Text>
          
          <View style={faceCardStyles.imagesGrid}>
            {selectedFaceImages.map((image, index) => (
              <View key={index} style={faceCardStyles.modalImageContainer}>
                <Image 
                  source={{ uri: image }} 
                  style={faceCardStyles.modalImage}
                  resizeMode="cover"
                />
                <View style={faceCardStyles.imageNumberBadge}>
                  <Text style={faceCardStyles.imageNumberText}>{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={faceCardStyles.closeModalButton}
            onPress={() => setIsImageModalVisible(false)}
          >
            <Text style={faceCardStyles.closeModalButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>


    {/* delete modal */}
    
<Modal
  isVisible={deleteModal}
  onBackdropPress={cancelDelete}
  style={{ justifyContent: 'flex-end', margin: 0 }}
>
  <View
    style={{
      backgroundColor: '#0A0D28',
      padding: 20,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingBottom: 55,
      paddingTop: 35,
    }}
  >
    <View style={{ alignItems: 'center' }}>
      <Image
        style={{ width: 80, height: 80, marginBottom: 20 }}
        source={require('../../../../assets/Tickit/delIcon.png')}
      />
      <Text style={{ color: 'white', fontSize: 24, fontFamily: 'LatoBold' }}>Delete Face Registration</Text>
      <Text style={{ color: '#787CA5', textAlign: 'center' }} className='mb-10'>
        Are you sure you want to delete this face registration? This action cannot be undone.
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#37384B',
            padding: 15,
            borderRadius: 30,
            flex: 1,
            marginRight: 10,
          }}
          onPress={cancelDelete}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>
            No, Keep It
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: '#EF4444', padding: 15, borderRadius: 30, flex: 1 }}
          onPress={confirmDelete}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
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

const { width } = Dimensions.get('window');
const faceCardStyles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'LatoBold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvedBadge: {
    backgroundColor: 'rgba(6, 214, 160, 0.2)',
    borderWidth: 1,
    borderColor: '#06D6A0',
  },
  rejectedBadge: {
    backgroundColor: 'rgba(255, 90, 90, 0.2)',
    borderWidth: 1,
    borderColor: '#FF5A5A',
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'LatoBold',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 90, 90, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  cardContent: {
    flexDirection: 'column',
    gap: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  faceImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#815BF5',
  },
  tapHintContainer: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tapHintText: {
    color: '#A0A0C8',
    fontSize: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: 'rgba(255, 90, 90, 0.2)',
    borderWidth: 1,
    borderColor: '#FF5A5A',
  },
  approveButton: {
    backgroundColor: 'rgba(6, 214, 160, 0.2)',
    borderWidth: 1,
    borderColor: '#06D6A0',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'LatoBold',
  },
  
  // Modal styles
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.85,
    backgroundColor: '#1F1D36',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#815BF5',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'LatoBold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    color: '#A0A0C8',
    fontSize: 16,
    marginBottom: 24,
  },
  imagesGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  modalImageContainer: {
    position: 'relative',
  },
  modalImage: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#815BF5',
  },
  imageNumberBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#815BF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeModalButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#37384B',
    borderRadius: 24,
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'LatoBold',
  },
});