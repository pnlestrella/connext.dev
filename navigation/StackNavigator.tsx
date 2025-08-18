import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home } from "screens/Home";
import { RegisterScreen } from "screens/RegisterScreen";
import { LoginScreen } from "screens/LoginScreen";
import { RootStackParamList } from "./types/RootStackParamList";
import { useAuth } from "context/auth/AuthHook";
import { AccountType } from "screens/AccountType";

//onboarding screens
import OnboardingScreen1 from "screens/onboarding/OnBoardingScreen1";
import OnboardingScreen2 from "screens/onboarding/OnBoardingScreen2";
const Stack = createNativeStackNavigator<RootStackParamList>();


export default function StackNavigator() {
    const { user, firstLaunch } = useAuth()

    console.log(user)




    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}
            initialRouteName={user ? "home" : firstLaunch ? "onboarding1" : "login"}
        >
            {user ? (
                <Stack.Screen name="home" component={Home} />

            ) : (
                //If the app is launched at the first time
                (firstLaunch) ?
                    <>
                        <Stack.Screen name='onboarding1' component={OnboardingScreen1} />
                        <Stack.Screen name='onboarding2' component={OnboardingScreen2} />
                    </>

                    :
                    <> 
                        <Stack.Screen name="login" component={LoginScreen} />
                        <Stack.Screen name='accountType' component={AccountType} />
                        <Stack.Screen name="register" component={RegisterScreen} />
                    </>
            )}


        </Stack.Navigator>
    )
}