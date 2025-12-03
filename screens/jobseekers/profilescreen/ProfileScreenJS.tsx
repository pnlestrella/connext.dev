import { useState } from 'react';
import { Text, View, Pressable, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from 'context/auth/AuthHook';
// Header
import { Header } from 'components/Header';
import {
  LucideImageUp,
  Settings,
  SendHorizonal,
  Star,
  LogOut,
  FileUser,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFileUrl, getUploadKeys } from 'api/employers/imagekit';
import { Loading } from 'components/Loading';
import * as DocumentPicker from 'expo-document-picker';
import { updateProfile } from 'api/profile';
import ConfirmationModal from 'components/ConfirmationModal';
import AlertModal from 'components/AlertModal';

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreenJS = () => {
  const { userMDB, signOutUser, refreshAuth } = useAuth();
  const navigation = useNavigation<NavigationType>();
  const [loading, setLoading] = useState(false);

  // For Alerts
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string>('Alert');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Logout modal
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const handleLogoutConfirm = async () => {
    try {
      await AsyncStorage.multiRemove(['userProfile', 'unsyncedActions']);
      await signOutUser();
      setLogoutModalVisible(false);
      navigation.navigate('login');
    } catch (err) {
      showAlert('Logout failed', 'Failed to log out. Try again.');
    }
  };

  // Resume modal and local loading
  const [resumeModalVisible, setResumeModalVisible] = useState(false);
  const [pickedResume, setPickedResume] = useState<any>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  const pickResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setPickedResume(file);
    } catch (err) {
      showAlert('Document error', 'Could not pick a file.');
    }
  };

  const handleSaveResume = async () => {
    if (!pickedResume) {
      showAlert('Missing file', 'Please pick a resume first!');
      return;
    }
    setResumeLoading(true);
    try {
      const data = await getUploadKeys(pickedResume, '/resumes');
      const updated = { resume: data.filePath };

      const res = await updateProfile('jobseekers', userMDB.seekerUID, {
        updates: updated,
      });
      refreshAuth();

      showAlert('Success', 'Successfully uploaded Resume');
    } catch (err) {
      showAlert('Upload failed', 'There was a problem uploading the resume.');
    }
    setResumeLoading(false);
    setResumeModalVisible(false);
  };

  // Profile Summary expand/collapse
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const toggleSummary = () => setSummaryExpanded((p) => !p);

  // Helpers
  const industriesList = Array.isArray(userMDB?.industries) ? userMDB?.industries : [];
  const skillsList = Array.isArray(userMDB?.skills) ? userMDB?.skills : [];
  const industriesText = industriesList.join(', ');

  return (
    <SafeAreaView className="flex-1 bg-white">
      {loading && (
        <View className="z-99999 absolute top-0 bottom-0 left-0 right-0 bg-white/50">
          <Loading />
        </View>
      )}

      <Header />

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Profile Title */}
        <View className="flex-row justify-between items-center">
          <Text
            style={{
              fontFamily: 'Poppins-Bold',
              fontSize: 24,
              color: '#37424F',
            }}
          >
            Your Profile
          </Text>
          <Pressable
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            onPress={() => {
              navigation.navigate('editProfile');
            }}
          >
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 12,
                color: '#007AFF',
              }}
            >
              Edit Profile
            </Text>
          </Pressable>
        </View>

        {/* Profile Info Section */}
        <View className="space-y-2">
          {/* Name */}
          <View className="flex-row items-center">
            <Text
              style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100, color: '#37424F' }}
            >
              Profile
            </Text>
            <Text
              style={{
                fontFamily: 'Lexend-Regular',
                fontSize: 14,
                color: '#747474',
                flex: 1,
                textAlign: 'right',
              }}
              numberOfLines={1}
            >
              {userMDB?.fullName.firstName} {userMDB?.fullName.middleInitial}.
              {' '}{userMDB?.fullName.lastName}
            </Text>
          </View>

          {/* Industry chips */}
          <View className="flex-row items-start">
            <Text
              style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100, color: '#37424F' }}
            >
              Industry
            </Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              {industriesList.length ? (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                    marginHorizontal: -4,
                  }}
                >
                  {industriesList.map((ind: string, i: number) => (
                    <View
                      key={`${ind}-${i}`}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        backgroundColor: '#EEF2FF',
                        borderRadius: 999,
                        marginHorizontal: 4,
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ color: '#3730A3', fontSize: 12 }}>{ind}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text
                  style={{
                    fontFamily: 'Lexend-Regular',
                    fontSize: 14,
                    color: '#747474',
                    textAlign: 'right',
                  }}
                  numberOfLines={1}
                >
                  —
                </Text>
              )}
            </View>
          </View>

          {/* Location */}
          <View className="flex-row items-center">
            <Text
              style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100, color: '#37424F' }}
            >
              Location
            </Text>
            <Text
              style={{
                fontFamily: 'Lexend-Regular',
                fontSize: 14,
                color: '#747474',
                flex: 1,
                textAlign: 'right',
              }}
              numberOfLines={1}
            >
              {userMDB?.location?.display_name || '—'}
            </Text>
          </View>

          {/* Skills chips */}
          <View className="flex-row items-start">
            <Text
              style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100, color: '#37424F' }}
            >
              Skills
            </Text>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              {skillsList.length ? (
                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                    marginHorizontal: -4,
                  }}
                >
                  {skillsList.map((skill: string, i: number) => (
                    <View
                      key={`${skill}-${i}`}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        backgroundColor: '#ECFDF5',
                        borderRadius: 999,
                        marginHorizontal: 4,
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ color: '#065F46', fontSize: 12 }}>{skill}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text
                  style={{
                    fontFamily: 'Lexend-Regular',
                    fontSize: 14,
                    color: '#747474',
                    textAlign: 'right',
                  }}
                >
                  —
                </Text>
              )}
            </View>
          </View>

          {/* Profile Summary Section */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontFamily: 'Lexend-SemiBold',
                fontSize: 18,
                color: '#37424F',
                marginBottom: 12,
              }}
            >
              Profile Summary
            </Text>

            {userMDB?.profileSummary ? (
              <View
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 16,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 14,
                    lineHeight: 22,
                    color: '#37424F',
                  }}
                  numberOfLines={summaryExpanded ? undefined : 5}
                >
                  {userMDB.profileSummary}
                </Text>

                {/* Toggle View More/Less */}
                <Pressable
                  onPress={toggleSummary}
                  style={{ marginTop: 8, alignSelf: 'flex-start' }}
                  android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
                >
                  <Text
                    style={{
                      fontFamily: 'Poppins-SemiBold',
                      fontSize: 13,
                      color: '#1572DB',
                    }}
                  >
                    {summaryExpanded ? 'View Less' : 'View More'}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={{
                  backgroundColor: '#F3F4F6',
                  borderRadius: 16,
                  padding: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                android_ripple={{ color: 'rgba(0,0,0,0.05)' }}
                onPress={() => navigation.navigate('editProfile')}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins-Italic',
                    fontSize: 14,
                    color: '#6B7280',
                  }}
                >
                  No profile summary yet. Tap to add one.
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Résumé Section */}
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              fontFamily: 'Lexend-SemiBold',
              fontSize: 18,
              color: '#37424F',
              marginBottom: 16,
            }}
          >
            Résumé
          </Text>

          <View className="space-y-3">
            {!userMDB?.resume && (
              <>
                <Pressable
                  className="flex-row items-center p-4 rounded-2xl bg-white shadow-sm"
                  onPress={() => setResumeModalVisible(true)}
                >
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                    <LucideImageUp color="#1572DB" />
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Lexend-SemiBold',
                      fontSize: 14,
                      color: '#37424F',
                    }}
                  >
                    Upload Resume
                  </Text>
                </Pressable>

                <Pressable
                  className="flex-row items-center p-4 rounded-2xl bg-[#1572DB] shadow-sm"
                  onPress={() => showAlert('Coming soon', 'Create flow coming soon')}
                >
                  <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                    <LucideImageUp color="white" />
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Lexend-SemiBold',
                      fontSize: 14,
                      color: 'white',
                    }}
                  >
                    Create Resume
                  </Text>
                </Pressable>
              </>
            )}

            {userMDB?.resume && (
              <>
                <Pressable
                  className="flex-row items-center p-4 rounded-2xl bg-white shadow-sm"
                  onPress={async () => {
                    try {
                      setLoading(true);
                      const filePaths = [userMDB.resume];
                      const res = await getFileUrl(filePaths);
                      const resumeUrl = res.files[0].signedUrl;

                      navigation.navigate('resumeViewer' as never, { resumeUrl } as never);
                      setLoading(false);
                    } catch (err) {
                      showAlert('Open failed', 'Could not open resume');
                      setLoading(false);
                    }
                  }}
                >
                  <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <FileUser color="#1572DB" />
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Lexend-SemiBold',
                      fontSize: 14,
                      color: '#1572DB',
                    }}
                  >
                    View Resume
                  </Text>
                </Pressable>

                <Pressable
                  className="flex-row items-center p-4 rounded-2xl bg-white shadow-sm"
                  onPress={() => setResumeModalVisible(true)}
                >
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                    <LucideImageUp color="#1572DB" />
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Lexend-SemiBold',
                      fontSize: 14,
                      color: '#37424F',
                    }}
                  >
                    Upload New Resume
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Miscellaneous Section */}
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              fontFamily: 'Lexend-SemiBold',
              fontSize: 18,
              color: '#37424F',
              marginBottom: 12,
            }}
          >
            Miscellaneous
          </Text>

          <View className="space-y-2 justify-between">
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100, color: '#37424F' }}>
                Settings
              </Text>
              <Settings width={20} color={'#37424F'} />
            </View>
          </View>

          <View className="space-y-2 justify-between">
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 200, color: '#37424F' }}>
                Send us feedback
              </Text>
              <SendHorizonal width={20} color={'#37424F'} />
            </View>
          </View>

          <View className="space-y-2 justify-between">
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 200, color: '#37424F' }}>
                Give us Rating
              </Text>
              <Star width={20} color={'#37424F'} />
            </View>
          </View>
        </View>

        {/* Exit Section */}
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              fontFamily: 'Lexend-SemiBold',
              fontSize: 18,
              color: '#37424F',
              marginBottom: 12,
            }}
          >
            Exit
          </Text>

          <View className="space-y-2 justify-between">
            <Pressable
              className="flex-row items-center justify-between"
              onPress={() => setLogoutModalVisible(true)}
            >
              <Text style={{ fontFamily: 'Lexend-Bold', fontSize: 14, width: 100, color: '#37424F' }}>
                Logout
              </Text>
              <LogOut width={20} color={'#37424F'} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Upload Resume Modal */}
      <Modal
        visible={resumeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResumeModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)', // full dark overlay
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            width: 320,
            padding: 20,
            borderRadius: 16,
            backgroundColor: 'white',
            position: 'relative',
          }}>
            <Text style={{
              fontFamily: 'Lexend-SemiBold',
              fontSize: 16,
              marginBottom: 16,
              textAlign: 'center',
            }}>
              Upload Resume
            </Text>

            <Pressable
              style={{
                backgroundColor: '#F0F0F0',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
              onPress={pickResume}
              disabled={resumeLoading}
            >
              <Text style={{ textAlign: 'center', fontFamily: 'Lexend-Regular' }}>
                {pickedResume ? pickedResume.name : 'Upload Here'}
              </Text>
            </Pressable>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Pressable
                style={{
                  backgroundColor: '#E0E0E0',
                  borderRadius: 8,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
                onPress={() => {
                  setPickedResume(null);
                  setResumeModalVisible(false);
                }}
                disabled={resumeLoading}
              >
                <Text style={{ fontFamily: 'Lexend-Regular' }}>Cancel</Text>
              </Pressable>

              <Pressable
                style={{
                  backgroundColor: '#1572DB',
                  borderRadius: 8,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
                onPress={handleSaveResume}
                disabled={resumeLoading}
              >
                <Text style={{ color: 'white', fontFamily: 'Lexend-SemiBold' }}>Save</Text>
              </Pressable>
            </View>

            {/* Modal loading overlay */}
            {resumeLoading && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 999,
              }}>
                <Loading />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Confirmation modal for logout */}
      <ConfirmationModal
        visible={logoutModalVisible}
        type="logout"
        title="Logout"
        message="Are you sure you want to log out of your account?"
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={handleLogoutConfirm}
      />

      {/* Centralized Alert modal */}
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};
