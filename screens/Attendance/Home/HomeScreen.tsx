import * as Location from 'expo-location';
import { useToast } from "react-native-toast-notifications";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, 
  TouchableWithoutFeedback, Keyboard, ScrollView, Image, Alert, 
  StyleSheet, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { Camera, CameraType, FlashMode, CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import Navbar from "~/components/navbar";
import { RootState } from "~/redux/store";
import { useSelector } from "react-redux";
import * as Haptics from 'expo-haptics';
import * as Brightness from 'expo-brightness';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Define the TimelineEvent type with userId
type TimelineEvent = {
  type: 'login' | 'logout' | 'startBreak' | 'endBreak';
  time: string;
  location: string;
  userId: string; // Add userId to track events per user
  timestamp: number; // Add timestamp for sorting and calculations
};

// Session storage for current app session only
const sessionData = {
  timelineEvents: [] as TimelineEvent[],
  breakData: {
    isBreakOpen: false,
    breakStartTime: null as Date | null,
    history: [] as {start: Date, end: Date, duration: number}[],
    totalTime: 0
  }
};

export default function HomeScreen() {
  const toast = useToast();
  const screenWidth = Dimensions.get('window').width;
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front'); // Default to front camera
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Office');
  const [flash, setFlash] = useState<FlashMode>("off");
  const [cameraTorch, setCameraTorch] = React.useState<boolean>(false);
  const cameraRef = useRef<Camera>(null);
  const [originalBrightness, setOriginalBrightness] = useState<number | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginTime, setLoginTime] = useState<string | null>(null);
  const { userData } = useSelector((state: RootState) => state.auth);
  const userId = userData?.data?._id || "anonymous";
  
  // Break tracking states
  const [isBreakOpen, setIsOnBreakOpen] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [currentBreakDuration, setCurrentBreakDuration] = useState(0); // in seconds
  const [totalBreakTime, setTotalBreakTime] = useState(0); // in seconds
  const [breakHistory, setBreakHistory] = useState<{start: Date, end: Date, duration: number}[]>([]);
  const [breakModalVisible, setBreakModalVisible] = useState(false);
  const breakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [actionType, setActionType] = useState<'login' | 'logout' | 'startBreak' | 'endBreak' | null>(null);
  

// Function to check login status
const checkLoginStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) {
      setIsLoggedIn(false);
      setIsOnBreakOpen(false);
      setBreakStartTime(null);
      return;
    }

    const response = await fetch('https://zapllo.com/api/check-login-status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      setIsLoggedIn(data.isLoggedIn);
      setIsOnBreakOpen(data.isBreakOpen);
      setBreakStartTime(data.breakStartTime ? new Date(data.breakStartTime) : null);
    } else {
      setIsLoggedIn(false);
      setIsOnBreakOpen(false);
      setBreakStartTime(null);
    }
  } catch (error) {
    console.error('Error checking login status:', error);
  }
};



useEffect(() => {
  checkLoginStatus(); 
}, []);






  // Get permissions and save original brightness when modal opens
  useEffect(() => {
    if (modalVisible) {
      (async () => {
        // Get permission to change brightness (iOS only)
        if (Platform.OS === 'ios') {
          const { status } = await Brightness.requestPermissionsAsync();
          if (status !== 'granted') {
            console.log('Brightness permission not granted');
          }
        }

        // Save original brightness
        try {
          const brightness = await Brightness.getBrightnessAsync();
          setOriginalBrightness(brightness);
        } catch (error) {
          console.error('Failed to get brightness:', error);
        }

        // Get location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermission(true);
          try {
            const location = await Location.getCurrentPositionAsync({});
            setLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude
            });
          } catch (error) {
            console.error('Error getting location:', error);
            Alert.alert('Error', 'Unable to get your location. Please check your location settings.');
           
          }
        } else {
          setLocationPermission(false);
          Alert.alert('Error', 'Location permission is required for attendance.');
         
        }
      })();
    } else {
      // Restore original brightness when modal closes
      if (originalBrightness !== null) {
        (async () => {
          try {
            await Brightness.setBrightnessAsync(originalBrightness);
          } catch (error) {
            console.error('Failed to restore brightness:', error);
          }
        })();
      }
      // Reset scanning states when modal closes
      setIsScanning(false);
      setScanComplete(false);
      setErrorMessage(null);
    }
  }, [modalVisible]);

  // Add this function to handle adding events to the timeline
  const addTimelineEvent = async (type: 'login' | 'logout' | 'startBreak' | 'endBreak') => {
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEvent: TimelineEvent = {
      type,
      time: currentTime,
      location: selectedOption === 'Home' ? 'Work From Home' : 'Work From Office',
      userId: userId || 'anonymous',
      timestamp: Date.now()
    };
  
    // Prevent duplicate events
    setTimelineEvents((prevEvents) => {
      if (prevEvents.length > 0 && prevEvents[0].type === type) {
        return prevEvents;
      }
      return [newEvent, ...prevEvents];
    });
  
    // Persist events in AsyncStorage
    try {
      await AsyncStorage.setItem('timelineEvents', JSON.stringify(timelineEvents));
    } catch (error) {
      console.error('Error saving timeline:', error);
    }
  };
  

  const handleLoginPress = async () => {
    // Add heavy haptic feedback when login button is pressed
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Set the action type based on current login state
    setActionType(isLoggedIn ? 'logout' : 'login');
    
    if (!cameraPermission || !cameraPermission.granted) {
      requestPermission();
    } else {
      setModalVisible(true);
    }
  };
  const handleStartEndBreak = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
    // if (!isLoggedIn) {
    //   toast.show("You need to be logged in to manage breaks", {
    //     type: "warning",
    //     placement: "bottom",
    //     duration: 3000,
    //   });
    //   return;
    // }
  
    const action = isBreakOpen ? 'logout' : 'login';
    setActionType(isBreakOpen ? 'endBreak' : 'startBreak');
  
    if (!cameraPermission || !cameraPermission.granted) {
      const permission = await requestPermission();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Camera permission is needed to verify your face for breaks.");
        return;
      }
    }
  
    setModalVisible(true);
  
    // This ensures actionType is properly set before photo capture
    setActionType(isBreakOpen ? 'endBreak' : 'startBreak');
  };
    
  
  

  const toggleCameraFacing = () => {
    // Reset flash state when switching cameras
    setIsFlashOn(false);
    setFlash("off");
    setCameraTorch(false);
    
    // If we were using screen brightness for front camera, restore it
    if (facing === 'front' && originalBrightness !== null) {
      (async () => {
        try {
          await Brightness.setBrightnessAsync(originalBrightness);
        } catch (error) {
          console.error('Failed to restore brightness:', error);
        }
      })();
    }
    
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // Break functionality
  const startBreakTimer = (startTime: Date) => {
    // Clear any existing timer
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
    }
    
    // Start a new timer that updates every second
    breakTimerRef.current = setInterval(() => {
      const now = new Date();
      const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setCurrentBreakDuration(elapsedSeconds);
    }, 1000);
  };


  const saveBreakDataToSession = (
    isBreakOpen: boolean, 
    breakStartTime: Date | null, 
    history: {start: Date, end: Date, duration: number}[], 
    totalTime: number
  ) => {
    // Update session data
    sessionData.breakData = {
      isBreakOpen,
      breakStartTime,
      history,
      totalTime
    };
  };
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };



// Fix for capturePhoto function - only the break-related part needs to be updated
const capturePhoto = async () => {
  const token = await AsyncStorage.getItem('authToken');
  if (cameraRef.current && !isScanning && location) {
    try {
      setIsScanning(true);
      setErrorMessage(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      const formData = new FormData();
      const imageUri = photo.uri;
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      formData.append('files', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      } as any);
      const uploadResponse = await fetch('https://zapllo.com/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.fileUrls[0];
      
      // Handle different action types
      if (actionType === 'login' || actionType === 'logout') {
        // Login/logout code remains unchanged
        const action = isLoggedIn ? 'logout' : 'login';
        
        const loginResponse = await fetch('https://zapllo.com/api/face-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            imageUrl,
            lat: location.lat,
            lng: location.lng,
            action,
            workFromHome: selectedOption === 'Home',
            userId,
          }),
        });
        const loginData = await loginResponse.json();
        if (loginResponse.ok && loginData.success) {
          setScanComplete(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          const newLoginState = action === 'login';
          setIsLoggedIn(newLoginState);
          addTimelineEvent(newLoginState ? 'login' : 'logout');
          if (newLoginState) {
            const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            setLoginTime(currentTime);
            await AsyncStorage.setItem(`loginTime_${userId}`, currentTime);
          } else {
            setLoginTime(null);
            await AsyncStorage.removeItem(`loginTime_${userId}`);
          }
          Alert.alert(`${action === 'login' ? 'Login' : 'Logout'} successful`);
          setTimeout(() => {
            setModalVisible(false);
            setIsScanning(false);
            setScanComplete(false);
          }, 1500);
        } else {
          handleApiError(loginData);
        }
      } else if (actionType === 'startBreak' || actionType === 'endBreak') {
        // Fixed break handling - use the correct API endpoint based on action type
        const action = isBreakOpen ? 'endBreak' : 'startBreak';
        const breakResponse = await fetch('https://zapllo.com/api/face-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            imageUrl,
            lat: location.lat,
            lng: location.lng,
            workFromHome: selectedOption === 'Home',
            userId,
            action
          }),
        });
        
        const breakData = await breakResponse.json();
        if (breakResponse.ok && breakData.success) {
          setScanComplete(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          
          if (actionType === 'startBreak') {
            // Start break
            const now = new Date();
            setIsOnBreakOpen(true);
            setBreakStartTime(now);
            startBreakTimer(now);
            addTimelineEvent('startBreak');
            
            // Save break data to session
            saveBreakDataToSession(
              true,
              now,
              breakHistory,
              totalBreakTime
            );
            
            Alert.alert("Break started successfully");
          } else {
            // End break
            const now = new Date();
            const breakDuration = currentBreakDuration;
            
            // Stop the timer
            if (breakTimerRef.current) {
              clearInterval(breakTimerRef.current);
              breakTimerRef.current = null;
            }
            
            // Update break history
            const newBreakHistory = [...breakHistory];
            if (breakStartTime) {
              newBreakHistory.push({
                start: breakStartTime,
                end: now,
                duration: breakDuration
              });
            }
            
            // Update total break time
            const newTotalBreakTime = totalBreakTime + breakDuration;
            
            // Reset current break state
            setIsOnBreakOpen(false);
            setBreakStartTime(null);
            setCurrentBreakDuration(0);
            
            // Update state with new history and total time
            setBreakHistory(newBreakHistory);
            setTotalBreakTime(newTotalBreakTime);
            addTimelineEvent('endBreak');
            
            // Save updated break data to session
            saveBreakDataToSession(
              false,
              null,
              newBreakHistory,
              newTotalBreakTime
            );
            
            Alert.alert("Break ended successfully");
          }
          
          setTimeout(() => {
            setModalVisible(false);
            setIsScanning(false);
            setScanComplete(false);
          }, 1500);
        } else {
          handleApiError(breakData);
        }
      }
    } catch (error: any) {
      console.error('Error in face verification process:', error);
      setErrorMessage(error.message || 'An error occurred during the process');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsScanning(false);
    }
  } else if (!location) {
    Alert.alert('Location Required', 'Location is required for attendance. Please enable location services.');
    setIsScanning(false);
  }
};
  // Helper function to handle API errors
  const handleApiError = (data: any) => {
    if (data.error === 'You are outside the allowed geofencing area.') {
      setErrorMessage('You are outside the allowed Geo-Fencing Area. Please raise a regularization request.');
    } else if (data.error === 'No matching face found. Please ensure you are facing the camera clearly and retry.') {
      setErrorMessage('Face not recognized. Please try again or contact support.');
    } else {
      setErrorMessage(data.error || 'Face recognition failed.');
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setIsScanning(false);
  };
  
  // Reset action type when modal closes
  useEffect(() => {
    if (!modalVisible) {
      setActionType(null);
    }
  }, [modalVisible]);

  // Enhanced flash toggle that works differently based on camera facing
  const toggleFlash = useCallback(async () => {
    setIsFlashOn(!isFlashOn);
    
    if (facing === 'back') {
      // For back camera, toggle torch
      setFlash(current => current === "off" ? "on" : "off");
      setCameraTorch(!cameraTorch);
    } else {
      // For front camera, adjust screen brightness
      try {
        if (!isFlashOn) {
          // Save current brightness if not already saved
          if (originalBrightness === null) {
            const brightness = await Brightness.getBrightnessAsync();
            setOriginalBrightness(brightness);
          }
          // Set to maximum brightness
          await Brightness.setBrightnessAsync(1);
        } else {
          // Restore original brightness
          if (originalBrightness !== null) {
            await Brightness.setBrightnessAsync(originalBrightness);
          }
        }
      } catch (error) {
        console.error('Failed to adjust brightness:', error);
      }
    }
  }, [facing, isFlashOn, cameraTorch, originalBrightness]);


  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <Navbar title="Attendance" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 ,alignItems:"center"}}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            
            >
            <View className=" items-center flex gap-8 mt-14 mb-16 pb-10  rounded-3xl w-[70%] h-[29.5 rem] bg-[#1f1d1d] shadow-black  "
                          style={{
                            shadowColor: 'rgba(0, 0, 3, 3.95)',
                            shadowOffset: { width: 2, height: 9 },
                            shadowOpacity: 0.8,
                            shadowRadius: 15,
                            elevation: 10,
                            boxShadow: "0px 7px 15px rgba(181, 128, 37, 0.75)",
                          }}
            >
              <View className='w-full items-center flex flex-col pt-20'>
                <Text className="text-white text-3xl" style={{fontFamily:"LatoBold"}}>
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
                <Text className="text-[#5e5656] mb-8" style={{fontFamily:"LatoBold"}}>
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    weekday: 'long'
                  })}
                </Text>
                
           
                {/* login/logout button */}
                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    colors={isLoggedIn ? ["#d75d5d", "#400b0b"] : ["#5d5479", "#1a226d"]}
                    style={styles.gradientBorderOne} 
                >
                  <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      colors={["#0A0D28", isLoggedIn ? "#c63d3d" : "#9079d4"]}  
                      style={styles.gradientBorderTwo}              
                  >
                    <TouchableOpacity
                      className="w-52 h-52 rounded-full items-center"
                      onPress={handleLoginPress}
                    >
                        <LinearGradient
                        start={{ x: 0, y:1 }}
                        end={{ x: 0, y: 0 }}
                        colors={["#0A0D28", "#383951"]}
                        style={styles.gradientButton}
                        >
                          {
                            isLoggedIn ? 
                            <Image 
                            style={{objectFit:"scale-down"}} 
                            className="h-28 w-32" 
                            source={require("../../../assets/Attendence/tapLOgout.png")}
                          /> :
                          <Image 
                          style={{objectFit:"scale-down"}} 
                          className="h-28 w-32" 
                          source={require("../../../assets/Attendence/tap.png")}
                        />
                          }

                            <Text className="text-white text-lg" style={{fontFamily:"LatoBold"}}>
                              {isLoggedIn ? "Log out" : "Log in"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                  </LinearGradient>                  
                </LinearGradient>
               
                </View>

                {/* Modal for Camera */}
                <Modal
                  isVisible={modalVisible}
                  style={{ margin: 0, justifyContent: 'flex-end' }}
                  animationIn="slideInUp"
                  animationOut="slideOutDown"
                  onBackdropPress={() => {
                    if (!isScanning) {
                      setModalVisible(false);
                    }
                  }}
                >
                  <View className="rounded-t-3xl bg-[#060924] h-[95%]">
                    {cameraPermission?.granted && (
                      <View style={styles.cameraContainer}>
                        <CameraView 
                       
                          ref={cameraRef}
                          style={styles.camera} 
                          facing={facing}
                          flash={facing === 'back' ? flash : 'off'}
                          enableTorch={facing === 'back' ? cameraTorch : false}
                        >
                          <View className="absolute p-5 flex w-full flex-row items-center justify-between">
                            <Image 
                              className="h-8 w-48" 
                              source={require("../../../assets/Attendence/cameraAiZapllo.png")}
                            />
                            <TouchableOpacity 
                              onPress={() => {
                                if (!isScanning) {
                                  setModalVisible(false);
                                }
                              }}
                              disabled={isScanning}
                            >
                              <Image 
                                source={require('../../../assets/commonAssets/cross.png')} 
                                className="h-8 w-8" 
                                style={{ opacity: isScanning ? 0.5 : 1 }}
                              />
                            </TouchableOpacity>
                          </View>  
                          
                          {location && (
                            <View 
                              className="flex items-center gap-2 flex-row absolute bottom-0 right-0 bg-[#06D6A0] p-2 rounded-tl-xl" 
                              style={{backgroundColor: "rgba(33, 225, 158, 0.6)"}}
                            >
                              <Image 
                                style={{opacity:1000}} 
                                className="w-6 h-6" 
                                source={require("../../../assets/Attendence/office.png")}
                              />
                              <Text 
                                className="text-white text-xs" 
                                style={{fontFamily:"LatoBold"}}
                              >
                                You are in office reach
                              </Text>
                            </View>
                          )}

                          {/* Scanning overlay */}
                          {isScanning && (
                            <View style={styles.scanningOverlay}>
                              {scanComplete ? (
                                <View style={styles.scanCompleteContainer}>
                                  <Text className='text-white' style={{fontFamily:"LatoBold"}}>
                                    {isLoggedIn ? "Logged Out Successfully" : "Logged In Successfully"}
                                  </Text>
                                </View>
                              ) : errorMessage ? (
                                <View style={styles.errorContainer}>
                                  <Text className=' text-red-500'>{errorMessage}</Text>
                                  <TouchableOpacity 
                                    style={styles.retryButton}
                                    onPress={() => {
                                      setIsScanning(false);
                                      setErrorMessage(null);
                                    }}
                                  >
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <View style={styles.scanningContainer}>
                                  <Image 
                                    source={require("../../../assets/Attendence/scanFace.png")} 
                                    style={styles.scanningImage}
                                  />
                                  <ActivityIndicator size="large" color="#815BF5" style={{marginVertical: 10}} />
                                  <Text style={styles.scanningText}>Scanning...</Text>
                                </View>
                              )}
                            </View>
                          )}
                        </CameraView>
                      </View>
                    )}
                    
                    {location && (
                      <View className="w-full items-start flex flex-col gap-2 ml-5 mt-2">
                        <Text className="text-white" style={{fontFamily:"LatoBold"}}>
                          {isLoggedIn ? "Logout" : "Login"} at {new Date().toLocaleTimeString()}
                        </Text>
                        <Text className="text-white text-xs" style={{fontFamily:"LatoBold"}}>
                          Lat: {location.lat.toFixed(6)}
                        </Text>
                        <Text className="text-xs text-white" style={{fontFamily:"LatoBold"}}>
                          Long: {location.lng.toFixed(6)}
                        </Text>
                      </View>
                    )}

                    <View className="w-full items-center flex flex-row justify-center gap-12 mb-3">
                      <TouchableOpacity 
                        className="bg-[#223072] justify-center h-12 w-12 rounded-full items-center flex"
                        onPress={toggleFlash}
                        disabled={isScanning}
                      >
                        <Ionicons 
                          name={isFlashOn ? "flash-outline" : "flash-off-outline"} 
                          size={30} 
                          color={isScanning ? "#666" : "white"}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={capturePhoto}
                        disabled={isScanning}
                      >
                        <MaterialIcons 
                          name="radio-button-on" 
                          size={80} 
                          color={isScanning ? "#666" : "white"}
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={toggleCameraFacing}
                        className="bg-[#223072] justify-center h-12 w-12 rounded-full items-center flex"
                        disabled={isScanning}
                      >
                        <Ionicons 
                          name="camera-reverse-outline" 
                          size={30} 
                          color={isScanning ? "#666" : "white"}
                        />
                      </TouchableOpacity>
                    </View>
                    
                    <View className="items-center border border-[#676B93] w-[95%] px-1.5 py-1.5 rounded-full mb-5 ml-3">
                      <View className="w-full flex flex-row items-center justify-between">
                        <TouchableOpacity
                          className="w-1/2 items-center"
                          onPress={() => handleOptionPress('Office')}
                          disabled={isScanning}
                        >
                          <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            colors={selectedOption === 'Office' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                            style={styles.tablet}
                          >
                            <Text 
                              className={`text-sm ${selectedOption === 'Office' ? 'text-white' : 'text-[#676B93]'}`} 
                              style={{ fontFamily: "LatoBold" }}
                            >
                              Office
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="w-1/2 items-center"
                          onPress={() => handleOptionPress('Home')}
                          disabled={isScanning}
                        >
                          <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            colors={selectedOption === 'Home' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                            style={styles.tablet}
                          >
                            <Text 
                              className={`text-sm ${selectedOption === 'Home' ? 'text-white' : 'text-[#676B93]'}`} 
                              style={{ fontFamily: "LatoBold" }}
                            >
                              Work From Home
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>


                {/* Take a break button */} 
                {/* Take a break button */} 
                {isLoggedIn && (
                  <TouchableOpacity
                    className="flex h-[4rem] items-center text-center w-[70%] shadow-2xl shadow-[#f7d472] border-2 justify-center rounded-full"
                    onPress={handleStartEndBreak}
                    style={{ overflow: 'hidden' }}
                  >
                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      colors={isBreakOpen ? ["#e63916", "#f77272"] : ["#e6af16", "#f7d472"]}
                      style={styles.gradient}
                    >
                      <MaterialIcons 
                        name={isBreakOpen ? "timer-off" : "free-breakfast"} 
                        size={25} 
                        color="#10122d" 
                        style={{ marginRight: 8 }} 
                      />
                      <Text className="text-primary text-lg" style={{fontFamily:"LatoBold"}}>
                        {isBreakOpen ? `End Break (${formatDuration(currentBreakDuration)})` : "Take a Break"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* Break time information */}
                {isLoggedIn && (
                  <View className="w-[70%] items-center mt-2">
                    <Text className="text-white text-sm" style={{fontFamily:"LatoRegular"}}>
                      Total Break Time Today: {formatDuration(totalBreakTime + (isBreakOpen ? currentBreakDuration : 0))}
                    </Text>
                  </View>
                )}

     

            </View>
            
            <View className="bg-[#272945] h-full w-full  rounded-t-3xl flex items-center p-5 pb-16">
              <Text className="text-white p-2 text-xl w-full" style={{fontFamily:"LatoBold"}}>Today's Logs</Text>
              <View className="m-6 mt-8 flex items-center justify-around flex-row w-full">
                <View className="w-1/3 flex flex-col gap-3 items-center">
                  <Image className="w-8 h-8" source={require("../../../assets/Attendence/clockWhite.png")}/>
                  <Text 
                    className={`text-[#FC8929] font-bold ${screenWidth < 300 ? "text-2xl" : "text-xl"}`}
                    style={{fontFamily:"LatoBold"}}
                  >
                    {isLoggedIn ? new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--"}
                  </Text>
                  <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>Clock In</Text>
                </View>

                <View className="w-1/3 flex flex-col gap-3 items-center">
                  <Image 
                    className="w-8 h-8" 
                    source={require("../../../assets/Attendence/clockGray.png")}
                    style={{ opacity: isLoggedIn ? 1 : 0.5 }}
                  />
                  <Text 
                    className={`text-white font-bold ${screenWidth < 300 ? "text-2xl" : "text-xl"}`} 
                    style={{fontFamily:"LatoBold"}}
                  >
                    {/* {!isLoggedIn && clockOutTime ? clockOutTime : "--:--"} */}
                  </Text>
                  <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>Clock Out</Text>
                </View>

                <View className="w-1/3 flex flex-col gap-3 items-center">
                  <Image className="w-8 h-8" source={require("../../../assets/Attendence/hours.png")}/>
                  <Text 
                    className={`text-white font-bold ${screenWidth < 300 ? "text-2xl" : "text-xl"}`} 
                    style={{fontFamily:"LatoBold"}}
                  >
                    --:--
                  </Text>
                  <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>Hours</Text>
                </View>
              </View>

              <View className="flex flex-col items-start w-[90%] mt-11 ">
                {timelineEvents.length > 0 ? (
                  timelineEvents.map((event, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <View className="h-20 w-0.5 bg-[#FC8929] ml-5"></View>}
                      
                      <View className="h-14 flex flex-row gap-2 items-center justify-center relative">
                        <Image
                          className="w-12 h-52 mt-4 object-scale-down"
                          source={
                            event.type === 'login' 
                              ? require("../../../assets/Attendence/right.png")
                              : event.type === 'logout'
                              ? require("../../../assets/Attendence/chaeckOut.png")
                              : event.type === 'startBreak'
                              ? require("../../../assets/Attendence/breakStart.png")
                              : require("../../../assets/Attendence/breakEnd.png")
                          }
                        />
                        <View className="flex flex-col items-start">
                          <View className="flex flex-row gap-2 items-center">
                            <Text className="text-white text-lg">{event.time}</Text>
                            {event.type === 'startBreak' && isBreakOpen && (
                              <LinearGradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}                      
                                colors={['#815BF5', '#FC8929']}
                                style={styles.gradientBorder}
                              >
                                <View className="bg-[#040614] items-center rounded-xl p-1">
                                  <Text className="text-white">On Break</Text>
                                </View>
                              </LinearGradient>
                            )}
                          </View>
                          <Text className="text-[#787CA5] text-sm">
                            {event.type === 'login' 
                              ? 'Login'
                              : event.type === 'logout'
                              ? 'Check Out'
                              : event.type === 'startBreak'
                              ? 'Break Started'
                              : 'Break Ended'
                            } - {event.location}
                          </Text>
                        </View>
                      </View>
                    </React.Fragment>
                        ))
                      ) : (
                        <Text className="text-[#787CA5] text-center w-full mt-4">No activity logged today</Text>
                      )}
                    </View>
            </View>             
        
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 10,
    padding: 1 ,
  },
  gradientBorderOne:{
    borderRadius: 1000,
    width:228,
    height:228,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
 


    
  },
  gradientBorderTwo:{
    borderRadius: 1000,
    width:202,
    height:202,
    display:"flex",
    alignItems:"center",
    justifyContent:"center"
    
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    borderRadius: 1000,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    gap:"3",
    
  },
  cameraContainer: {
    display:"flex",
    justifyContent: 'center',
    
    height:"65%",
    borderRadius:100,
  },
  camera: {
    flex: 1,
    
    
  },

  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width:"100%",
    display:"flex",
    alignItems:"center",
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  scanningContainer: {
    width: '80%',
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',

  

    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  
  scanCompleteContainer: {
    width: '80%',
    backgroundColor: '#0A0D28',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#21E19E',
    shadowColor: '#21E19E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  
  scanningImage: {
    width: 320,
    height: 320,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  
  scanCompleteImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  
  scanningText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'LatoBold',
    marginTop: 5,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#060924',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'LatoBold',
  },
  subText: {
    fontSize: 16,
    color: '#9DA3B4',
    marginBottom: 30,
  },

  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50, // To match the rounded-full class
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  
});