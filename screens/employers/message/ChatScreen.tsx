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
  CalendarDays,
  Check
} from 'lucide-react-native';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useRef } from 'react';
import { getMessages } from 'api/chats/message';
import { useAuth } from 'context/auth/AuthHook';
import { useSockets } from 'context/sockets/SocketHook';
import { updateApplications } from 'api/applications';
import ConfirmationModal from 'components/ConfirmationModal';

export const ChatScreen = () => {
  const { socket } = useSockets();
  const { userMDB, initializing } = useAuth();

  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;

  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [isHiredState, setIsHiredState] = useState(item.applicationStatus === 'hired');

  const hireBadgeAnim = useState(new Animated.Value(isHiredState ? 1 : 0))[0];

  // Animate badge when hired
  useEffect(() => {
    if (isHiredState) {
      Animated.spring(hireBadgeAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 80,
      }).start();
    }
  }, [isHiredState]);

  // Load messages
  useEffect(() => {
    if (initializing || !userMDB) return;
    getMessages(item.conversationUID)
      .then((res) => {
        // Sort messages by createdAt to ensure chronological order (oldest first)
        const sortedMessages = res.sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setHistory(sortedMessages);
      })
      .catch((err) => console.log(err));
  }, [item.conversationUID, initializing, userMDB]);

  // Socket listeners
  useEffect(() => {
    if (initializing || !userMDB || !socket) return;

    socket.emit('joinConversation', item.conversationUID);

    socket.on('newMessage', (newMsg: Message) => {
      setHistory((prev) => {
        const exists = prev.some((m) => m._id === newMsg._id);
        if (exists) return prev;
        return [newMsg, ...prev];
      });
    });

    return () => {
      socket.emit('leaveConversation', item.conversationUID);
      socket.off('newMessage');
    };
  }, [socket, item.conversationUID, initializing, userMDB]);

  if (initializing || !userMDB) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text>Loading chat...</Text>
      </SafeAreaView>
    );
  }

  const displayName = `${item?.seekerName?.firstName ?? ''} ${item?.seekerName?.lastName ?? ''}`.trim();

  const handleSend = () => {
    if (!message.trim() || !socket) return;

    const senderUID = userMDB?.employerUID || userMDB?.seekerUID;
    if (!senderUID) return;

    socket.emit('sendMessage', {
      conversationUID: item.conversationUID,
      senderUID,
      text: message.trim(),
    });

    setMessage('');
  };

  const handleHire = async () => {
    try {
      const res = await updateApplications(item.applicationID, 'hired');
      console.log(res, 'Successfully Hired the Jobseeker');
      setShowConfirm(false);
      setIsHiredState(true); // Immediately reflect in UI
    } catch (err) {
      console.log(err, 'Error Hiring the Jobseeker');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* Hire Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirm}
        type="hire"
        title="Are you sure?"
        message="Only press confirm if you have scheduled an interview and assessed the applicant personally."
        onConfirm={handleHire}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Root KeyboardAvoidingView */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, color: '#37424F' }}>
                {displayName || 'Applicant'}
              </Text>
              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: '#6B7280' }}>
                Active 2 hours ago
              </Text>
            </View>

            {!isHiredState && (
              <Pressable className="bg-blue-500 rounded-lg px-3 py-1" onPress={() => setShowConfirm(true)}>
                <Text style={{ color: 'white', fontFamily: 'Poppins-Medium' }}>Hire Applicant</Text>
              </Pressable>
            )}
          </View>

          {/* Job Title Context Banner */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 6,
              marginBottom: 4,
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: isHiredState ? "#D1FAE5" : "#F9FAFB",
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              elevation: 1,
            }}
          >
            <CalendarDays width={18} height={18} color={isHiredState ? "#10B981" : "#6C63FF"} />

            <Text
              style={{
                marginLeft: 8,
                fontFamily: "Poppins-Regular",
                fontSize: 13,
                color: "#37424F",
                flexShrink: 1,
              }}
            >
              Chat regarding{" "}
              <Text style={{ fontFamily: "Poppins-SemiBold", color: isHiredState ? "#047857" : "#2563EB" }}>
                {item.jobTitle}
              </Text>
            </Text>

            {isHiredState && (
              <Animated.View
                style={{
                  marginLeft: 8,
                  backgroundColor: "#047857",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 999,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: hireBadgeAnim,
                  transform: [{ scale: hireBadgeAnim }],
                }}
              >
                <Check width={14} height={14} color="white" />
                <Text
                  style={{
                    color: "white",
                    fontSize: 11,
                    fontFamily: "Poppins-Medium",
                    marginLeft: 4,
                  }}
                >
                  Hired
                </Text>
              </Animated.View>
            )}
          </View>

          {/* Chat body */}
          <FlatList
            data={history}
            keyExtractor={(msg, index) => `${msg._id ?? index}`}
            renderItem={({ item: msg }) => {
              const myUID = userMDB?.employerUID || userMDB?.seekerUID;
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
            inverted
          />

          {/* Bottom input bar */}
          <View className="border-t border-gray-200 bg-white px-3 py-2">
            <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-2">
              <Pressable className="mr-2">
                <Plus width={26} height={26} color="#2563EB" />
              </Pressable>

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

              <Pressable className="ml-2">
                <Smile width={24} height={24} color="#6B7280" />
              </Pressable>

              {message.trim().length > 0 ? (
                <Pressable className="ml-2 bg-blue-500 rounded-full p-2" onPress={handleSend}>
                  <Send width={20} height={20} color="white" />
                </Pressable>
              ) : (
                <View className="flex-row items-center ml-2">
                  <Pressable className="mr-3">
                    <Camera width={22} height={22} color="#6B7280" />
                  </Pressable>
                  <Pressable>
                    <Mic width={22} height={22} color="#6B7280" />
                  </Pressable>
                </View>
              )}
            </View>

            {/* Quick actions */}
            {/* <View className="flex-row justify-between px-2 mt-2">
              <TouchableOpacity className="flex-row items-center">
                <AlertTriangle width={18} color="#EF4444" />
                <Text className="text-xs text-red-500 ml-1">Report</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center">
                <Star width={18} color="#FACC15" />
                <Text className="text-xs text-yellow-500 ml-1">Fav</Text>
              </TouchableOpacity>
            </View> */}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
