import { Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import NavbarTwo from "~/components/navbarTwo";
import { KeyboardAvoidingView } from "react-native";
import ToggleSwitch from "~/components/ToggleSwitch";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from 'expo-haptics';
import GradientButton from "~/components/GradientButton";
import MapView, { Marker, Region, MapPressEvent } from 'react-native-maps'
import * as Location from 'expo-location';

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
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
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
      } catch (error) {
        setErrorMsg('Error getting location');
        console.error(error);
      }
    })();
  }, []);

  const handleUnitPress = (unit: string) => {
    setSelectedUnit(unit);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleGeofencingToggle = (newState: boolean) => {
    setIsGeofencingEnabled(newState);
  };

  const handleSaveChanges = () => {
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

    // Prepare data for saving
    const officeLocationData = {
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      geofencing: isGeofencingEnabled,
      maxDistance: isGeofencingEnabled ? distanceValue : null,
      unit: selectedUnit,
    };

    console.log('Saving office location data:', officeLocationData);
    // Here you would typically save this data to your backend or local storage
    
    Alert.alert(
      "Success", 
      `Office location saved successfully${isGeofencingEnabled ? ` with a ${distanceValue} ${selectedUnit === 'Kilometers' ? 'km' : 'm'} geofence` : ''}`
    );
  };


const handleMapPress = (e: MapPressEvent) => {
  try {
    const { coordinate } = e.nativeEvent;
    if (coordinate) {
      setLocation(prevLocation => ({
        ...prevLocation,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: prevLocation.latitudeDelta,
        longitudeDelta: prevLocation.longitudeDelta,
      }));
    }
  } catch (error) {
    console.error('Error handling map press:', error);
    Alert.alert("Error", "Failed to set location. Please try again.");
  }
};

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
              {/* Map View */}
              <View className="w-full bg-white rounded-xl shadow-xl overflow-hidden h-64">
                {errorMsg ? (
                  <View className="flex-1 justify-center items-center">
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
                    }}
                  />
                </MapView>
                )}
              </View>
              <Text className="text-white text-xs mt-2 self-start" style={{ fontFamily: "Lato" }}>
                Tap on the map to set your office location
              </Text>
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
                title="Save Changes"
                imageSource={""}
                onPress={handleSaveChanges}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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