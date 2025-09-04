import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from 'navigation/StackNavigator';
import {useFonts} from 'expo-font'
import './global.css';
import { AuthProvider } from 'context/auth/AuthProvider';

import FontProvider from 'context/fonts/FontProvider';


export default function App() {


  return (
    <FontProvider>
      <AuthProvider>
        <NavigationContainer>
          <StackNavigator />
        </NavigationContainer>
      </AuthProvider>
    </FontProvider>


  );
}
