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
import { ProfileSummaryScreen } from "screens/profileupdates/ProfileSummaryScreen";
import { RegistrationConfirmationScreen } from "screens/profileupdates/RegistrationConfirmationScreen";

// Tabs
import JobseekerTabs from "./tabs/JobseekerTabs";
import EmployerTabs from "./tabs/EmployerTabs";

// Splash
import { SplashScreen } from "screens/SplashScreen";

// Types
import { RootStackParamList } from "./types/RootStackParamList";
import React, { useEffect } from "react";
import { getVerification } from "api/employers/verification_requests";

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
  const { location, industries, skills, profileSummary } = userMDB || {};

  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: 'white' },
    }}>
      {!location && <Stack.Screen name="address" component={AddressScreen} />}
      {!industries && <Stack.Screen name="industries" component={IndustryScreen} />}
      {!skills && <Stack.Screen name="skills" component={SkillsScreen} />}
      {(profileSummary?.length === 0) && <Stack.Screen name="profileSummary" component={ProfileSummaryScreen} />}

      <Stack.Screen name="home" component={JobseekerTabs} />
    </Stack.Navigator>
  );
}

function EmployerStack({ userMDB }: any) {
  const { location, industries } = userMDB || {};
  const [verif, setVerif] = React.useState<VerificationRecord | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!userMDB?.employerUID) { setReady(true); return; }
      try {
        const res = await getVerification(userMDB.employerUID);
        if (!mounted) return;
        setVerif(res ?? null);
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => { mounted = false; };
  }, [userMDB?.employerUID]);

  if (!ready) return null; // or a loading splash

  const initial = verif?.verificationStatus === 'pending' ? 'confirmation' : 'home';

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}
      initialRouteName={initial}
    >
      <Stack.Screen name="confirmation" component={RegistrationConfirmationScreen} />
      {!location && <Stack.Screen name="address" component={AddressScreen} />}
      {!industries && <Stack.Screen name="industries" component={IndustryScreen} />}
      <Stack.Screen name="home" component={EmployerTabs} />
    </Stack.Navigator>
  );
}


export default function StackNavigator() {
  const { user, userMDB, userType, firstLaunch, initializing } = useAuth();


  console.log(userMDB, 'usermdbbbb')
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

  return <SplashScreen />;
}
