import { Entypo } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

interface CheckboxProps {
  onPress: () => void;
  isChecked: boolean;
  containerStyle?: object;
  checkboxStyle?: object;
}

const CheckRound: React.FC<CheckboxProps> = ({
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
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          startAnimation();
          onPress();
        }}
        style={[
          styles.CheckboxTwo,
          checkboxStyle,
          isChecked && styles.checkedStyle, // Apply additional style when checked
        ]}
        accessibilityLabel="CheckboxTwo"
        accessibilityState={{ checked: isChecked }}
      >
        {isChecked ? (
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={["#815BF5", "#FC8929"]}
            style={styles.gradientBackground}
          >
            <View className='bg-white w-4 h-4 rounded-full '></View>
          </LinearGradient>
        ) : (
          <Animated.View style={{ width: animatedWidth }}>
            <View ></View>
          </Animated.View>
        )}
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
    borderRadius: 100,
    height: 25,
    width: 25,
    fontFamily: "Lato-Regular",
    borderColor: "#37384B",
  },
  checkedStyle: {
    borderWidth: 0, // Remove border when checked
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    height: '100%',
    width: '100%',
  },
});

export default CheckRound;