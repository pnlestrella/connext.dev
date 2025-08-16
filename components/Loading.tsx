import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export const Loading = ({ size = 45, color = '#6C63FF', text = '' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 10,
    color: '#666',
  },
});

