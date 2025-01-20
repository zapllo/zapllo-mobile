import React, { useState } from 'react';
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface AISelectProps {
  title: string;
}

const AISelect: React.FC<AISelectProps> = ({ title }) => {
  const [isActive, setIsActive] = useState(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsActive(!isActive);
  };

  return (
    <View className='w-[90%]'>
      <TouchableOpacity onPress={handlePress}>
        <LinearGradient
          colors={isActive ? ['#815BF5', '#FC8929'] : ['#37384B', '#37384B']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.button}>
            <Text style={styles.text}>{title}</Text>
            {isActive && (
              <Image
                style={styles.image}
                source={require('../../assets/Tasks/isEditing.png')}
              />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 24,
    marginBottom: 12,
    padding: 1,
    width: '100%',
  },
  button: {
    paddingVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#10122d',
  },
  text: {
    color: 'white',
  },
  image: {
    width: 20,
    height: 20,
  },
});

export default AISelect;