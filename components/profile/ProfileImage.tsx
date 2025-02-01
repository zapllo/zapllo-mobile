import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, Image, Text, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { backend_Host } from '~/config';
import { RootState } from '~/redux/store';

interface ProfileImageProps {
  profilePic?: string;
  firstName?: string;
  lastName?: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  image: any;
  loading: any;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  profilePic,
  firstName,
  lastName,
  size = 64, // default size of 64 (equivalent to h-16 w-16)
  backgroundColor = '#8a75c8',
  textColor = '#6648c2',
  image,
  loading,
}) => {
  const getInitials = () => {
    if (!firstName && !lastName) return '';
    const firstInitial = firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = lastName?.charAt(0).toUpperCase() || '';
    return firstInitial + lastInitial;
  };

  console.log("oooooo",profilePic,image)

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
      }}>
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : profilePic ? (
        <Image
          style={{
            height: size,
            width: size,
            borderRadius: size / 2,
          }}
          source={{ uri: image ? image : profilePic }}
        />
      ) : (
        <Text
          style={{
            color: textColor,
            fontSize: size * 0.4,
            fontWeight: 'bold',
          }}>
          {getInitials()}
        </Text>
      )}
    </View>
  );
};

export default ProfileImage;
