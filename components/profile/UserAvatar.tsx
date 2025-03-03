import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface UserAvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: number;
  borderColor?: string;
  textColor?: string;
  backgroundColor?: string;
  style?: any;
}

/**
 * A reusable avatar component that displays a user's image if available,
 * or their initials if no image is available.
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  imageUrl,
  name,
  size = 40,
  borderColor = 'transparent',
  textColor = '#000',
  backgroundColor = '#c3c5f7',
  style,
}) => {
  // Get user initials from name
  const getUserInitials = (name: string): string => {
    if (!name) return '';
    
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length >= 1) {
      return nameParts[0][0].toUpperCase();
    }
    return '';
  };

  // Generate a consistent background color based on the user's name
  const getAvatarColor = (name: string): string => {
    if (!name) return backgroundColor;
    
    // Simple hash function to generate a consistent color for a name
    const colors = ['#c3c5f7', '#FDB314', '#815BF5', '#D85570', '#007B5B', '#EF4444'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getUserInitials(name);
  const avatarColor = getAvatarColor(name);
  
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: borderColor,
    backgroundColor: avatarColor,
    ...style,
  };

  const textStyle = {
    color: textColor,
    fontSize: size * 0.4,
    fontWeight: 'bold',
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.text, textStyle]}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    textAlign: 'center',
  },
});

export default UserAvatar;