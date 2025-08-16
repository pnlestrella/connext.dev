import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from 'navigation/StackNavigator';

import './global.css';
import { AuthProvider } from 'context/auth/AuthProvider';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StackNavigator/>
      </NavigationContainer>
    </AuthProvider>

  );
}
