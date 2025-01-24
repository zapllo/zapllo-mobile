import React from 'react';
import { View, Image, Text } from 'react-native';

interface ProfileImageProps {
  profilePic?: string;
  firstName?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  profilePic,
  firstName,
  size = 64, // default size of 64 (equivalent to h-16 w-16)
  backgroundColor = '#8a75c8',
  textColor = '#6648c2'
}) => {
  const getInitials = () => {
    if (!firstName) return '';
    const words = firstName.split(' ');
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return firstName.slice(0, 2);
  };

  return (
    <View 
      style={{
        height: size,
        width: size,
        borderRadius: size / 2,
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}
    >
      {profilePic ? (
        <Image
          style={{
            height: size,
            width: size,
            borderRadius: size / 2
          }}
          source={{ uri: profilePic }}
        />
      ) : (
        <Text 
          style={{
            color: textColor,
            fontSize: size * 0.4,
            fontWeight: 'bold'
          }}
        >
          {getInitials()}
        </Text>
      )}
    </View>
  );
};

export default ProfileImage;