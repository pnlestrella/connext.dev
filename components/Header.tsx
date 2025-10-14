import { Bell } from 'lucide-react-native';
import { View, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const Header = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: insets.top + 6, // lighter padding for modern look
        paddingBottom: 6,
        backgroundColor: 'white',
        // no border, subtle shadow instead
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
        elevation: 1,
      }}
    >
      {/* Logo */}
      <Image
        style={{ width: 36, height: 24, resizeMode: 'contain' }}
        source={require('../assets/images/justLogo.png')}
      />

      {/* Notification */}
      <TouchableOpacity
        onPress={() => alert('This feature is coming soon.')}
        style={{
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Bell width={20} height={20} color="#6C63FF" />
      </TouchableOpacity>
    </View>
  );
};
