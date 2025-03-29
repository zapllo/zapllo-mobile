// File: GradientButton.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator } from 'react-native';

interface GradientButtonProps {
  title: string;
  onPress?: () => void;
  imageSource: any; 
  loading:any
}

const ImageContainer: React.FC<{ source: any}> = ({ source}) => {
  return (
    <Image source={source} style={styles.image} />
  );
};

const GradientButton: React.FC<GradientButtonProps> = ({ title, onPress, imageSource,loading }) => {
  return (
    <View className="w-[90%]">
      <TouchableOpacity
        className="flex h-[3rem] items-center  text-center w-full justify-center rounded-full"
        onPress={onPress}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={['#6f40f0','#8963f2']}
          style={styles.gradient}
        >
          {/* <ImageContainer source={imageSource} /> */}
          <Text className="text-center font-semibold justify-center text-white text-lg" style={{ fontFamily: "LatoBold" }}>
            {loading ? <ActivityIndicator size="small" color='#fff'/> :title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5, // Use padding to simulate a gap
    flexDirection: "row", // To align image and text horizontally
  },
  image: {
    width: 22, // Adjust the size as needed
    height: 22,
    marginRight: 10, // Adjust the margin to create space between image and text
  },
});

export default GradientButton;