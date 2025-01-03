import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LeavesScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Welcome to the Leaves Screen!</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});

export default LeavesScreen;
