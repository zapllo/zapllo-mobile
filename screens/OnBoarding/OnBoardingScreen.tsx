import React, { useRef, useState, useEffect } from 'react'
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, FlatList, Image, StatusBar, NativeSyntheticEvent, NativeScrollEvent, ViewToken } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
  Extrapolate,
  interpolate,
  Easing,
  SharedValue,
  withDelay,
  withSequence,
  withRepeat,
  runOnJS,
  useDerivedValue
} from 'react-native-reanimated'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Path } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import * as SecureStore from 'expo-secure-store'

const { width, height } = Dimensions.get('window')

interface PageItem {
  id: string;
  title: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  image: any;
}

// Updated PAGES array with images
const PAGES: PageItem[] = [
  {
    id: '1',
    title: 'Welcome to Zapllo',
    description: 'Your all-in-one platform for managing your employees with seamless tracking and organization tools.',
    primaryColor: '#0A0D28',
    secondaryColor: '#815BF5',
    accentColor: '#38BDF8',
    image: require('../../assets/LOGO.png')
  },
  {
    id: '2',
    title: 'Manage Your Tasks',
    description: 'Efficiently assign and track employee tasks, monitor project progress, and boost team productivity with our intuitive management system.',
    primaryColor: '#272945',
    secondaryColor: '#FC8929',
    accentColor: '#9F7AEA',
    image: require('../../assets/Tasks/onboardTwo.png')
  },
  {
    id: '3',
    title: 'Track Attendance',
    description: 'Keep track of employee attendance, work hours, and schedules with our comprehensive attendance management system.',
    primaryColor: '#1A1B4B',
    secondaryColor: '#6366F1',
    accentColor: '#818CF8',
    image: require('../../assets/Attendence/Onboardthree.png')
  },
]

// Create a custom wave component with animated SVG
const AnimatedPath = Animated.createAnimatedComponent(Path)

interface WaveProps {
  scrollX: SharedValue<number>;
  index: number;
  waveIndex: number;
  amplitude: number;
  phase: number;
  frequency: number;
}

// Enhanced Wave component with more natural animation
const Wave: React.FC<WaveProps> = ({ 
  scrollX, 
  index, 
  waveIndex, 
  amplitude = 35,  // Reduced amplitude for more subtle waves
  phase = 0,
  frequency = 2.5  // Lower frequency for smoother waves
}) => {
  const wavePhase = useSharedValue(phase)
  
  // Enhanced wave animation with natural movement
  useEffect(() => {
    wavePhase.value = withRepeat(
      withTiming(phase + Math.PI * 2, { 
        duration: 20000 / (waveIndex + 1), // Slower, more natural movement
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Custom easing for more natural flow
      }),
      -1,
      false
    )
  }, [])
  
  // Calculate the active state based on scroll position
  const activeValue = useDerivedValue(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
    return interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolate.CLAMP
    )
  })
  
  // Enhanced wave path generation
  const animatedPath = useDerivedValue(() => {
    const points = []
    const stepX = width / 50 // Increased points for smoother curves
    const steps = 51
    
    for (let i = 0; i < steps; i++) {
      const x = i * stepX
      const scaling = 1 - 0.25 * waveIndex // Subtle scaling for background waves
      const waveAmplitude = amplitude * scaling * activeValue.value
      
      // Enhanced wave formula with multiple sine waves
      const y = waveAmplitude * (
        Math.sin((i / frequency) + wavePhase.value + (waveIndex * Math.PI / 4)) * 0.6 +
        Math.sin((i / (frequency * 2)) + wavePhase.value) * 0.4
      )
      
      points.push(`${x},${y + height * (0.35 + 0.08 * waveIndex)}`)
    }
    
    return `M0,${height} L0,${height * 0.5} ${points.join(' ')} L${width},${height * 0.5} L${width},${height} Z`
  })
  
  // Enhanced color transitions
  const waveColor = useDerivedValue(() => {
    const colors = PAGES.map((page) => 
      waveIndex === 0 ? page.primaryColor :
      waveIndex === 1 ? page.secondaryColor :
      page.accentColor
    )
    
    return interpolateColor(
      scrollX.value,
      PAGES.map((_, i) => i * width),
      colors
    )
  })
  
  // Enhanced opacity animation
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        activeValue.value,
        [0, 1],
        [0.2, 0.85 - (waveIndex * 0.2)], // Increased base opacity
        Extrapolate.CLAMP
      )
    }
  })
  
  return (
    <Animated.View style={[styles.waveContainer, animatedStyle]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <AnimatedPath
          d={animatedPath as any}
          fill={waveColor as any}
        />
      </Svg>
    </Animated.View>
  )
}

interface BackgroundProps {
  scrollX: SharedValue<number>;
}

interface CircleGradientProps {
  scrollX: SharedValue<number>;
}

const CircleGradient: React.FC<CircleGradientProps> = ({ scrollX }) => {
  const gradientColors = useDerivedValue(() => {
    const inputRange = PAGES.map((_, i) => i * width)
    const currentIndex = Math.floor(scrollX.value / width)
    const nextIndex = Math.min(currentIndex + 1, PAGES.length - 1)
    const progress = (scrollX.value - currentIndex * width) / width

    const startColors = [
      `${PAGES[currentIndex].primaryColor}80`,
      `${PAGES[currentIndex].secondaryColor}60`,
      `${PAGES[currentIndex].accentColor}40`
    ]
    
    const endColors = [
      `${PAGES[nextIndex].primaryColor}80`,
      `${PAGES[nextIndex].secondaryColor}60`,
      `${PAGES[nextIndex].accentColor}40`
    ]

    return startColors.map((startColor, index) => {
      return interpolateColor(
        scrollX.value,
        inputRange,
        PAGES.map((_, i) => i === currentIndex ? startColor : endColors[index])
      )
    })
  })

  const gradientStyle = useAnimatedStyle(() => {
    return {
      opacity: 0.95,
      backgroundColor: 'transparent'
    }
  })

  return (
    <Animated.View style={[styles.circle, gradientStyle]}>
      <LinearGradient
        colors={[
          gradientColors.value[0],
          gradientColors.value[1],
          gradientColors.value[2]
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.8)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 1, y: 1 }}
        end={{ x: 0, y: 0 }}
      />
    </Animated.View>
  )
}

// Redesigned background with animated waves
const Background: React.FC<BackgroundProps> = ({ scrollX }) => {
  // Base background color animation
  const animatedStyles = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      PAGES.map((_, i) => i * width),
      PAGES.map(page => page.primaryColor)
    )
    
    return {
      backgroundColor,
    }
  })
  
  // Generate multiple waves for each onboarding page
  const renderWaves = () => {
    const waves = []
    
    // Create waves for each page
    for (let pageIndex = 0; pageIndex < PAGES.length; pageIndex++) {
      // Create multiple wave layers with different properties
      for (let waveIndex = 0; waveIndex < 3; waveIndex++) {
        waves.push(
          <Wave
            key={`wave-${pageIndex}-${waveIndex}`}
            scrollX={scrollX}
            index={pageIndex}
            waveIndex={waveIndex}
            amplitude={40 + (waveIndex * 15)} // Increasing amplitude
            phase={pageIndex * Math.PI / 2 + (waveIndex * Math.PI / 4)}
            frequency={4 + waveIndex}
          />
        )
      }
    }
    
    return waves
  }
  
  return (
    <View style={styles.backgroundContainer}>
      {/* Main background color */}
      <Animated.View style={[styles.backgroundFill, animatedStyles]} />
      
      {/* Render all wave layers */}
      {renderWaves()}
      
      {/* White circle for content */}
      <View style={styles.circleContainer}>
        <CircleGradient scrollX={scrollX} />
      </View>
    </View>
  )
}

interface PaginationProps {
  scrollX: SharedValue<number>;
  itemsCount: number;
}

// Redesigned pagination indicators
const Pagination: React.FC<PaginationProps> = ({ scrollX, itemsCount }) => {
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: itemsCount }).map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width]
        
        const dotWidth = useAnimatedStyle(() => {
          const width = interpolate(
            scrollX.value,
            inputRange,
            [8, 20, 8],
            Extrapolate.CLAMP
          )
          
          const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.5, 1, 0.5],
            Extrapolate.CLAMP
          )
          
          return {
            width,
            opacity
          }
        })
        
        const dotColor = useAnimatedStyle(() => {
          const backgroundColor = interpolateColor(
            scrollX.value,
            PAGES.map((_, i) => i * width),
            PAGES.map(page => page.primaryColor)
          )
          
          return {
            backgroundColor
          }
        })
        
        return (
          <Animated.View 
            key={`dot-${i}`} 
            style={[styles.dot, dotWidth, dotColor]} 
          />
        )
      })}
    </View>
  )
}

interface OnboardingItemProps {
  item: PageItem;
  index: number;
  scrollX: SharedValue<number>;
}

// Completely redesigned item component for the new look
const OnboardingItem: React.FC<OnboardingItemProps> = ({ item, index, scrollX }) => {
  const contentAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 0.5) * width,
      index * width,
      (index + 0.5) * width
    ]
    
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolate.CLAMP
    )
    
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolate.CLAMP
    )
    
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [width * 0.5, 0, -width * 0.5],
      Extrapolate.CLAMP
    )
    
    return {
      opacity,
      transform: [
        { scale },
        { translateX }
      ]
    }
  })
  
  return (
    <View style={styles.itemContainer}>
      <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
        {/* Image container replacing icon container */}
        <View style={styles.imageContainer}>
          <Image 
            source={item.image}
            style={styles.onboardingImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </Animated.View>
    </View>
  )
}

// Define ViewableItemsChanged type
type ViewableItemsChanged = {
  viewableItems: Array<ViewToken>;
  changed: Array<ViewToken>;
};

export default function OnBoardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollX = useSharedValue(0)
  const flatListRef = useRef<FlatList<PageItem>>(null)
  const insets = useSafeAreaInsets()
  
  // Button animations
  const buttonScale = useSharedValue(1)
  
  const animateButton = () => {
    buttonScale.value = withSequence(
      withTiming(1.1, { duration: 150 }),
      withTiming(1, { duration: 250 })
    )
  }
  
  const onViewableItemsChanged = useRef(({ viewableItems }: ViewableItemsChanged) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index || 0)
    }
  }).current
  
  const handleNext = () => {
    animateButton()
    
    if (currentIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })
    } else {
      // Mark onboarding as completed and navigate to login
      SecureStore.setItemAsync('hasCompletedOnboarding', 'true')
        .then(() => {
          router.replace('/(routes)/login')
        })
        .catch(error => {
          console.error('Error saving onboarding status:', error)
          router.replace('/(routes)/login')
        })
    }
  }
  
  const handleSkip = () => {
    // Mark onboarding as completed when skipped
    SecureStore.setItemAsync('hasCompletedOnboarding', 'true')
      .then(() => {
        router.replace('/(routes)/login')
      })
      .catch(error => {
        console.error('Error saving onboarding status:', error)
        router.replace('/(routes)/login')
      })
  }
  
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = event.nativeEvent.contentOffset.x
  }
  
  // Button animation style
  const buttonStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollX.value,
      PAGES.map((_, i) => i * width),
      PAGES.map((page) => page.primaryColor)
    )
    
    return {
      backgroundColor,
      transform: [{ scale: buttonScale.value }]
    }
  })
  
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Background with animated waves */}
      <Background scrollX={scrollX} />
      
      {/* Skip button at top right */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 16 }]}
        activeOpacity={0.7}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      
      {/* Main content with horizontal paging */}
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={({ item, index }) => (
          <OnboardingItem item={item} index={index} scrollX={scrollX} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 30 }}
        keyExtractor={(item) => item.id}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
      />
      
      {/* Bottom navigation bar */}
      <View style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom + 20, 30) }]}>
        {/* Pagination indicators */}
        <Pagination scrollX={scrollX} itemsCount={PAGES.length} />
        
        {/* Next/Done button */}
        <Animated.View style={[styles.nextButtonContainer]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleNext}
          >
            <Animated.View style={[styles.nextButton, buttonStyle]}>
              <Ionicons 
                name={currentIndex === PAGES.length - 1 ? "checkmark" : "arrow-forward"} 
                size={24} 
                color="white" 
              />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Background components
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  backgroundFill: {
    ...StyleSheet.absoluteFillObject,
  },
  waveContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  circleContainer: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    width: 1,
    height: 1,
    marginLeft: -0.5,
    marginTop: -0.5,
    zIndex: 2,
  },
  circle: {
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: 'hidden',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: 'transparent',
  },
  // FlatList content
  flatListContent: {
    alignItems: 'center',
  },
  // Item components
  itemContainer: {
    width,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    width: width * 0.5,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 150,
    zIndex: 2,
  },
  onboardingImage: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    position: 'absolute',
    bottom: 160,
    left: 40,
    width: '85%',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 22,
    fontWeight: '400',
  },
  // Navigation components
  skipButton: {
    position: 'absolute',
    right: 24,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  skipText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 20,
    zIndex: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButtonContainer: {
    marginLeft: 'auto',
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  }
})