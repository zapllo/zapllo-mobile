import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import Modal from 'react-native-modal';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import AudioVisualizer from '../TaskComponents/assignNewTaskComponents/AudioVisualizer';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import axios from 'axios';
import { backend_Host } from '~/config';

interface VoiceTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onTaskCreated?: (taskData: any) => void;
}

const VoiceTaskModal: React.FC<VoiceTaskModalProps> = ({ isVisible, onClose, onTaskCreated }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [waveAnim1] = useState(new Animated.Value(0));
  const [waveAnim2] = useState(new Animated.Value(0));
  const [waveAnim3] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));
  const [aiCredits, setAiCredits] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (!isVisible) {
      cleanupRecording();
    } else {
      // Fetch AI credits when modal opens
      fetchAiCredits();
    }
  }, [isVisible]);

  const fetchAiCredits = async () => {
    try {
      const response = await axios.get(`${backend_Host}/organization/ai-credits`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data.success) {
        setAiCredits(response.data.aiCredits);
      }
    } catch (error) {
      console.error('Error fetching AI credits:', error);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupRecording();
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      // Pulse animation for main circle
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animations
      Animated.loop(
        Animated.timing(waveAnim1, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(waveAnim2, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(waveAnim3, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim1.setValue(0);
      waveAnim2.setValue(0);
      waveAnim3.setValue(0);
      glowAnim.setValue(0);
    }
  }, [isRecording]);

  const cleanupRecording = async () => {
    // Clean up both state and ref
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        console.log('Error cleaning up ref recording:', e);
      }
      recordingRef.current = null;
    }
    
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {
        console.log('Error cleaning up state recording:', e);
      }
    }
    
    setRecording(null);
    setIsRecording(false);
    setIsTranscribing(false);
    setRecordingDuration(0);
  };

  const startRecording = async () => {
    try {
      // Aggressive cleanup before starting
      await cleanupRecording();
      
      // Wait a bit to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant microphone permission to record voice tasks.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = newRecording;
      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      await cleanupRecording();
    }
  };

  const stopRecording = async () => {
    const currentRecording = recordingRef.current || recording;
    if (!currentRecording) return;

    try {
      setIsRecording(false);
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      recordingRef.current = null;
      setRecording(null);
      setRecordingDuration(0);
      
      if (uri) {
        await processRecording(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to save recording. Please try again.');
      await cleanupRecording();
    }
  };

  const processRecording = async (uri: string) => {
    if (aiCredits <= 0) {
      Alert.alert('No Credits', 'No AI credits remaining. Please contact your administrator.');
      return;
    }

    setIsTranscribing(true);
    try {
      // Create FormData for the audio file
      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/wav',
        name: 'recording.wav',
      } as any);

      // Simulate API call - replace with your actual endpoint
      const response = await fetch('https://zapllo.com/api/tasks/voice-suggest', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (result.success) {
        if (result.creditStatus) {
          setAiCredits(result.creditStatus.remaining);
        }

        Alert.alert('Success', 'Task created from your voice recording!');
        
        if (onTaskCreated && result.taskData) {
          onTaskCreated(result.taskData);
        }
        
        onClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to process voice input');
      }
    } catch (error: any) {
      console.error('Error processing voice:', error);
      Alert.alert('Error', 'Failed to process voice input. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const cancelRecording = async () => {
    await cleanupRecording();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (isTranscribing) return 'Creating your task...';
    if (isRecording) return 'Listening... Speak your task';
    return 'Ready to record';
  };

  const getSubText = () => {
    if (isTranscribing) return 'Structuring your Tasks with Zapllo AI';
    if (isRecording) return 'Describe your task with details like due date, assignee, and priority';
    return 'Tap record and speak naturally - the task will be created automatically';
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={!isRecording && !isTranscribing ? onClose : undefined}
      style={{ justifyContent: 'center', margin: 20 }}
    >
      <View className="bg-[#05071E] rounded-2xl overflow-hidden border border-[#37384B]">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#37384B]">
          <View className="flex-row items-center gap-3">
            
            <View>
              <Text className="text-white text-lg" style={{ fontFamily: 'LatoBold' }}>
                AI Voice Assistant
              </Text>
              <Text className="text-[#787CA5] text-sm" style={{ fontFamily: 'LatoRegular' }}>
                {isTranscribing ? 'Processing your voice...' : 'Turn your ideas into structured tasks'}
              </Text>
            </View>
          </View>
          
          <View className={`px-3 py-1.5 rounded-full flex-row items-center ${
            aiCredits > 10 ? 'bg-[#065F46]' :
            aiCredits > 0 ? 'bg-[#92400E]' : 'bg-[#7F1D1D]'
          }`}>
            {aiCredits <= 5 && <MaterialIcons name="warning" size={12} color="#FFFFFF" />}
            <Text className="text-white text-xs ml-1" style={{ fontFamily: 'LatoBold' }}>
              {aiCredits}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View className="p-5">
          {/* AI Introduction */}
          <View className="items-center mb-6">
            <Text className="text-white text-xl mb-2" style={{ fontFamily: 'LatoBold' }}>
              {getStatusText()}
            </Text>
            <Text className="text-[#787CA5] text-xs text-center mb-4" style={{ fontFamily: 'LatoRegular' }}>
              {getSubText()}
            </Text>
            
            {/* AI Credits Warning */}
            {aiCredits <= 5 && (
              <View className="flex-row items-center bg-[#92400E20] border border-[#92400E40] rounded-lg px-3 py-2 mb-4">
                <MaterialIcons name="warning" size={16} color="#FC8929" />
                <Text className="text-[#FC8929] text-sm ml-2" style={{ fontFamily: 'LatoRegular' }}>
                  {aiCredits === 0 ? 'No AI credits remaining' : `Only ${aiCredits} credit${aiCredits !== 1 ? 's' : ''} left`}
                </Text>
              </View>
            )}
          </View>

          {/* Central Recording Interface */}
          <View className="items-center mb-6">
            {!isRecording ? (
              <View className="items-center mb-4">
                {isTranscribing ? (
                  <View className="items-center mb-6">
                    <View className="flex-row gap-2 mb-3">
                      <View className="w-3 h-3 bg-[#815BF5] rounded-full" />
                      <View className="w-3 h-3 bg-[#815BF5] rounded-full" />
                      <View className="w-3 h-3 bg-[#815BF5] rounded-full" />
                    </View>
                    <Text className="text-[#4F46E5] text-sm" style={{ fontFamily: 'LatoBold' }}>
                      Converting speech to structured task...
                    </Text>
                  </View>
                ) : (
                  <View className="relative">
                    {/* Outer glow ring */}
                    <View className={`absolute -inset-2 rounded-full opacity-20 blur-lg ${
                      aiCredits <= 0 ? 'bg-[#374151]' : 'bg-[#815BF5]'
                    }`} />
                    <TouchableOpacity
                      onPress={startRecording}
                      disabled={aiCredits <= 0}
                      className="h-36 w-36 items-center justify-center rounded-full overflow-hidden"
                      activeOpacity={0.8}
                      style={{
                        shadowColor: aiCredits <= 0 ? '#374151' : '#815BF5',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 12,
                      }}
                    >
                      <View
                        className={`w-full h-full items-center justify-center relative ${
                          aiCredits <= 0 ? 'bg-[#374151]' : 'bg-[#815BF5]'
                        }`}
                      >
                        <MaterialIcons 
                          name="mic" 
                          size={56} 
                          color={aiCredits <= 0 ? "#6B7280" : "#FFFFFF"} 
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View className="mb-3 h-52 w-full mt-6">
                <View className="flex-1">
                  <AudioVisualizer recording={recording} />
                </View>
                <View className="flex-row justify-center mt-8">
                  <TouchableOpacity
                    onPress={stopRecording}
                    className="flex-row items-center bg-[#EF4444] px-6 py-3 rounded-xl shadow-md"
                  >
                    <View className="h-5 w-5 rounded-sm bg-white mr-2" />
                    <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                      Stop & Create Task
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>





          {/* AI explainer */}
          {!isRecording && !isTranscribing && (
            <View className="bg-[#37384B20] border border-[#37384B40] rounded-xl p-4">
              <View className="flex-row items-start">
                <MaterialIcons name="info" size={16} color="#815BF5" />
                <View className="flex-1 ml-3">
                  <Text className="text-[#815BF5] text-xs mb-2" style={{ fontFamily: 'LatoBold' }}>
                    AI OPTIMIZATION TIPS
                  </Text>
               
                  <View className="gap-1">
                    <Text className="text-[#787CA5] text-xs" style={{ fontFamily: 'LatoRegular' }}>
                      • Speak clearly and mention specific details
                    </Text>
                    <Text className="text-[#787CA5] text-xs" style={{ fontFamily: 'LatoRegular' }}>
                      • Include due dates: "next Friday", "January 15th"
                    </Text>
                    <Text className="text-[#787CA5] text-xs" style={{ fontFamily: 'LatoRegular' }}>
                      • Assign tasks: "assign to John" or "for Sarah"
                    </Text>
                    <Text className="text-[#787CA5] text-xs" style={{ fontFamily: 'LatoRegular' }}>
                      • Mention priority: "high priority" or "urgent"
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View className="flex-row justify-between items-center px-5 py-4 border-t border-[#37384B]">
          <Text className="text-[#787CA5] text-xs" style={{ fontFamily: 'LatoRegular' }}>
            {isTranscribing ? 'Processing...' : 'Uses 1 credit per generation'}
          </Text>

          <TouchableOpacity
            onPress={onClose}
            disabled={isRecording || isTranscribing}
            className={`px-4 py-2 rounded-lg border ${
              isRecording || isTranscribing 
                ? 'border-[#4A4B5C] bg-[#37384B]' 
                : 'border-[#815BF5] bg-[#815BF520]'
            }`}
          >
            <Text className={`${
              isRecording || isTranscribing ? 'text-[#787CA5]' : 'text-[#815BF5]'
            }`} style={{ fontFamily: 'LatoBold' }}>
              {isRecording || isTranscribing ? 'Processing...' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default VoiceTaskModal;