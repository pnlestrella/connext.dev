import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import StackNavigator from 'navigation/StackNavigator';

// wrappers
import { AuthProvider } from 'context/auth/AuthProvider';
import FontProvider from 'context/fonts/FontProvider';
import { AuthGate } from 'navigation/AuthGate';
import { SocketProvider } from 'context/sockets/SocketProvider';

import './global.css';

const linking = {
  prefixes: [
    'connext://',
    'exp://iw2cv5a-patnhel-8081.exp.direct/--',
  ],
  config: {
    screens: {
      EmployerTabs: {
        screens: {
          Message: {
            screens: {
              conversation: 'messages',       // <-- for list
              chats: 'chats/:chatId',         // <-- for specific chat
            },
          },
        },
      },
    },
  },
};



export default function App() {
  return (
    <FontProvider>
      <AuthProvider>
        <SocketProvider>
          <AuthGate>
            <NavigationContainer linking={linking} fallback={<></>}>
              <StackNavigator />
            </NavigationContainer>
          </AuthGate>
        </SocketProvider>
      </AuthProvider>
    </FontProvider>
  );
}
