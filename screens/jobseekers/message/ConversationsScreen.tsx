import { Header } from 'components/Header';
import { Text, View, FlatList, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import { getUserConversations } from 'api/chats/conversation';
import { useAuth } from 'context/auth/AuthHook';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search } from 'lucide-react-native';

export const ConversationsScreen = () => {
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();
  const navigation = useNavigation();

  const fetchConversations = async () => {
    if (!user?.uid) return;
    try {
      const res = await getUserConversations(user.uid);
      setConversations(res);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [user?.uid])
  );

  const renderConversation = ({ item }) => {
    const displayName = item?.employerName || 'Employer';
    const profilePic = item?.employerProfilePic;

    return (
      <Pressable
        className="flex-row items-center border-b border-gray-200 px-4 py-3"
        onPress={() => navigation.navigate('chats', { item })}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} className="mr-3 h-12 w-12 rounded-full" />
        ) : (
          <View className="mr-3 h-12 w-12 rounded-full bg-gray-200" />
        )}

        <View className="flex-1">
          <Text style={{fontFamily: 'Lexend-Bold'}} className="mb-0.5 text-base text-[#37424F]" numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={{fontFamily: 'Lexend-Regular'}} className="text-sm text-gray-500" numberOfLines={1}>
            {item?.lastMessage ||
              `Start a conversation with ${displayName.split(' ')[0] || 'them'}`}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <Header />

      {/* Title */}
      <View className="flex-row items-center justify-between px-2 pb-2">
        <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-2xl text-[#37424F]">
          Your Messages
        </Text>
        <Text
          style={{ fontFamily: 'Poppins-Bold' }}
          className="text-base font-normal text-gray-500">
          Favorites
        </Text>
      </View>

      {/* Search bar placeholder */}
      <View className="mx-4 mb-2 flex-row items-center rounded-full bg-gray-100 px-4 py-2">
        <Search size={16} color="#9CA3AF" />
        <Text style={{ fontFamily: 'Lexend-Regular' }} className="ml-2 font-normal text-gray-400">
          Find a conversation
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderConversation}
        ListEmptyComponent={
          <Text className="mt-5 text-center font-normal">No conversations yet</Text>
        }
      />
    </SafeAreaView>
  );
};
