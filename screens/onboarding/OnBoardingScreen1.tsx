import { StyleSheet, View, Text, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from 'components/Button'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from 'navigation/types/RootStackParamList'

export default function OnboardingScreen1() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <View className='flex-1 items-center justify-center px-6 pb-10'>
        <Text style={styles.titleText}>
          Welcome to
        </Text>

        <Image
          source={require('../../assets/images/app_logo.png')}
          className='my-5 w-[330px] h-[95px]'
          resizeMode='contain'>
        </Image>

        <Text style={{ fontFamily: 'Lexend-Regular' }} className="text-base text-center text-black-100 my-5 mx-5">
          We offer a centralized mobile platform that makes it more accessible for individuals
          that struggle with taking the first step into the professional world.
        </Text>

        <Button title={"Let's get started!"} onPress={() => navigation.navigate('onboarding2')} />
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  titleText: {
    fontFamily: 'Lexend-Medium',
    fontSize: 32,
    textAlign: 'center'
  }
})