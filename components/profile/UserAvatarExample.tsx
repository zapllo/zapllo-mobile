import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UserAvatar from './UserAvatar';

const UserAvatarExample = () => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          <UserAvatar 
            // This will fetch user profile from API
            // and use profilePic if available, otherwise show initials
            userId="current" 
            size={50}
            borderColor="#37384B"
          />
          <Text style={styles.label}>Auto-fetch</Text>
        </View>

        <View style={styles.avatarContainer}>
          <UserAvatar 
            // Direct image URL provided
            imageUrl="https://zapllo.s3.ap-south-1.amazonaws.com/uploads/1738839447225-Profile%20Pic.png"
            size={50}
            borderColor="#37384B"
          />
          <Text style={styles.label}>Direct URL</Text>
        </View>

        <View style={styles.avatarContainer}>
          <UserAvatar 
            // Only name provided - will show initials
            name="Shubhodeep Banerjee" 
            size={50}
            borderColor="#37384B"
          />
          <Text style={styles.label}>Initials</Text>
        </View>

        <View style={styles.avatarContainer}>
          <UserAvatar 
            // One name only
            name="Shubhodeep" 
            size={50}
            borderColor="#37384B"
          />
          <Text style={styles.label}>Single Name</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          <UserAvatar 
            // Different sizes
            name="John Doe" 
            size={30}
            borderColor="#37384B"
          />
          <Text style={styles.label}>Small</Text>
        </View>

        <View style={styles.avatarContainer}>
          <UserAvatar 
            name="John Doe" 
            size={50}
            borderColor="#37384B"
          />
          <Text style={styles.label}>Medium</Text>
        </View>

        <View style={styles.avatarContainer}>
          <UserAvatar 
            name="John Doe" 
            size={80}
            borderColor="#37384B"
          />
          <Text style={styles.label}>Large</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0A0D28',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  label: {
    marginTop:.5,
    color: '#787CA5',
    fontSize: 12,
  }
});

export default UserAvatarExample; 