import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  interpolate
} from 'react-native-reanimated';

interface CustomSplashScreenProps {
  visible: boolean; // Add visible prop to control modal visibility
  lottieSource: string | object;
  mainText: string;
  subtitle: string;
  onComplete?: () => void;
  onDismiss?: () => void; // Add onDismiss callback
  duration?: number;
  gradientColors?: string[];
  textGradientColors?: string[];
  condition?: {
    type: 'location' | 'order' | 'custom';
    status: boolean;
    successAnimation?: string | object;
    failureAnimation?: string | object;
  };
}

const { width, height } = Dimensions.get('window');

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({
  visible,
  lottieSource,
  mainText,
  subtitle,
  onComplete,
  onDismiss,
  duration = 3000,
  gradientColors = ["#05071E", "#0A0D28"],
  textGradientColors = ["#815BF5", "#FC8929"],
  condition
}) => {
  const [showMainText, setShowMainText] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [animationSource, setAnimationSource] = useState<string | object>(lottieSource);
  
  // Animation values
  const lottieOpacity = useSharedValue(0);
  const mainTextOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const mainTextTranslateY = useSharedValue(20);
  const subtitleTranslateY = useSharedValue(20);
  
  // Reset animation states when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset states
      setShowMainText(false);
      setShowSubtitle(false);
      lottieOpacity.value = 0;
      mainTextOpacity.value = 0;
      subtitleOpacity.value = 0;
      mainTextTranslateY.value = 20;
      subtitleTranslateY.value = 20;
      
      // Start animations
      startAnimations();
    }
  }, [visible]);
  
  // Determine which animation to show based on condition
  useEffect(() => {
    if (condition) {
      if (condition.status) {
        if (condition.successAnimation) {
          setAnimationSource(condition.successAnimation);
        }
      } else {
        if (condition.failureAnimation) {
          setAnimationSource(condition.failureAnimation);
        }
      }
    }
  }, [condition]);
  
  // Animation styles
  const lottieAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: lottieOpacity.value,
      transform: [
        { scale: interpolate(lottieOpacity.value, [0, 0.5, 1], [0.8, 1.05, 1]) },
        { 
          rotate: `${interpolate(
            lottieOpacity.value, 
            [0, 0.3, 0.6, 1], 
            [-10, 5, -2, 0]
          )}deg` 
        }
      ],
      shadowOpacity: interpolate(lottieOpacity.value, [0, 1], [0, 0.2]),
      shadowRadius: interpolate(lottieOpacity.value, [0, 1], [0, 10]),
      shadowOffset: {
        width: 0,
        height: interpolate(lottieOpacity.value, [0, 1], [0, 5]),
      },
    };
  });
  
 
  
  const startAnimations = () => {
    // Fade in lottie animation
    lottieOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    
    // After a delay, show main text
    const mainTextDelay = 1000;
    setTimeout(() => {
      setShowMainText(true);
      mainTextOpacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      mainTextTranslateY.value = withTiming(0, {
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }, mainTextDelay);
    
    // After another delay, show subtitle
    const subtitleDelay = 1800;
    setTimeout(() => {
      setShowSubtitle(true);
      subtitleOpacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      subtitleTranslateY.value = withTiming(0, {
        duration: 600,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }, subtitleDelay);
    
    // Call onComplete after the specified duration
    if (onComplete) {
      setTimeout(() => {
        onComplete();
        if (onDismiss) {
          onDismiss(); // Call onDismiss to close the modal
        }
      }, duration);
    }
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={gradientColors}
          style={styles.gradient}
        >
          <Animated.View style={[styles.lottieContainer, lottieAnimatedStyle]}>
            <LottieView
              source={typeof animationSource === 'string' ? { uri: animationSource } : animationSource}
              autoPlay
              loop
              style={styles.lottie}
            />
          </Animated.View>
          
        
       

                <Text style={styles.mainText}>{mainText}</Text>
             
        
          
          
          
          
              <Text style={styles.subtitle}>{subtitle}</Text>

     
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  lottie: {
    width: 200,
    height: 200,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  textGradient: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mainText: {
    fontSize: 20,
    fontFamily: 'LatoBold',
    color: '#d3d6f5',
    textAlign: 'center',
  },
  subtitleContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: '#787CA5',
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default CustomSplashScreen;