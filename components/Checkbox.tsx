import { Entypo } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { XStack } from 'tamagui';

interface CheckboxProps {
  onPress: () => void;
  isChecked: boolean;
  containerStyle?: object;
  textStyle?: object;
  checkboxStyle?: object;
}

const Checkbox: React.FC<CheckboxProps> = ({
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

  const openTermsOfService = () => {
    Linking.openURL('https://zapllo.com/terms');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://zapllo.com/privacypolicy');
  };

  return (
    <XStack width="90%" alignItems="center" gap={12}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Trigger light haptic feedback
          startAnimation();
          onPress();
        }}
        style={[
          styles.checkbox,
          isChecked && styles.checkboxSelected,
          checkboxStyle,
        ]}
        accessibilityLabel="Checkbox"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked }}
      >
        <Animated.View style={{ width: animatedWidth }}>
          <Entypo name="check" size={25} style={{ color: '#815BF5' }} />
        </Animated.View>
      </TouchableOpacity>
      <View className=' '>
        <Text style={styles.checkboxText}>
          By clicking continue, you agree to our{' '}
          <Text style={styles.link} onPress={openTermsOfService}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.link} onPress={openPrivacyPolicy}>Privacy Policy</Text>.
        </Text>
      </View>
    </XStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    backgroundColor: '#37384B',
    borderWidth: 1,
    borderRadius: 5,
    height: 25,
    width: 25,
    fontFamily: "Lato-Regular"
  },
  checkboxSelected: {
    backgroundColor: '#37384B',
  },
  checkboxText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '400',
  },
  link: {
    color: '#815BF5',
    textDecorationLine: 'underline',
  },
});

export default Checkbox;