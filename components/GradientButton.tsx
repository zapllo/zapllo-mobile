// File: GradientButton.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientButtonProps {
  title: string;
  onPress?: () => void;
  imageSource: any; // You can specify a more specific type if needed
}

const ImageContainer: React.FC<{ source: any }> = ({ source }) => {
  return (
    <Image source={source} style={styles.image} />
  );
};

const GradientButton: React.FC<GradientButtonProps> = ({ title, onPress, imageSource }) => {
  return (
    <View className="w-[90%]">
      <TouchableOpacity
        className="flex h-[4rem] items-center justify-center rounded-full"
        onPress={onPress}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={["#815BF5", "#FC8929"]}
          style={styles.gradient}
        >
          <ImageContainer source={imageSource} />
          <Text className="text-center font-semibold text-white text-lg" style={{ fontFamily: "LatoBold" }}>
            {title}
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