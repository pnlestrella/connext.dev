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
type NavigationType = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreenJS = () => {
  const { userMDB, signOutUser, setLoading, loading, refreshAuth } = useAuth();
  const navigation = useNavigation<NavigationType>();

  //for logout
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const handleLogoutConfirm = async () => {
    try {
      await AsyncStorage.multiRemove(['userProfile', 'unsyncedActions']);
      await signOutUser();
      setLogoutModalVisible(false);
      navigation.navigate('login');
    } catch (err) {
      alert('Failed to log out. Try again.');
    }
  };



  // 🔹 modal state
  const [resumeModalVisible, setResumeModalVisible] = useState(false);

  // 🔹 picked file state
  const [pickedResume, setPickedResume] = useState<any>(null);

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
      console.log('Picked file:', file);
    } catch (err) {
      console.log('❌ Error picking document', err);
      alert('Could not pick a file');
    }
  };


  const handleSaveResume = async () => {
    if (!pickedResume) {
      alert('Please pick a resume first!');
      return;
    }
    try {
      const data = await getUploadKeys(pickedResume, "/resumes");
      const updated = { resume: data.filePath }

      const res = await updateProfile("jobseekers", userMDB.seekerUID, {
        updates: updated
      });
      console.log(res, 'ressy')
      refreshAuth()

      alert("Successfully uploaded Resume")
    } catch (err) {
      console.log(err)
    }
    setResumeModalVisible(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
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

        {/* Profile Info */}
        <View className="space-y-2">
          {/* Name */}
          <View className="flex-row items-center">
            <Text
              style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100 }}
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
            >
              {userMDB?.fullName.firstName} {userMDB?.fullName.middleInitial}.{' '}
              {userMDB?.fullName.lastName}
            </Text>
          </View>



          {/* Industry */}
          <View className="flex-row items-center">
            <Text
              style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100 }}
            >
              Industry
            </Text>
            <Text
              style={{
                fontFamily: 'Lexend-Regular',
                fontSize: 14,
                color: '#747474',
                flex: 1,
                textAlign: 'right',
              }}
            >
              {userMDB?.industries}
            </Text>
          </View>

          {/* Location */}
          <View className="flex-row items-center">
            <Text
              style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100 }}
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
            >
              {userMDB?.location.display_name}
            </Text>
          </View>

          {/* Skills */}
          <View className="flex-row items-center">
            <Text
              style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100 }}
            >
              Skills
            </Text>
            <Text
              style={{
                fontFamily: 'Lexend-Regular',
                fontSize: 14,
                color: '#747474',
                flex: 1,
                textAlign: 'right',
              }}
            >
              {userMDB?.skills?.map((skill, i) => (
                <Text key={i}>{skill}, </Text>
              ))}
            </Text>
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
                >
                  {userMDB.profileSummary}
                </Text>
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
                  onPress={() => alert('Create flow coming soon')}
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

                      navigation.navigate(
                        'resumeViewer' as never,
                        { resumeUrl } as never
                      );
                      setLoading(false);
                    } catch (err) {
                      console.log('❌ Error opening resume', err);
                      alert('Could not open resume');
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
              <Text
                style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100 }}
              >
                Settings
              </Text>
              <Settings width={20} color={'#37424F'} />
            </View>
          </View>

          <View className="space-y-2 justify-between">
            <View className="flex-row items-center justify-between">
              <Text
                style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 200 }}
              >
                Send us feedback
              </Text>
              <SendHorizonal width={20} color={'#37424F'} />
            </View>
          </View>

          <View className="space-y-2 justify-between">
            <View className="flex-row items-center justify-between">
              <Text
                style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 200 }}
              >
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
              <Text
                style={{ fontFamily: 'Lexend-Bold', fontSize: 14, width: 100 }}
              >
                Logout
              </Text>
              <LogOut width={20} color={'#37424F'} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* 🔹 Modal for Upload Resume */}
      <Modal
        visible={resumeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResumeModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white w-80 rounded-2xl p-6">
            <Text
              style={{
                fontFamily: 'Lexend-SemiBold',
                fontSize: 16,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Upload Resume
            </Text>

            <Pressable
              className="p-3 rounded-xl bg-gray-100 mb-4"
              onPress={pickResume}
            >
              <Text
                style={{ textAlign: 'center', fontFamily: 'Lexend-Regular' }}
              >
                {pickedResume ? pickedResume.name : 'Upload Here'}
              </Text>
            </Pressable>

            <View className="flex-row justify-between">
              <Pressable
                className="px-4 py-2 rounded-xl bg-gray-200"
                onPress={() => {
                  setPickedResume(null);
                  setResumeModalVisible(false);
                }}
              >
                <Text>Cancel</Text>
              </Pressable>
              <Pressable
                className="px-4 py-2 rounded-xl bg-[#1572DB]"
                onPress={() => handleSaveResume()}
              >
                <Text style={{ color: 'white' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmationModal
        visible={logoutModalVisible}
        type="logout"
        title="Logout"
        message="Are you sure you want to log out of your account?"
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={handleLogoutConfirm}
      />


      {loading ? (
        <View className="z-999 absolute top-0 bottom-0 left-0 right-0 bg-white/50">
          <Loading />
        </View>
      ) : null}
    </SafeAreaView>
  );
};
