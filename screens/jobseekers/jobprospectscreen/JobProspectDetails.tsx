import { Text, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Check } from 'lucide-react-native';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { useAuth } from 'context/auth/AuthHook';
import { createApplication } from 'api/applications';
import { useJobs } from 'context/jobs/JobHook';
import AlertModal from 'components/AlertModal';
import * as WebBrowser from 'expo-web-browser';

dayjs.extend(relativeTime);

export const JobProspectDetails = () => {
    const { userMDB } = useAuth()
    const route = useRoute();
    const navigation = useNavigation();
    const { item } = route.params as { item?: any };
    const { shortlistedJobs, fetchShortlistedJobs } = useJobs();

    console.log("Jobprdetai;ls", item)
    console.log("Jobprdetai;ls", item.salaryRange)

    // Early guard for missing route data
    if (!item || !item.jobDetails) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-4">
                <Text className="text-base text-gray-700 text-center font-poppins mb-6">
                    Job details are not available.
                </Text>
                <Pressable
                    onPress={() => navigation.goBack()}
                    className="bg-gray-800 px-6 py-3 rounded-2xl"
                >
                    <Text className="text-white font-semibold text-base font-lexend">Go Back</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    // For Alerts
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState<string>('Alert');
    const [alertMessage, setAlertMessage] = useState<string>('');
    const showAlert = (title: string, message: string) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const job = item.jobDetails;
    const [showFeedback, setShowFeedback] = useState(false);

    const postedAgo = job.createdAt ? dayjs(job.createdAt).fromNow() : "N/A";

    const handleApply = async (item: any) => {
        const job = item?.jobDetails;

        if (!job) {
            showAlert('Missing data', 'Job details are not available yet.');
            return;
        }

        // Basic required fields for any kind of apply
        if (!userMDB?.seekerUID) {
            showAlert('Profile Incomplete', 'Please complete your seeker profile first.');
            return;
        }

        if (!job.jobUID && !item.jobUID) {
            showAlert('Invalid job', 'This job cannot be applied to right now.');
            return;
        }

        if (!job.isExternal) {
            // Internal job validation
            if (!userMDB?.resume) {
                showAlert('Resume Required', 'Please upload your resume before applying.');
                return;
            }

            const application = {
                jobUID: item.jobUID ?? job.jobUID,
                employerUID: job.employerUID,
                seekerUID: userMDB.seekerUID,
                resume: userMDB.resume,
            };

            try {
                await createApplication(application);
                fetchShortlistedJobs();
                showAlert('Application Submitted', 'Successfully sent an application.');
                navigation.goBack();
            } catch (err) {
                console.error(err);
                showAlert('Error', 'Failed to apply. Please try again.');
            }
        } else {
            // External job validation
            const url = job.link;

            if (!url || typeof url !== 'string' || url.trim() === '') {
                showAlert('Invalid link', 'No valid link is available for this job yet.');
                return;
            }

            try {
                await WebBrowser.openBrowserAsync(url, {
                    showTitle: true,
                });
            } catch (e) {
                console.error('WebBrowser error:', e);
                showAlert('Error', 'Something went wrong opening the job page.');
            }
        }
    }

    const StatusSteps = ["pending", "viewed", "shortlisted", "contacted", "hired"];
    const renderStatusSteps = (currentStatus: string) => {
        if (currentStatus === "closed") return null;

        const currentIndex = StatusSteps.indexOf(currentStatus);
        const totalSteps = StatusSteps.length - 1;

        return (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16, paddingHorizontal: 12 }}>
                {/* Progress bar */}
                <View style={{ position: "absolute", top: 14, left: 24, right: 24, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, zIndex: 0 }} />
                {currentIndex > 0 && (
                    <View style={{ position: "absolute", top: 14, left: 24, height: 4, backgroundColor: "#37424F", width: `${(currentIndex / totalSteps) * 100}%`, borderRadius: 2, zIndex: 1 }} />
                )}

                {/* Circles */}
                {StatusSteps.map((step, index) => {
                    const isCompleted = index <= currentIndex;
                    const circleColor = isCompleted ? "#37424F" : "#FFFFFF";
                    const borderColor = "#9CA3AF";

                    return (
                        <View key={step} style={{ flex: 1, alignItems: "center" }}>
                            <View style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor: circleColor,
                                borderWidth: 2,
                                borderColor,
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 2,
                            }}>
                                {isCompleted && <Check size={16} color="white" />}
                            </View>
                            <Text style={{ marginTop: 6, fontSize: 12, color: "#9CA3AF", textTransform: "capitalize", maxWidth: 70, textAlign: "center" }} numberOfLines={1}>
                                {step}
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
                <Pressable onPress={() => navigation.goBack()} className="mr-3">
                    <ArrowLeft size={26} color="#37424F" />
                </Pressable>
                <Text className="text-xl font-bold text-gray-800 font-lexend">Job Details</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Title & Company */}
                <Text className="text-3xl font-extrabold text-gray-800 mb-1 font-lexend">
                    {job.jobTitle || 'Job Title Not Available'}
                </Text>
                <Text className="text-xl text-gray-700 mb-4 font-semibold font-poppins">
                    {job.companyName ?? (job.isExternal ? (job.profilePic === "ziprecruiter" ? "ZipRecruiter" : "Indeed") : "Internal Posting")}
                </Text>

                {job.isExternal ? (
                    <Text className="text-sm text-indigo-600 font-semibold mb-4 font-poppins">
                        External Job via {job.profilePic === "ziprecruiter" ? "ZipRecruiter" : "Indeed"}
                    </Text>
                ) : (
                    <Text className="text-sm text-green-600 font-semibold mb-4 font-poppins">
                        Posted internally on our platform
                    </Text>
                )}

                {/* Salary */}
                {job.salaryRange?.min && (
                    <Text className="text-lg font-semibold text-gray-800 mb-3 font-poppins">
                        {job.salaryRange.currency} {job.salaryRange.min} – {job.salaryRange.max}/{job.salaryRange.frequency}
                    </Text>
                )}

                {/* Location */}
                <Text className="text-base text-gray-700 mb-4 font-poppins leading-6">
                    {job.location?.display_name || 'Location not specified'}
                </Text>

                {/* Industry */}
                {job.jobIndustry && (
                    <Text className="text-sm text-gray-500 italic mb-4 font-poppins">{job.jobIndustry}</Text>
                )}

                {/* Tags */}
                <View className="flex-row flex-wrap mb-4">
                    {job.employment?.map((type: string, idx: number) => (
                        <View key={idx} className="bg-indigo-100 px-3 py-1 rounded-full mr-2 mb-2">
                            <Text className="text-indigo-700 text-xs font-semibold font-poppins">{type}</Text>
                        </View>
                    ))}
                    {job.workTypes?.map((type: string, idx: number) => (
                        <View key={idx} className="bg-green-100 px-3 py-1 rounded-full mr-2 mb-2">
                            <Text className="text-green-700 text-xs font-semibold font-poppins">{type}</Text>
                        </View>
                    ))}
                </View>


                {!job.isExternal ?
                    <>
                        {!job.isExternal ? (
                            <View style={{ marginTop: 24, marginBottom: 20 }}>
                                <Text style={{ fontFamily: 'Lexend-Bold', color: '#37424F', marginBottom: 12, fontSize: 16 }}>
                                    Application Process
                                </Text>
                                {renderStatusSteps("")}
                            </View>
                        ) : null}

                    </>

                    : null
                }

                {/* Skills */}
                {job.jobSkills && job.jobSkills.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-gray-800 mb-2 font-lexend">Required Skills</Text>
                        <View className="flex-row flex-wrap">
                            {job.jobSkills.map((skill: string, idx: number) => (
                                <View key={idx} className="bg-gray-200 px-3 py-1 rounded-full mr-2 mb-2">
                                    <Text className="text-gray-700 text-sm font-poppins">{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Description */}
                {job.jobDescription && (
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-gray-800 mb-3 font-lexend">Job Description</Text>
                        <Text className="text-base text-gray-600 leading-7 font-poppins">
                            {typeof job.jobDescription === "string"
                                ? job.jobDescription.replace(/[\[\]']/g, "")
                                : JSON.stringify(job.jobDescription)}
                        </Text>
                    </View>
                )}

                {/* Analytics */}
                <Pressable
                    onPress={() => setShowFeedback((prev) => !prev)}
                    className="bg-indigo-50 rounded-2xl p-5 mb-8 shadow-sm"
                >
                    <Text className="text-indigo-700 font-bold text-xl mb-3 font-lexend">
                        Match Score: {(item.score * 100).toFixed(0)}%
                    </Text>
                    {showFeedback ? (
                        <View className="space-y-2">
                            <Text className="text-base text-gray-800 leading-6 font-poppins">
                                🔹 {item.feedback?.match_summary || 'No summary available'}
                            </Text>
                            <Text className="text-base text-gray-800 leading-6 font-poppins">
                                🛠 {item.feedback?.skill_note || 'No skills feedback'}
                            </Text>
                            <Text className="text-base text-gray-800 leading-6 font-poppins">
                                📌 {item.feedback?.extra_note || 'No additional notes'}
                            </Text>
                        </View>
                    ) : (
                        <Text className="text-sm text-gray-500 italic font-poppins">
                            Tap to view feedback & suggestions
                        </Text>
                    )}
                </Pressable>

                {/* Posted Date */}
                <Text className="text-sm text-gray-500 mb-8 font-poppins">Posted {postedAgo}</Text>

                {/* Apply Button */}
                <Pressable
                    onPress={() => handleApply(item)}
                    className="bg-brand-purpleMain rounded-2xl py-4 px-8 items-center mb-12"
                >
                    <Text className="text-white font-bold text-lg font-lexend">Apply Now</Text>
                </Pressable>
            </ScrollView>
            <AlertModal
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={() => setAlertVisible(false)}
            />
        </SafeAreaView>
    );
};
