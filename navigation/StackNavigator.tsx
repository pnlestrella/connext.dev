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
import React, { useEffect, useState } from "react";
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
  const [status, setStatus] = React.useState<string>(""); // 'pending' | 'approved' | '' etc.

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!userMDB?.employerUID) return;
        const res = await getVerification(userMDB.employerUID);
        if (!mounted) return;
        setStatus(res?.verificationStatus ?? "");
      } catch (err) {
        console.log(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userMDB?.employerUID]);

  // Derive flow state
  const needsAddress = !location;
  const needsIndustries = !industries;
  const needsConfirmation = status === "pending";

  // Priority: address -> industries -> confirmation -> home
  const initial = needsAddress
    ? "address"
    : needsIndustries
    ? "industries"
    : needsConfirmation
    ? "confirmation"
    : "home";

  // Force remount when prerequisites or status change so initialRouteName re-applies
  const flowKey = [
    needsAddress ? "addr" : "ok",
    needsIndustries ? "ind" : "ok",
    needsConfirmation ? "conf" : "ok",
  ].join("-");

  return (
    <Stack.Navigator
      key={flowKey}
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "white" } }}
      initialRouteName={initial}
    >
      {needsAddress && <Stack.Screen name="address" component={AddressScreen} />}
      {!needsAddress && needsIndustries && (
        <Stack.Screen name="industries" component={IndustryScreen} />
      )}
      {!needsAddress && !needsIndustries && needsConfirmation && (
        <Stack.Screen name="confirmation" component={RegistrationConfirmationScreen} />
      )}
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

  return <SplashScreen />;
}
