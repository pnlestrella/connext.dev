import { useState } from 'react';
import { Button, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { useAuth } from 'context/auth/AuthHook';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'login'>

export const LoginScreen = () => {
    const {login} = useAuth()

    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
        <Text>This is Login</Text>
      <Text>Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text>Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Submit"
        onPress={async () => {
          //Successful Login
          try{
            const loginUser = login(email,password);
            navigation.navigate('home')
          }catch(err: any){
            //Failed Login
            alert(err.code)
            console.log(err)
          }
        }}
      />
      <Button title={"Register here"} onPress={() => {
        navigation.navigate('accountType')
      }} />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderWidth: 1, marginVertical: 8, padding: 8, borderRadius: 4, color:"black" }
});
