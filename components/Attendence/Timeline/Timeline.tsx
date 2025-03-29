import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Define the TimelineEvent type
type TimelineEvent = {
  type: 'login' | 'logout' | 'break_started' | 'break_ended';
  time: string;
  location: string;
  userId: string;
  timestamp: number;
};

type TimelineProps = {
  events: TimelineEvent[];
  isBreakOpen: boolean;
};

const Timeline = ({ events, isBreakOpen }: TimelineProps) => {
  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No activity logged today</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {events.map((event, index) => (
        <React.Fragment key={index}>
          {index > 0 && <View style={styles.connector}></View>}
          
          <View style={styles.eventContainer}>
            <Image
              style={styles.eventIcon}
              source={
                event.type === 'login' 
                  ? require("../../../assets/Attendence/right.png")
                  : event.type === 'logout'
                  ? require("../../../assets/Attendence/chaeckOut.png")
                  : event.type === 'break_started'
                  ? require("../../../assets/Attendence/breakStart.png")
                  : require("../../../assets/Attendence/breakEnd.png")
              }
            />
            <View style={styles.eventDetails}>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{event.time}</Text>
                {event.type === 'break_started' && isBreakOpen && (
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}                      
                    colors={['#815BF5', '#FC8929']}
                    style={styles.gradientBorder}
                  >
                    <View style={styles.onBreakContainer}>
                      <Text style={styles.onBreakText}>On Break</Text>
                    </View>
                  </LinearGradient>
                )}
              </View>
              <Text style={styles.locationText}>
                {event.type === 'login' 
                  ? 'Login'
                  : event.type === 'logout'
                  ? 'Check Out'
                  : event.type === 'break_started'
                  ? 'Break Started'
                  : 'Break Ended'
                } - {event.location}
              </Text>
            </View>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginTop: 44,
  },
  emptyContainer: {
    width: '90%',
    marginTop: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#787CA5',
    textAlign: 'center',
  },
  eventContainer: {
    height: 56,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  connector: {
    height: 20,
    width: 2,
    backgroundColor: '#FC8929',
    marginLeft: 20,
  },
  eventIcon: {
    width: 48,
    height: 48,
    marginTop: 16,
    resizeMode: 'contain',
  },
  eventDetails: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 18,
  },
  locationText: {
    color: '#787CA5',
    fontSize: 14,
  },
  gradientBorder: {
    borderRadius: 10,
    padding: 1,
  },
  onBreakContainer: {
    backgroundColor: '#040614',
    alignItems: 'center',
    borderRadius: 11,
    padding: 4,
  },
  onBreakText: {
    color: 'white',
  },
});

export default Timeline;