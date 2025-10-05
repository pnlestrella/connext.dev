import { StyleSheet, View, Text, Image, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { useState } from 'react';
import Constants from 'expo-constants';
import { userLogin } from 'firebase/firebaseAuth';
import { useAuth } from 'context/auth/AuthHook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AlertModal from 'components/AlertModal';
import { Eye, EyeOff } from 'lucide-react-native'; // add this import


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'login'>;

export function LoginScreen() {
  const { loading, setLoading, setUserMDB } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // Alert modal state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Alert');

  //password
  const [showPassword, setShowPassword] = useState(false);


  const navigation = useNavigation<NavigationProp>();

  const showAlert = (message: string, title: string = 'Alert') => {
    setAlertMessage(message);
    setAlertTitle(title);
    setAlertVisible(true);
  };

  const handleLogin = async (role: 'jobseeker' | 'employer') => {
    if (!email) return showAlert('Email is required', 'Validation Error');
    if (!password) return showAlert('Password is required', 'Validation Error');

    setLoading(true);

    try {
      const url =
        role === 'jobseeker'
          ? `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/jobseekers/getJobseeker?email=${encodeURIComponent(email)}`
          : `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/getEmployer?email=${encodeURIComponent(email)}`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error('Account does not exist');
      }

      const userProfile = await res.json();
      setUserMDB(userProfile.message);

      // Store profile for persistence
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile.message));

      // Firebase login
      await userLogin(email, password);

    } catch (err: any) {
      console.log(err);

      if (err.message === 'Network request failed') {
        showAlert('Turn on the SERVER!', 'Connection Error');
        await AsyncStorage.removeItem('userProfile');
        setUserMDB(null);
      } else {
        showAlert(err.code || err.message || 'Login failed', 'Login Error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-8 bg-white">

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6C63FF" />
        </View>
      )}

      {/* Logo */}
      <View className="items-center mb-8">
        <Image
          source={require('../assets/images/app_logo.png')}
          className="w-[330px] h-[95px]"
          resizeMode="contain"
        />
      </View>

      {/* Header */}
      <View className="w-full max-w-md mb-8">
        <Text style={styles.titleText}>Login</Text>
        <Text style={styles.subHeaderText}>Welcome back, connect now!</Text>
      </View>

      {/* Form */}
      <View className="w-full max-w-md space-y-4">
        {/* Email */}
        <View>
          <Text style={styles.fieldHeader} className="ml-2 mt-2">Email</Text>
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

        {/* Password */}
        <View>
          <Text style={styles.fieldHeader} className="ml-2 mt-2">Password</Text>
          <View className="relative">
            <TextInput
              className="border border-gray-300 rounded-lg p-3 pr-10" // add padding-right for icon space
              placeholder="Enter your password"
              value={password}
              placeholderTextColor="#9CA3AF"
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={{ color: '#000' }}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '35%',
              }}
            >
              {showPassword ? (
                <EyeOff size={20} color="#6B7280" />
              ) : (
                <Eye size={20} color="#6B7280" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Keep signed in + Forgot */}
        <View className="flex-row justify-between items-center mt-2 mb-4">
          <Pressable className="flex-row items-center" onPress={() => setKeepSignedIn(!keepSignedIn)}>
            <View className="w-5 h-5 border border-gray-400 rounded mr-2 items-center justify-center mt-5">
              {keepSignedIn && <View className="w-3 h-3 bg-[#3397f5] rounded-sm" />}
            </View>
            <Text className="text-sm text-gray-700">Keep me signed in</Text>
          </Pressable>

          <Pressable onPress={() => showAlert('Feature in progress', 'Coming Soon')}>
            <Text className="text-sm text-[#1572DB] font-semibold">Forgot password?</Text>
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

        {/* Register */}
        <Text className="justify-center text-center mt-5">
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
});
