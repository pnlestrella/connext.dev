import { StyleSheet, View, Text, Image, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { useState } from 'react';
import Constants from 'expo-constants';
import { userLogin } from 'firebase/firebaseAuth';
import { Loading } from 'components/Loading';
import { useAuth } from 'context/auth/AuthHook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Lock } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'login'>;

export function LoginScreen() {
  const { loading, setLoading, setUserMDB } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const navigation = useNavigation<NavigationProp>();

  const handleLogin = async (role: 'jobseeker' | 'employer') => {
    setLoading(true);
    console.log('hey');
    console.log(role);

    if (!email) {
      alert('Email is required');
      return;
    }
    if (!password) {
      alert('Password is required');
      return;
    }

    try {
      if (role === 'jobseeker') {
        //check if the user exist in JOBSEEKER DB
        const res = await fetch(
          `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/jobseekers/getJobseeker?email=${encodeURIComponent(email)}`
        );

        if (!res.ok) {
          console.log('Account Does not exist');
          throw new Error('Account Does not exist');
        }
        const userProfile = await res.json();

        setUserMDB(userProfile.message);

        //set Async storage for UX purpose
        await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile.message));

        await userLogin(email, password);
        setLoading(false);
      } else {
        const res = await fetch(
          `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/getEmployer?email=${encodeURIComponent(email)}`
        );

        if (!res.ok) {
          console.log('Account Does not Exist');
          throw new Error('Account Does not exist');
        }

        const userProfile = await res.json();
        setUserMDB(userProfile.message);

        //set Async storage for UX purpose
        await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile.message));

        await userLogin(email, password);
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      alert(err.code || 'Login failed');
      console.log(err, '--=====================================================-');
      console.log(err.message);
      if (err.message === 'Network request failed') {
        alert('Turn on the SERVER!');
        await AsyncStorage.clear();
        setUserMDB(null);
      }
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      {loading && (
        <View
          className="absolute inset-0 z-50"
          style={{ backgroundColor: '#fff5f5', opacity: 0.5 }}>
          <Loading />
        </View>
      )}

      {/* Logo Section */}
      <View className="mb-8 items-center">
        <Image
          source={require('../assets/images/app_logo.png')}
          className="h-[95px] w-[330px]"
          resizeMode="contain"
        />
      </View>

      {/* Login Header */}
      <View className="mb-8 w-full max-w-md">
        <Text style={styles.titleText}>Login</Text>
        <Text style={styles.subHeaderText}>Welcome back, connect now!</Text>
      </View>

      {/* Form Section */}
      <View className="w-full max-w-md space-y-4">
        {/* Email Input */}
        <View>
          <View className="mb-2 flex-row items-center">
            <Mail size={16} />
            <Text style={styles.fieldHeader} className="ml-2 mt-2">
              Email
            </Text>
          </View>

          <TextInput
            className="mb-5 rounded-lg border border-gray-300 p-3"
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
          <View className="mb-2 flex-row items-center text-black">
            <Lock size={16} />
            <Text style={styles.fieldHeader} className="ml-2 mt-2">
              Password
            </Text>
          </View>

          <TextInput
            className="rounded-lg border border-gray-300 p-3"
            placeholder="Enter your password"
            value={password}
            placeholderTextColor="#9CA3AF"
            onChangeText={setPassword}
            secureTextEntry
            style={{ color: '#000' }}
          />
        </View>

        {/* Checkbox & Forgot Password */}
        <View className="my-4 flex-row items-center justify-between">
          <Pressable
            className="flex-row items-center"
            onPress={() => setKeepSignedIn(!keepSignedIn)}>
            <View className="mr-2 h-5 w-5 items-center justify-center rounded border border-gray-400">
              {keepSignedIn && <View className="h-3 w-3 rounded-sm bg-[#3397f5]" />}
            </View>
            <Text className="text-sm text-gray-700">Keep me signed in</Text>
          </Pressable>

          <Pressable onPress={() => alert('Feature in progress')}>
            <Text className="text-sm font-semibold text-[#1572DB]">Forgot password?</Text>
          </Pressable>
        </View>

        {/* Login Buttons */}
        <View className="mt-4 ">
          <Pressable
            onPress={() => handleLogin('jobseeker')}
            className="items-center justify-center rounded-lg bg-[#6C63FF] px-6 py-3">
            <Text className="text-center font-bold text-white">Login as Job Seeker</Text>
          </Pressable>

          <View className="my-2 flex-row items-center justify-center">
            <View className="flex-1 border-b border-gray-300" />
            <Text className="mx-3 mb-3 mt-3 text-sm font-bold text-gray-500">
              Not A Job Seeker?
            </Text>
            <View className="flex-1 border-b border-gray-300" />
          </View>

          <Pressable
            onPress={() => handleLogin('employer')}
            className="items-center justify-center rounded-lg bg-[#1572DB] px-6 py-3">
            <Text className="text-center font-bold text-white">Login as Employer</Text>
          </Pressable>
        </View>

        {/* Register Link */}
        <Text className="mt-5 justify-center text-center">
          Don&apos;t have an account?
          <Text
            className="font-bold text-[#6C63FF]"
            onPress={() => navigation.navigate('accountType')}>
            {' '}
            Register now.
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
