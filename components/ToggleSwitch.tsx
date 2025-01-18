import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Image, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface ToggleSwitchProps {
  isOn: boolean;
  onToggle: (newState: boolean) => void;
  title: String;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isOn, onToggle, title }) => {
  const position = useRef(new Animated.Value(isOn ? 1 : 0)).current;

  const toggleSwitch = () => {
    const newState = !isOn;
    onToggle(newState);
    Animated.timing(position, {
      toValue: newState ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // Enhanced haptic feedback
  };

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 43],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{title}</Text>
      <View
        style={[
          styles.switchContainer,
          { backgroundColor: isOn ? 'white' : '#37384B' },
        ]}
      >
        <TouchableOpacity onPress={toggleSwitch}>
          <Animated.View style={{ transform: [{ translateX }] }}>
            <Image
              style={styles.switchBall}
              source={require('../assets/Tasks/onOffBall.png')}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginTop: 6,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: 'white',
    fontFamily: 'LatoBold',
  },
  switchContainer: {
    position: 'relative',
    height: 37,
    width: 80,
    justifyContent: 'center',
    borderRadius: 24,
  },
  switchBall: {
    marginHorizontal: 1,
    height: 34,
    width: 34,
  },
});

export default ToggleSwitch;