import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Pressable,
    ActivityIndicator,
    Image,
    StyleSheet,
    SectionList
} from 'react-native';
import { getNotifications, updateNotification } from 'api/notifications/notifications';
import { useAuth } from 'context/auth/AuthHook';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export function NotificationsScreen() {
    const { userMDB } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'read', 'unread'
    const navigation = useNavigation();

    useEffect(() => {
        fetchNotifications();
    }, [userMDB]);

    const fetchNotifications = async () => {
        if (!userMDB) return;

        setLoading(true);
        setFetchError(null);
        try {
            const results = await getNotifications(
                userMDB.role === 'jobseeker' ? userMDB.seekerUID : userMDB.employerUID,
                userMDB.role
            );
            setNotifications(results || []);
        } catch (error) {
            setFetchError('Could not fetch notifications.');
            console.log('Notifications fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Memoized filtered notifications
    const filteredNotifications = useMemo(() => {
        return notifications.filter(notif => {
            if (filter === 'all') return true;
            if (filter === 'read') return notif.read === true;
            if (filter === 'unread') return notif.read === false;
            return true;
        });
    }, [notifications, filter]);

    // Memoized grouped data
    const groupedData = useMemo(() => {
        const grouped = {};

        filteredNotifications.forEach(notif => {
            const date = new Date(notif.createdAt);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateKey;
            const isToday = date.toDateString() === today.toDateString();
            const isYesterday = date.toDateString() === yesterday.toDateString();

            if (isToday) {
                dateKey = 'Today';
            } else if (isYesterday) {
                dateKey = 'Yesterday';
            } else {
                dateKey = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }); // "Nov 8, 2025"
            }

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(notif);
        });

        const sortOrder = ['Today', 'Yesterday'];
        const otherDates = Object.keys(grouped).filter(key => !sortOrder.includes(key));

        const sortedSections = [
            ...sortOrder.filter(key => grouped[key]),
            ...otherDates.sort((a, b) => new Date(b) - new Date(a))
        ].map(date => ({
            title: date,
            data: grouped[date]
        }));

        return sortedSections;
    }, [filteredNotifications]);

    const filterCounts = useMemo(() => {
        const total = notifications.length;
        const unreadCount = notifications.filter(n => n.read === false).length;
        const readCount = notifications.filter(n => n.read === true).length;
        return { total, unread: unreadCount, read: readCount };
    }, [notifications]);

    async function handleNotifPress(item) {
        console.log(item, 'itemm');
        console.log(item.notificationUID, 'itemm');

        if (item.read === false) {
            const updateData = { read: true };
            const upd = await updateNotification(item.notificationUID, updateData);
            console.log(upd, "Updated Notification Data");

            // Update local state optimistically
            setNotifications(prev =>
                prev.map(n =>
                    n._id === item._id
                        ? { ...n, read: true }
                        : n
                )
            );
        }

        if (item.type === 'message') {
            navigation.navigate('home', {
                screen: 'Message',
                params: {
                    screen: 'conversation',
                    params: {
                        conversationUID: item.data.conversationUID,
                        redirect: Math.random()
                    }
                }
            });
        }
        else if (item.type?.includes('application')) {
            const split = item.type.split('_')[1];

            navigation.navigate('home', {
                screen: 'Job Prospect',
                params: {
                    screen: 'jobProspect',
                    params: {
                        applicationID: item.data.applicationID,
                        activeTabSet: 'applied',
                        redirect: Math.random(),
                        status: split
                    }
                }
            });
        }
    }

    const renderNotification = ({ item }) => (
        <Pressable
            style={[
                styles.notificationRow,
                item.read === false && styles.unreadHighlight
            ]}
            onPress={() => handleNotifPress(item)}
        >
            <Image
                source={item.senderDetails?.profilePic ? { uri: item.senderDetails.profilePic } : require('../assets/icon.png')}
                style={[
                    styles.avatar,
                    item.read === false && styles.unreadAvatar
                ]}
            />
            <View style={styles.notificationContent}>
                <Text style={[
                    styles.notificationText,
                    item.read === false && styles.unreadText
                ]}>
                    {item.title || item.message}
                </Text>
                {item.message && item.title && (
                    <Text style={styles.notificationSub}>{item.message}</Text>
                )}
                <Text style={styles.timestamp}>
                    {new Date(item.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })}
                </Text>
            </View>
            {item.read === false && <View style={styles.dot} />}
        </Pressable>
    );

    const renderSectionHeader = ({ section: { title } }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    const renderFilterTab = useCallback((tabName, label) => {
        const count = tabName === 'all' ? filterCounts.total :
            tabName === 'read' ? filterCounts.read :
                filterCounts.unread;

        return (
            <Pressable
                style={[
                    styles.filterTab,
                    filter === tabName && styles.activeFilterTab
                ]}
                onPress={() => setFilter(tabName)}
            >
                <Text style={[
                    styles.filterTabText,
                    filter === tabName && styles.activeFilterTabText
                ]}>
                    {label} ({count})
                </Text>
            </Pressable>
        );
    }, [filter, filterCounts]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={headerStyles.container}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    style={headerStyles.backButton}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <ArrowLeft size={24} color="black" />
                </Pressable>
                <Text style={headerStyles.title}>Notifications</Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {renderFilterTab('all', 'All')}
                {renderFilterTab('unread', 'Unread')}
                {renderFilterTab('read', 'Read')}
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginVertical: 16 }} color="#2465e2" />
            ) : fetchError ? (
                <Text style={styles.errorText}>{fetchError}</Text>
            ) : (
                <SectionList
                    contentContainerStyle={{ paddingHorizontal: 8, paddingTop: 8, paddingBottom: 20 }}
                    sections={groupedData}
                    renderItem={renderNotification}
                    renderSectionHeader={renderSectionHeader}
                    keyExtractor={(item) => item._id}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {filter === 'all' ? 'No notifications.' :
                                filter === 'unread' ? 'No unread notifications.' :
                                    'No read notifications.'}
                        </Text>
                    }
                    SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
                />
            )}
        </SafeAreaView>
    );
}

const headerStyles = {
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        position: 'relative',
    },
    backButton: {
        marginRight: 16,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Poppins-Bold',
        fontSize: 20,
        color: '#37424F',
        flex: 1,
        textAlign: 'center',
        marginRight: 44,
    },
};

const styles = StyleSheet.create({
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeFilterTab: {
        backgroundColor: '#2465e2',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    activeFilterTabText: {
        color: 'white',
        fontWeight: '600',
    },
    sectionHeader: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#f8f9fa',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2b3651',
        fontFamily: 'Poppins-SemiBold',
    },
    sectionSeparator: {
        height: 8,
        backgroundColor: '#f8f9fa',
    },
    notificationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadHighlight: {
        backgroundColor: '#e3f2fd',
        borderLeftWidth: 4,
        borderLeftColor: '#2465e2',
        shadowColor: '#2465e2',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#f2f2f2',
    },
    unreadAvatar: {
        borderWidth: 2,
        borderColor: '#2465e2',
        backgroundColor: '#fff',
    },
    notificationContent: {
        flex: 1,
        paddingRight: 12,
    },
    notificationText: {
        fontSize: 15,
        color: '#2b3651',
        fontWeight: '600',
        lineHeight: 20,
        marginBottom: 2,
    },
    unreadText: {
        fontWeight: '700',
        color: '#1a237e',
    },
    notificationSub: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginBottom: 2,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
    },
    dot: {
        width: 12,
        height: 12,
        backgroundColor: '#2465e2',
        borderRadius: 6,
        shadowColor: '#2465e2',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 3,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginVertical: 16,
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        color: '#aaa',
        marginVertical: 48,
        fontSize: 16,
        fontWeight: '500',
    },
});
