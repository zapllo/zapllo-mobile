import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingZaplloProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  showBackground?: boolean;
}

const LoadingZapllo: React.FC<LoadingZaplloProps> = ({
  isVisible,
  onAnimationComplete,
  showText = true,
  size = 'large',
  showBackground = true
}) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<any>(null);

  const sizeConfig = {
    small: { logo: 60, text: 18, container: 80 },
    medium: { logo: 80, text: 20, container: 100 },
    large: { logo: 100, text: 24, container: 120 }
  };

  const currentSize = sizeConfig[size];

  useEffect(() => {
    if (isVisible) {
      // Start animations
      const mainAnimation = Animated.parallel([
        // Logo animations
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        // Text animation (delayed)
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        })
      ]);

      mainAnimation.start(() => {
        // Animation complete callback
        if (onAnimationComplete) {
          setTimeout(() => {
            onAnimationComplete();
          }, 0);
        }
      });

      // Continuous pulse animation
      const pulse = () => {
        if (!isVisible) return;
        
        animationRef.current = Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        ]);
        
        animationRef.current.start(() => {
          if (isVisible) {
            pulse();
          }
        });
      };
      
      pulse();
    } else {
      // Stop any running animations
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      // Reset animations when not visible
      logoOpacity.setValue(0);
      logoScale.setValue(0.3);
      logoRotation.setValue(0);
      textOpacity.setValue(0);
      pulseAnim.setValue(1);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [isVisible]);

  const spin = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isVisible) return null;

  // If showBackground is false, render just the logo without background
  if (!showBackground) {
    return (
      <View style={styles.inlineContainer}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              width: currentSize.container,
              height: currentSize.container,
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { rotate: spin },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#815BF5', '#FC8929']}
            style={[styles.logoGradient, { 
              width: currentSize.logo, 
              height: currentSize.logo,
              borderRadius: currentSize.logo / 2 
            }]}
          >
            <Text style={[styles.logoText, { fontSize: currentSize.logo * 0.48 }]}>Z</Text>
          </LinearGradient>
        </Animated.View>
        
        {showText && (
          <Animated.Text
            style={[
              styles.logoSubtext,
              {
                fontSize: currentSize.text,
                opacity: textOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            Zapllo
          </Animated.Text>
        )}

        {/* Simple loading dots without infinite loop */}
        <Animated.View 
          style={[
            styles.dotsContainer,
            { opacity: textOpacity }
          ]}
        >
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      {/* Solid background with #05071E color */}
      <View style={styles.solidBackground}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              width: currentSize.container,
              height: currentSize.container,
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                { rotate: spin },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#815BF5', '#FC8929']}
            style={[styles.logoGradient, { 
              width: currentSize.logo, 
              height: currentSize.logo,
              borderRadius: currentSize.logo / 2 
            }]}
          >
            <Text style={[styles.logoText, { fontSize: currentSize.logo * 0.48 }]}>Z</Text>
          </LinearGradient>
        </Animated.View>
        
        {showText && (
          <Animated.Text
            style={[
              styles.logoSubtext,
              {
                fontSize: currentSize.text,
                opacity: textOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            Zapllo
          </Animated.Text>
        )}

        {/* Simple loading dots without infinite loop */}
        <Animated.View 
          style={[
            styles.dotsContainer,
            { opacity: textOpacity }
          ]}
        >
          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  solidBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#05071E',
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#815BF5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logoText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtext: {
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    letterSpacing: 3,
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dotsContainer: {
    marginTop: 10,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(252, 137, 41, 0.3)',
  },
  dotActive: {
    backgroundColor: '#FC8929',
  },
});

export default LoadingZapllo;