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
type NavigationType = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreenJS = () => {
  const { userMDB, signOutUser, setLoading, loading, refreshAuth } = useAuth();
  const navigation = useNavigation<NavigationType>();

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

      <ScrollView className='px-2'>
        {/* Profile Title */}
        <View className="flex-row justify-between items-center">
          <Text
            style={{
              fontFamily: 'Poppins-Bold',
              color: '#37424F',
            }} className='text-2xl'
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
        <View>

          {/* Name */}
          <View className="flex-row items-center py-2">
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

          <View className="flex-row items-center py-2">
            <Text
              style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100 }}
            >
              Email
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
              {userMDB?.email}
            </Text>
          </View>

          {/* Industry */}
          <View className="flex-row items-center py-2">
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
          <View className="flex-row items-center py-2">
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
              {userMDB?.location?.address}
            </Text>
          </View>

          {/* Skills */}
          <View className="flex-row items-center py-2">
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
        </View>

        {/* Résumé Section */}
        <View className='py-2'>
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

          <View className="flex-row gap-2">
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
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
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
                  className="flex-row items-center p-4 rounded-2xl bg-gray-50 shadow-sm"
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
                  className="flex-row items-center p-4 rounded-2xl bg-[#1572DB] shadow-sm"
                  onPress={() => setResumeModalVisible(true)}
                >
                  <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                    <LucideImageUp color="#1572DB" />
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Lexend-SemiBold',
                      fontSize: 14,
                      color: 'white',
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
        <View className='py-2'>
          <Text
            style={{
              fontFamily: 'Lexend-SemiBold',
              fontSize: 18,
              marginBottom: 12,
            }} className='color-[#221E5C]'
          >
            Miscellaneous
          </Text>

          <View className="justify-between">
            <View className="flex-row items-center justify-between py-2">
              <Text
                style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 100 }}
              >
                Settings
              </Text>
              <Settings width={20} color={'#747474'} />
            </View>
          </View>

          <View className="justify-between">
            <View className="flex-row items-center justify-between py-2">
              <Text
                style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 200 }}
              >
                Send us feedback
              </Text>
              <SendHorizonal width={20} color={'#1572DB'} />
            </View>
          </View>

          <View className="justify-between">
            <View className="flex-row items-center justify-between py-2">
              <Text
                style={{ fontFamily: 'Lexend-Regular', fontSize: 14, width: 200 }}
              >
                Give us a rating
              </Text>
              <Star width={20} color={'#FFC312'} />
            </View>
          </View>
        </View>

        {/* Exit Section */}
        <View>
          <Text
            style={{
              fontFamily: 'Lexend-SemiBold',
              fontSize: 18,
              color: '#221E5C',
              marginBottom: 12,
            }}
          >
            Exit
          </Text>

          <View className="space-y-2 justify-between">
            <Pressable
              className="flex-row items-center justify-between"
              onPress={async () => {
                try {
                  await AsyncStorage.multiRemove([
                    'userProfile',
                    'unsyncedActions',
                  ]);
                  signOutUser();
                  alert('Signed out successfully');
                  navigation.navigate('login');
                } catch (err) {
                  alert(err);
                }
              }}
            >
              <Text
                style={{ fontFamily: 'Lexend-Bold', fontSize: 14}}
              >
                Logout
              </Text>
              <LogOut width={20} color={'#B80E0E'} />
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

      {loading ? (
        <View className="z-999 absolute top-0 bottom-0 left-0 right-0 bg-white/50">
          <Loading />
        </View>
      ) : null}
    </SafeAreaView>
  );
};
