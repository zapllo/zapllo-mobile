import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface EmployeesDetaildComponentProps {
  overdue: number;
  pending: number;
  inProgress: number;
  completed: number;
  name: string;
  profilePic?: string;
}

const EmployeesDetaildComponent: React.FC<EmployeesDetaildComponentProps> = ({
  overdue,
  pending,
  inProgress,
  completed,
  profilePic,
  name,
}) => {
  // Calculate the completion percentage
  const totalTasks = overdue + pending + inProgress + completed;
  const completionPercentage = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  console.log('Profile Pic URL:', profilePic);

  // Encode profile picture URL in case it has spaces
  const encodedProfilePic = profilePic ? profilePic.replace(/ /g, '%20') : null;

  // Extract initials from name
  const getInitials = (fullName: string) => {
    const nameParts = fullName.split(' ');
    const initials = nameParts
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
    return initials.length > 2 ? initials.slice(0, 2) : initials;
  };

  return (
    <View style={styles.card}>
      {/* Profile + Name */}
      <View style={styles.header}>
        {encodedProfilePic ? (
          <Image source={{ uri: encodedProfilePic }} style={styles.profileImage} />
        ) : (
          <View style={styles.initialsContainer}>
            <Text style={styles.initialsText}>{getInitials(name)}</Text>
          </View>
        )}

        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.progressText}>{completionPercentage}% completed</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${completionPercentage}%` }]} />
      </View>

      {/* Status Labels */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBox, styles.overdue]}>
          <Text style={styles.statusText}>Overdue {overdue}</Text>
        </View>
        <View style={[styles.statusBox, styles.pending]}>
          <Text style={styles.statusText}>Pending {pending}</Text>
        </View>
        <View style={[styles.statusBox, styles.inProgress]}>
          <Text style={styles.statusText}>In Progress {inProgress}</Text>
        </View>
        <View style={[styles.statusBox, styles.completed]}>
          <Text style={styles.statusText}>Completed {completed}</Text>
        </View>
      </View>
    </View>
  );
};

export default EmployeesDetaildComponent;

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: 16,
    marginVertical: 8,
    width: '90%',
    alignSelf: 'center',
    borderColor: '#37384B',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  initialsContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor:'#2E2E46',
    backgroundColor: 'transparent', // Blue background
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initialsText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  name: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressText: {
    color: '#A0A5C3',
    fontSize: 12,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#2E2E46',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00C48C',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusBox: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  overdue: {
    borderColor: '#EF4444',
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  pending: {
    borderColor: '#FFC107',
    borderWidth: 1,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
  },
  inProgress: {
    borderColor: '#A914DD',
    borderWidth: 1,
    backgroundColor: 'rgba(169, 20, 221, 0.1)',
  },
  completed: {
    borderColor: '#00C48C',
    borderWidth: 1,
    backgroundColor: 'rgba(0, 196, 140, 0.1)',
  },
  statusText: {
    color: 'white',
    fontSize: 8,
    fontWeight: '500',
  },
});
