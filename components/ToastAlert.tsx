import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastAlertProps {
  visible: boolean;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onHide: () => void;
  position?: 'top' | 'bottom';
  showCloseButton?: boolean;
}

const ToastAlert: React.FC<ToastAlertProps> = ({
  visible,
  type,
  title,
  message,
  duration = 4000,
  onHide,
  position = 'bottom',
  showCloseButton = true,
}) => {
  const translateY = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-done',
          colors: ['rgba(129, 91, 245, 0.15)', 'rgba(139, 101, 255, 0.1)'],
          borderColor: 'transparent',
          iconColor: '#815BF5',
          shadowColor: '#815BF5',
        };
      case 'error':
        return {
          icon: 'close-circle',
          colors: ['rgba(129, 91, 245, 0.15)', 'rgba(139, 101, 255, 0.1)'],
          borderColor: 'transparent',
          iconColor: '#815BF5',
          shadowColor: '#815BF5',
        };
      case 'warning':
        return {
          icon: 'warning',
          colors: ['rgba(129, 91, 245, 0.15)', 'rgba(139, 101, 255, 0.1)'],
          borderColor: 'transparent',
          iconColor: '#815BF5',
          shadowColor: '#815BF5',
        };
      case 'info':
        return {
          icon: 'information-circle',
          colors: ['rgba(129, 91, 245, 0.15)', 'rgba(139, 101, 255, 0.1)'],
          borderColor: 'transparent',
          iconColor: '#815BF5',
          shadowColor: '#815BF5',
        };
      default:
        return {
          icon: 'information-circle',
          colors: ['rgba(129, 91, 245, 0.15)', 'rgba(139, 101, 255, 0.1)'],
          borderColor: 'transparent',
          iconColor: '#815BF5',
          shadowColor: '#815BF5',
        };
    }
  };

  const config = getToastConfig();

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();

      // Auto hide
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    } else {
      hideToast();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 200,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 0.8,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    hideToast();
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 100 : 95,
        left: '35%',
        right: '35%',
        zIndex: 9999,
        transform: [
          { translateY },
          { scale },
        ],
        opacity,
      }}
    >
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 70}
        tint="dark"
        style={{
          borderRadius: 30,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={config.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 8,
            minHeight: 45,
            backgroundColor: 'rgba(129, 91, 245, 0.08)',
          }}
        >

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',marginTop:3 }}>
            {/* Icon Container */}
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: 'rgba(129, 91, 245, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 6,
              }}
            >
              <Ionicons
                name={config.icon as any}
                size={14}
                color={config.iconColor}
              />
            </View>

            {/* Content */}
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '600',
                fontFamily: 'LatoBold',
                lineHeight: 16,
              }}
              numberOfLines={1}
            >
              {type === 'success' ? 'Done' : title}
            </Text>
          </View>

                  </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

export default ToastAlert;