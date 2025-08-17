import { useState } from 'react';
import { StyleSheet, View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Constants from 'expo-constants';

import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { useAuth } from 'context/auth/AuthHook';
import { userRegister } from 'firebase/firebaseAuth';
import { OTPModal } from 'components/OTP.modal';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const JSRegisterScreen = () => {
  const { setLoading, userType, loading } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP modal
  const [showOTP, setShowOTP] = useState(false);

  async function handleRegister() {
    // Required fields
    if (!email || !password || !firstName || !lastName) {
      alert('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Password validation
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setShowOTP(true);
  }

  async function onVerify() {
    // Register in Firebase
    const registerFirebaseUser = await userRegister(email, password);

    // Build user object
    const user = {
      seekerUID: registerFirebaseUser.user.uid,
      email,
      fullName: { firstName, middleInitial, lastName },
      industries: null,
      skills: null,
      status: true,
      accountIncomplete: true,
    };

    try {
      const response = await fetch(
        `${Constants?.expoConfig?.extra?.BACKEND_BASE_URL}/api/jobseekers/registerJobSeeker`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        }
      );
      console.log(await response.json());
      console.log('Account created successfully');
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-3">
      <View className="items-center justify-center  px-10">
        {/* Header with logo and title */}
        <View className="flex-row items-center ">
          <Image source={require('../../assets/images/justLogo.png')} className="w-20 h-20" resizeMode="contain" />
          <View className="ml-1 flex-1">
            <Text style={style.titleText}>Create an account</Text>
            <Text style={style.subHeaderText} className="ml-1">
              Find your jobs with one swipe
            </Text>
          </View>
        </View>

        {/* Form fields */}
        <View className="w-full max-w-md mt-8">
          {/* Email */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Text style={style.fieldHeader} className="ml-2">
                Email
              </Text>
            </View>
            <TextInput
              style={style.textInput}
              className="border border-gray-300 rounded-md p-3"
              placeholder="johndoe@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* First Name */}
          <View className="mb-4">
            <Text style={style.fieldHeader} className="mb-2">
              First Name
            </Text>
            <TextInput
              style={style.textInput}
              className="border border-gray-300 rounded-md p-3"
              placeholder="John"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Middle Initial */}
          <View className="mb-4">
            <Text style={style.fieldHeader} className="mb-2">
              Middle Initial (If applicable)
            </Text>
            <TextInput
              style={style.textInput}
              className="border border-gray-300 rounded-md p-3"
              placeholder="i.e M."
              maxLength={2}
              value={middleInitial}
              onChangeText={setMiddleInitial}
            />
          </View>

          {/* Last Name */}
          <View className="mb-4">
            <Text style={style.fieldHeader} className="mb-2">
              Last Name
            </Text>
            <TextInput
              style={style.textInput}
              className="border border-gray-300 rounded-md p-3"
              placeholder="Doe"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Password */}
          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Text style={style.fieldHeader} className="ml-2">
                Password
              </Text>
            </View>
            <TextInput
              style={style.textInput}
              className="border border-gray-300 rounded-md p-3"
              placeholder="Create a password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Confirm Password */}
          <View className="mb-10">
            <View className="flex-row items-center mb-2">
              <Text style={style.fieldHeader} className="ml-2">
                Confirm Password
              </Text>
            </View>
            <TextInput
              style={style.textInput}
              className="border border-gray-300 rounded-md p-3"
              placeholder="Confirm your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleRegister}
            className="bg-[#6C63FF] px-6 py-4 rounded-xl w-full"
          >
            <Text className="text-white font-bold text-center">Proceed</Text>
          </TouchableOpacity>

          {/* Already have account? */}
          <Text className="mt-4 text-center">
            Already have an account?{' '}
            <Text
              className="text-[#6C63FF] font-bold"
              onPress={() => navigation.navigate('login')}
            >
              Sign In here
            </Text>
          </Text>
        </View>
      </View>

      {/* OTP Modal */}
      <OTPModal
        loading={loading}
        setLoading={setLoading}
        userType={userType}
        email={email}
        onVerify={onVerify}
        visible={showOTP}
        onClose={() => setShowOTP(false)}
        onSubmit={() => setShowOTP(false)}
      />
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  titleText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    marginBottom: 2,
  },
  subHeaderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#A1A1A1',
  },
  fieldHeader: {
    fontFamily: 'Lexend-Bold',
    color: '#37424F',
    fontSize: 14,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
  },
});
