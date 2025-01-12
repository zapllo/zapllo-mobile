import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Audio } from 'expo-av';
import LottieView from 'lottie-react-native';
import Slider from '@react-native-community/slider';

interface AudioModalProps{
  isAudioModalVisible :any,
  setAudioModalVisible:any,
}

const AudioModal: React.FC<AudioModalProps> = ({
  isAudioModalVisible,
  setAudioModalVisible,

}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState<any>(null);
  const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isRecordingStopped, setIsRecordingStopped] = useState(false);

  async function startRecording(): Promise<void> {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission...');
        const response = await requestPermission();
        if (response.status !== 'granted') {
          console.warn('Permission not granted');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording...');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecordingStopped(false);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording(): Promise<void> {
    try {
      if (recording) {
        console.log('Stopping recording...');
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
        const uri = recording.getURI();
        const { sound } = await recording.createNewLoadedSoundAsync();
        setSound(sound);
        console.log('Recording stopped and stored at', uri);
        setRecording(undefined);
        setIsRecordingStopped(true);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  }
  const playAudio = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
        sound.setOnPlaybackStatusUpdate(updateStatus);
      }
    }
  };

  const clearAudio = () => {
    if (sound) {
      sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setDuration(0);
      setCurrentPosition(0);
      setIsRecordingStopped(false);
    }
  };

  const updateStatus = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setCurrentPosition(status.positionMillis || 0);
      if (status.didJustFinish) {
        setIsPlaying(false);
        setCurrentPosition(0);
      }
    }
  };

  return (
    <Modal
      isVisible={isAudioModalVisible}
      onBackdropPress={() => setAudioModalVisible(false)}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      animationIn="slideInUp"
      animationOut="slideOutDown">
      <View className="rounded-t-3xl bg-[#0A0D28] p-5">
        <View className="mb-10 mt-2 flex w-full flex-row items-center justify-between">
          <Text className="text-2xl font-semibold text-white" style={{ fontFamily: 'Lato-Bold' }}>
            Add Audio
          </Text>
          <TouchableOpacity onPress={() => setAudioModalVisible(false)}>
            <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
          </TouchableOpacity>
        </View>

        <View className="flex w-full items-center">
          {!recording ? (
            <TouchableOpacity
              onPress={startRecording}
              className="flex h-32 w-full flex-row items-center justify-center gap-4 rounded-2xl border border-dashed border-[#815BF5]">
              <Image className="h-9 w-9" source={require('../../../assets/Tasks/voice.png')} />
              <Text className="text-white" style={{ fontFamily: 'Lato-Bold' }}>
                Tap to Record Your Voice Note
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex h-32 w-full items-center justify-center">
              {/* Lottie Animation for Recording */}

              <TouchableOpacity onPress={stopRecording} className="mt-4">
                <LottieView
                  source={require('../../../assets/sound-wave.json')} // Replace with your animation file
                  autoPlay
                  loop
                  style={{ height: 100, width: 100 }}
                />
                <Text className="text-red-500" style={{ fontFamily: 'Lato-Bold' }}>
                  Stop Recording
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!isRecordingStopped ? (
          <TouchableOpacity
            onPress={recording ? stopRecording : startRecording}
            style={styles.recordButton}>
            <Text style={styles.recordText}>
              {recording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={styles.title}>Voice Note</Text>
            <Text style={styles.timer}>
              {Math.floor(currentPosition / 1000)}s / {Math.floor(duration / 1000)}s
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration/1000}
              value={currentPosition/1000}
              minimumTrackTintColor="#815BF5"
              maximumTrackTintColor="#fff"
              thumbTintColor="#fff"
              onValueChange={(value) => sound?.setPositionAsync(value)}
            />
            <View style={styles.controls}>
              <TouchableOpacity style={styles.playButton} onPress={playAudio}>
                <Text style={styles.playText}>{isPlaying ? 'Pause' : 'Play'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearButton} onPress={clearAudio}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View className="mt-16 w-full">
          <TouchableOpacity className="mb-10 flex h-[4rem] items-center justify-center rounded-full bg-[#37384B] p-5">
            <Text
              className="text-center font-semibold text-white"
              style={{ fontFamily: 'Lato-Bold' }}>
              Upload Documents
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AudioModal;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A0D28',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timer: {
    color: '#FFF',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  recordButton: {
    backgroundColor: '#815BF5',
    borderRadius: 50,
    padding: 10,
    paddingHorizontal: 20,
  },
  recordText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  playButton: {
    backgroundColor: '#3CB371',
    borderRadius: 50,
    padding: 10,
    paddingHorizontal: 20,
  },
  playText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#DC143C',
    borderRadius: 50,
    padding: 10,
    paddingHorizontal: 20,
  },
  clearText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
