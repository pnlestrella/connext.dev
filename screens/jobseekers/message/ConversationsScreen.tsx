import { Header } from 'components/Header';
import {
  Text,
  View,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import { getUserConversations } from 'api/chats/conversation';
import { useAuth } from 'context/auth/AuthHook';
import { useFocusEffect, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';


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
  //use route for redirection
  const route = useRoute();
  const { conversationUID, redirect } = route.params || {};

  useEffect(() => {
    const loadAndRedirect = async () => {
      if (!conversationUID) return;

      // If empty, fetch first
      if (conversations.length === 0) {
        const res = await getUserConversations(user.uid);
        setConversations(res);

        // ✅ Find the conversation *after* fetching
        const conv = res.find((c) => c.conversationUID === conversationUID);
        if (conv) {
          navigation.navigate('chats', { item: conv });
        }
      } else {
        // ✅ Otherwise, use existing data
        const conv = conversations.find((c) => c.conversationUID === conversationUID);
        if (conv) {
          navigation.navigate('chats', { item: conv });
        }
      }
    };

    loadAndRedirect();
  }, [redirect]);


  //fetching conversations
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
        style={styles.row}
        onPress={() => { navigation.navigate('chats', { item }) }}
      >
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholderAvatar} />
        )}

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item?.lastMessage ||
              `Start a conversation with ${displayName.split(' ')[0] || 'them'}`}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header />

      {/* Title */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Your Messages</Text>
        <Text style={styles.favorites}>Favorites</Text>
      </View>

      {/* Search bar placeholder */}
      <View style={styles.searchBar}>
        <Text style={styles.searchText}>Find a conversation</Text>
      </View>

      {/* List */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderConversation}
        ListEmptyComponent={
          <Text style={styles.empty}>No conversations yet</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    margin: 16,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#37424F',
  },
  favorites: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  searchText: {
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  placeholderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#E5E7EB',
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#37424F',
    marginBottom: 2,
  },
  lastMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Poppins-Regular',
  },
});
