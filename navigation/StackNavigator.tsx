import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "context/auth/AuthHook";

// Auth
import { RegisterScreen } from "screens/RegisterScreen";
import { LoginScreen } from "screens/LoginScreen";
import { AccountType } from "screens/AccountType";

// Onboarding
import OnboardingScreen1 from "screens/onboarding/OnBoardingScreen1";
import OnboardingScreen2 from "screens/onboarding/OnBoardingScreen2";

// Profile updates
import { AddressScreen } from "screens/profileupdates/AddressScreen";
import { IndustryScreen } from "screens/profileupdates/IndustryScreen";
import { SkillsScreen } from "screens/profileupdates/SkillsScreen";

// Tabs
import JobseekerTabs from "./tabs/JobseekerTabs";
import EmployerTabs from "./tabs/EmployerTabs";

// Splash
import { SplashScreen } from "screens/SplashScreen";

// Types
import { RootStackParamList } from "./types/RootStackParamList";

const Stack = createNativeStackNavigator<RootStackParamList>();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="accountType" component={AccountType} />
      <Stack.Screen name="register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding1" component={OnboardingScreen1} />
      <Stack.Screen name="onboarding2" component={OnboardingScreen2} />
    </Stack.Navigator>
  );
}

function JobseekerStack({ userMDB }: any) {
  const { location, industries, skills } = userMDB || {};

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!location && <Stack.Screen name="address" component={AddressScreen} />}
      {!industries && <Stack.Screen name="industries" component={IndustryScreen} />}
      {!skills && <Stack.Screen name="skills" component={SkillsScreen} />}

      <Stack.Screen name="home" component={JobseekerTabs} />
    </Stack.Navigator>
  );
}

function EmployerStack({ userMDB }: any) {
  const { location, industries } = userMDB || {};

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!location && <Stack.Screen name="address" component={AddressScreen} />}
      {!industries && <Stack.Screen name="industries" component={IndustryScreen} />}

      <Stack.Screen name="home" component={EmployerTabs} />
    </Stack.Navigator>
  );
}

export default function StackNavigator() {
  const { user, userMDB, userType, firstLaunch, initializing } = useAuth();

  if (initializing) {
    return <SplashScreen />;
  }

  if (!user) {
    return firstLaunch ? <OnboardingStack /> : <AuthStack />;
  }

  if (userType === "jobseeker") {
    return <JobseekerStack userMDB={userMDB} />;
  }

  if (userType === "employer") {
    return <EmployerStack userMDB={userMDB} />;
  }

  return <SplashScreen />; // fallback
}
