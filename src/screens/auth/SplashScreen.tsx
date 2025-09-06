import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        VR Doctor
      </Text>
      <Text style={styles.subtitle}>
        Loading...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e4336', // brand-dark-green
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Zen Kaku Gothic Antique-Bold',
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.8,
    fontFamily: 'Zen Kaku Gothic Antique',
  },
});
