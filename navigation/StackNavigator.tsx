import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RegisterScreen } from "screens/RegisterScreen";
import { LoginScreen } from "screens/LoginScreen";
import { RootStackParamList } from "./types/RootStackParamList";
import { useAuth } from "context/auth/AuthHook";
import { AccountType } from "screens/AccountType";

//onboarding screens
import OnboardingScreen1 from "screens/onboarding/OnBoardingScreen1";
import OnboardingScreen2 from "screens/onboarding/OnBoardingScreen2";

//profile edits
import { AddressScreen } from "screens/profileupdates/AddressScreen";
import { IndustryScreen } from "screens/profileupdates/IndustryScreen";
import { SkillsScreen } from "screens/profileupdates/SkillsScreen";

//Navigations
import  JobseekerTabs  from "./tabs/JobseekerTabs";
import EmployerTabs from "./tabs/EmployerTabs";

//Navigation stack
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
    const { user, userMDB, userType, firstLaunch } = useAuth()

    const location = userMDB?.location
    const industries = userMDB?.industries

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false, animation: 'fade' }}
            initialRouteName={
                user
                    ? !location // no location set → go to AddressScreen
                        ? "address"
                        : "address" 
                    : firstLaunch
                        ? "onboarding1"
                        : "login"
            }
        >
            {user ? (
                <>
                    {/* If Profile is incomplete */}
                    {!location && <Stack.Screen name="address" component={AddressScreen} />}
                    {!industries && <Stack.Screen name='industries' component={IndustryScreen} />}

                    {(userType === 'jobseeker' && !userMDB?.skills) &&
                        <Stack.Screen name='skills' component={SkillsScreen} />
                    }

                    {/* Main page */}
                    <Stack.Screen name="home" component={userType === 'jobseeker'? JobseekerTabs: EmployerTabs} />
                </>
            ) : firstLaunch ? (
                <>
                    <Stack.Screen name="onboarding1" component={OnboardingScreen1} />
                    <Stack.Screen name="onboarding2" component={OnboardingScreen2} />
                </>
            ) : (
                <>
                    <Stack.Screen name="login" component={LoginScreen} />
                    <Stack.Screen name="accountType" component={AccountType} />
                    <Stack.Screen name="register" component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>

    )
}