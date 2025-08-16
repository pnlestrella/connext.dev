import { useState } from 'react';
import { Text, TextInput, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from 'context/auth/AuthHook';
import { jobseekerRegister } from 'firebase/firebaseAuth';
import Constants from 'expo-constants'
//otp
import { OTPModal } from 'components/OTP.modal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export const JSRegisterScreen = () => {
  const { setLoading, userType,loading } = useAuth()

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')
  const navigation = useNavigation<NavigationProp>();


  //for OTP
  const [showOTP, setShowOTP] = useState(false)


  async function handleRegister() {
    //verification first
    if (!email || !password || !firstName || !lastName) {
      alert("Please fill in all required fields");
      return;
    }
    //email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }
    //passwords validation
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (password.length < 6 && confirmPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setShowOTP(true)
    //after verifying
    
  }

  
  async function onVerify(){
    //register user in firebase AUTH
    const registerFirebaseUser = await jobseekerRegister(email, password)
    
    // USER Registration MONGODB
    const user = {
      seekerUID: registerFirebaseUser.user.uid,
      email: email,
      fullName: {
        firstName: firstName,
        middleInitial: middleInitial,
        lastName: lastName
      },
      industries: null,
      skills: null,
      status: true,
      accountIncomplete: true
    }
    console.log(user)

    try {
      const response = await fetch(`${Constants?.expoConfig?.extra?.BACKEND_BASE_URL}/api/jobseekers/registerJobSeeker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      })
      console.log(response)
      console.log("Account created successfully")
    } catch (err) {
      console.log(err)
    }

  }

  // alert(Constants.expoConfig?.extra?.FIREBASE_API_KEY)

  return (
    <SafeAreaView className='h-full'>
      <Text>JOBSEEKER Register Screen</Text>
      <TextInput style={styles.input} onChangeText={setEmail} value={email} placeholder='Enter your email'></TextInput>
      <TextInput style={styles.input} onChangeText={setFirstName} value={firstName} placeholder='Enter your First Name'></TextInput>
      <TextInput style={styles.input} onChangeText={setMiddleInitial} value={middleInitial} placeholder='Enter your Middle initial'></TextInput>
      <TextInput style={styles.input} onChangeText={setLastName} value={lastName} placeholder='Enter your Last Name'></TextInput>
      <TextInput style={styles.input} onChangeText={setPassword} value={password} placeholder='Enter your Password'></TextInput>
      <TextInput style={styles.input} onChangeText={setConfirmPassword} value={confirmPassword} placeholder='Confirm Your Password'></TextInput>
      <Button title={"Submit"} onPress={() => handleRegister()} />
      <Text>Already have an accounnt? <TouchableOpacity onPress={() => navigation.navigate('login')}><Text>SignIn here</Text></TouchableOpacity></Text>

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

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderWidth: 1, marginVertical: 8, padding: 8, borderRadius: 4 }
});
