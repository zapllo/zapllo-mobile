import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import TeamTabs from '~/components/Teams/TeamsTabs';
import NavbarTwo from '~/components/navbarTwo';

interface User {
  _id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  whatsappNo: string;
  reportingManager: string;
  profilePic: string;
  country: string;
  isLeaveAccess: boolean;
  isTaskAccess: boolean;
}

interface OrganizationData {
  trialExpires: string | null;
  companyName: string;
}

const TeamsScreen: React.FC = () => {
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    try {
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const userResponse = await axios.get(`${backend_Host}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      if (userResponse.data?.data) {
        setCurrentUser(userResponse.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      setError('Failed to fetch user details');
    }
  }, [token]);

  const checkTrialStatus = useCallback(async () => {
    try {
      if (!token) return;

      const response = await axios.get(`${backend_Host}/organization/getById`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      if (response.data?.data) {
        const organization: OrganizationData = response.data.data;
        const isExpired = organization.trialExpires &&
          new Date(organization.trialExpires) <= new Date();
        setIsTrialExpired(!!isExpired);
      }
    } catch (err: any) {
      console.error('Error checking trial status:', err);
    }
  }, [token]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.allSettled([
        fetchUserDetails(),
        checkTrialStatus(),
      ]);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load team data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserDetails, checkTrialStatus]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarTwo title="Team Management" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FC8929" />
          <Text style={styles.loadingText}>Loading team data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarTwo title="Team Management" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableWithoutFeedback onPress={() => fetchData()}>
            <View style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <NavbarTwo title="Team Management" />
        <TeamTabs 
          currentUser={currentUser}
          isTrialExpired={isTrialExpired}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'LatoBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Lato-Light',
    fontSize: 14,
    color: '#A9A9A9',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0D28',
  },
  loadingText: {
    fontFamily: 'Lato-Light',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0D28',
    padding: 20,
  },
  errorTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'Lato-Light',
    fontSize: 14,
    color: '#A9A9A9',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FC8929',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default TeamsScreen;