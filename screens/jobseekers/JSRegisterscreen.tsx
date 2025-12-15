import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import Constants from 'expo-constants';

import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { useAuth } from 'context/auth/AuthHook';
import { userRegister } from 'firebase/firebaseAuth';
import { OTPModal } from 'components/OTP.modal';
import { Loading } from 'components/Loading';
import AlertModal from 'components/AlertModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function capitalizeFirst(input: string) {
  const cleaned = input.replace(/\s+/g, ' '); // collapse multiple spaces
  if (!cleaned) return '';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export const JSRegisterScreen = () => {
  const { setLoading, userType, loading } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const uType = "jobseeker"
  console.log(uType,'babababa')

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // show/hide toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // OTP modal
  const [showOTP, setShowOTP] = useState(false);

  // AlertModal state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("Alert");
  const [alertMessage, setAlertMessage] = useState("");
  const [onAlertClose, setOnAlertClose] = useState<(() => void) | null>(null);

  // Reusable function to show alert modal
  const showAlert = (message: string, title = "Alert", onClose: () => void = () => {}) => {
    setAlertMessage(message);
    setAlertTitle(title);
    setAlertVisible(true);
    setOnAlertClose(() => onClose);
  };

  async function handleRegister() {
    if (!email || !password || !firstName || !lastName) {
      return showAlert('Please fill in all required fields');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return showAlert('Please enter a valid email address');
    }
    if (password !== confirmPassword) {
      return showAlert("Passwords don't match");
    }
    if (password.length < 6) {
      return showAlert('Password must be at least 6 characters');
    }
    console.log("TESTYYYY")
    //temporary
    onVerify();
    // setShowOTP(true);
  }

  async function onVerify() {
    try {
      setLoading(true);
      const registerFirebaseUser = await userRegister(email, password);

      const user = {
        seekerUID: registerFirebaseUser.user.uid,
        email,
        fullName: { firstName, middleInitial, lastName },
        industries: null,
        skills: null,
        status: true,
        accountIncomplete: true,
      };

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
      
      showAlert("Account created successfully", "Success", () => {
        navigation.navigate("login");
      });
    } catch (err: any) {
      console.log(err);
      showAlert(err?.message || "Something went wrong", "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white pt-3">
      {loading && (
        <View className="absolute inset-0 z-50" style={{ backgroundColor: '#fff5f5', opacity: 0.5 }}>
          <Loading />
        </View>
      )}

      {/* Keyboard-aware wrapper */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 16}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center justify-center px-10">
            {/* Header with logo and title */}
            <View className="flex-row items-center">
              <Image
                source={require('../../assets/images/justLogo.png')}
                className="w-20 h-20"
                resizeMode="contain"
              />
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
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
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
                  placeholderTextColor="#9CA3AF"
                  placeholder="John"
                  autoCapitalize="words"
                  value={firstName}
                  onChangeText={(t) => setFirstName(capitalizeFirst(t))}
                  returnKeyType="next"
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
                  placeholderTextColor="#9CA3AF"
                  placeholder="i.e M."
                  maxLength={2}
                  autoCapitalize="characters"
                  value={middleInitial}
                  onChangeText={setMiddleInitial}
                  returnKeyType="next"
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
                  placeholderTextColor="#9CA3AF"
                  placeholder="Doe"
                  autoCapitalize="words"
                  value={lastName}
                  onChangeText={(t) => setLastName(capitalizeFirst(t))}
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <Text style={style.fieldHeader} className="ml-2">
                    Password
                  </Text>
                </View>
                <View
                  className="border border-gray-300 rounded-md px-3"
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <TextInput
                    style={[style.textInput, { flex: 1, paddingVertical: 12 }]}
                    placeholderTextColor="#9CA3AF"
                    placeholder="Create a password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoComplete="password-new"
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    onPress={() => setShowPassword((s) => !s)}
                    style={{ paddingVertical: 8, paddingHorizontal: 6 }}
                  >
                    <Text style={{ color: '#6C63FF', fontWeight: '700' }}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View className="mb-10">
                <View className="flex-row items-center mb-2">
                  <Text style={style.fieldHeader} className="ml-2">
                    Confirm Password
                  </Text>
                </View>
                <View
                  className="border border-gray-300 rounded-md px-3"
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <TextInput
                    style={[style.textInput, { flex: 1, paddingVertical: 12 }]}
                    placeholderTextColor="#9CA3AF"
                    placeholder="Confirm your password"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoComplete="password-new"
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    accessibilityLabel={showConfirm ? 'Hide password' : 'Show password'}
                    onPress={() => setShowConfirm((s) => !s)}
                    style={{ paddingVertical: 8, paddingHorizontal: 6 }}
                  >
                    <Text style={{ color: '#6C63FF', fontWeight: '700' }}>
                      {showConfirm ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity onPress={handleRegister} className="bg-[#6C63FF] px-6 py-4 rounded-xl w-full">
                <Text className="text-white font-bold text-center">Proceed</Text>
              </TouchableOpacity>

              {/* Already have account? */}
              <Text className="mt-4 text-center">
                Already have an account?{' '}
                <Text className="text-[#6C63FF] font-bold" onPress={() => navigation.navigate('login')}>
                  Sign In here
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal */}
      <OTPModal
        loading={loading}
        setLoading={setLoading}
        userType={uType}
        email={email}
        onVerify={onVerify}
        visible={showOTP}
        onClose={() => setShowOTP(false)}
        onSubmit={() => setShowOTP(false)}
      />

      {/* AlertModal */}
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertVisible(false);
          onAlertClose?.();
          setOnAlertClose(null);
        }}
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
    color: '#000',
  },
});
