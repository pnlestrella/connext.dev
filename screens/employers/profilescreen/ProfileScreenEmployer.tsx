import { Button, Text, View, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from 'context/auth/AuthHook';
//Header
import { Header } from 'components/Header';
import { LucideImageUp, Settings, SendHorizonal, Star, LogOut } from 'lucide-react-native';

type NavigationType = NativeStackNavigationProp<RootStackParamList>;
export const ProfileScreenEmployer = () => {
  const {  userMDB, signOutUser } = useAuth();

  const navigation = useNavigation<NavigationType>();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />

      {/* scroll if content gets long */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="flex-1 justify-center items-center">
          <View className="border rounded-full w-32 h-32 overflow-hidden">
            <Image
              source={{ uri: userMDB?.profilePic }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          <Text
            style={{
              fontFamily: 'Poppins-Bold',
              fontSize: 21,
              color: '#37421F',
            }}
          >
            {userMDB.companyName}
          </Text>
        </View>

        {/* Profile Title */}
        <View className='flex-row justify-between items-center'>
          <Text
            style={{
              fontFamily: 'Poppins-Bold',
              fontSize: 24,
              color: '#37424F',
            }}
          >
            Your Profile
          </Text>

          <Pressable
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,          // rounded pill
              justifyContent: 'center',
              alignItems: 'center',
            }}
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            onPress={() => { navigation.navigate('editProfile') }}
          >
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 12,            // closer to heading scale
                color: '#007AFF',        // tappable hint
              }}
            >
              Edit Profile
            </Text>
          </Pressable>
        </View>



        {/* Profile Info */}
        <View className="space-y-2">
          {/* Profile (Company Name) */}
          <View className="flex-row items-center">
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
          <View className="flex-row items-center">
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
          <View className="flex-row items-center">
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
          <View className="flex-row items-center">
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
        <View style={{ marginTop: 32 }}>
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
          <View className="space-y-2 justify-between">
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
          <View className="space-y-2 justify-between">
            {/* Name */}
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
          <View className="space-y-2 justify-between">
            {/* Name */}
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

        {/* Miscellaneous Section */}
        <View style={{ marginTop: 32 }}>
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

          {/* Settings  */}
          <View className="space-y-2 justify-between">
            <Pressable
              className="flex-row items-center justify-between"
              onPress={async () => {
                try {
                  const signout = signOutUser();
                  console.log(signout);
                  console.log("Successfully Updated Profile in DB")

                  alert('Signed out successfully');
                  navigation.navigate('login');
                } catch (err) {
                  alert(err);
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
              <LogOut width={20} color={"#37424F"}></LogOut>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
