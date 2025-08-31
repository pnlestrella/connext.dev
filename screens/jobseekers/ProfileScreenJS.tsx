import { Button, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userSignOut } from 'firebase/firebaseAuth';

import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from 'context/auth/AuthHook';

type NavigationType = NativeStackNavigationProp<RootStackParamList>


export const ProfileScreenJS = () => {
    const {user,userMDB, signOutUser} = useAuth()
    const navigation = useNavigation<NavigationType>()

    
  return (
    <SafeAreaView>
      <Text>{user?.email}</Text>
        <Text>This is Home</Text>
        {/* <Text>Welcome {user?.email}</Text> */}
        <Button title="logout" onPress={async() => {
          try{
            const signout = signOutUser()
            console.log(signout)
            
            alert("Signed out successfully")
            navigation.navigate('login')

          }catch(err){
            alert(err)
          }
        }}></Button>
    </SafeAreaView>
  );
};
