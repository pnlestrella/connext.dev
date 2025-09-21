import { StyleSheet, View, Text, Image, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { useState } from 'react';
import Constants from 'expo-constants'
import { userLogin } from 'firebase/firebaseAuth';
import { Loading } from 'components/Loading';
import { useAuth } from 'context/auth/AuthHook';
import AsyncStorage from '@react-native-async-storage/async-storage';


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'login'>

export function LoginScreen() {
  const { loading, setLoading, setUserMDB } = useAuth()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const navigation = useNavigation<NavigationProp>();

  const handleLogin = async (role: 'jobseeker' | 'employer') => {
    setLoading(true)
    console.log("hey")
    console.log(role)

    if (!email) {
      alert("Email is required")
      return
    }
    if (!password) {
      alert("Password is required")
      return
    }

    try {
      if (role === 'jobseeker') {

        //check if the user exist in JOBSEEKER DB
        const res = await fetch(
          `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/jobseekers/getJobseeker?email=${encodeURIComponent(email)}`
        );

        if (!res.ok) {
          console.log("Account Does not exist")
          throw new Error("Account Does not exist")
        }
        const userProfile = await res.json()

        setUserMDB(userProfile.message)

        //set Async storage for UX purpose
        await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile.message))

        await userLogin(email, password)
        setLoading(false)


      } else {
        const res = await fetch(
          `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/getEmployer?email=${encodeURIComponent(email)}`
        );

        if (!res.ok) {
          console.log("Account Does not Exist")
          throw new Error("Account Does not exist")
        }

        const userProfile = await res.json()
        setUserMDB(userProfile.message)

        //set Async storage for UX purpose
        await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile.message))

        await userLogin(email, password)
        setLoading(false)

      }

    } catch (err: any) {
      setLoading(false)
      alert(err.code || 'Login failed');
      console.log(err, '--=====================================================-');
      console.log(err.message)
      if (err.message === 'Network request failed') {
        alert("Turn on the SERVER!")
        await AsyncStorage.clear()
        setUserMDB(null)
      }
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-8 bg-white">
      {loading &&
        <View className='absolute inset-0 z-50' style={{ backgroundColor: '#fff5f5', opacity: 0.5 }}>
          <Loading />
        </View>
      }

      {/* Logo Section */}
      <View className="items-center mb-8">
        <Image source={require('../assets/images/app_logo.png')} className="w-[330px] h-[95px]" resizeMode="contain" />
      </View>

      {/* Login Header */}
      <View className="w-full max-w-md mb-8">
        <Text style={styles.titleText}>Login</Text>
        <Text style={styles.subHeaderText}>Welcome back, connect now!</Text>
      </View>

      {/* Form Section */}
      <View className="w-full max-w-md space-y-4">
        {/* Email Input */}
        <View>
          <View className="flex-row items-center mb-2">
            <Text style={styles.fieldHeader} className="ml-2 mt-2">Email</Text>
          </View>

          <TextInput
            className="border border-gray-300 rounded-lg p-3 mb-5"
            placeholder="johndoe@gmail.com"
            value={email}
            placeholderTextColor="#9CA3AF"
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ color: '#000' }} 
          />

        </View>

        {/* Password Input */}
        <View>
          <View className="flex-row items-center mb-2 text-black">
            <Text style={styles.fieldHeader} className="ml-2 mt-2">Password</Text>
          </View>

          <TextInput
            className="border border-gray-300 rounded-lg p-3"
            placeholder="Enter your password"
            value={password}
            placeholderTextColor="#9CA3AF"
            onChangeText={setPassword}
            secureTextEntry
            style={{ color: '#000' }}
          />

        </View>

        {/* Checkbox & Forgot Password */}
        <View className="flex-row justify-between items-center mt-2 mb-4">
          <Pressable
            className="flex-row items-center"
            onPress={() => setKeepSignedIn(!keepSignedIn)}
          >
            <View className="w-5 h-5 border border-gray-400 rounded mr-2 items-center justify-center mt-5">
              {keepSignedIn && <View className="w-3 h-3 bg-[#3397f5] rounded-sm" />}
            </View>
            <Text className="text-sm text-gray-700 mt-5">Keep me signed in</Text>
          </Pressable>

          <Pressable onPress={() => alert('Feature in progress')}>
            <Text className="text-sm text-[#1572DB] font-semibold">Forgot password?</Text>
          </Pressable>
        </View>

        {/* Login Buttons */}
        <View className="space-y-4 mt-4">
          <Pressable
            onPress={() => handleLogin('jobseeker')}
            className="bg-[#6C63FF] px-6 py-3 rounded-lg items-center justify-center"
          >
            <Text className="text-white font-bold text-center">Login as Job Seeker</Text>
          </Pressable>

          <View className="flex-row justify-center items-center my-2">
            <View className="border-b border-gray-300 flex-1" />
            <Text className="text-gray-500 mt-3 mb-3 mx-3 text-sm font-bold">
              Not A Job Seeker?
            </Text>
            <View className="border-b border-gray-300 flex-1" />
          </View>

          <Pressable
            onPress={() => handleLogin('employer')}
            className="bg-[#1572DB] px-6 py-3 rounded-lg items-center justify-center"
          >
            <Text className="text-white font-bold text-center">Login as Employer</Text>
          </Pressable>
        </View>

        {/* Register Link */}
        <Text className="justify-center text-center mt-5">
          Don&apos;t have an account?
          <Text
            className="text-[#6C63FF] font-bold"
            onPress={() => navigation.navigate('accountType')}
          >
            {' '}Register now.
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 22,
    marginBottom: 2,
  },
  subHeaderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#8E8E8E',
    marginLeft: 1,
  },
  fieldHeader: {
    fontFamily: 'Lexend-Medium',
    color: '#616161',
    fontSize: 14,
    marginBottom: 10,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
  },
});
