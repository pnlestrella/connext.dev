import { Header } from 'components/Header';
import { BriefcaseBusiness, PhilippinePeso, MapPin, FileText, Check } from 'lucide-react-native';
import { Text, View, Pressable, Image, FlatList, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useJobs } from 'context/jobs/JobHook';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from 'context/auth/AuthHook';
import { createApplication } from 'api/applications';
import { getFileUrl } from 'api/employers/imagekit';
import { Loading } from 'components/Loading';
import AlertModal from 'components/AlertModal';

dayjs.extend(relativeTime);

export function formatTimeAgo(dateString: any) {
  return dayjs(dateString).fromNow();
}

// External job logos
const Indeed = "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/indeed_logo.png?updatedAt=1756757217985";
const ZipRecruiter = "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/ZipRecruiter-logo-full-color-black.webp?updatedAt=1756757383134";

export const JobProspectScreen = () => {
  const { userMDB } = useAuth();
  const { shortlistedJobs, fetchShortlistedJobs } = useJobs();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'shortlisted' | 'applied'>('shortlisted');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const route = useRoute();
  const { applicationID, activeTabSet, redirect, status } = route.params || {};
  const matchedJobOpenedRef = useRef(false);

  useEffect(() => {
    if (!redirect) return;

    // Reset flag each time fetch is triggered
    matchedJobOpenedRef.current = false;

    setActiveTab(activeTabSet);
    fetchShortlistedJobs();

  }, [redirect]);

  useEffect(() => {
    if (!redirect || !applicationID) return;
    if (!shortlistedJobs || shortlistedJobs.length === 0) return;

    // Check if already opened
    if (matchedJobOpenedRef.current) return;

    const matchedJob = shortlistedJobs.find(
      (job) => job.application?.applicationID === applicationID
    );

    matchedJob.application.status = status

    console.log('------------------------------------',matchedJob,'MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAATCHED')

    if (matchedJob) {
      setSelectedJob(matchedJob);
      setModalVisible(true);
      matchedJobOpenedRef.current = true; // Mark as opened, prevent repeat
    }
  }, [redirect, shortlistedJobs, applicationID]);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState<string>('Alert');
  const [alertMessage, setAlertMessage] = useState<string>('');
  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchShortlistedJobs();
    }, [])
  );

  const displayedJobs = activeTab === 'shortlisted'
    ? shortlistedJobs?.filter(job => !job.application)
    : shortlistedJobs?.filter(job => job.application);

  const handleAppliedClick = (item: any) => {
    setSelectedJob(item);
    setModalVisible(true);
  };

  const handleApply = async (item: any) => {
    const job = item.jobDetails;
    if (!job.isExternal) {
      if (!userMDB.resume) {
        showAlert("Resume Required", "Please upload resume before applying");
        return;
      }

      const application = {
        jobUID: item.jobUID,
        employerUID: job.company.uid,
        seekerUID: userMDB.seekerUID,
        resume: userMDB.resume,
      };

      try {
        await createApplication(application);
        fetchShortlistedJobs();
        showAlert('Application Submitted', 'Successfully sent an application.');
      } catch (err) {
        alert("Failed to apply. Try again.");
      }
    } else {
      showAlert('Notice', 'This feature is coming soon.');
    }
  };

  const totalCount = displayedJobs?.length || 0;
  const activeCount = displayedJobs?.filter(j => j.jobDetails.isActive).length || 0;
  const newCount = displayedJobs?.filter(j => dayjs().diff(dayjs(j.jobDetails.createdAt), "day") <= 7).length || 0;

  const closeModal = () => {
    setSelectedJob(null);
    setModalVisible(false);
  };

  // Visual Status Indicator (stepper style)
  const StatusSteps = ["pending", "viewed", "shortlisted", "contacted", "hired"];
  const StatusColors: Record<string, string> = {
    pending: "#F59E0B",
    viewed: "#3B82F6",
    shortlisted: "#8B5CF6",
    contacted: "#10B981",
    hired: "#22C55E",
  };

  const renderStatusSteps = (currentStatus: string) => {
    if (currentStatus === "closed") return null;

    const currentIndex = StatusSteps.indexOf(currentStatus);
    const totalSteps = StatusSteps.length - 1;
    const currentColor = StatusColors[StatusSteps[currentIndex]];

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 16,
          paddingHorizontal: 12,
        }}
      >
        {/* Full background track */}
        <View
          style={{
            position: "absolute",
            top: 14,
            left: 24,
            right: 24,
            height: 4,
            backgroundColor: "#E5E7EB",
            borderRadius: 2,
            zIndex: 0,
          }}
        />

        {/* Active progress fill */}
        {currentIndex < totalSteps && (
          <View
            style={{
              position: "absolute",
              top: 14,
              left: 24,
              height: 4,
              backgroundColor: currentColor,
              width: `${(currentIndex / totalSteps) * 100}%`,
              borderRadius: 2,
              zIndex: 1,
            }}
          />
        )}

        {/* If last step (e.g., hired), line stops at previous */}
        {currentIndex === totalSteps && (
          <View
            style={{
              position: "absolute",
              top: 14,
              left: 24,
              height: 4,
              backgroundColor: currentColor,
              width: `${((currentIndex - 1) / totalSteps) * 100}%`,
              borderRadius: 2,
              zIndex: 1,
            }}
          />
        )}

        {StatusSteps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const circleColor =
            isCompleted || isActive ? StatusColors[step] : "#FFFFFF";
          const borderColor =
            isCompleted || isActive ? StatusColors[step] : "#9CA3AF";
          const checkVisible = isCompleted || isActive;

          return (
            <View key={step} style={{ flex: 1, alignItems: "center" }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: circleColor,
                  borderWidth: 2,
                  borderColor: borderColor,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 2,
                  shadowColor: isActive ? borderColor : "transparent",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: isActive ? 0.5 : 0,
                  shadowRadius: 4,
                }}
              >
                {checkVisible && <Check size={16} color="white" />}
              </View>
              <Text
                style={{
                  marginTop: 6,
                  fontFamily: "Lexend-Regular",
                  fontSize: 12,
                  color:
                    isCompleted || isActive ? StatusColors[step] : "#9CA3AF",
                  textTransform: "capitalize",
                  maxWidth: 70,
                  textAlign: "center",
                }}
                numberOfLines={1}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView className='bg-white mb-5 h-full'>
      <Header />

      {/* Title */}
      <View className="flex-row justify-between px-6">
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

      {(displayedJobs?.length === 0 || displayedJobs?.length === undefined) ? (
        <View className="flex-1 justify-center items-center mt-10">
          <Text style={{ fontFamily: 'Lexend-Regular', color: '#9CA3AF' }}>
            No jobs to display
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedJobs}
          keyExtractor={(item) => item.jobInteractionID}
          contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 40 }}
          ListHeaderComponent={
            <View className="flex-row justify-around mt-4 mb-4 px-4">
              <View className="bg-gray-100 rounded-xl p-4 flex-1 mx-1 items-center">
                <Text style={{ fontFamily: "Lexend-Bold", fontSize: 14, color: "#6B7280" }}>Total</Text>
                <Text style={{
                  fontFamily: "Poppins-Bold",
                  fontSize: 18,
                  color: activeTab === 'shortlisted' ? "#4F46E5" : "#10B981"
                }}>
                  {totalCount}
                </Text>
              </View>
              <View className="bg-gray-100 rounded-xl p-4 flex-1 mx-1 items-center">
                <Text style={{ fontFamily: "Lexend-Bold", fontSize: 14, color: "#6B7280" }}>Active</Text>
                <Text style={{
                  fontFamily: "Poppins-Bold",
                  fontSize: 18,
                  color: "#111827"
                }}>
                  {activeCount}
                </Text>
              </View>
              <View className="bg-gray-100 rounded-xl p-4 flex-1 mx-1 items-center">
                <Text style={{ fontFamily: "Lexend-Bold", fontSize: 14, color: "#6B7280" }}>New</Text>
                <Text style={{
                  fontFamily: "Poppins-Bold",
                  fontSize: 18,
                  color: "#F59E0B"
                }}>
                  {newCount}
                </Text>
              </View>
            </View>
          }

          renderItem={({ item }) => {
            const job = item.jobDetails;
            const hasApplied = !!item.application;
            const status = hasApplied ? item.application?.status || "pending" : null;

            const StatusColors: Record<string, string> = {
              pending: "#F59E0B",
              viewed: "#3B82F6",
              shortlisted: "#8B5CF6",
              contacted: "#10B981",
              hired: "#22C55E",
              closed: "#9CA3AF",
            };

            const progressColor = status && status !== "closed" ? StatusColors[status] : "#6B7280";
            const progressLabel = status ? status.charAt(0).toUpperCase() + status.slice(1) : null;

            const cardStyle = hasApplied
              ? {
                backgroundColor: "#FFFFFF",
                borderColor: progressColor,
                borderWidth: 2,
                shadowColor: progressColor,
                shadowOpacity: 0.15,
                shadowRadius: 5,
              }
              : { backgroundColor: "#6C63FF" };

            const textColor = hasApplied ? "#111827" : "white";

            const companyName = job.isExternal
              ? job.company.profilePic === "indeed"
                ? "Indeed"
                : job.company.profilePic === "ziprecruiter"
                  ? "ZipRecruiter"
                  : job.company.profilePic || "External Company"
              : job.company.name ?? "Company";

            let profileImage: string | null = null;
            if (job.isExternal) {
              if (job.company.profilePic === "indeed") profileImage = Indeed;
              else if (job.company.profilePic === "ziprecruiter") profileImage = ZipRecruiter;
            } else {
              profileImage = job.company.profilePic || null;
            }

            return (
              <Pressable
                className="rounded-2xl p-4 mb-4 w-full"
                style={cardStyle}
                onPress={() =>
                  hasApplied
                    ? handleAppliedClick(item)
                    : navigation.navigate("jobProspectDetails", { item })
                }
              >
                {/* Top section: Company & progress tag */}
                <View className="flex-row justify-between items-center mb-2">
                  <View className="flex-row items-center">
                    <View
                      className="rounded-full border-2 overflow-hidden mr-2"
                      style={{
                        width: 55,
                        height: 55,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#E5E7EB",
                        borderColor: "#D1D5DB",
                      }}
                    >
                      {profileImage ? (
                        <Image
                          source={{ uri: profileImage }}
                          style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                        />
                      ) : (
                        <Text
                          style={{
                            fontFamily: "Poppins-Bold",
                            fontSize: 18,
                            color: "#37424F",
                          }}
                        >
                          {companyName.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text
                        style={{
                          color: textColor,
                          fontFamily: "Poppins-Regular",
                          fontSize: 14,
                        }}
                        numberOfLines={1}
                      >
                        {companyName}
                      </Text>
                      <Text
                        style={{
                          color: textColor,
                          fontFamily: "Lexend-SemiBold",
                          fontSize: 18,
                          flexShrink: 1,
                          flexWrap: "wrap",
                          maxWidth: 220,
                        }}
                        numberOfLines={2}
                      >
                        {job.jobTitle.replace(/\//g, "/\u200B")}
                      </Text>
                    </View>
                  </View>

                  {hasApplied && (
                    <View
                      style={{
                        backgroundColor: progressColor + "20",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: progressColor,
                      }}
                    >
                      <Text
                        style={{
                          color: progressColor,
                          fontFamily: "Lexend-Bold",
                          fontSize: 12,
                        }}
                      >
                        {`${progressLabel}`}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Job Info */}
                <View className="py-2">
                  <View className="flex-row items-center mb-1">
                    <PhilippinePeso size={20} color={textColor} />
                    <Text
                      style={{
                        color: textColor,
                        fontFamily: "Lexend-SemiBold",
                        marginLeft: 8,
                      }}
                    >
                      {job.salaryRange.currency} {job.salaryRange.min || ""} -{" "}
                      {job.salaryRange.max || ""}/{job.salaryRange.frequency || ""}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-1">
                    <MapPin size={20} color={textColor} />
                    <Text
                      style={{
                        color: textColor,
                        fontFamily: "Lexend-SemiBold",
                        marginLeft: 8,
                      }}
                    >
                      {job.location.display_name || job.location.city || "Location not specified"}
                    </Text>
                  </View>

                  <View className="flex-row items-center mb-1">
                    <BriefcaseBusiness size={20} color={textColor} />
                    <Text
                      style={{
                        color: textColor,
                        fontFamily: "Lexend-SemiBold",
                        marginLeft: 8,
                      }}
                    >
                      {job.employment.join(", ")}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between mt-3">
                    <Text
                      style={{
                        color: textColor,
                        fontSize: 12,
                        fontFamily: "Lexend-Bold",
                      }}
                    >
                      {activeTab === "applied"
                        ? `Applied ${item.application?.appliedAt ? dayjs(item.application.appliedAt).fromNow() : ""}`
                        : `Posted ${formatTimeAgo(job.createdAt)}`}
                    </Text>

                    <Pressable
                      className="px-16 py-2 rounded-xl"
                      style={{
                        backgroundColor: hasApplied ? "#9CA3AF" : "#154588",
                      }}
                      onPress={() =>
                        hasApplied ? handleAppliedClick(item) : handleApply(item)
                      }
                    >
                      <Text
                        style={{
                          color: "white",
                          fontFamily: "Lexend-Bold",
                          fontSize: 12,
                        }}
                      >
                        {hasApplied ? "Applied" : "Apply"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          }}

        />
      )}

      {/* Modal */}
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
                <View style={{ borderBottomWidth: 1, borderBottomColor: '#E5E7EB', marginBottom: 15, paddingBottom: 8 }}>
                  <Text style={{ fontFamily: "Poppins-Bold", fontSize: 20, color: "#6C63FF" }}>
                    {selectedJob.jobDetails.jobTitle}
                  </Text>
                  <Text style={{ fontFamily: "Lexend-SemiBold", fontSize: 16, color: '#37424F' }}>
                    {selectedJob.jobDetails.isExternal
                      ? (selectedJob.jobDetails.profilePic === "indeed"
                        ? "Indeed"
                        : selectedJob.jobDetails.profilePic === "ziprecruiter"
                          ? "ZipRecruiter"
                          : selectedJob.jobDetails.profilePic || "External Company")
                      : (selectedJob.jobDetails.company.name ?? "Company")}
                  </Text>
                </View>

                <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 14, color: '#111827' }}>
                  <Text style={{ fontFamily: 'Lexend-Bold' }}>Applied On: </Text>
                  {dayjs(selectedJob.application.appliedAt).format('MMMM D, YYYY')}
                </Text>

                {/* Visual Status Indicator */}
                <View style={{ marginTop: 15, marginBottom: 15 }}>
                  <Text style={{ fontFamily: 'Lexend-Bold', color: '#37424F', marginBottom: 5 }}>
                    Application Progress
                  </Text>
                  {renderStatusSteps(selectedJob.application.status)}
                </View>

                {/* Job Details */}
                <View style={{ marginBottom: 15 }}>
                  <Text style={{ fontFamily: 'Lexend-Bold', fontSize: 16, color: '#6C63FF', marginBottom: 8 }}>
                    Job Details
                  </Text>
                  <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 14, marginBottom: 4 }}>
                    <Text style={{ fontFamily: 'Lexend-Bold' }}>Location:</Text> {selectedJob.jobDetails.location.city || selectedJob.jobDetails.location.display_name}, {selectedJob.jobDetails.location.province || ''}
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
                    justifyContent: 'center',
                  }}
                  onPress={async () => {
                    try {
                      setLoading(true);
                      const filePaths = [selectedJob.application.resume];
                      const res = await getFileUrl(filePaths);
                      const resumeUrl = res.files[0].signedUrl;
                      navigation.navigate('resumeViewerProspect' as never, { resumeUrl } as never);
                    } catch {
                      alert('Could not open resume');
                      setLoading(false);
                    }
                    setLoading(false);
                  }}
                >
                  <FileText size={20} color="white" />
                  <Text style={{ color: 'white', fontFamily: 'Lexend-Bold', marginLeft: 8 }}>View Resume</Text>
                </Pressable>

                <Pressable
                  style={{
                    marginTop: 15,
                    backgroundColor: '#E5E7EB',
                    padding: 12,
                    borderRadius: 10,
                    alignItems: 'center',
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

      {loading && (
        <View className="z-999 absolute top-0 bottom-0 left-0 right-0 bg-white/50">
          <Loading />
        </View>
      )}

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};
