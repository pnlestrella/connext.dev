import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  User,
  Smile,
  Send,
  Plus,
  Camera,
  Mic,
  CalendarDays,
  Check,
  Copy,
} from 'lucide-react-native';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  FlatList,
  KeyboardAvoidingView,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { getMessages } from 'api/chats/message';
import { getSchedulesByConversation } from 'api/schedules/schedules';
import { useAuth } from 'context/auth/AuthHook';
import { useSockets } from 'context/sockets/SocketHook';
import * as Linking from 'expo-linking';
import MeetIcon from '../../../assets/images/meet.png';

export const ChatScreen = () => {
  const { socket, onlineUsers } = useSockets();
  const { userMDB, initializing } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;

  const isOnline = onlineUsers.has(item.employerUID);

  console.log(onlineUsers,'online uses')

  const isEmployer = !!item.employerUID && userMDB?.employerUID === item.employerUID;
  const isJobSeeker = !!item.seekerUID && userMDB?.seekerUID === item.seekerUID;

  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [copySuccessId, setCopySuccessId] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [joinMeetingModalVisible, setJoinMeetingModalVisible] = useState(false);
  const [selectedMeetingLink, setSelectedMeetingLink] = useState(null);

  const isHired = item.applicationStatus === 'hired';

  const bgColorMap = {
    completed: '#D1FAE5',
    cancelled: '#FEE2E2',
    missed: '#FEF3C7',
    pending: '#F9FAFB',
    'on-call': '#F9FAFB',
  };

  const borderColorMap = {
    completed: '#10B981',
    cancelled: '#EF4444',
    missed: '#FBBF24',
    pending: '#3B82F6',
    'on-call': '#3B82F6',
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [messagesRes, schedulesRes] = await Promise.all([
          getMessages(item.conversationUID),
          getSchedulesByConversation(item.conversationUID),
        ]);
        const messages = messagesRes.reverse();
        const combined = [...schedulesRes, ...messages].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setHistory(combined.reverse());
        setSchedules(schedulesRes);
      } catch (err) {
        console.log('Error loading chat or schedules:', err);
      }
    };
    loadData();
  }, [item.conversationUID]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('joinConversation', item.conversationUID);
    socket.on('newMessage', (newMsg) => {
      setHistory((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [newMsg, ...prev];
      });
    });
    return () => {
      socket.emit('leaveConversation', item.conversationUID);
      socket.off('newMessage');
    };
  }, [socket, item.conversationUID]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

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

  const onPressJoinMeeting = (meetingLink) => {
    setSelectedMeetingLink(meetingLink);
    setJoinMeetingModalVisible(true);
  };

  const onConfirmJoinMeeting = () => {
    if (selectedMeetingLink) {
      Linking.openURL(selectedMeetingLink);
      setJoinMeetingModalVisible(false);
      setSelectedMeetingLink(null);
    }
  };

  const onCancelJoinMeeting = () => {
    setJoinMeetingModalVisible(false);
    setSelectedMeetingLink(null);
  };

  const copyLinkToClipboard = () => {
    if (selectedMeetingLink) {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(selectedMeetingLink);
        setCopySuccessId(selectedMeetingLink);
        setTimeout(() => setCopySuccessId(null), 1500);
      } else {
        import('react-native').then(({ Clipboard }) => {
          Clipboard.setString(selectedMeetingLink);
          setCopySuccessId(selectedMeetingLink);
          setTimeout(() => setCopySuccessId(null), 1500);
        });
      }
    }
  };

  const displayName = isEmployer
    ? item?.seekerName ? `${item.seekerName.firstName} ${item.seekerName.lastName}` : 'Job Seeker'
    : item?.employerName || 'Employer';

  const profilePic = isEmployer ? null : item?.employerProfilePic;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}>
        <View style={{ flex: 1 }}>
          {/* Top bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft width={24} height={24} color="#37424F" />
            </TouchableOpacity>

            {profilePic ? (
              <Image source={{ uri: profilePic }} style={{ width: 40, height: 40, borderRadius: 20, marginLeft: 12 }} />
            ) : (
              <View style={{ width: 40, height: 40, borderRadius: 20, marginLeft: 12, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
                <User width={20} height={20} color="#37424F" />
              </View>
            )}

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, color: '#37424F' }}>{displayName}</Text>
              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: isOnline?'green':'#6B7280' }}>{isOnline? 'Online' : 'Offline'}</Text>
            </View>
          </View>

          {/* Job Title Context Banner */}
          <View style={{
            marginHorizontal: 16,
            marginTop: 6,
            marginBottom: 4,
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: isHired ? '#D1FAE5' : '#F9FAFB',
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
            justifyContent: 'space-between',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <CalendarDays width={18} height={18} color={isHired ? '#10B981' : '#6C63FF'} />
              <Text style={{ marginLeft: 8, fontFamily: 'Poppins-Regular', fontSize: 13, color: '#37424F', flexShrink: 1 }}>
                Chat regarding{' '}
                <Text style={{ fontFamily: 'Poppins-SemiBold', color: isHired ? '#047857' : '#2563EB' }}>
                  {item.jobTitle}
                </Text>
              </Text>
            </View>
            {isHired && (
              <View style={{ backgroundColor: '#047857', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                <Check width={14} height={14} color="white" />
                <Text style={{ color: 'white', fontSize: 11, fontFamily: 'Poppins-Medium', marginLeft: 4 }}>Hired</Text>
              </View>
            )}
          </View>

          {/* Chat body */}
          <FlatList
            data={history}
            keyExtractor={(msg, index) => `${msg._id ?? ''}-${msg.senderUID}-${msg.createdAt}-${index}`}
            renderItem={({ item: msg }) => {
              const myUID = userMDB?.employerUID || userMDB?.seekerUID;
              const isMe = msg.senderUID === myUID;

              if (msg.type === 'meeting' || msg.type === 'system') {
                const startDateObj = new Date(msg.startTime);
                const endDateObj = new Date(msg.endTime);
                const dateStr = startDateObj.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
                const startTimeStr = startDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/^0+/, '').replace(' ', '');
                const endTimeStr = endDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/^0+/, '').replace(' ', '');

                const thirtyMinutesBeforeStart = startDateObj.getTime() - (30 * 60 * 1000);
                const canJoin = currentTime >= thirtyMinutesBeforeStart && currentTime <= endDateObj.getTime();

                const meetingEnd = new Date(msg.endTime);
                const isPastMeeting = new Date(currentTime) > meetingEnd;
                const isInactiveStatus = ['completed', 'cancelled', 'missed'].includes(msg.status);

                return (
                  <View style={{
                    alignSelf: 'center',
                    backgroundColor: bgColorMap[msg.status] ?? bgColorMap.pending,
                    borderRadius: 14,
                    paddingVertical: 14,
                    paddingHorizontal: 18,
                    marginVertical: 10,
                    maxWidth: '85%',
                    borderWidth: 1,
                    borderColor: borderColorMap[msg.status] ?? borderColorMap.pending,
                    shadowColor: borderColorMap[msg.status] ?? borderColorMap.pending,
                    shadowOpacity: 0.05,
                    shadowOffset: { width: 0, height: 1 },
                    shadowRadius: 2,
                    elevation: 2,
                  }}>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 15, color: '#0B2745', flex: 1 }}>{msg.title}</Text>
                      {msg.status === 'completed' && (
                        <View style={{ backgroundColor: '#4B5563', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginLeft: 8 }}>
                          <Text style={{ color: 'white', fontFamily: 'Poppins-Medium', fontSize: 12 }}>Completed</Text>
                        </View>
                      )}
                    </View>

                    {msg.description && (
                      <Text style={{ fontFamily: 'Poppins-Regular', color: '#465063', fontSize: 13, marginVertical: 3 }}>{msg.description}</Text>
                    )}

                    <View style={{ marginTop: 8, marginBottom: 4, flexDirection: 'row', alignItems: 'center' }}>
                      <CalendarDays width={17} height={17} color={borderColorMap[msg.status] ?? borderColorMap.pending} />
                      <Text style={{ fontFamily: 'Poppins-Medium', color: borderColorMap[msg.status] ?? borderColorMap.pending, fontSize: 12, marginLeft: 5 }}>{dateStr}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13, color: '#0B2745', marginRight: 7 }}>
                        {startTimeStr} — {endTimeStr}
                      </Text>
                      {msg.status === 'pending' && <Text style={{ color: '#f59e42', fontFamily: 'Poppins-Medium', fontSize: 12, marginLeft: 3 }}>Pending</Text>}
                      {msg.status === 'on-call' && <Text style={{ color: '#10B981', fontFamily: 'Poppins-Medium', fontSize: 12, marginLeft: 3 }}>On-Call</Text>}
                      {msg.status === 'cancelled' && <Text style={{ color: '#EF4444', fontFamily: 'Poppins-Medium', fontSize: 12, marginLeft: 3 }}>Cancelled</Text>}
                      {msg.status === 'missed' && <Text style={{ color: '#FBBF24', fontFamily: 'Poppins-Medium', fontSize: 12, marginLeft: 3 }}>Missed</Text>}
                    </View>

                    {!isInactiveStatus && (
                      <TouchableOpacity
                        disabled={!canJoin}
                        onPress={() => onPressJoinMeeting(msg.meetingLink)}
                        style={{
                          backgroundColor: canJoin ? "#2563EB" : "#A5AAB6",
                          borderRadius: 10,
                          paddingVertical: 9,
                          alignItems: "center",
                          marginTop: 8,
                          opacity: canJoin ? 1 : 0.65
                        }}>
                        <Text style={{ color: "white", fontFamily: "Poppins-Medium", fontSize: 14 }}>
                          {canJoin ? "Join Meeting" : "Join Meeting (Locked)"}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {!canJoin && (
                      <Text style={{ fontSize: 12, color: "#A5AAB6", textAlign: "center", marginTop: 7, fontFamily: "Poppins-Regular" }}>
                        You can join only during the scheduled meeting time.
                      </Text>
                    )}

                    <Text style={{ textAlign: 'center', color: "#6c757d", fontSize: 11, marginTop: 7 }}>
                      {new Date(msg.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </Text>
                  </View>
                );
              }

              return (
                <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', backgroundColor: isMe ? '#2563EB' : '#E5E7EB', borderRadius: 16, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8, maxWidth: '75%' }}>
                  <Text style={{ color: isMe ? 'white' : '#37424F', fontFamily: 'Poppins-Regular', fontSize: 14 }}>{msg.text}</Text>
                  <Text style={{ fontSize: 10, color: isMe ? '#BFDBFE' : '#6B7280', marginTop: 4, alignSelf: 'flex-end' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </Text>
                </View>
              );
            }}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            inverted
            style={{ flex: 1 }}
          />

          {/* Modal for join meeting confirmation */}
          <Modal
            visible={joinMeetingModalVisible}
            transparent
            animationType="fade"
            onRequestClose={onCancelJoinMeeting}
          >
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)'
            }}>
              <View style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: 20,
                width: '80%',
                alignItems: 'center',
                elevation: 5,
                shadowColor: '#2563EB',
                shadowOpacity: 0.3,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 5 }
              }}>
                <Text style={{ fontSize: 16, fontFamily: 'Poppins-Medium', marginBottom: 15, textAlign: 'center' }}>
                  You will be redirected to the meeting link.
                </Text>
                <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 14, marginBottom: 20, textAlign: 'center', color: '#4B5563' }}>
                  Copy the link or press Confirm to proceed.
                </Text>

                {/* Styled Copy Meeting Link Button with Meet Icon */}
                <TouchableOpacity
                  onPress={copyLinkToClipboard}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#C8F7F0',  // lighter mint-green
                    borderRadius: 10,
                    paddingVertical: 6,          // reduced from 8
                    paddingHorizontal: 12,       // reduced from 15
                    marginBottom: 20,
                    width: '100%',
                    shadowColor: '#00A67E',      // keep original green shadow
                    shadowOpacity: 0.4,
                    shadowRadius: 4,             // slight smaller shadow radius
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 4,
                  }}
                >
                  <Image
                    source={MeetIcon}
                    style={{ width: 18, height: 18, marginRight: 8, resizeMode: 'contain' }} // smaller icon and margin
                  />
                  <Text style={{ color: '#007759', fontFamily: 'Poppins-Medium', fontSize: 13 }}> {/* darker green text */}
                    Copy Meeting Link
                  </Text>
                </TouchableOpacity>


                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    onPress={onCancelJoinMeeting}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 15,
                      borderRadius: 10,
                      backgroundColor: '#D1D5DB',
                      flex: 1,
                      marginRight: 10,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 14, color: '#374151' }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onConfirmJoinMeeting}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 15,
                      borderRadius: 10,
                      backgroundColor: '#2563EB',
                      flex: 1,
                      marginLeft: 10,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 14, color: 'white' }}>
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

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
                style={{ flex: 1, fontFamily: 'Poppins-Regular', fontSize: 15, color: '#37424F', maxHeight: 100 }}
              />

              <TouchableOpacity style={{ marginLeft: 8 }}>
                <Smile width={24} height={24} color="#6B7280" />
              </TouchableOpacity>

              {message.trim().length > 0 ? (
                <TouchableOpacity style={{ marginLeft: 8, backgroundColor: '#2563EB', borderRadius: 9999, padding: 8 }} onPress={handleSend}>
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
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
