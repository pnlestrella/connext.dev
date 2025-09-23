import { Header } from 'components/Header';
import { Text, View, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import { getUserConversations } from 'api/chats/conversation';
import { useAuth } from 'context/auth/AuthHook';
import { User, Search } from 'lucide-react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

export const ConversationsScreen = () => {
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();

  const route = useRoute();
  const { newConversation } = route.params || {};

  console.log(newConversation, 'miao')

  useEffect(() => {
    if (!route.params?.newConversation) return;
    if (conversations.length === 0) return;

    const convUID = route.params.newConversation.payload.conversationUID;

    const fullConversation = conversations.find(
      (c) => c.conversationUID === convUID
    );

    if (fullConversation) {
      navigation.navigate("chats", { item: fullConversation });

      navigation.setParams({ newConversation: undefined });
    }
  }, [route.params?.newConversation, conversations]);

  const navigation = useNavigation()

  useEffect(() => {
    if (!user?.uid) return;
    getUserConversations(user.uid)
      .then((res) => setConversations(res))
      .catch((err) => console.log(err));
  }, [user]);

  useFocusEffect(useCallback(() => {
    getUserConversations(user.uid)
      .then((res) => setConversations(res))
      .catch((err) => console.log(err));
  }, []))

  const renderConversation = ({ item }) => {
    let displayName = "";
    let profilePic = null;

    // Employer should see seeker
    const seeker = item?.seekerName || {};
    displayName = `${seeker.firstName || ""} ${seeker.middleInitial ? seeker.middleInitial + ". " : ""
      }${seeker.lastName || ""}`.trim();

    profilePic = (
      <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-gray-200">
        <User size={24} color="#37424F" />
      </View>
    );

    return (
      <Pressable
        className="flex-row items-center border-b border-gray-200 px-4 py-3"
        onPress={() => navigation.navigate("chats", { item })}
      >
        {profilePic}
        <View className="flex-1">
          <Text
            style={{ fontFamily: "Lexend-Bold" }}
            className="mb-0.5 text-base text-[#37424F]"
            numberOfLines={1}
          >
            {displayName || "Unknown"}
          </Text>
          <Text
            style={{ fontFamily: "Lexend-Regular" }}
            className="text-sm text-gray-500"
            numberOfLines={1}
          >
            {item?.lastMessage ||
              `Start a conversation with ${displayName.split(" ")[0] || "them"}`}
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
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-2xl text-[#37424F]"
        >
          Your Messages
        </Text>
        <Text
          style={{ fontFamily: "Poppins-Bold" }}
          className="text-base font-normal text-gray-500"
        >
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
          <Text
            style={{ fontFamily: "Lexend-Regular" }}
            className="mt-5 text-center"
          >
            No conversations yet
          </Text>
        }
      />
    </SafeAreaView>
  );
};