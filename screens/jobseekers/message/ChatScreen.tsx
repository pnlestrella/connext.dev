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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { getMessages } from 'api/chats/message';
import { useAuth } from 'context/auth/AuthHook';
import { useSockets } from 'context/sockets/SocketHook';

export const ChatScreen = () => {
  const { socket } = useSockets();
  const { userMDB } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;

  const displayName = item?.employerName || 'Employer';
  const profilePic = item?.employerProfilePic;

  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);

  // Load history
  useEffect(() => {
    getMessages(item.conversationUID)
      .then((res) => setHistory(res)) // remove .reverse()
      .catch((err) => console.log(err));
  }, [item.conversationUID]);


  // Socket setup
  useEffect(() => {
    if (!socket) return;

    socket.emit('joinConversation', item.conversationUID);

    socket.on('newMessage', (newMsg) => {
      setHistory((prev) => {
        const exists = prev.find((m) => m._id === newMsg._id);
        if (exists) return prev;
        return [newMsg, ...prev];
      });
    });

    return () => {
      socket.emit('leaveConversation', item.conversationUID);
      socket.off('newMessage');
    };
  }, [socket, item.conversationUID]);

  const handleSend = () => {
    if (!message.trim() || !socket) return;

    socket.emit('sendMessage', {
      conversationUID: item.conversationUID,
      senderUID: userMDB.seekerUID,
      text: message.trim(),
    });

    setMessage('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Header />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Top bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft width={24} height={24} color="#37424F" />
              </TouchableOpacity>

              {profilePic ? (
                <Image
                  source={{ uri: profilePic }}
                  style={{ width: 40, height: 40, borderRadius: 20, marginLeft: 12 }}
                />
              ) : (
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginLeft: 12,
                    backgroundColor: '#E5E7EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User width={20} height={20} color="#37424F" />
                </View>
              )}

              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, color: '#37424F' }}>
                  {displayName}
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: '#6B7280' }}>
                  Active 2 hours ago
                </Text>
              </View>
            </View>

            {/* Chat body */}
            <FlatList
              data={history}
              keyExtractor={(msg, index) =>
                `${msg._id ?? ''}-${msg.senderUID}-${msg.createdAt}-${index}`
              }
              renderItem={({ item: msg }) => {
                const isMe = msg.senderUID === userMDB.seekerUID;
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
              contentContainerStyle={{ padding: 16, flexGrow: 1 }}
              showsVerticalScrollIndicator={false}
              inverted
              style={{ flex: 1 }}
            />


            {/* Input bar */}
            <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 9999, paddingHorizontal: 12, paddingVertical: 8 }}>
                <TouchableOpacity style={{ marginRight: 8 }}>
                  <Plus width={26} height={26} color="#2563EB" />
                </TouchableOpacity>

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
                  }}
                />

                <TouchableOpacity style={{ marginLeft: 8 }}>
                  <Smile width={24} height={24} color="#6B7280" />
                </TouchableOpacity>

                {message.trim().length > 0 ? (
                  <TouchableOpacity
                    style={{ marginLeft: 8, backgroundColor: '#2563EB', borderRadius: 9999, padding: 8 }}
                    onPress={handleSend}
                  >
                    <Send width={20} height={20} color="white" />
                  </TouchableOpacity>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                    <TouchableOpacity style={{ marginRight: 8 }}>
                      <Camera width={22} height={22} color="#6B7280" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Mic width={22} height={22} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Quick actions */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AlertTriangle width={18} color="#EF4444" />
                  <Text style={{ fontSize: 12, color: '#EF4444', marginLeft: 4 }}>Report</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Star width={18} color="#FACC15" />
                  <Text style={{ fontSize: 12, color: '#FACC15', marginLeft: 4 }}>Favorite</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
