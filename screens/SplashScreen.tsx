import { Text, View , Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SplashScreen = () => {
  return (
    <SafeAreaView>
         <Image source={require('../assets/images/app_logo.png')} className="w-[330px] h-[95px]" resizeMode="contain" />
    </SafeAreaView>
  );
};
