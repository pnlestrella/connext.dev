import { useNavigation, useRoute } from "@react-navigation/native";
import {
    ArrowLeft,
    MapPin,
    Briefcase,
    GraduationCap,
    FileText,
    Clock,
    Mail
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    View,
    Text,
    Pressable,
    ScrollView,
    Alert,
} from "react-native";
import { useAuth } from "context/auth/AuthHook";
import { createConversation } from "api/chats/conversation";
import { getFileUrl } from "api/employers/imagekit";
import { useEmployers } from "context/employers/EmployerHook";
import { updateApplications } from "api/applications";

export const ApplicantDetail = () => {
    const { resumeCache, setResumeCache } = useEmployers()

    const { userMDB } = useAuth();
    const navigation = useNavigation();
    const route = useRoute();
    const { applicant } = route.params as any;
    const { profile, appliedAt } = applicant;



    console.log("TESTYYY", applicant)

    const handleOpenResume = async () => {
        if (!profile?.resume) {
            Alert.alert("No Resume", "This applicant did not upload a resume.");
            return;
        }

        const filePath = profile.resume;
        const cached = resumeCache[filePath];
        const now = Date.now();

        // ✅ Use cached if valid
        if (cached && cached.expiresAt > now) {
            navigation.navigate("resumeViewer" as never, {
                resumeUrl: cached.url,
            } as never);
            return;
        }

        try {
            // Fetch new signed URL
            const res = await getFileUrl([filePath]);

            if (res?.files?.length > 0) {
                const signedUrl = res.files[0].signedUrl;

                // Save in state
                setResumeCache((prev) => ({
                    ...prev,
                    [filePath]: {
                        url: signedUrl,
                        expiresAt: now + 3600 * 1000, // 1 hour
                    },
                }));

                navigation.navigate("resumeViewer" as never, {
                    resumeUrl: signedUrl,
                } as never);
            } else {
                Alert.alert("Error", "Failed to load resume link.");
            }
        } catch (err) {
            console.log("❌ Error fetching resume:", err);
            Alert.alert("Error", "Something went wrong while loading the resume.");
        }
    };

    const handleContact = async () => {
        try {
            // 1️⃣ Update applicant status
            // const res = await updateApplications(applicant.applicationID, "contacted");
            // if (!res?.success) {
            //     console.log('Failed to update status', res);
            //     return;
            // }
            // console.log('Status updated:', res);

            // 2️⃣ Create conversation
            const conversation = await createConversation(userMDB.employerUID, profile.seekerUID, applicant.applicationID);
            if (!conversation) {
                console.log('Failed to create conversation');
                return;
            }
            console.log('Conversation created:', conversation);

            // 3️⃣ Navigate to Messages stack, passing the new conversation
            navigation.navigate('Message', {
                screen: 'conversation',
                params: {
                    newConversation: conversation,
                },
            });
        } catch (err) {
            console.log('❌ Error handling contact:', err);
        }
    };



    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
                <Pressable onPress={() => navigation.goBack()} className="mr-3">
                    <ArrowLeft size={24} color="black" />
                </Pressable>
                <Text style={{ fontFamily: "Poppins-Bold", fontSize: 20, color: "#37424F" }}>
                    Applicant Detail
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Profile Section */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-md items-center">
                    {/* Avatar */}
                    <View className="bg-indigo-100 w-20 h-20 rounded-full items-center justify-center mb-3">
                        <Text className="text-2xl font-bold text-indigo-700">
                            {profile?.fullName?.firstName?.[0]}
                            {profile?.fullName?.lastName?.[0]}
                        </Text>
                    </View>

                    <Text className="text-xl font-bold text-gray-900">
                        {profile?.fullName?.firstName} {profile?.fullName?.lastName}
                    </Text>

                      <View className="flex-row items-center mt-1">
                        <Mail size={16} color="#6B7280" />
                        <Text className="ml-1 text-gray-600 text-sm">
                            {applicant.profile.email}
                        </Text>
                    </View>

                    <View className="flex-row items-center mt-1">
                        <MapPin size={16} color="#6B7280" />
                        <Text className="ml-1 text-gray-600 text-sm">
                            {profile?.location?.city}, {profile?.location?.province}
                        </Text>
                    </View>

                    <View className="flex-row items-center mt-2">
                        <Clock size={14} color="#9CA3AF" />
                        <Text className="ml-1 text-gray-500 text-xs">
                            Applied {new Date(appliedAt).toLocaleDateString()}
                        </Text>
                    </View>

                </View>

                {/* Profile Summary */}
                {profile?.profileSummary && (
                    <View className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
                        <Text className="font-bold text-gray-800 mb-2">Profile Summary</Text>
                        <Text className="text-gray-700 leading-relaxed text-base">
                            {profile.profileSummary}
                        </Text>
                    </View>
                )}

                {/* Skills */}
                {profile?.skills?.length > 0 && (
                    <View className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
                        <Text className="font-bold text-gray-800 mb-2">Skills</Text>
                        <View className="flex-row flex-wrap">
                            {profile.skills.map((skill, idx) => (
                                <View
                                    key={idx}
                                    className="bg-indigo-50 px-3 py-1 rounded-full mr-2 mb-2"
                                >
                                    <Text className="text-xs text-indigo-700 font-medium">
                                        {skill}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Industries */}
                {profile?.industries?.length > 0 && (
                    <View className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
                        <Text className="font-bold text-gray-800 mb-2">Industries</Text>
                        <View className="flex-row items-center">
                            <Briefcase size={16} color="#6B7280" />
                            <Text className="ml-2 text-gray-700">
                                {profile.industries.join(" · ")}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Education */}
                {profile?.education && (
                    <View className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
                        <Text className="font-bold text-gray-800 mb-2">Education</Text>
                        <View className="flex-row items-center">
                            <GraduationCap size={16} color="#6B7280" />
                            <Text className="ml-2 text-gray-700">
                                {profile.education.highestLevel} - {profile.education.school}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Resume */}
                <View className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm">
                    <Text className="font-bold text-gray-800 mb-2">Resume</Text>
                    <Pressable
                        onPress={handleOpenResume}
                        className="flex-row items-center bg-indigo-600 px-4 py-2 rounded-xl"
                    >
                        <FileText size={18} color="white" />
                        <Text className="ml-2 text-white font-medium">View Resume</Text>
                    </Pressable>
                </View>

                {/* Bottom Actions */}
                <View className="absolute bottom-0 left-0 right-0 flex-row justify-between p-4 bg-white border-t border-gray-200">
                    <Pressable className="flex-1 bg-red-500 py-3 rounded-xl mr-2 items-center">
                        <Text className="text-white font-bold">Remove</Text>
                    </Pressable>
                    <Pressable
                        className="flex-1 bg-indigo-600 py-3 rounded-xl ml-2 items-center"
                        onPress={handleContact}
                    >
                        <Text className="text-white font-bold">Contact</Text>
                    </Pressable>
                </View>
            </ScrollView>


        </SafeAreaView>
    );
};
