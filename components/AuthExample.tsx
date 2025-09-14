import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { performLogout, isUserAuthenticated, getCurrentUser } from '~/utils/authUtils';

/**
 * Example component showing how to use authentication utilities
 * This demonstrates the proper way to handle login/logout with AsyncStorage
 */
const AuthExample: React.FC = () => {
  const { isLoggedIn, token, userData } = useSelector((state: RootState) => state.auth);
  
  const handleLogout = async () => {
    await performLogout();
  };

  const checkAuthStatus = () => {
    const isAuth = isUserAuthenticated();
    const currentUser = getCurrentUser();
    
    console.log('Is authenticated:', isAuth);
    console.log('Current user:', currentUser);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ color: 'white', fontSize: 18, marginBottom: 10 }}>
        Auth Status: {isLoggedIn ? 'Logged In' : 'Logged Out'}
      </Text>
      
      {isLoggedIn && (
        <Text style={{ color: 'white', marginBottom: 10 }}>
          User: {userData?.data?.firstName} {userData?.data?.lastName}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={checkAuthStatus}
        style={{ backgroundColor: '#815BF5', padding: 10, borderRadius: 5, marginBottom: 10 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Check Auth Status</Text>
      </TouchableOpacity>
      
      {isLoggedIn && (
        <TouchableOpacity
          onPress={handleLogout}
          style={{ backgroundColor: '#EF4444', padding: 10, borderRadius: 5 }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AuthExample;