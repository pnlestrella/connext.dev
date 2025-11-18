import React, { useEffect, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
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
  X,
} from "lucide-react-native";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getMessages } from "api/chats/message";
import { useAuth } from "context/auth/AuthHook";
import { useSockets } from "context/sockets/SocketHook";
import { updateApplications } from "api/applications";
import ConfirmationModal from "components/ConfirmationModal";
import MeetingModal from "components/MeetingModal";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import AlertModal from "components/AlertModal";
import EditMeetingModal from "components/EditMeetingModal";
import { getSchedulesByConversation } from "api/schedules/schedules";
import { updateMeeting } from "api/employers/google";

export const ChatScreen = () => {
  const { socket, onlineUsers } = useSockets();
  const { userMDB, initializing, refreshAuth } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;

  const isOnline = onlineUsers.has(item.seekerUID);

  const [schedules, setSchedules] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmProps, setConfirmProps] = useState({
    title: "",
    message: "",
    confirmButtonText: "Confirm",
    onConfirm: () => {},
  });
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [isHiredState, setIsHiredState] = useState(
    item.applicationStatus === "hired"
  );
  const hireBadgeAnim = useState(new Animated.Value(isHiredState ? 1 : 0))[0];
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("Alert");
  const [onAlertClose, setOnAlertClose] = useState(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [copySuccessId, setCopySuccessId] = useState(null);
  const [editMeetingModalVisible, setEditMeetingModalVisible] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState(null);

  // BUTTONS: Meeting action modal state
  const [meetingActionModalVisible, setMeetingActionModalVisible] =
    useState(false);
  const [selectedMeetingForAction, setSelectedMeetingForAction] =
    useState(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  console.log("SCHEDSS", schedules);

  const handleEditMeeting = (meeting) => {
    setMeetingToEdit(meeting);
    setEditMeetingModalVisible(true);
  };

  const handleSaveEditedMeeting = async (updatedMeeting) => {
    try {
      const res = await updateMeeting(updatedMeeting);
      if (res.code === "REFRESH_TOKEN_EXPIRED") {
        const redirectUri = Linking.createURL("/auth/success");
        const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/oauth/google?redirect_uri=${encodeURIComponent(
          redirectUri
        )}&userUID=${userMDB.employerUID}`;
        openConfirmModal({
          title: "Google Re-Authentication",
          message: "Re-authenticate with your Google account.",
          confirmButtonText: "Proceed",
          onConfirm: () => {
            Linking.openURL(url);
            setShowConfirm(false);
          },
        });
      }
      fetchSchedules();
    } catch (err) {
      console.log(err);
    }
    setEditMeetingModalVisible(false);
  };

  const fetchSchedules = async () => {
    try {
      const res = await getSchedulesByConversation(item.conversationUID);
      setSchedules(res);
    } catch (err) {
      console.log("Error fetching schedules:", err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [item.conversationUID]);

  useEffect(() => {
    if (initializing || !userMDB) return;
    getMessages(item.conversationUID)
      .then((res) => {
        const messages = res.reverse();
        const allMessages = [...schedules, ...messages].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setHistory(allMessages.reverse());
      })
      .catch((err) => console.log(err));
  }, [item.conversationUID, initializing, userMDB, schedules]);

  useEffect(() => {
    if (initializing || !userMDB || !socket) return;
    socket.emit("joinConversation", item.conversationUID);
    socket.on("newMessage", (newMsg) => {
      setHistory((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [newMsg, ...prev];
      });
    });
    return () => {
      socket.emit("leaveConversation", item.conversationUID);
      socket.off("newMessage");
    };
  }, [socket, item.conversationUID, initializing, userMDB]);

  useEffect(() => {
    const handleDeepLink = ({ url }) => {
      const parsed = Linking.parse(url);
      const status = parsed?.queryParams?.status;
      if (status) {
        refreshAuth();
        setTimeout(
          () =>
            showAlert(
              "You can now access Google Calendar.",
              "Success!",
              () => {
                setShowMeetingModal(true);
              }
            ),
          500
        );
      }
    };
    const subscription = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => url && handleDeepLink({ url }));
    return () => {
      subscription.remove();
    };
  }, []);

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

  const displayName = `${item?.seekerName?.firstName ?? ""} ${
    item?.seekerName?.lastName ?? ""
  }`.trim();

  const handleSend = () => {
    if (!message.trim() || !socket) return;
    const senderUID = userMDB?.employerUID || userMDB?.seekerUID;
    if (!senderUID) return;
    socket.emit("sendMessage", {
      conversationUID: item.conversationUID,
      senderUID,
      text: message.trim(),
    });
    setMessage("");
  };

  const handleHire = async () => {
    try {
      await updateApplications(item.applicationID, "hired");
      setShowConfirm(false);
      setIsHiredState(true);
    } catch (err) {
      console.log(err);
    }
  };

  const openConfirmModal = ({
    title,
    message,
    confirmButtonText,
    onConfirm,
  }) => {
    setConfirmProps({ title, message, confirmButtonText, onConfirm });
    setShowConfirm(true);
  };

  const copyToClipboard = async (text, msgId) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopySuccessId(msgId);
      setTimeout(() => setCopySuccessId(null), 1500);
    } else {
      import("react-native").then(({ Clipboard }) => {
        Clipboard.setString(text);
        setCopySuccessId(msgId);
        setTimeout(() => setCopySuccessId(null), 1500);
      });
    }
  };

  useEffect(() => {
    if (!userMDB) return;
    if (
      userMDB.oauth.accessToken === null ||
      userMDB.oauth.refreshToken === null ||
      new Date() >= new Date(userMDB.oauth.refreshTokenExpiresAt)
    ) {
      setGoogleConnected(false);
    } else {
      setGoogleConnected(true);
    }
  }, [userMDB]);

  const showAlert = (message, title = "Alert", onClose) => {
    setAlertMessage(message);
    setAlertTitle(title);
    setAlertVisible(true);
    setOnAlertClose(() => onClose);
  };

  // BUTTONS: Cancel meeting handler
  const cancelMeeting = async () => {
    if (!selectedMeetingForAction) return;
    setIsLoadingAction(true);
    try {
      const updated = { ...selectedMeetingForAction, status: "cancelled" };
      await updateMeeting(updated);
      showAlert("Meeting has been cancelled.", "Cancelled");
      setMeetingActionModalVisible(false);
      fetchSchedules();
    } catch (err) {
      showAlert("Failed to cancel meeting, please try again.", "Error");
    } finally {
      setIsLoadingAction(false);
    }
  };

  // BUTTONS: Mark meeting done handler
  const markMeetingDone = async () => {
    if (!selectedMeetingForAction) return;
    setIsLoadingAction(true);
    try {
      const updated = { ...selectedMeetingForAction, status: "completed" };
      await updateMeeting(updated);
      showAlert("Meeting marked as done.", "Success");
      setMeetingActionModalVisible(false);
      fetchSchedules();
    } catch (err) {
      showAlert("Failed to mark meeting done, please try again.", "Error");
    } finally {
      setIsLoadingAction(false);
    }
  };

  // BUTTONS: Open meeting action modal
  const openMeetingActionModal = (meeting) => {
    setSelectedMeetingForAction(meeting);
    setMeetingActionModalVisible(true);
  };

  const bgColorMap = {
    completed: "#D1FAE5",
    cancelled: "#FEE2E2",
    missed: "#FEF3C7",
    pending: "#F9FAFB",
    "on-call": "#F9FAFB",
  };

  const borderColorMap = {
    completed: "#10B981",
    cancelled: "#EF4444",
    missed: "#FBBF24",
    pending: "#3B82F6",
    "on-call": "#3B82F6",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 30}
      >
        <AlertModal
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => {
            setAlertVisible(false);
            onAlertClose?.();
            setOnAlertClose(null);
          }}
        />
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
          onConfirm={(result) => {
            if (result === "REFRESH_TOKEN_EXPIRED") {
              const redirectUri = Linking.createURL("/auth/success");
              const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/oauth/google?redirect_uri=${encodeURIComponent(
                redirectUri
              )}&userUID=${userMDB.employerUID}`;
              openConfirmModal({
                title: "Google Re-Authentication",
                message: "Re-authenticate with your Google account.",
                confirmButtonText: "Proceed",
                onConfirm: () => {
                  Linking.openURL(url);
                  setShowConfirm(false);
                },
              });
            } else if (result?.error) {
              alert(`❌ Failed to create meeting: ${result.message}`);
            } else {
              showAlert("Meeting created successfully.", "Success!", fetchSchedules);
            }
          }}
        />

        {/* BUTTONS: Meeting Action Modal */}
        <Modal
          visible={meetingActionModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMeetingActionModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 16,
                paddingBottom: 32,
                paddingHorizontal: 20,
              }}
            >
              {/* Handle drag indicator */}
              <View
                style={{
                  alignSelf: "center",
                  width: 40,
                  height: 4,
                  backgroundColor: "#e5e7eb",
                  borderRadius: 2,
                  marginBottom: 16,
                }}
              />

              {/* Meeting info */}
              {selectedMeetingForAction && (
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: 8,
                    }}
                  >
                    {selectedMeetingForAction.title}
                  </Text>
                  {selectedMeetingForAction.description && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#6B7280",
                        lineHeight: 20,
                      }}
                    >
                      {selectedMeetingForAction.description}
                    </Text>
                  )}
                </View>
              )}

              {/* Status check - show buttons only for pending/on-call */}
              {selectedMeetingForAction &&
              (selectedMeetingForAction.status === "pending" ||
                selectedMeetingForAction.status === "on-call") ? (
                <View style={{ gap: 12 }}>
                  {/* Cancel Button */}
                  <Pressable
                    onPress={cancelMeeting}
                    disabled={isLoadingAction}
                    style={{
                      backgroundColor: "#EF4444",
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: "center",
                      opacity: isLoadingAction ? 0.6 : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: 16,
                      }}
                    >
                      {isLoadingAction ? "Cancelling..." : "Cancel Meeting"}
                    </Text>
                  </Pressable>

                  {/* Done/Completed Button */}
                  <Pressable
                    onPress={markMeetingDone}
                    disabled={isLoadingAction}
                    style={{
                      backgroundColor: "#10B981",
                      borderRadius: 12,
                      paddingVertical: 14,
                      alignItems: "center",
                      opacity: isLoadingAction ? 0.6 : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "700",
                        fontSize: 16,
                      }}
                    >
                      {isLoadingAction ? "Marking Done..." : "Meeting Done"}
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: "#f3f4f6",
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#6B7280",
                      fontWeight: "600",
                    }}
                  >
                    {selectedMeetingForAction?.status === "completed"
                      ? "✓ Meeting Completed"
                      : selectedMeetingForAction?.status === "cancelled"
                      ? "✗ Meeting Cancelled"
                      : selectedMeetingForAction?.status === "missed"
                      ? "⚠ Meeting Missed"
                      : "Meeting Status: " +
                        selectedMeetingForAction?.status}
                  </Text>
                </View>
              )}

              {/* Close button */}
              <Pressable
                onPress={() => setMeetingActionModalVisible(false)}
                style={{
                  marginTop: 16,
                  paddingVertical: 12,
                  alignItems: "center",
                  backgroundColor: "#f3f4f6",
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#6B7280", fontWeight: "600" }}>
                  Close
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <EditMeetingModal
          visible={editMeetingModalVisible}
          meeting={meetingToEdit}
          onClose={() => setEditMeetingModalVisible(false)}
          onConfirm={handleSaveEditedMeeting}
        />

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft width={24} height={24} color="#37424F" />
            </TouchableOpacity>
            <View
              style={{
                marginLeft: 12,
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#d1d5db",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User width={20} height={20} color="#37424F" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Poppins-Bold",
                  fontSize: 16,
                  color: "#37424F",
                }}
              >
                {displayName || "Applicant"}
              </Text>
              <Text
                style={{
                  fontFamily: "Poppins-Regular",
                  fontSize: 12,
                  color: isOnline ? "green" : "#6B7280",
                }}
              >
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ marginHorizontal: 8 }}>
                <Pressable
                  style={{
                    backgroundColor: "#1ab50e",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                  }}
                  onPress={() => {
                    if (!googleConnected) {
                      const redirectUri = Linking.createURL("/auth/success");
                      const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/oauth/google?redirect_uri=${encodeURIComponent(
                        redirectUri
                      )}&userUID=${userMDB.employerUID}`;
                      openConfirmModal({
                        title: "Google Sign-In Required",
                        message: "Sign in with Google.",
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
                  <Text style={{ color: "white", fontFamily: "Poppins-Medium" }}>
                    Meet
                  </Text>
                </Pressable>
              </View>
              {!isHiredState && (
                <Pressable
                  style={{
                    backgroundColor: "#3b82f6",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                  }}
                  onPress={() =>
                    openConfirmModal({
                      title: "Are you sure?",
                      message: "Schedule interview?",
                      confirmButtonText: "Confirm Hire",
                      onConfirm: handleHire,
                    })
                  }
                >
                  <Text style={{ color: "white", fontFamily: "Poppins-Medium" }}>
                    Hire
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

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
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <CalendarDays
                width={18}
                height={18}
                color={isHiredState ? "#10B981" : "#6C63FF"}
              />
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
                <Text
                  style={{
                    fontFamily: "Poppins-SemiBold",
                    color: isHiredState ? "#047857" : "#2563EB",
                  }}
                >
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

          <FlatList
            data={history}
            keyExtractor={(msg, index) => `${msg._id ?? index}`}
            renderItem={({ item: msg }) => {
              const myUID = userMDB?.employerUID || userMDB?.seekerUID;
              const isMe = msg.senderUID === myUID;

              if (msg.type === "system" || msg.type === "meeting") {
                const startDateObj = new Date(msg.startTime);
                const endDateObj = new Date(msg.endTime);
                const dateStr = startDateObj.toLocaleDateString([], {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });
                const startTimeStr = startDateObj
                  .toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .replace(/^0+/, "")
                  .replace(" ", "");
                const endTimeStr = endDateObj
                  .toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                  .replace(/^0+/, "")
                  .replace(" ", "");

                const thirtyMinutesBeforeStart =
                  startDateObj.getTime() - 30 * 60 * 1000;
                const canJoin =
                  currentTime >= thirtyMinutesBeforeStart &&
                  currentTime <= endDateObj.getTime();

                const meetingEnd = new Date(msg.endTime);
                const isPastMeeting = new Date(currentTime) > meetingEnd;
                const isInactiveStatus = [
                  "completed",
                  "cancelled",
                  "missed",
                ].includes(msg.status);

                return (
                  <Pressable
                    onPress={() => openMeetingActionModal(msg)}
                    style={{
                      alignSelf: "center",
                      backgroundColor:
                        bgColorMap[msg.status] ?? bgColorMap.pending,
                      borderRadius: 14,
                      paddingVertical: 14,
                      paddingHorizontal: 18,
                      marginVertical: 10,
                      maxWidth: "85%",
                      borderWidth: 1,
                      borderColor:
                        borderColorMap[msg.status] ?? borderColorMap.pending,
                      shadowColor:
                        borderColorMap[msg.status] ?? borderColorMap.pending,
                      shadowOpacity: 0.05,
                      shadowOffset: { width: 0, height: 1 },
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-SemiBold",
                          fontSize: 15,
                          color: "#0B2745",
                          flex: 1,
                        }}
                      >
                        {msg.title}
                      </Text>
                      {!isInactiveStatus && !isPastMeeting && (
                        <Pressable
                          onPress={() => handleEditMeeting(msg)}
                          style={{
                            backgroundColor: "#2563EB20",
                            paddingVertical: 4,
                            paddingHorizontal: 12,
                            borderRadius: 6,
                            marginLeft: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: "#2563EB",
                              fontFamily: "Poppins-Medium",
                              fontSize: 13,
                            }}
                          >
                            Edit
                          </Text>
                        </Pressable>
                      )}
                      {msg.status === "completed" && (
                        <View
                          style={{
                            backgroundColor: "#4B5563",
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 999,
                            marginLeft: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontFamily: "Poppins-Medium",
                              fontSize: 12,
                            }}
                          >
                            Completed
                          </Text>
                        </View>
                      )}
                    </View>

                    {msg.description && (
                      <Text
                        style={{
                          fontFamily: "Poppins-Regular",
                          color: "#465063",
                          fontSize: 13,
                          marginVertical: 3,
                        }}
                      >
                        {msg.description}
                      </Text>
                    )}

                    <View
                      style={{
                        marginTop: 8,
                        marginBottom: 4,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <CalendarDays
                        width={17}
                        height={17}
                        color={
                          borderColorMap[msg.status] ?? borderColorMap.pending
                        }
                      />
                      <Text
                        style={{
                          fontFamily: "Poppins-Medium",
                          color:
                            borderColorMap[msg.status] ??
                            borderColorMap.pending,
                          fontSize: 12,
                          marginLeft: 5,
                        }}
                      >
                        {dateStr}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Poppins-Regular",
                          fontSize: 13,
                          color: "#0B2745",
                          marginRight: 7,
                        }}
                      >
                        {startTimeStr} — {endTimeStr}
                      </Text>
                      {msg.status === "pending" && (
                        <Text
                          style={{
                            color: "#f59e42",
                            fontFamily: "Poppins-Medium",
                            fontSize: 12,
                            marginLeft: 3,
                          }}
                        >
                          Pending
                        </Text>
                      )}
                      {msg.status === "on-call" && (
                        <Text
                          style={{
                            color: "#10B981",
                            fontFamily: "Poppins-Medium",
                            fontSize: 12,
                            marginLeft: 3,
                          }}
                        >
                          On-Call
                        </Text>
                      )}
                      {msg.status === "cancelled" && (
                        <Text
                          style={{
                            color: "#EF4444",
                            fontFamily: "Poppins-Medium",
                            fontSize: 12,
                            marginLeft: 3,
                          }}
                        >
                          Cancelled
                        </Text>
                      )}
                      {msg.status === "missed" && (
                        <Text
                          style={{
                            color: "#FBBF24",
                            fontFamily: "Poppins-Medium",
                            fontSize: 12,
                            marginLeft: 3,
                          }}
                        >
                          Missed
                        </Text>
                      )}
                    </View>

                    {!isInactiveStatus && (
                      <Pressable
                        disabled={!canJoin}
                        onPress={() => Linking.openURL(msg.meetingLink)}
                        style={{
                          backgroundColor: canJoin ? "#2563EB" : "#A5AAB6",
                          borderRadius: 10,
                          paddingVertical: 9,
                          alignItems: "center",
                          marginTop: 8,
                          opacity: canJoin ? 1 : 0.65,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontFamily: "Poppins-Medium",
                            fontSize: 14,
                          }}
                        >
                          {canJoin
                            ? "Join Meeting"
                            : "Join Meeting (Locked)"}
                        </Text>
                      </Pressable>
                    )}

                    {!isInactiveStatus && (
                      <Pressable
                        disabled={!canJoin}
                        onPress={() =>
                          copyToClipboard(msg.meetingLink, msg._id)
                        }
                        style={{
                          marginTop: 8,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: "#2563EB",
                          backgroundColor: canJoin ? "#E0F2FE" : "#C0CAD8",
                          shadowColor: "#2563EB",
                          shadowOpacity: canJoin ? 0.2 : 0,
                          shadowOffset: { width: 0, height: 1 },
                          shadowRadius: 4,
                          elevation: canJoin ? 4 : 0,
                          opacity: canJoin ? 1 : 0.5,
                        }}
                      >
                        {copySuccessId === msg._id && canJoin ? (
                          <Check
                            width={20}
                            height={20}
                            color="#10B981"
                            style={{ marginRight: 8 }}
                          />
                        ) : (
                          <Copy
                            width={20}
                            height={20}
                            color={canJoin ? "#2563EB" : "#A0AEC0"}
                            style={{ marginRight: 8 }}
                          />
                        )}

                        <View style={{ flex: 1, maxWidth: "80%" }}>
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={{
                              fontSize: 14,
                              color: canJoin ? "#2563EB" : "#A0AEC0",
                              fontWeight: "600",
                            }}
                          >
                            {msg.meetingLink}
                          </Text>
                        </View>
                      </Pressable>
                    )}

                    {!canJoin && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#A5AAB6",
                          textAlign: "center",
                          marginTop: 7,
                          fontFamily: "Poppins-Regular",
                        }}
                      >
                        You can join only during the scheduled meeting time.
                      </Text>
                    )}

                    <Text
                      style={{
                        textAlign: "center",
                        color: "#6c757d",
                        fontSize: 11,
                        marginTop: 7,
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Text>
                  </Pressable>
                );
              }

              return (
                <View
                  style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    backgroundColor: isMe ? "#2563EB" : "#E5E7EB",
                    borderRadius: 16,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    marginBottom: 8,
                    maxWidth: "75%",
                  }}
                >
                  <Text
                    style={{
                      color: isMe ? "white" : "#37424F",
                      fontFamily: "Poppins-Regular",
                      fontSize: 14,
                    }}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: isMe ? "#BFDBFE" : "#6B7280",
                      marginTop: 4,
                      alignSelf: "flex-end",
                    }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
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

          <View
            style={{
              borderTopWidth: 1,
              borderColor: "#e5e7eb",
              backgroundColor: "white",
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#f3f4f6",
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
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
                  fontFamily: "Poppins-Regular",
                  fontSize: 15,
                  color: "#37424F",
                  maxHeight: 100,
                  paddingTop: 6,
                }}
              />
              <Pressable style={{ marginLeft: 8 }}>
                <Smile width={24} height={24} color="#6B7280" />
              </Pressable>
              {message.trim().length > 0 ? (
                <Pressable
                  style={{
                    marginLeft: 8,
                    backgroundColor: "#3b82f6",
                    borderRadius: 999,
                    padding: 8,
                  }}
                  onPress={handleSend}
                >
                  <Send width={20} height={20} color="white" />
                </Pressable>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: 8,
                  }}
                >
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
