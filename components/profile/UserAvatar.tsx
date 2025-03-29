import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';

interface UserData {
  _id: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
}

interface UserAvatarProps {
  name?: string;
  size?: number;
  imageUrl?: string;
  borderColor?: string;
  userId?: string;
}

/**
 * A reusable avatar component that displays a user's image if available,
 * or their initials if no image is available.
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  name = '',
  size = 40,
  imageUrl,
  borderColor = 'transparent',
  userId,
}) => {
  const [profileImage, setProfileImage] = useState<string | null>(imageUrl || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [initials, setInitials] = useState<string>('');
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // If imageUrl is provided directly, use it
    if (imageUrl) {
      setProfileImage(imageUrl);
      return;
    }

    // If no imageUrl but userId is provided, fetch the profile
    if (userId) {
      fetchUserProfile();
    } else if (name) {
      // Generate initials from the name
      generateInitials(name);
    }
  }, [imageUrl, userId, name]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backend_Host}/users/organization`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data && response.data.data) {
        // Find the specific user by userId
        const userData = response.data.data.find((user: UserData) => user._id === userId);
        
        if (userData) {
          // First priority: Check and use profilePic if available
          if (userData.profilePic) {
            setProfileImage(userData.profilePic);
          } 
          // Second priority: Generate initials from name
          else {
            // Generate initials from the user's name
            const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            generateInitials(fullName);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError(true);
      
      // If there's a name provided as prop, use that for initials
      if (name) {
        generateInitials(name);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateInitials = (fullName: string) => {
    if (!fullName || fullName.trim() === '') {
      setInitials('U');
      return;
    }
    
    const names = fullName.trim().split(' ');
    
    if (names.length === 1) {
      setInitials(names[0].charAt(0).toUpperCase());
    } else {
      setInitials(
        (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
      );
    }
  };

  // Generate a pseudorandom background color based on the name or initials
  const getBackgroundColor = () => {
    const colors = [
      '#815BF5', // Purple
      '#D85570', // Pink
      '#007B5B', // Green
      '#FDB314', // Amber
      '#4ECDC4', // Teal
      '#3B82F6', // Blue
      '#EF4444', // Red
    ];
    
    const seed = initials || name || 'U';
    const index = seed.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          backgroundColor: profileImage ? 'transparent' : getBackgroundColor(),
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : profileImage ? (
        <Image
          source={{ uri: profileImage }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={[
            styles.initialsText,
            {
              fontSize: size * 0.4,
            },
          ]}
        >
          {initials}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initialsText: {
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    fontWeight: '600',
  },
});

export default UserAvatar;