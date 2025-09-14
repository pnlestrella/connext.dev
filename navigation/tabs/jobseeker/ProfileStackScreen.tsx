import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreenJS } from 'screens/jobseekers/profilescreen/ProfileScreenJS';
import {EditProfileScreen} from 'screens/jobseekers/profilescreen/EditProfileScreen';
0
const ProfileStack = createNativeStackNavigator();

export default function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <ProfileStack.Screen name="profileMain" component={ProfileScreenJS} />
      <ProfileStack.Screen name="editProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}
