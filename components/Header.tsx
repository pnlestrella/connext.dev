import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from 'context/auth/AuthHook';
import { getNotifications, updateNotification } from 'api/notifications/notifications';
import { useNavigation } from '@react-navigation/native';
import { useSockets } from 'context/sockets/SocketHook';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DROPDOWN_WIDTH = SCREEN_WIDTH * 0.8;

export const Header = () => {

  const { socket } = useSockets()
  const { userMDB, hasUnread, setHasUnread } = useAuth();
  console.log(hasUnread)
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [visible, setVisible] = useState(false);

  const insets = useSafeAreaInsets();
  const animation = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation();

  //sockets
  useEffect(() => {
    if (!socket) return;

    socket.on("newNotification", (notif) => {
      console.log("New notification received:", notif);
      fetchNotifications();

    });

    return () => {
      socket.off("newNotification");
    };
  }, [socket]);

  //fetch notifications
  const fetchNotifications = async () => {
    if (!userMDB) return;
    setLoading(true);
    setFetchError(null);
    try {
      let results;
      if (userMDB.role === 'jobseeker') {
        results = await getNotifications(userMDB.seekerUID, userMDB.role);
      } else {
        results = await getNotifications(userMDB.employerUID, userMDB.role);
      }

      console.log(results, 'Fetched Notifications');
      setNotifications(results || []);

      // 🔵 Check if there are unread notifications
      const unreadExists = results?.some((n) => !n.read);
      setHasUnread(unreadExists);
    } catch (error) {
      setFetchError('Could not fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);



  // Open dropdown and mark as read
  const openDropdown = () => {
    setVisible(true);
    setHasUnread(false);
    Animated.timing(animation, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  };

  const closeDropdown = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const dropdownStyle = {
    width: DROPDOWN_WIDTH,
    right: 0,
    top: insets.top + 48,
    opacity: animation,
  };

  async function handleNotifPress(item) {
    // alert(`Clicked: ${item.title || item.message}`)
    console.log(item, 'itemm')
    console.log(item.notificationUID, 'itemm')
    if (item.type === 'message') {
      if (userMDB.role === 'jobseeker') {
        //this is for message navigation
        navigation.navigate("Message", {
          screen: "conversation",
          params: {
            conversationUID: item.data.conversationUID,
            redirect: Math.random()
          }
        })

      }
    } else if (item.type?.includes('application')) {
      console.log('----',item,'itemmmmmm')
      const split = item.type.split('_')[1]
      //application navigation
      navigation.navigate("Job Prospect", {
        screen: "jobProspect",
        params: {
          applicationID: item.data.applicationID,
          activeTabSet: 'applied',
          redirect: Math.random(),
          status:split
        }
      })
    }
    const updateData = {
      "read": true
    }
    const upd = await updateNotification(item.notificationUID, updateData);
    console.log(upd, "Updated Notification Data")
    fetchNotifications()
    setVisible(false)
  }

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationRow}
      activeOpacity={0.8}
      onPress={() => handleNotifPress(item)}
    >
      <Image
        source={item.logo ? { uri: item.logo } : require('../assets/icon.png')}
        style={styles.avatar}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>{item.title || item.message}</Text>
        {item.message && item.title && (
          <Text style={styles.notificationSub}>{item.message}</Text>
        )}
      </View>
      {!item.read && <View style={styles.dot} />}
    </TouchableOpacity >
  );

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: insets.top + 6,
          paddingBottom: 6,
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0.5 },
          shadowOpacity: 0.05,
          shadowRadius: 1,
          elevation: 1,
        }}
      >
        <Image
          style={{ width: 36, height: 24, resizeMode: 'contain' }}
          source={require('../assets/images/justLogo.png')}
        />

        {/* 🔔 Bell with unread indicator */}
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            onPress={openDropdown}
            style={{
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bell width={20} height={20} color="#6C63FF" />
          </TouchableOpacity>

          {hasUnread && (
            <View
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#2465e2',
              }}
            />
          )}
        </View>
      </View>

      {visible && (
        <TouchableWithoutFeedback onPress={closeDropdown}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.modal, dropdownStyle]}>
                <Text style={styles.modalTitle}>Notifications</Text>
                {loading ? (
                  <ActivityIndicator
                    style={{ marginVertical: 16 }}
                    color="#2465e2"
                  />
                ) : fetchError ? (
                  <Text
                    style={{
                      color: 'red',
                      textAlign: 'center',
                      marginVertical: 16,
                    }}
                  >
                    {fetchError}
                  </Text>
                ) : (
                  <FlatList
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item._id}
                    ListEmptyComponent={
                      <Text
                        style={{
                          textAlign: 'center',
                          color: '#aaa',
                          marginVertical: 24,
                        }}
                      >
                        No notifications.
                      </Text>
                    }
                  />
                )}

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionButtonPrimary}>
                    <Text style={styles.actionButtonLabelPrimary}>View all</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButtonSecondary}>
                    <Text style={styles.actionButtonLabelSecondary}>
                      Clear all
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.13)',
    zIndex: 99999,
  },
  modal: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 12,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 12,
    color: '#1b4f91',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#f2f2f2',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    color: '#2b3651',
    fontWeight: 'bold',
  },
  notificationSub: {
    fontSize: 13,
    color: '#555',
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: '#2465e2',
    borderRadius: 5,
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  actionButtonPrimary: {
    flex: 1,
    backgroundColor: '#2465e2',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  actionButtonLabelPrimary: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: '#e2e2e2',
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionButtonLabelSecondary: {
    color: '#454545',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
