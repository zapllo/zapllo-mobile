import { Entypo } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CheckboxProps {
  onPress: () => void;
  isChecked: boolean;
  containerStyle?: object;
  textStyle?: object;
  checkboxStyle?: object;
}

const CheckboxTwo: React.FC<CheckboxProps> = ({
  onPress,
  isChecked,
  containerStyle,
  checkboxStyle,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const startAnimation = () => {
    const toValue = isChecked ? 0 : 30;
    Animated.timing(animatedWidth, {
      toValue: toValue,
      duration: 500,
      useNativeDriver: false, // Consider changing to true if applicable
    }).start();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Trigger light haptic feedback
          startAnimation();
          onPress();
        }}
        style={[
          styles.CheckboxTwo,
          isChecked && styles.checkboxSelected,
          checkboxStyle,
        ]}
        accessibilityLabel="CheckboxTwo"
        
        accessibilityState={{ checked: isChecked }}
      >
        <Animated.View style={{ width: animatedWidth }}>
          <Entypo name="check" size={22} style={{ color: '#815BF5' }} />
        </Animated.View>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  CheckboxTwo: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderRadius: 5,
    height: 25,
    width: 25,
    fontFamily:"Lato-Regular",
    borderColor:"#37384B",
    
  },
  checkboxSelected: {
    backgroundColor: '#37384B',
  },
  checkboxText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '400',
    paddingLeft: 5,
  },
  link: {
    color: '#815BF5',
    textDecorationLine: 'underline',
  },
});

export default CheckboxTwo;