import { Button, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from 'context/auth/AuthHook';
//Header
import { Header } from 'components/Header';
import { LucideImageUp, Settings, SendHorizonal, Star, LogOut } from 'lucide-react-native';

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreenJS = () => {
  const { user, userMDB, signOutUser } = useAuth();
  const navigation = useNavigation<NavigationType>();
  console.log(userMDB?.fullName);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />

      {/* scroll if content gets long */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Profile Title */}
        <Text
          style={{
            fontFamily: 'Poppins-Bold',
            fontSize: 24,
            color: '#37424F',
            marginBottom: 16,
          }}
        >
          Your Profile
        </Text>

        {/* Profile Info */}
        <View className="space-y-2">
          {/* Name */}
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
              {userMDB?.fullName.firstName} {userMDB?.fullName.middleInitial}.{' '}
              {userMDB?.fullName.lastName}
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
              {userMDB?.industries}
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
              {userMDB?.email}
            </Text>
          </View>
        </View>

        {/* Resume Section */}
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              fontFamily: 'Lexend-SemiBold',
              fontSize: 18,
              color: '#37424F',
              marginBottom: 12,
            }}
          >
            Résumé
          </Text>

          <View className="flex-row space-x-3">
            <Pressable
              className="flex-1 border flex-row p-2 rounded-lg border-gray-400 items-center justify-center"
              onPress={() => alert('Feature on progress')}
            >
              <LucideImageUp color={'#949494'} style={{ marginRight: 6 }} />
              <Text
                style={{
                  fontFamily: 'Inter-Regular',
                  fontSize: 12,
                  color: '#949494',
                }}
              >
                Upload Resume
              </Text>
            </Pressable>

            <Pressable
              className="flex-1  flex-row p-2 rounded-lg items-center justify-center"
              onPress={() => alert('Feature on progress')}
              style={{ backgroundColor: '#1572DB' }}
            >
              <Text
                style={{
                  fontFamily: 'Lexend-Bold',
                  fontSize: 14,
                  color: 'white',
                }}
              >
                Create Resume
              </Text>
            </Pressable>
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
