import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

interface AudioVisualizerProps {
  recording: any;
  barCount?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ recording, barCount = 30 }) => {
  const bars = Array(barCount).fill(0);
  const audioLevels = bars.map(() => useSharedValue(2));
  const phases = bars.map(() => useSharedValue(0));

  useEffect(() => {
    if (recording) {
      // Start wave animation
      bars.forEach((_, index) => {
        // Create phase offset for wave effect
        phases[index].value = withRepeat(
          withTiming(2 * Math.PI, {
            duration: 2000,
            easing: Easing.linear,
          }),
          -1,
          false
        );
      });

      recording.setOnRecordingStatusUpdate((status: any) => {
        if (status.metering !== undefined) {
          bars.forEach((_, index) => {
            // Base amplitude from audio level
            const baseAmplitude = Math.max(2, (status.metering + 100) / 2);
            
            // Animate with spring for more natural movement
            audioLevels[index].value = withSpring(baseAmplitude, {
              mass: 1,
              damping: 15,
              stiffness: 120,
            });
          });
        }
      });
    } else {
      // Reset animations when not recording
      bars.forEach((_, index) => {
        audioLevels[index].value = withSpring(2);
        phases[index].value = 0;
      });
    }

    return () => {
      // Cleanup
      bars.forEach((_, index) => {
        audioLevels[index].value = 2;
        phases[index].value = 0;
      });
    };
  }, [recording]);

  const renderBar = (index: number) => {
    const animatedStyle = useAnimatedStyle(() => {
      // Calculate wave effect
      const phase = phases[index].value;
      const offset = (index / barCount) * (2 * Math.PI);
      const wave = Math.sin(phase + offset) * 6;
      
      // Combine base height with wave effect
      const height = Math.max(2, audioLevels[index].value + wave);
      const width = Math.max(4, wave); // Increased width

      return {
        height,
        backgroundColor: '#815BF5',
        width, // Updated width
        margin: 2,
        borderRadius: 3,
        transform: [
          { scaleY: height / 17 }, // Smooth scaling effect
        ],
      };
    });

    return (
      <Animated.View
        key={index}
        style={[
          {
            alignSelf: 'center',
          },
          animatedStyle,
        ]}
      />
    );
  };

  return (
    <View className="flex h-20  flex-row items-center justify-center">
      {bars.map((_, index) => renderBar(index))}
    </View>
  );
};

export default AudioVisualizer;