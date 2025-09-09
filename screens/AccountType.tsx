import { StyleSheet, Text, View, Image, Pressable, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { useAuth } from 'context/auth/AuthHook';
import { useState, useRef } from 'react';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AccountType = () => {
  const [selected, setSelected] = useState<'jobseeker' | 'employer'>('jobseeker');
  const [settledType, setSettledType] = useState<'jobseeker' | 'employer'>('jobseeker');

  const navigation = useNavigation<NavigationProp>();
  const { setAccountType} = useAuth()

  // 👇 Animated value instead of Reanimated
  const position = useRef(new Animated.Value(0)).current;

  const handleSelect = (type: 'jobseeker' | 'employer') => {
    setSelected(type);
    const targetValue = type === 'jobseeker' ? 0 : 1;

    Animated.timing(position, {
      toValue: targetValue,
      duration: 600,
      useNativeDriver: true,
    }).start(() => setSettledType(type));
  };

  const handleProceed = () => {
    const chosenType = selected;

    // 2️⃣ Update the context
    setAccountType(chosenType);

    // 3️⃣ Navigate to register screen
    navigation.navigate('register');
  };


  // Slider animation style
  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.5 - 16],
  });

  const isActive = (type: 'jobseeker' | 'employer') => selected === type;

  return (
    <SafeAreaView className="flex-1 items-center justify-center px-4 bg-white">
      {/* Logo */}
      <Image source={require('../assets/images/app_logo.png')} className="w-[250px] h-[95px]" resizeMode="contain" />

      <Text style={styles.titleText}>Who are you?</Text>

      <Text className="text-center mr-10 ml-10 mt-4 mb-10 mx-10 text-[14px] text-black">
        Choose one account type so that we know who to pair you up with.
      </Text>

      {/* Sliding Highlight */}
      <View className="flex-row w-full justify-between relative p-1 mb-10 rounded-2xl">
        <Animated.View
          style={[
            {
              position: 'absolute',
              height: 250,
              width: width * 0.5 - 16,
              backgroundColor: '#6C63FF',
              borderRadius: 20,
              zIndex: 0,
              transform: [{ translateX }],
            },
          ]}
        />

        {/* Job Seeker */}
        <Pressable
          onPress={() => handleSelect('jobseeker')}
          className="flex-1 items-center p-4 rounded-2xl z-10"
        >
          <Image source={require('../assets/images/jobSeeker.png')} className="mb-5 w-[100px] h-[100px]" resizeMode="contain" />
          <Text
            style={[
              styles.accountTypeText,
              { color: isActive('jobseeker') ? 'white' : 'black' },
            ]}
          >
            Job Seeker
          </Text>
          <Text
            style={{
              color: isActive('jobseeker') ? 'white' : 'black',
              textAlign: 'center',
              fontSize: 14,
            }}
          >
            This account type is for those looking for employment.
          </Text>
        </Pressable>

        {/* Employer */}
        <Pressable
          onPress={() => handleSelect('employer')}
          className="flex-1 items-center p-4 rounded-2xl z-10"
        >
          <Image source={require('../assets/images/Employer.png')} className="mb-5 w-[100px] h-[100px]" resizeMode="contain" />
          <Text
            style={[
              styles.accountTypeText,
              { color: isActive('employer') ? 'white' : '#1A1A1A' },
            ]}
          >
            Employer
          </Text>
          <Text
            style={{
              color: isActive('employer') ? 'white' : 'black',
              textAlign: 'center',
              fontSize: 14,
            }}
          >
            This account type is for those looking for employees.
          </Text>
        </Pressable>
      </View>

      {/* Proceed button */}
      <Pressable
        onPress={handleProceed}
        className="bg-[#6C63FF] px-6 py-3 rounded-lg items-center justify-center"
      >
        <Text className="text-white font-bold text-center">Proceed</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 24,
    textAlign: 'center',
    color: '#6C63FF',
  },
  accountTypeText: {
    fontSize: 16,
    fontFamily: 'Lexend-Bold',
    marginBottom: 5,
  },
});
