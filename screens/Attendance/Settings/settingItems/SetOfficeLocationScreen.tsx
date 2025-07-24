import { Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Alert, ActivityIndicator, Image } from "react-native";
import React, { useState, useEffect } from "react";
import NavbarTwo from "~/components/navbarTwo";
import { KeyboardAvoidingView } from "react-native";
import ToggleSwitch from "~/components/ToggleSwitch";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from 'expo-haptics';
import GradientButton from "~/components/GradientButton";
import MapView, { Marker, Region, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import ToastAlert from "~/components/ToastAlert";

export default function SetOfficeLocationScreen() {
  const [selectedUnit, setSelectedUnit] = useState('Kilometers');
  const [distance, setDistance] = useState('');
  const [isGeofencingEnabled, setIsGeofencingEnabled] = useState(false);
  const [location, setLocation] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [initialLocationSet, setInitialLocationSet] = useState(false);
  const [locationManuallySet, setLocationManuallySet] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Get auth token from Redux store
  const { token } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // First fetch organization data to get existing settings
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      setFetchingData(true);
      
      // Fetch organization data
      const response = await axios.get('https://zapllo.com/api/organization/getById', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.data) {
        const orgData = response.data.data;
        
        // Check if organization has geofencing enabled
        if (orgData.allowGeofencing !== undefined) {
          setIsGeofencingEnabled(orgData.allowGeofencing);
        }
        
        // Check if organization has geofence radius set
        if (orgData.geofenceRadius) {
          setDistance(orgData.geofenceRadius.toString());
          
          // Determine unit based on the radius value
          if (orgData.geofenceRadius >= 1000) {
            setSelectedUnit('Kilometers');
          } else {
            setSelectedUnit('Meters');
          }
        }
        
        // Now get location permissions and set location
        await initializeLocation();
      } else {
        // If no organization data, just get location permissions and set location
        await initializeLocation();
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
      // If error fetching organization data, just get location permissions and set location
      await initializeLocation();
    } finally {
      setFetchingData(false);
    }
  };
  
  const initializeLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      setFetchingData(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setInitialLocationSet(true);
      setFetchingData(false);
    } catch (error) {
      setErrorMsg('Error getting location');
      console.error(error);
      setFetchingData(false);
    }
  };

  const handleUnitPress = (unit: string) => {
    setSelectedUnit(unit);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleGeofencingToggle = (newState: boolean) => {
    setIsGeofencingEnabled(newState);
  };

  const handleSaveChanges = async () => {
    if (isGeofencingEnabled && !distance) {
      Alert.alert("Error", "Please enter a maximum allowed distance");
      return;
    }

    // Convert to a number and validate
    const distanceValue = parseFloat(distance);
    if (isGeofencingEnabled && (isNaN(distanceValue) || distanceValue <= 0)) {
      Alert.alert("Error", "Please enter a valid distance value");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for saving according to the API requirements
      const payload = {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        allowGeofencing: isGeofencingEnabled,
        geofenceInput: isGeofencingEnabled ? distanceValue : 0,
        unit: isGeofencingEnabled ? (selectedUnit === 'Kilometers' ? 'km' : 'm') : 'm', // default unit if geofencing is off
      };

      // Make API call to save location settings
      const response = await axios.post(
        'https://zapllo.com/api/organization/location',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Show success toast
        setShowSuccessToast(true);
      } else {
        Alert.alert("Error", response.data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert("Error", "Error updating settings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    try {
      const { coordinate } = e.nativeEvent;
      if (coordinate) {
        setLocation(prevLocation => ({
          ...prevLocation,
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
        }));
        setLocationManuallySet(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error handling map press:', error);
      Alert.alert("Error", "Failed to set location. Please try again.");
    }
  };

  const useCurrentLocation = async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Error", "Permission to access location was denied");
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      setLocationManuallySet(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert("Error", "Failed to get current location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <SafeAreaView className="h-full flex-1 bg-primary">
        <NavbarTwo title="Set Office Location" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#815BF5" />
          <Text className="text-white mt-4">Loading location settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Set Office Location" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-[90%] mt-8 flex items-center">
              {/* Instructions */}
              <View className="w-full bg-[#10122d] border border-[#37384B] rounded-xl p-4 mb-4">
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>
                  Office Location
                </Text>
                <Text className="text-[#787CA5] mt-1" style={{ fontFamily: "Lato" }}>
                  Tap on the map to set your office location or use the button below to use your current location.
                </Text>
              </View>
              
              {/* Map View */}
              <View className="w-full bg-white rounded-xl shadow-xl overflow-hidden h-64">
                {!initialLocationSet ? (
                  <View className="flex-1 justify-center items-center bg-[#10122d]">
                    <ActivityIndicator size="large" color="#815BF5" />
                    <Text className="text-white mt-4">Getting location...</Text>
                  </View>
                ) : errorMsg ? (
                  <View className="flex-1 justify-center items-center bg-[#10122d]">
                    <Text className="text-red-500">{errorMsg}</Text>
                  </View>
                ) : (
                <MapView
                  style={{ flex: 1 }}
                  region={location}
                  onPress={handleMapPress}
                  showsUserLocation={true}
                  loadingEnabled={true}
                >
                  <Marker
                    coordinate={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                    }}
                    title="Office Location"
                    description="Your office is located here"
                    draggable={true}
                    onDragEnd={(e) => {
                      setLocation(prevLocation => ({
                        ...prevLocation,
                        latitude: e.nativeEvent.coordinate.latitude,
                        longitude: e.nativeEvent.coordinate.longitude,
                      }));
                      setLocationManuallySet(true);
                    }}
                  />
                </MapView>
                )}
              </View>
              
              {/* Location status */}
              <View className="w-full flex-row justify-between items-center mt-2 mb-4">
                <Text 
                  className={`text-xs ${locationManuallySet ? 'text-[#FC8929]' : 'text-[#06D6A0]'}`} 
                  style={{ fontFamily: "Lato" }}
                >
                  {locationManuallySet 
                    ? "Location manually set" 
                    : "Using current location"}
                </Text>
                <TouchableOpacity 
                  onPress={useCurrentLocation}
                  className="bg-[#37384B] py-2 px-4 rounded-lg"
                  disabled={loading}
                >
                  <Text className="text-white text-xs" style={{ fontFamily: "LatoBold" }}>
                    Use Current Location
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <ToggleSwitch 
              title="Allow Geofencing" 
              isOn={isGeofencingEnabled} 
              onToggle={handleGeofencingToggle} 
            />
            
            {isGeofencingEnabled && (
              <View className="w-[90%] mt-8 flex items-center">
                {/* Distance unit selection */}
                <Text className="text-white self-start mb-2" style={{ fontFamily: "LatoBold" }}>Select Distance Unit</Text>
                <View className="items-center border border-[#676B93] w-full px-1.5 py-1.5 rounded-full mb-6">
                  <View className="w-full flex flex-row items-center justify-between">
                    <TouchableOpacity
                      className="w-1/2 items-center"
                      onPress={() => handleUnitPress('Kilometers')}
                    >
                      <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        colors={selectedUnit === 'Kilometers' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                        style={styles.tablet}
                      >
                        <Text className={`text-sm ${selectedUnit === 'Kilometers' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Kilometers</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-1/2 items-center"
                      onPress={() => handleUnitPress('Meters')}
                    >
                      <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        colors={selectedUnit === 'Meters' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                        style={styles.tablet}
                      >
                        <Text className={`text-sm ${selectedUnit === 'Meters' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Meters</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Distance configuration */}
                <View className="w-full bg-[#10122d] border border-[#37384B] rounded-2xl p-4 mb-4">
                  <Text className="text-white mb-2" style={{ fontFamily: "LatoBold" }}>
                    Maximum Allowed Distance in: {selectedUnit === 'Kilometers' ? 'km' : 'm'}
                  </Text>
                  
                  {/* Distance input field with unit */}
                  <View className="flex flex-row items-center justify-center mt-2">
                    <View className="flex-row items-center bg-[#1A1C3D] rounded-lg px-4 py-2 w-[70%]">
                      <TextInput
                        className="flex-1 text-white text-center"
                        value={distance}
                        onChangeText={setDistance}
                        placeholder="Enter distance"
                        placeholderTextColor="#676B93"
                        keyboardType="numeric"
                        style={{ fontFamily: "Lato" }}
                      />
                      <Text className="text-white ml-2" style={{ fontFamily: "LatoBold" }}>
                        {selectedUnit === 'Kilometers' ? 'km' : 'm'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            
            <View className="w-full items-center my-12">
              <GradientButton
                title={loading ? "Saving..." : "Save Changes"}
                imageSource={""}
                onPress={handleSaveChanges}
                loading={loading}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Success Toast */}
      <ToastAlert
        visible={showSuccessToast}
        type="success"
        title="Settings Updated!"
        message="Office location and geofencing settings have been updated successfully."
        onHide={() => setShowSuccessToast(false)}
        duration={4000}
        position="bottom"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
});