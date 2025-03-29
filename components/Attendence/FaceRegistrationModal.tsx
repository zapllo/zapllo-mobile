import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from "react-native-toast-notifications";

interface FaceRegistrationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FaceRegistrationModal = ({ isVisible, onClose, onSuccess }: FaceRegistrationModalProps) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  const pickImages = async () => {
    // Request permission
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        // toast.show("Permission to access gallery was denied", {
        //   type: "danger",
        //   placement: "bottom",
        //   duration: 3000,
        // });
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 3,
      });

      if (!result.canceled) {
        // Get the URIs from the selected assets
        const selectedUris = result.assets.map(asset => asset.uri);
        
        // Limit to 3 images
        const limitedUris = selectedUris.slice(0, 3);
        setCapturedImages(limitedUris);
        
        if (limitedUris.length < 3) {
          // toast.show(`Please select 3 images (${limitedUris.length}/3 selected)`, {
          //   type: "warning",
          //   placement: "bottom",
          //   duration: 3000,
          // });
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      // toast.show("Failed to pick images from gallery", {
      //   type: "danger",
      //   placement: "bottom",
      //   duration: 3000,
      // });
    }
  };

  const handleSubmit = async () => {
    if (capturedImages.length < 3) {
      // toast.show(`Please select 3 face images (${capturedImages.length}/3 selected)`, {
      //   type: "warning",
      //   placement: "bottom",
      //   duration: 3000,
      // });
      return;
    }
  
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      // Get current user ID from AsyncStorage or Redux state
      const userDataString = await AsyncStorage.getItem('userData');
      let userId = 'anonymous';
      
      if (userDataString) {
        try {
          const parsedUserData = JSON.parse(userDataString);
          userId = parsedUserData?.data?._id || 'anonymous';
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      // Upload the images
      const formData = new FormData();
      capturedImages.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `face_${index}.jpg`;
        formData.append('files', {
          uri: uri,
          type: 'image/jpeg',
          name: filename,
        } as any);
      });
      
      const uploadResponse = await fetch('https://zapllo.com/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload images');
      }
      
      const uploadData = await uploadResponse.json();
      const imageUrls = uploadData.fileUrls;
      
      // Register the faces with user ID
      const registrationResponse = await fetch('https://zapllo.com/api/face-registration-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrls,
          userId, // Include user ID for server-side association
        }),
      });
      
      const registrationData = await registrationResponse.json();
      
      if (registrationResponse.ok && registrationData.success) {
        // toast.show("Face registration request submitted successfully", {
        //   type: "success",
        //   placement: "bottom",
        //   duration: 3000,
        // });
        
        // Set local storage flag to indicate face registration is pending for this user
        await AsyncStorage.setItem(`faceRegistrationStatus_${userId}`, 'pending');
        
        // Close modal and notify parent component
        onSuccess();
        onClose();
      } else {
        throw new Error(registrationData.error || 'Face registration failed');
      }
    } catch (error: any) {
      console.error('Error in face registration:', error);
      toast.show(error.message || "Face registration failed", {
        type: "danger",
        placement: "bottom",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetCapture = () => {
    setCapturedImages([]);
  };

  return (
    <Modal
      isVisible={isVisible}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackdropPress={() => {
        if (!isLoading) {
          onClose();
        }
      }}
    >
      <View className="rounded-t-3xl bg-[#060924] h-[80%]">
        <View className="absolute p-5 flex w-full flex-row items-center justify-between z-10">
          <Text className="text-white text-lg font-bold">Register Your Face</Text>
          <TouchableOpacity 
            onPress={() => {
              if (!isLoading) {
                onClose();
              }
            }}
            disabled={isLoading}
          >
            <Image 
              source={require('../../assets/commonAssets/cross.png')} 
              className="h-8 w-8" 
              style={{ opacity: isLoading ? 0.5 : 1 }}
            />
          </TouchableOpacity>
        </View>

        <View className="mt-20 p-4">
          <Text className="text-white text-center mb-6">
            Please select 3 different clear images of your face for registration
          </Text>
          
          <View className="flex-row justify-center mb-6">
            {[0, 1, 2].map((index) => (
              <View 
                key={index} 
                className="w-24 h-24 mx-2 rounded-lg overflow-hidden border-2"
                style={{ borderColor: capturedImages[index] ? '#815BF5' : '#333' }}
              >
                {capturedImages[index] ? (
                  <Image 
                    source={{ uri: capturedImages[index] }} 
                    style={{ width: '100%', height: '100%' }} 
                  />
                ) : (
                  <View className="w-full h-full bg-[#1A1D3D] justify-center items-center">
                    <Text className="text-white">{index + 1}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="bg-[#223072] py-3 px-6 rounded-lg mx-auto mb-6"
            onPress={pickImages}
            disabled={isLoading}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="images-outline" size={24} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white text-center">Select Images from Gallery</Text>
            </View>
          </TouchableOpacity>

          <Text className="text-white text-center mb-6 text-xs">
            For best results, please select clear images of your face from different angles
          </Text>

          <View className="flex-row justify-center mt-4 space-x-4">
            <TouchableOpacity
              className="bg-[#333] py-3 px-6 rounded-full"
              onPress={resetCapture}
              disabled={isLoading || capturedImages.length === 0}
              style={{ opacity: (isLoading || capturedImages.length === 0) ? 0.5 : 1 }}
            >
              <Text className="text-white">Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="bg-[#815BF5] py-3 px-6 rounded-full"
              onPress={handleSubmit}
              disabled={isLoading || capturedImages.length < 3}
              style={{ opacity: (isLoading || capturedImages.length < 3) ? 0.5 : 1 }}
            >
              <Text className="text-white">Submit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#815BF5" />
            <Text style={styles.loadingText}>Uploading images...</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});

export default FaceRegistrationModal;