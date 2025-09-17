import { Header } from 'components/Header';
import { Text, View, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import { getUserConversations } from 'api/chats/conversation';
import { useAuth } from 'context/auth/AuthHook';
import { User } from 'lucide-react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

export const ConversationsScreen = () => {
  const [conversations, setConversations] = useState([]);
  const { user } = useAuth();


  const route = useRoute();
  const { newConversation } = route.params || {};

  console.log(newConversation, 'miao')

  useEffect(() => {
    if (!route.params?.newConversation) return;
    if (conversations.length === 0) return; // wait until conversations are loaded

    const convUID = route.params.newConversation.payload.conversationUID

    console.log(convUID,' woa')

    // Find the full conversation by UID
    const fullConversation = conversations.find(
      (c) => c.conversationUID === convUID
    );

    console.log(fullConversation,'maiaiaiaiaiai')

    if (fullConversation) {
      navigation.navigate('chats', { item: fullConversation });
    }
  }, [route.params?.newConversation]);






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
      <User
        size={40}
        style={{ padding: 20, marginHorizontal: 5 }}
        color="#37424F"
      />
    );

    return (
      <Pressable className="flex-row items-center px-4 py-3 border-b border-gray-200"
        onPress={() => navigation.navigate("chats", { item })}
      >
        {profilePic}
        <View className="flex-1">
          <Text
            style={{
              fontFamily: "Poppins-Bold",
              fontSize: 16,
              color: "#37424F",
            }}
            numberOfLines={1}
          >
            {displayName || "Unknown"}
          </Text>
          <Text
            style={{
              fontFamily: "Poppins-Regular",
              fontSize: 14,
              color: "#6B7280",
            }}
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
      <View className="flex-row justify-between px-1 m-4">
        <Text
          style={{
            fontFamily: "Poppins-Bold",
            fontSize: 24,
            color: "#37424F",
          }}
        >
          Your Messages
        </Text>
        <Text
          style={{
            fontFamily: "Poppins-Regular",
            fontSize: 16,
            color: "#6B7280",
          }}
        >
          Favorites
        </Text>
      </View>

      {/* Search bar placeholder */}
      <View className="mx-4 mb-2 px-4 py-2 rounded-full bg-gray-100">
        <Text style={{ color: "#9CA3AF", fontFamily: "Poppins-Regular" }}>
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
            style={{
              textAlign: "center",
              marginTop: 20,
              fontFamily: "Poppins-Regular",
            }}
          >
            No conversations yet
          </Text>
        }
      />
    </SafeAreaView>
  );
};
