import { Header } from 'components/Header';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export const HomeScreenEmployer = () => {
  return (
    <SafeAreaView className='flex-1'>
      <Header />
      <Text>This is Employers Home Screen</Text>

    </SafeAreaView>
  );
};
