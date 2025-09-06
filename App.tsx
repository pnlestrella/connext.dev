import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from 'navigation/StackNavigator';

//wrappers
import { AuthProvider } from 'context/auth/AuthProvider';
import { JobProvider } from 'context/job/JobProvider';
import FontProvider from 'context/fonts/FontProvider';



import './global.css';



export default function App() {


  return (
    <FontProvider>
      {/* for Authentication of the users */}
      <AuthProvider>
        {/* for Job matters // swiping, etc. */}
        <JobProvider>
          <NavigationContainer>
            <StackNavigator />
          </NavigationContainer>
        </JobProvider>
      </AuthProvider>
    </FontProvider>


  );
}
