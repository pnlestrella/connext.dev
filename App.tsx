import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from 'navigation/StackNavigator';

//wrappers
import { AuthProvider } from 'context/auth/AuthProvider';
import { JobProvider } from 'context/jobs/JobProvider';
import FontProvider from 'context/fonts/FontProvider';
import { AuthGate } from 'navigation/AuthGate';


import './global.css';

export default function App() {



  return (
    <FontProvider>
      <AuthProvider>
          <JobProvider>
            <NavigationContainer>
              <StackNavigator />
            </NavigationContainer>
          </JobProvider>
      </AuthProvider>
    </FontProvider>
  );
}
