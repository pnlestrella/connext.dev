import { Header } from 'components/Header';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export const JobProspectScreen = () => {
  return (
    <SafeAreaView className='bg-white' style={{ flex: 1 }}>
      <Header />
      
      <Text>This is job prospects</Text>
      
    </SafeAreaView>
  );
};
