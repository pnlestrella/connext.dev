import { useRoute, useNavigation } from '@react-navigation/native';
import { Header } from 'components/Header';
import {
  ArrowLeft,
  User,
  Smile,
  AlertTriangle,
  Star,
  Send,
  Plus,
  Camera,
  Mic,
} from 'lucide-react-native';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';
import { getMessages } from 'api/chats/message';
import { useAuth } from 'context/auth/AuthHook';
import { useSockets } from 'context/sockets/SocketHook';

interface Message {
  _id?: string;
  senderUID: string;
  text: string;
  createdAt: string;
}

interface RouteParams {
  item: {
    conversationUID: string;
    seekerName?: {
      firstName: string;
      lastName: string;
    };
  };
}

export const ChatScreen = () => {
  // sockets
  const { socket } = useSockets();
  const { userMDB } = useAuth();

  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params as RouteParams;

  const displayName = `${item?.seekerName?.firstName} ${item?.seekerName?.lastName}`;
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // load messages (oldest first)
  useEffect(() => {
    getMessages(item.conversationUID)
      .then((res) => {
        // Sort messages by createdAt to ensure chronological order (oldest first)
        const sortedMessages = res.sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setHistory(sortedMessages);
      })
      .catch((err) => console.log(err));
  }, [item.conversationUID]);

  // socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.emit('joinConversation', item.conversationUID);

    socket.on('newMessage', (newMsg: Message) => {
      setHistory((prev) => {
        // ✅ prevent duplicates
        const exists = prev.some((m) => m._id === newMsg._id);
        if (exists) return prev;
        const newHistory = [...prev, newMsg];
        // Auto-scroll to bottom when new message arrives
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        return newHistory;
      });
    });

    return () => {
      socket.emit('leaveConversation', item.conversationUID);
      socket.off('newMessage');
    };
  }, [socket, item.conversationUID]);

  const handleSend = () => {
    if (!message.trim() || !socket) return;

    const senderUID = userMDB.employerUID || userMDB.seekerUID;

    socket.emit('sendMessage', {
      conversationUID: item.conversationUID,
      senderUID,
      text: message.trim(),
    });

    setMessage('');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={{ flex: 1 }}>
          {/* Top bar */}
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft width={24} height={24} color="#37424F" />
            </TouchableOpacity>

            <View className="ml-3 w-10 h-10 rounded-full bg-gray-300 items-center justify-center">
              <User width={20} height={20} color="#37424F" />
            </View>
            <View className="ml-3 flex-1">
              <Text
                style={{
                  fontFamily: 'Poppins-Bold',
                  fontSize: 14,
                  color: '#37424F',
                }}
              >
                {displayName}
              </Text>
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 12,
                  color: '#6B7280',
                }}
              >
                Active 2 hours ago
              </Text>
            </View>

            <TouchableOpacity className="bg-blue-500 rounded-lg px-3 py-1">
              <Text style={{ color: 'white', fontFamily: 'Poppins-Medium' }}>
                Hire Applicant
              </Text>
            </TouchableOpacity>
          </View>

          {/* Chat body */}
          <FlatList
            data={history}
            keyExtractor={(msg, index) =>
              `${msg._id ?? ''}-${msg.senderUID}-${msg.createdAt}-${index}`
            }
            renderItem={({ item: msg }) => {
              const myUID = userMDB.employerUID || userMDB.seekerUID;
              const isMe = msg.senderUID === myUID;

              return (
                <View
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    backgroundColor: isMe ? '#2563EB' : '#E5E7EB',
                    borderRadius: 16,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginBottom: 8,
                    maxWidth: '75%',
                  }}
                >
                  <Text
                    style={{
                      color: isMe ? 'white' : '#37424F',
                      fontFamily: 'Poppins-Regular',
                      fontSize: 14,
                    }}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: isMe ? '#BFDBFE' : '#6B7280',
                      marginTop: 4,
                      alignSelf: 'flex-end',
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              );
            }}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ref={flatListRef}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Bottom input bar */}
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="border-t border-gray-200 bg-white px-3 py-2">
              <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2">
                {/* Plus button */}
                <TouchableOpacity className="mr-2">
                  <Plus width={26} height={26} color="#2563EB" />
                </TouchableOpacity>

                {/* Input */}
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Message..."
                  multiline
                  style={{
                    flex: 1,
                    fontFamily: 'Poppins-Regular',
                    fontSize: 15,
                    color: '#37424F',
                    maxHeight: 100,
                    paddingTop: 6,
                  }}
                />

                {/* Emoji */}
                <TouchableOpacity className="ml-2">
                  <Smile width={24} height={24} color="#6B7280" />
                </TouchableOpacity>

                {/* Send vs attachments */}
                {message.trim().length > 0 ? (
                  <TouchableOpacity
                    className="ml-2 bg-blue-500 rounded-full p-2"
                    onPress={handleSend}
                  >
                    <Send width={20} height={20} color="white" />
                  </TouchableOpacity>
                ) : (
                  <View className="flex-row items-center ml-2">
                    <TouchableOpacity className="mr-3">
                      <Camera width={22} height={22} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Mic width={22} height={22} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Quick actions */}
              <View className="flex-row justify-between px-2 py-2">
                <TouchableOpacity className="flex-row items-center">
                  <AlertTriangle width={18} color="#EF4444" />
                  <Text className="text-xs text-red-500 ml-1">Report</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center">
                  <Star width={18} color="#FACC15" />
                  <Text className="text-xs text-yellow-500 ml-1">Favorites</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
