import { Header } from 'components/Header';
import { BriefcaseBusiness, PhilippinePeso, MapPin, FileText } from 'lucide-react-native';
import { Text, View, TouchableOpacity, Image, FlatList, Pressable, Modal, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useJobs } from 'context/jobs/JobHook';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useAuth } from 'context/auth/AuthHook';
import { createApplication } from 'api/applications';

dayjs.extend(relativeTime);

export function formatTimeAgo(dateString: any) {
  return dayjs(dateString).fromNow();
}

// Profile pics
const Indeed = "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/indeed_logo.png?updatedAt=1756757217985";
const ZipRecruiter = "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/ZipRecruiter-logo-full-color-black.webp?updatedAt=1756757383134";
export const JobProspectScreen = () => {
  const { userMDB } = useAuth()

  const { shortlistedJobs, fetchShortlistedJobs } = useJobs();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'shortlisted' | 'applied'>('shortlisted');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      fetchShortlistedJobs();
    }, [])
  );

  const displayedJobs = activeTab === 'shortlisted'
    ? shortlistedJobs.filter(job => !job.application)
    : shortlistedJobs.filter(job => job.application);

  const handleAppliedClick = (item: any) => {
    setSelectedJob(item);
    setModalVisible(true);
  }

  const handleApply = (item: any) => {
    const job = item.jobDetails
    if (!job.isExternal) {
      //check if the user has resume already
      console.log(userMDB.resume)
      if (userMDB.resume) {
        const application = {
          jobUID: item.jobUID,
          employerUID: job.employerUID,
          seekerUID: userMDB.seekerUID,
          resume: userMDB.resume
        }
        createApplication(application)
          .then((res) => {
                  fetchShortlistedJobs();
            console.log(res)
            alert("Successfully sent an application")
          })
          .catch(err => console.log(err))

      } else {
        alert("Please upload resume before applying")
      }
    } else {
      alert("External jobs is currently being implemented")
    }
  }

  const closeModal = () => {
    setSelectedJob(null);
    setModalVisible(false);
  }

  return (
    <SafeAreaView className='bg-white mb-5 h-full'>
      <Header />

      {/* Title */}
      <View className="flex-row justify-between px-6 ">
        <Text style={{ fontFamily: "Poppins-Bold", fontSize: 24, color: "#37424F" }}>
          Job Prospects
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-around mt-4 mb-4 border-b border-gray-300">
        <Pressable
          onPress={() => setActiveTab('shortlisted')}
          className={`px-4 py-2 ${activeTab === 'shortlisted' ? 'border-b-2 border-indigo-600' : ''}`}
        >
          <Text className={`${activeTab === 'shortlisted' ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
            Shortlisted
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('applied')}
          className={`px-4 py-2 ${activeTab === 'applied' ? 'border-b-2 border-indigo-600' : ''}`}
        >
          <Text className={`${activeTab === 'applied' ? 'text-indigo-600 font-bold' : 'text-gray-500'}`}>
            Applied
          </Text>
        </Pressable>
      </View>

      {/* Job List */}
      <FlatList
        data={displayedJobs}
        keyExtractor={(item) => item.jobInteractionID}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 40 }}
        renderItem={({ item }) => {
          const job = item.jobDetails;
          const hasApplied = !!item.application;

          const cardStyle = hasApplied
            ? { backgroundColor: "#F3F4F6", borderColor: "#9CA3AF", borderWidth: 1 }
            : { backgroundColor: "#6C63FF" };

          const textColor = hasApplied ? "black" : "white";

          return (
            <Pressable
              className="rounded-2xl p-4 mb-4 w-full"
              style={cardStyle}
              onPress={() => hasApplied ? handleAppliedClick(item) : navigation.navigate("jobProspectDetails", { item })}
            >
              {/* Logo + Company */}
              <View className="flex-row items-center space-x-3 mb-3">
                <View
                  className="rounded-full border-2 border-white overflow-hidden mr-2"
                  style={{ width: 60, height: 60, justifyContent: "center", alignItems: "center" }}
                >
                  <Image
                    source={{
                      uri:
                        job.profilePic === "indeed"
                          ? Indeed
                          : job.profilePic === "ziprecruiter"
                            ? ZipRecruiter
                            : job.profilePic,
                    }}
                    style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                  />
                </View>

                <View>
                  <Text style={{ color: textColor, fontFamily: "Poppins-Bold", fontSize: 18 }}>
                    {job.companyName ?? "Company"}
                  </Text>
                  <Text style={{ color: textColor, fontFamily: "Lexend-SemiBold" }}>
                    {job.jobTitle}
                  </Text>
                </View>
              </View>

              {/* Job Info */}
              <View className="py-2">
                <View className="flex-row items-center mb-1">
                  <BriefcaseBusiness size={20} color={textColor} />
                  <Text style={{ color: textColor, fontFamily: "Lexend-SemiBold", marginLeft: 8 }}>
                    {job.jobTitle}
                  </Text>
                </View>

                <View className="flex-row items-center mb-1">
                  <PhilippinePeso size={20} color={textColor} />
                  <Text style={{ color: textColor, fontFamily: "Lexend-SemiBold", marginLeft: 8 }}>
                    {job.salaryRange.currency} {job.salaryRange.min || ''} - {job.salaryRange.max || ''}/{job.salaryRange.frequency || ''}
                  </Text>
                </View>

                <View className="flex-row items-center mb-1">
                  <MapPin size={20} color={textColor} />
                  <Text style={{ color: textColor, fontFamily: "Lexend-SemiBold", marginLeft: 8 }}>
                    {job.location.city}, {job.location.province}, {job.location.postalCode}
                  </Text>
                </View>

                {/* Apply / Applied Button */}
                <View className="flex-row items-center justify-between mt-3">
                  <Text style={{ color: textColor, fontSize: 12, fontFamily: "Lexend-Bold" }}>
                    Posted {formatTimeAgo(job.createdAt)}
                  </Text>
                  <Pressable
                    className="px-16 py-2 rounded-xl"
                    style={{
                      backgroundColor: hasApplied ? "#9CA3AF" : "#154588",
                    }}
                    onPress={() => hasApplied ? handleAppliedClick(item) : handleApply(item)}
                  >
                    <Text style={{ color: "white", fontFamily: "Lexend-Bold", fontSize: 12 }}>
                      {hasApplied ? "Applied" : "Apply"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Modal for Applied Jobs */}
      {selectedJob && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ width: '90%', backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
              <ScrollView>
                {/* Header */}
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 15, paddingBottom: 8 }}>
                  <Text style={{ fontFamily: "Poppins-Bold", fontSize: 20, color: "#6C63FF" }}>
                    {selectedJob.jobDetails.jobTitle}
                  </Text>
                  <Text style={{ fontFamily: "Lexend-SemiBold", fontSize: 16, color: '#37424F' }}>
                    {selectedJob.jobDetails.companyName}
                  </Text>
                </View>

                {/* Application Info */}
                <View style={{ marginBottom: 15 }}>
                  <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 14, color: '#111827', marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Lexend-Bold' }}>Applied On:</Text> {dayjs(selectedJob.application.appliedAt).format('MMMM D, YYYY')}
                  </Text>
                  <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 14, color: '#111827', marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Lexend-Bold' }}>Application Status: </Text>
                    <Text style={{ color: selectedJob.application.status === 'pending' ? "orange" : selectedJob.application.status === "viewed" ? "green" : "blue" }}>{selectedJob.application.status}
                    </Text>
                  </Text>
                </View>

                {/* Job Details */}
                <View style={{ marginBottom: 15 }}>
                  <Text style={{ fontFamily: 'Lexend-Bold', fontSize: 16, color: '#6C63FF', marginBottom: 8 }}>
                    Job Details
                  </Text>
                  <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 14, marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Lexend-Bold' }}>Location:</Text> {selectedJob.jobDetails.location.city}, {selectedJob.jobDetails.location.province}
                  </Text>
                  <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 14, marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Lexend-Bold' }}>Salary:</Text> {selectedJob.jobDetails.salaryRange.currency} {selectedJob.jobDetails.salaryRange.min || ''} - {selectedJob.jobDetails.salaryRange.max || ''}/{selectedJob.jobDetails.salaryRange.frequency || ''}
                  </Text>
                  <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 14, marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Lexend-Bold' }}>Employment Type:</Text> {selectedJob.jobDetails.employment.join(', ')}
                  </Text>
                  <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 14, marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Lexend-Bold' }}>Work Type:</Text> {selectedJob.jobDetails.workTypes.join(', ')}
                  </Text>
                </View>

                {/* Resume */}
                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#6C63FF',
                    padding: 12,
                    borderRadius: 10,
                    justifyContent: 'center'
                  }}
                  onPress={() => Linking.openURL(selectedJob.application.resume)}
                >
                  <FileText size={20} color="white" />
                  <Text style={{ color: 'white', fontFamily: 'Lexend-Bold', marginLeft: 8 }}>View Resume</Text>
                </Pressable>

                {/* Close */}
                <Pressable
                  style={{
                    marginTop: 15,
                    backgroundColor: '#E5E7EB',
                    padding: 12,
                    borderRadius: 10,
                    alignItems: 'center'
                  }}
                  onPress={closeModal}
                >
                  <Text style={{ fontFamily: 'Lexend-Bold', color: '#37424F' }}>Close</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

    </SafeAreaView>
  );
};
