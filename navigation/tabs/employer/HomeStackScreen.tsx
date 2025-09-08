import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreenEmployer } from 'screens/employers/homescreen/HomeScreenEmployer';
const HomeStack = createNativeStackNavigator();


export default function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <HomeStack.Screen name="homeMain" component={HomeScreenEmployer} />

    </HomeStack.Navigator>
  );
}
