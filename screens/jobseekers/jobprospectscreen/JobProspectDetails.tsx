import { Text, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { useAuth } from 'context/auth/AuthHook';
import { createApplication } from 'api/applications';
import { useJobs } from 'context/jobs/JobHook';

dayjs.extend(relativeTime);

export const JobProspectDetails = () => {
    const {userMDB} = useAuth()
    const route = useRoute();
    const navigation = useNavigation();
    const { item } = route.params;
      const { shortlistedJobs, fetchShortlistedJobs } = useJobs();
    

    const job = item.jobDetails;
    const [showFeedback, setShowFeedback] = useState(false);

    const postedAgo = job.createdAt ? dayjs(job.createdAt).fromNow() : "N/A";

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
                        navigation.goBack()
                    })
                    .catch(err => console.log(err))

            } else {
                alert("Please upload resume before applying")
            }
        } else {
            alert("External jobs is currently being implemented")
        }
    }



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
                <Text className="text-3xl font-extrabold text-gray-900 mb-1 font-lexend">
                    {job.jobTitle}
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
                    {job.location.display_name}
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
                                🔹 {item.feedback.match_summary}
                            </Text>
                            <Text className="text-base text-gray-800 leading-6 font-poppins">
                                🛠 {item.feedback.skill_note}
                            </Text>
                            <Text className="text-base text-gray-800 leading-6 font-poppins">
                                📌 {item.feedback.extra_note}
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
                22
            </ScrollView>
        </SafeAreaView>
    );
};
