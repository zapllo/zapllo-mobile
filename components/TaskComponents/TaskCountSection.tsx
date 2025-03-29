import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TaskStatusCardProps {
  imageSource: any;
  status: string;
  count: number;
  color?: string;
  gradientColors?: string[];
  animationDelay?: number;
}

const TaskStatusCard: React.FC<TaskStatusCardProps> = ({ 
  imageSource, 
  status, 
  count = 0, 
  color = '#4b4d64',
  gradientColors = ['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.02)'],
  animationDelay = 0
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const barWidthAnim = useRef(new Animated.Value(0)).current;
  
  // Animated count value for smooth counting effect
  const animatedCount = countAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, count]
  });

  // Animated bar width
  const barWidth = barWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '40%']
  });

  useEffect(() => {
    // Reset animation when count changes
    countAnim.setValue(0);
    
    // Sequence of animations with delay
    const animationTimeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.bezier(0.16, 1, 0.3, 1)), // Custom bezier for premium feel
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        }),
        Animated.timing(countAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.poly(2)),
          useNativeDriver: false
        }),
        Animated.timing(barWidthAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false
        })
      ]).start();
    }, animationDelay);

    return () => clearTimeout(animationTimeout);
  }, [count, animationDelay]);

  // Generate colors for various elements
  const iconBgColor = `${color}15`;
  const borderColor = `#191d4d`;
  const shadowColor = "#342f5c";

  return (
    <Animated.View 
      className="w-1/2 px-1.5 py-1.5"
      style={[
        { 
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim
        }
      ]}
    >
      <View 
        className="rounded-2xl overflow-hidden"
        style={[
          styles.cardContainer,
          { 
            backgroundColor: '#0A0D28', // Simple background color that matches the theme
            borderColor: borderColor,
            shadowColor: shadowColor
          }
        ]}
      >
        <CardContent 
          status={status}
          count={count}
          imageSource={imageSource}
          color={color}
          iconBgColor={iconBgColor}
          borderColor={borderColor}
          shadowColor={shadowColor}
          animatedCount={animatedCount}
          barWidth={barWidth}
        />
      </View>
    </Animated.View>
  );
};

// Extracted card content to avoid duplication
const CardContent = ({ 
  status, 
  count, 
  imageSource, 
  color, 
  iconBgColor, 
  borderColor, 
  shadowColor,
  animatedCount,
  barWidth,
}) => (
  <View className="p-4">
    {/* Status and count section */}
    <View className="flex-row items-center justify-between mb-1">
      <Text 
        className="text-white text-xs uppercase tracking-wider opacity-70" 
        style={styles.statusLabel}
      >
        {status}
      </Text>
      
      <View 
        style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}
        className="rounded-full p-2"
      >
        <Image 
          source={imageSource} 
          className="h-5 w-5"
        />
      </View>
    </View>
    
    {/* Count with animation */}
    <View className="mt-1">
      <Animated.Text 
        className="text-white text-3xl" 
        style={[styles.countText, { color: 'white' }]}
      >
        {animatedCount.interpolate({
          inputRange: [0, count],
          outputRange: count ? ['0', count.toString()] : ['0', '0']
        })}
      </Animated.Text>
    </View>
    
    {/* Decorative elements */}
    <Animated.View 
      style={[
        styles.decorativeBar, 
        { 
          backgroundColor: color,
          width: barWidth
        }
      ]} 
      className="absolute bottom-0 left-0 h-1"
    />
    
    {/* Subtle highlight at top */}
    <View 
      style={styles.topHighlight} 
      className="absolute top-0 left-0 right-0 h-[1px] opacity-30"
    />
  </View>
);

const styles = StyleSheet.create({
  cardContainer: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderBottomWidth: 2,
  },
  statusLabel: {
    fontFamily: "SF-Pro-Display-Medium",
    letterSpacing: 0.7,
  },
  countText: {
    fontFamily: "SF-Pro-Display-Bold",
    letterSpacing: -0.8,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  iconImage: {
    resizeMode: 'contain',
  },
  decorativeBar: {
    height: 2,
    borderRadius: 1,
    opacity: 0.85,
  },
  topHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  }
});

export default TaskStatusCard;