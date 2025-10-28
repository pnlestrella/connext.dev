import { useRoute, useNavigation } from '@react-navigation/native';
import { Header } from 'components/Header';
import {
  ArrowLeft, User, Smile, AlertTriangle, Star, Send,
  Plus, Camera, Mic, CalendarDays, Check
} from 'lucide-react-native';
import {
  Text, View, TouchableOpacity, TextInput, Keyboard,
  TouchableWithoutFeedback, FlatList, Pressable, Animated,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { getMessages } from 'api/chats/message';
import { useAuth } from 'context/auth/AuthHook';
import { useSockets } from 'context/sockets/SocketHook';
import { updateApplications } from 'api/applications';
import ConfirmationModal from 'components/ConfirmationModal';
import MeetingModal from 'components/MeetingModal';
import * as Linking from "expo-linking";


//constants
import Constants from 'expo-constants'
import AlertModal from 'components/AlertModal';

//api imports
import {  getSchedulesByConversation } from 'api/schedules/schedules';

export const ChatScreen = () => {
  const { socket } = useSockets();
  const { userMDB, initializing, refreshAuth } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;

  const [schedules, setSchedules] = useState([]);

     const fetchSchedules = async () => {
      try {
        const res = await getSchedulesByConversation(item.conversationUID);
        console.log(item.conversationUID, 'BOMMMMM');
        console.log(res, 'Fetched schedules');
        setSchedules(res);
      } catch (err) {
        console.log('Error fetching schedules:', err);
      }
    };

  useEffect(() => {
    fetchSchedules();
  }, [item.conversationUID]);



  console.log(item,'WOOOOOOOOOWIE')


  //for confirmation modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmProps, setConfirmProps] = useState({
    title: '',
    message: '',
    confirmButtonText: 'Confirm',
    onConfirm: () => { },
  });

  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);

  //ui/ux purpose -- hiring
  const [isHiredState, setIsHiredState] = useState(item.applicationStatus === 'hired');
  const hireBadgeAnim = useState(new Animated.Value(isHiredState ? 1 : 0))[0];

  //meeting modal
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  //for alert modal
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('Alert');
  const [onAlertClose, setOnAlertClose] = useState<(() => void) | null>(null);

  const showAlert = (message: string, title: string = 'Alert', onClose?: () => void) => {
    setAlertMessage(message);
    setAlertTitle(title);
    setAlertVisible(true);
    setOnAlertClose(() => onClose); // store the callback
  };

  const [googleConnected, setGoogleConnected] = useState(true);

  //validation so user will be redirected to oauth
  useEffect(() => {
    if (userMDB.oauth.accessToken === null || userMDB.oauth.refreshToken === null || new Date() >= new Date(userMDB.oauth.refreshTokenExpiresAt)) {
      setGoogleConnected(false)
    }
  }, [])

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      const parsed = Linking.parse(url);
      console.log('Redirect URL:', url);
      console.log('Parsed params:', parsed);

      const status = parsed?.queryParams?.status;

      if (status) {
        console.log('✅ Google status received:', status);
        refreshAuth();
        console.log(userMDB.oauth, 'usermmdddb')
        setTimeout(() => showAlert(
          'You can now access Google Calendar.',
          'Success!',
          () => {
            setShowMeetingModal(true);
          }
        ), 500);
      }
    };
    const subscription = Linking.addEventListener('url', handleDeepLink);
    // For when the app is opened from a cold start via deep link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);
  //---------------------------------------------------------------------

  // Animate badge when hired
  useEffect(() => {
    if (isHiredState) {
      Animated.spring(hireBadgeAnim, {
        toValue: 1, useNativeDriver: true, friction: 5, tension: 80,
      }).start();
    }
  }, [isHiredState]);

  // Load messages
  useEffect(() => {
    if (initializing || !userMDB) return;

    getMessages(item.conversationUID)
      .then((res) => {
        const messages = res.reverse();
        const allMessages = [...schedules, ...messages].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setHistory(allMessages.reverse());
      })
      .catch((err) => console.log(err));
  }, [item.conversationUID, initializing, userMDB, schedules]);

  // Socket listeners
  useEffect(() => {
    if (initializing || !userMDB || !socket) return;
    socket.emit('joinConversation', item.conversationUID);
    socket.on('newMessage', (newMsg) => {
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
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
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
      setIsHiredState(true);
    } catch (err) {
      console.log(err, 'Error Hiring the Jobseeker');
    }
  };

  // Function to open the confirmation modal dynamically
  const openConfirmModal = ({
    title,
    message,
    confirmButtonText,
    onConfirm,
  }: {
    title: string;
    message: string;
    confirmButtonText?: string;
    onConfirm: () => void;
  }) => {
    setConfirmProps({
      title,
      message,
      confirmButtonText: confirmButtonText || 'Confirm',
      onConfirm,
    });
    setShowConfirm(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
      >
        {/* Alert Modal */}
        <AlertModal
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => {
            setAlertVisible(false);
            if (onAlertClose) {
              onAlertClose(); // ✅ execute custom behavior
              setOnAlertClose(null); // reset callback
            }
          }}
        />

        {/* Hire Confirmation Modal - now dynamic */}
        <ConfirmationModal
          visible={showConfirm}
          type="default"
          title={confirmProps.title}
          message={confirmProps.message}
          confirmButtonText={confirmProps.confirmButtonText}
          onConfirm={() => {
            confirmProps.onConfirm();
          }}
          onCancel={() => setShowConfirm(false)}
        />

        <MeetingModal
          visible={showMeetingModal}
          onClose={() => setShowMeetingModal(false)}
          item={item}
          onConfirm={(result: any) => {
            console.log("Scheduled meeting:", result);

            if (result === "REFRESH_TOKEN_EXPIRED") {
              //reloading error catcher for the REFRESH TOKENS
              const redirectUri = Linking.createURL('/auth/success');
              const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/oauth/google?redirect_uri=${encodeURIComponent(redirectUri)}&userUID=${userMDB.employerUID}`;
              openConfirmModal({
                title: "Google Re-Authentication",
                message: "You'll need to re-authenticate with your Google account to continue.",
                confirmButtonText: "Proceed",
                onConfirm: () => {
                  Linking.openURL(url);
                },
              });
              console.log("⚠️Token expired — user needs to reauthenticate.");
            } else if (result?.error) {
              alert(`❌ Failed to create meeting: ${result.message}`);
            } else {
              showAlert(
                'Meeting created successfully.',
                'Success!',
                () => {
                  console.log(result, 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
                  //refetch so its functioning real-time
                  fetchSchedules();

                  console.log("Successfully created a meeting!")
                }
              )
            }
          }}
        />

        {/* Dismiss Keyboard On Tap */}
        <View style={{ flex: 1 }}>
          {/* Top bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#e5e7eb' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft width={24} height={24} color="#37424F" />
            </TouchableOpacity>
            <View style={{ marginLeft: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' }}>
              <User width={20} height={20} color="#37424F" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 16, color: '#37424F' }}>
                {displayName || 'Applicant'}
              </Text>
              <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: '#6B7280' }}>
                Active 2 hours ago
              </Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <View style={{ marginHorizontal: 8 }}>
                <Pressable
                  style={{ backgroundColor: '#1ab50e', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}
                  onPress={() => {
                    if (!googleConnected) {
                      // dynamically generate deep link back to this chat
                      const redirectUri = Linking.createURL('/auth/success');
                      const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/oauth/google?redirect_uri=${encodeURIComponent(redirectUri)}&userUID=${userMDB.employerUID}`;
                      openConfirmModal({
                        title: "Google Sign-In Required",
                        message: "You'll be asked to sign in with your Google account to continue.",
                        confirmButtonText: "Proceed",
                        onConfirm: () => {
                          Linking.openURL(url);
                        },
                      });
                    } else {
                      setShowMeetingModal(true);
                    }
                  }}

                >
                  <Text style={{ color: 'white', fontFamily: 'Poppins-Medium' }}>Meet</Text>
                </Pressable>
              </View>
              {!isHiredState && (
                <Pressable
                  style={{ backgroundColor: '#3b82f6', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 }}
                  onPress={() =>
                    openConfirmModal({
                      title: "Are you sure?",
                      message: "Only press confirm if you have scheduled an interview and assessed the applicant personally.",
                      confirmButtonText: "Confirm Hire",
                      onConfirm: handleHire,
                    })
                  }
                >
                  <Text style={{ color: 'white', fontFamily: 'Poppins-Medium' }}>Hire</Text>
                </Pressable>
              )}
            </View>
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
              justifyContent: 'space-between'
            }}
          >
            <View style={{ flexDirection: 'row' }}>
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
            </View>

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

              // Meeting / system message special style
              if (msg.type === 'system' || msg.type === 'meeting') {
                // Parse meeting time
                const startDateObj = new Date(msg.startTime);
                const endDateObj = new Date(msg.endTime);

                const dateStr = startDateObj.toLocaleDateString([], {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                const startTimeStr = startDateObj.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                }).replace(/^0+/, '').replace(' ', '');
                const endTimeStr = endDateObj.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                }).replace(/^0+/, '').replace(' ', '');

                // Check if meeting is live (current time between start and end)
                const now = Date.now();
                const thirtyMinutesBeforeStart = startDateObj.getTime() - (30 * 60 * 1000);
                const canJoin = now >= thirtyMinutesBeforeStart && now <= endDateObj.getTime();

                return (
                  <View
                    style={{
                      alignSelf: 'center',
                      backgroundColor: '#F5F8FE',
                      borderRadius: 14,
                      paddingVertical: 14,
                      paddingHorizontal: 18,
                      marginVertical: 10,
                      maxWidth: '85%',
                      borderWidth: 1,
                      borderColor: canJoin ? "#2563EB" : "#A5AAB6",
                      shadowColor: "#2563EB",
                      shadowOpacity: 0.05,
                      shadowOffset: { width: 0, height: 1 },
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  >

                    {/* Top: Title + Edit */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 15, color: '#0B2745', flex: 1 }}>
                        {msg.title}
                      </Text>
                      <Pressable
                        onPress={() => alert("Test")}
                        style={{
                          backgroundColor: '#2563EB20',
                          paddingVertical: 4,
                          paddingHorizontal: 12,
                          borderRadius: 6,
                          marginLeft: 8
                        }}
                      >
                        <Text style={{ color: '#2563EB', fontFamily: 'Poppins-Medium', fontSize: 13 }}>Edit</Text>
                      </Pressable>
                    </View>

                    {/* Description (optional) */}
                    {msg.description ?
                      <Text style={{
                        fontFamily: 'Poppins-Regular',
                        color: '#465063',
                        fontSize: 13,
                        marginVertical: 3,
                      }}>
                        {msg.description}
                      </Text>
                      : null}

                    {/* Date and time */}
                    <View style={{ marginTop: 8, marginBottom: 4, flexDirection: 'row', alignItems: 'center' }}>
                      <CalendarDays width={17} height={17} color="#2563EB" />
                      <Text style={{ fontFamily: 'Poppins-Medium', color: '#2563EB', fontSize: 12, marginLeft: 5 }}>
                        {dateStr}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: 13,
                        color: '#0B2745',
                        marginRight: 7,
                      }}>
                        {startTimeStr} — {endTimeStr}
                      </Text>
                      {msg.status === "pending" &&
                        <Text style={{ color: '#f59e42', fontFamily: 'Poppins-Medium', fontSize: 12, marginLeft: 3 }}>
                          Pending
                        </Text>
                      }
                    </View>

                    {/* Meeting link section */}
                    <Pressable
                      disabled={!canJoin}
                      onPress={() => Linking.openURL(msg.meetingLink)}
                      style={{
                        backgroundColor: canJoin ? "#2563EB" : "#A5AAB6",
                        borderRadius: 10,
                        paddingVertical: 9,
                        alignItems: "center",
                        marginTop: 8,
                        opacity: canJoin ? 1 : 0.65
                      }}
                    >
                      <Text style={{
                        color: "white",
                        fontFamily: "Poppins-Medium",
                        fontSize: 14
                      }}>
                        {canJoin ? "Join Meeting" : "Join Meeting (Locked)"}
                      </Text>
                    </Pressable>

                    {/* Show info when meeting not open yet */}
                    {!canJoin && (
                      <Text style={{
                        fontSize: 12,
                        color: "#A5AAB6",
                        textAlign: "center",
                        marginTop: 7,
                        fontFamily: "Poppins-Regular"
                      }}>
                        You can join only during the scheduled meeting time.
                      </Text>
                    )}

                    {/* Created at */}
                    <Text style={{
                      textAlign: "center",
                      color: "#6c757d",
                      fontSize: 11,
                      marginTop: 7
                    }}>
                      {new Date(msg.createdAt).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </Text>
                  </View>
                );
              }

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
                      hour12: true,
                    })}
                  </Text>
                </View>
              );
            }}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            inverted
            nestedScrollEnabled
            style={{ flex: 1 }}
          />

          {/* Bottom input bar */}
          <View style={{ borderTopWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white', paddingHorizontal: 12, paddingVertical: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Pressable style={{ marginRight: 8 }}>
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
              <Pressable style={{ marginLeft: 8 }}>
                <Smile width={24} height={24} color="#6B7280" />
              </Pressable>
              {message.trim().length > 0 ? (
                <Pressable style={{ marginLeft: 8, backgroundColor: '#3b82f6', borderRadius: 999, padding: 8 }} onPress={handleSend}>
                  <Send width={20} height={20} color="white" />
                </Pressable>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                  <Pressable style={{ marginRight: 8 }}>
                    <Camera width={22} height={22} color="#6B7280" />
                  </Pressable>
                  <Pressable>
                    <Mic width={22} height={22} color="#6B7280" />
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
