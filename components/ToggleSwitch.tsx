import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Image, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: (newState: boolean) => void;
  title: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle, title }) => {
  const position = useRef(new Animated.Value(isOn ? 1 : 0)).current;

  const toggleSwitch = () => {
    const newState = !isOn;
    onToggle(newState);
    Animated.timing(position, {
      toValue: newState ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22], // Adjusted for smaller size
  });

  return (
    <View className='flex flex-row justify-between items-center w-[90%] py-3 px-4 bg-[#0A0D28] rounded-xl mt-4'>
      <Text style={styles.label}>{title}</Text>
      <TouchableOpacity onPress={toggleSwitch} activeOpacity={0.7}>
        <View style={[styles.switchContainer, { backgroundColor: isOn ? 'white' : '#37384B' }]}>
          <Animated.View style={[styles.switchBall, { transform: [{ translateX }] }]}>
            <Image source={require('../assets/Tasks/onOffBall.png')} style={styles.switchBallImage} />
          </Animated.View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  
  label: {
    color: 'white',
    fontFamily: 'LatoBold',
    fontSize: 12, // Made it smaller
  },
  switchContainer: {
    position: 'relative',
    height: 22, // Smaller height
    width: 45, // Smaller width
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 2,
  },
  switchBall: {
    position: 'absolute',
    height: 20,
    width: 20,
  },
  switchBallImage: {
    height: '100%',
    width: '100%',
  },
});

export default ToggleSwitch;
