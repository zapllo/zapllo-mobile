import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UserAvatar from '../profile/UserAvatar';

interface EmployeesDetaildComponentProps {
  overdue: number;
  pending: number;
  inProgress: number;
  completed: number;
  name: string;
  profilePic?: string;
  userId?: string;
}

const { width: screenWidth } = Dimensions.get('window');

const EmployeesDetaildComponent: React.FC<EmployeesDetaildComponentProps> = ({
  overdue,
  pending,
  inProgress,
  completed,
  profilePic,
  name,
  userId,
}) => {
  // Calculate the completion percentage
  const totalTasks = overdue + pending + inProgress + completed;
  const completionPercentage = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  // Get status color based on completion percentage
  const getStatusColor = () => {
    if (completionPercentage >= 80) return '#00C48C';
    if (completionPercentage >= 60) return '#FFC107';
    if (completionPercentage >= 40) return '#FF9500';
    return '#EF4444';
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['rgba(55, 56, 75, 0.8)', 'rgba(46, 46, 70, 0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <UserAvatar
              size={56}
              borderColor="rgba(255, 255, 255, 0.2)"
              userId={userId}
              name={name}
              imageUrl={profilePic}
            />
            
            <View style={styles.nameSection}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.progressText}>{completionPercentage}% completed</Text>
            </View>
          </View>
        </View>

        {/* Progress Bar Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={[getStatusColor(), `${getStatusColor()}80`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBar, { width: `${completionPercentage}%` }]}
            />
          </View>
        </View>

        {/* Status Grid */}
        <View style={styles.statusGrid}>
          <View style={styles.statusRow}>
            <View style={[styles.statusItem, styles.overdueStatus]}>
              <View style={styles.statusIconContainer}>
                <View style={[ { backgroundColor: '#EF4444' }]} />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusNumber}>{overdue}</Text>
                <Text style={styles.statusLabel} numberOfLines={1} adjustsFontSizeToFit>Overdue</Text>
              </View>
            </View>
            
            <View style={[styles.statusItem, styles.pendingStatus]}>
              <View style={styles.statusIconContainer}>
                <View style={[ { backgroundColor: '#FFC107' }]} />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusNumber}>{pending}</Text>
                <Text style={styles.statusLabel} numberOfLines={1} adjustsFontSizeToFit>Pending</Text>
              </View>
            </View>

            <View style={[styles.statusItem, styles.inProgressStatus]}>
              <View style={styles.statusIconContainer}>
                <View style={[ { backgroundColor: '#A914DD' }]} />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusNumber}>{inProgress}</Text>
                <Text style={styles.statusLabel} numberOfLines={1} adjustsFontSizeToFit>In Progress</Text>
              </View>
            </View>
            
            <View style={[styles.statusItem, styles.completedStatus]}>
              <View style={styles.statusIconContainer}>
                <View style={[ { backgroundColor: '#00C48C' }]} />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusNumber}>{completed}</Text>
                <Text style={styles.statusLabel} numberOfLines={1} adjustsFontSizeToFit>Completed</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default EmployeesDetaildComponent;

const styles = StyleSheet.create({
  cardContainer: {
    width: screenWidth - 32,
    alignSelf: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
    nameSection: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  progressText: {
    color: '#A0A5C3',
    fontSize: 12,
  },
  totalTasksContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  totalTasksNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'System',
  },
  totalTasksLabel: {
    color: '#A0A5C3',
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'System',
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(46, 46, 70, 0.8)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statusGrid: {
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  statusItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minHeight: 60,
    justifyContent: 'center',
  },
  overdueStatus: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  pendingStatus: {
    backgroundColor: 'rgba(255, 193, 7, 0.12)',
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  inProgressStatus: {
    backgroundColor: 'rgba(169, 20, 221, 0.12)',
    borderColor: 'rgba(169, 20, 221, 0.3)',
  },
  completedStatus: {
    backgroundColor: 'rgba(0, 196, 140, 0.12)',
    borderColor: 'rgba(0, 196, 140, 0.3)',
  },
  statusIconContainer: {
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'System',
    marginBottom: 2,
  },
  statusLabel: {
    color: '#A0A5C3',
    fontSize: 9,
    fontWeight: '500',
    fontFamily: 'System',
    textAlign: 'center',
    lineHeight: 11,
  },
});