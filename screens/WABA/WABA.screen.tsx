import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WABAScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Welcome to the Workflows Screen!</Text>
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

export default WABAScreen;
