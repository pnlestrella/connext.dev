import { Bell } from 'lucide-react-native';
import { View, Image, TouchableOpacity } from 'react-native';

export const Header = () => {
    return (
        <View className='flex-row py-4 px-2 justify-between items-center' >
            <Image className='w-4 h-7' source={require('../assets/images/justLogo.png')}></Image>
            <TouchableOpacity
            onPress={() => alert("Feature is on construction")}
            >
                <Bell width={20} color={"#6C63FF"}></Bell>

            </TouchableOpacity>
        </View>
    );
};
