import { Button, Text, View, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from 'context/auth/AuthHook';
//Header
import { Settings, SendHorizonal, Star, LogOut } from 'lucide-react-native';
import { Header } from 'components/Header';

type NavigationType = NativeStackNavigationProp<RootStackParamList>;
export const ProfileScreenEmployer = () => {
  const { userMDB, signOutUser } = useAuth();

  const navigation = useNavigation<NavigationType>();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* scroll if content gets long */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1}} className='px-2'>

          <Header/>

          {/* Profile Title */}
          <View className="flex-row items-center justify-between">
            <Text
              style={{
                fontFamily: 'Poppins-Bold',
                color: '#37424F',
              }} className='text-2xl'
            >
              Your Profile
            </Text>

            <Pressable
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
              onPress={() => { navigation.navigate('editProfile') }}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-SemiBold',
                  fontSize: 12,
                  color: '#007AFF',
                }}
              >
                Edit Profile
              </Text>
            </Pressable>
          </View>

          {/* Profile Info */}
          <View>
            {/* Profile (Company Name) */}
            <View className="flex-row items-center py-2">
              <Text
                style={{
                  fontFamily: 'Lexend-Regular',
                  fontSize: 14,
                  width: 100,
                }}
              >
                Profile
              </Text>
              <Text
                style={{
                  fontFamily: 'Lexend-Regular',
                  fontSize: 14,
                  color: '#747474',
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {userMDB?.companyName}   {/* <-- use companyName for employers */}
              </Text>
            </View>

            {/* Industry */}
            <View className="flex-row items-center py-2">
              <Text
                style={{
                  fontFamily: 'Lexend-Regular',
                  fontSize: 14,
                  width: 100,
                }}
              >
                Industry
              </Text>
              <Text
                style={{
                  fontFamily: 'Lexend-Regular',
                  fontSize: 14,
                  color: '#747474',
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {userMDB?.industries?.join(', ')}   {/* multiple industries */}
              </Text>
            </View>

            {/* Location */}
            <View className="flex-row items-center py-2">
              <Text
                style={{
                  fontFamily: 'Lexend-Regular',
                  fontSize: 14,
                  width: 100,
                }}
              >
                Location
              </Text>
              <Text
                style={{
                  fontFamily: 'Lexend-Regular',
                  fontSize: 14,
                  color: '#747474',
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {userMDB?.location?.address}
              </Text>
            </View>

            {/* Email */}
            <View className="flex-row items-center py-2">
              <Text
                style={{
                  fontFamily: 'Lexend-Regular',
                  fontSize: 14,
                  width: 100,
                }}
              >
                Email
              </Text>
              <Text
                style={{
                  fontFamily: 'Lexend-Regular',
                  fontSize: 14,
                  color: '#747474',
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {userMDB?.email}
              </Text>
            </View>
          </View>

          {/* Miscellaneous Section */}
          <View className='py-2'>
            <Text
              style={{
                fontFamily: 'Lexend-SemiBold',
                fontSize: 18,
                color: '#37424F',
                marginBottom: 12,
              }}
            >
              Miscellaneous
            </Text>

            {/* Settings  */}
            <View className="justify-between py-2">
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontFamily: 'Lexend-Regular',
                    fontSize: 14,
                    width: 100,
                  }}
                >
                  Settings
                </Text>
                <Settings width={20} color={"#37424F"}></Settings>
              </View>
            </View>
            {/* Feedback */}
            <View className="py-2 justify-between">
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontFamily: 'Lexend-Regular',
                    fontSize: 14,
                    width: 200,
                  }}
                >
                  Send us feedback
                </Text>
                <SendHorizonal width={20} color={"#37424F"}></SendHorizonal>
              </View>
            </View>
            {/* Rating */}
            <View className="py-2 justify-between">
              <View className="flex-row items-center justify-between">
                <Text
                  style={{
                    fontFamily: 'Lexend-Regular',
                    fontSize: 14,
                    width: 200,
                  }}
                >
                  Give us Rating
                </Text>
                <Star width={20} color={"#37424F"}></Star>
              </View>
            </View>
          </View>

          {/* Exit Section */}
          <View className='py-2'>
            <Text
              style={{
                fontFamily: 'Lexend-SemiBold',
                fontSize: 18,
                color: '#37424F',
                marginBottom: 12,
              }}
            >
              Exit
            </Text>

            {/* Logout */}
            <View className="justify-between">
              <Pressable
                className="flex-row items-center justify-between py-2"
                onPress={async () => {
                  try {
                    await signOutUser();
                    console.log("Successfully signed out");
                    alert('Signed out successfully');
                    navigation.navigate('login');
                  } catch (err) {
                    console.error('Sign out error:', err);
                    alert('Error signing out: ' + err);
                  }
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Lexend-Bold',
                    fontSize: 14,
                    width: 100,
                  }}
                >
                  Logout
                </Text>
                <LogOut width={20} color={"red"}></LogOut>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
