import React, { useState } from 'react';
import { View, Image, Text } from 'react-native';

interface ProfileImageProps {
  profilePic?: string;
  firstName?: string;
  lastName?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  image:any
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  profilePic,
  firstName,
  lastName,
  size = 64, // default size of 64 (equivalent to h-16 w-16)
  backgroundColor = '#8a75c8',
  textColor = '#6648c2',
  image
}) => {

  const getInitials = () => {
    if (!firstName && !lastName) return '';
    const firstInitial = firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = lastName?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
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
        overflow: 'hidden',
      }}
    >
      {image ? (
        <Image
          style={{
            height: size,
            width: size,
            borderRadius: size / 2,
          }}
          source={{ uri: image }}
        />
      ) : (
        <Text
          style={{
            color: textColor,
            fontSize: size * 0.4,
            fontWeight: 'bold',
          }}
        >
          {getInitials()}
        </Text>
      )}
    </View>
  );
};

export default ProfileImage;
