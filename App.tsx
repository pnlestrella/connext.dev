import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from 'navigation/StackNavigator';

//wrappers
import { AuthProvider } from 'context/auth/AuthProvider';
import FontProvider from 'context/fonts/FontProvider';
import { AuthGate } from 'navigation/AuthGate';


import './global.css';
import { SocketProvider } from 'context/sockets/SocketProvider';

export default function App() {
  return (
    <FontProvider>
      <AuthProvider>
        <SocketProvider>
          <AuthGate>
            <NavigationContainer>
              <StackNavigator />
            </NavigationContainer>
          </AuthGate>
        </SocketProvider>
      </AuthProvider>
    </FontProvider>
  );
}
