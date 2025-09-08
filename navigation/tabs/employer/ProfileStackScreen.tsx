import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EditProfileScreenEmployer } from 'screens/employers/profilescreen/EditProfileScreen';
import { ProfileScreenEmployer } from 'screens/employers/profilescreen/ProfileScreenEmployer';
const ProfileStack = createNativeStackNavigator();

export default function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <ProfileStack.Screen name="profileMain" component={ProfileScreenEmployer} />
      <ProfileStack.Screen name="editProfile" component={EditProfileScreenEmployer} />

    </ProfileStack.Navigator>
  );
}
