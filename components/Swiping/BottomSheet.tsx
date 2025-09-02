import { ChevronUp, MapPin } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    View
} from "react-native";

const { height } = Dimensions.get("window");

type Job = {
    boostWeight: number;
    companyName: string;
    employment: string[];
    feedback: {
        match_summary: string;
        skill_note: string;
        extra_note: string,
    };
    isExternal: boolean;
    jobDescription: string;
    jobIndustry: string;
    jobNormalized: string;
    jobSkills: string[];
    jobTitle: string;
    jobUID: string;
    location: {
        city: string;
        postalCode: string;
        state: string;
    };
    profilePic: string;
    salaryRange: {
        currency: string;
        frequency: string;
        max: number;
        min: number;
    };
    score: number;
    status: boolean;
    workTypes: string[];
};

type BStypes = {
    showModal: boolean;
    currentJob: Job;
    isExpanded: boolean;
    setIsExpanded: (value: boolean) => void;
};

export default function BottomSheet({
    showModal,
    currentJob,
    isExpanded,
    setIsExpanded,
}: BStypes) {

    const translateY = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        if (showModal) {
            Animated.spring(translateY, {
                toValue: 0,
                damping: 20,
                stiffness: 160,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateY, {
                toValue: height,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [showModal]);

    return (
        <Animated.View
            style={[
                styles.sheet,
                {
                    transform: [{ translateY }],
                    height: isExpanded ? 550 : 400,
                },
            ]}
        >
            <TouchableOpacity
                className="w-full items-center"
                onPress={() => setIsExpanded(!isExpanded)}
            >
                <ChevronUp />
            </TouchableOpacity>

            <ScrollView>
                {isExpanded && (
                    <>
                        <View className="flex justify-center items-center">
                            <Text className="text-black mt-4" style={{ fontFamily: "Lexend-Bold", fontSize: 20 }} >{currentJob.jobTitle}</Text>
                            {!currentJob.isExternal ? (
                                <>
                                    <Text style={{ fontFamily: "Lexend-Regular", fontSize: 12 }}>Posted By: <Text >{currentJob.companyName}</Text></Text>

                                </>
                            ) : (
                                <>
                                    <Text style={{ fontFamily: "Lexend-Regular", fontSize: 12 }} >External Job From: <Text>{currentJob.profilePic}</Text></Text>

                                </>
                            )}
                        </View>
                        <Text className="text-brand-purpleMain mt-4" style={{ fontFamily: "Lexend-SemiBold", fontSize: 16 }} >Job Details </Text>
                        <Text className="text-brand-purpleMain " style={{ fontFamily: "Lexend-SemiBold", fontSize: 15 }} >Pay: <Text className="text-black" style={{ fontFamily: "Lexend-Regular", fontSize: 14 }} > {currentJob.salaryRange.currency} {currentJob.salaryRange.min} - {currentJob.salaryRange.max}/{currentJob.salaryRange.frequency}</Text></Text>

                        {/* Job Types  */}
                        <View className="my-1" style={{ display: "flex", alignItems: 'center', flexDirection: 'row' }}>
                            <Text className="text-brand-purpleMain" style={{ fontFamily: "Lexend-SemiBold", fontSize: 15 }} >Job Type:  </Text>

                            {currentJob.employment.map((v, i) => (
                                <View key={i} >
                                    <Text className="mx-1 p-1 rounded-lg" style={{ fontFamily: "Lexend-Regular", fontSize: 12, backgroundColor: '#c7c3c3', color: '#2e2d2d' }} >{v} </Text>
                                </View>

                            ))}

                            {/* Skills REquired */}
                        </View>
                        <Text className="text-brand-purpleMain" style={{ fontFamily: "Lexend-SemiBold", fontSize: 14 }} >Skills Required:  </Text>

                        <View className="my-1" style={{ display: "flex", alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' }}>

                            {currentJob.jobSkills.map((v, i) => (
                                <View key={i} >
                                    <Text className="m-1 p-1 rounded-lg" style={{ fontFamily: "Lexend-Regular", fontSize: 12, backgroundColor: '#c7c3c3', color: '#2e2d2d' }} >{v} </Text>
                                </View>

                            ))}
                        </View>

                        {/* Work types */}
                        <Text className="text-brand-purpleMain" style={{ fontFamily: "Lexend-SemiBold", fontSize: 14 }} >Work Types:  </Text>

                        <View className="my-1" style={{ display: "flex", alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' }}>

                            {currentJob.workTypes.map((v, i) => (
                                <View key={i} >
                                    <Text className="m-1 p-1 rounded-lg" style={{ fontFamily: "Lexend-Regular", fontSize: 12, backgroundColor: '#c7c3c3', color: '#2e2d2d' }} >{v} </Text>
                                </View>

                            ))}
                        </View>
                        <View style={{ height: 1, backgroundColor: 'lightgray', marginVertical: 10 }}></View>


                        {/* Location */}
                        <View className="flex-row items-center">
                            <MapPin size={20} color={"#6C63FF"} />
                            <Text className="text-brand-purpleMain my-2" style={{ fontFamily: "Lexend-SemiBold", fontSize: 16 }} > Location: <Text className="text-black">{currentJob.location.city}</Text> </Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: 'lightgray', marginVertical: 10 }}></View>

                        <Text className="text-brand-purpleMain mt-4" style={{ fontFamily: "Lexend-SemiBold", fontSize: 16 }} >Full job description</Text>
                        <Text style={{ fontFamily: "Lexend-SemiBold", fontSize: 14, color: "#5e5c5c" }}>{currentJob.jobDescription}</Text>
                        <View style={{ height: 1, backgroundColor: 'lightgray', marginVertical: 10 }}></View>

                    </>
                )}
                <Text className="text-brand-purpleMain mt-4" style={{ fontFamily: "Lexend-SemiBold", fontSize: 16 }} >Feedback</Text>
                <Text
                    style={{
                        fontFamily: "Lexend-Regular",
                        fontSize: 10,
                        marginTop: 4,
                        color: "gray"
                    }}
                >
                    ⚠️ This is AI-generated feedback and may not be 100% accurate.
                </Text>

                <View className="space-y-4">
                    <View className="bg-green-50 rounded-2xl p-4 shadow-sm m-1">
                        <Text className="text-green-900 font-lexend font-bold text-base mb-1">
                            Match Summary
                        </Text>
                        <Text className="text-gray-700 font-lexend leading-relaxed">
                            {currentJob.feedback.match_summary}
                        </Text>
                    </View>
                    <View className="bg-violet-50 rounded-2xl p-4 shadow-sm m-1">
                        <Text className="text-violet-900 font-lexend font-bold text-base mb-1">
                            Skill Notes
                        </Text>
                        <Text className="text-gray-700 font-lexend leading-relaxed">
                            {currentJob.feedback.skill_note}
                        </Text>
                    </View>
                    <View className="bg-blue-50 rounded-2xl p-4 shadow-sm m-1">
                        <Text className="text-blue  -900 font-lexend font-bold text-base mb-1">
                            Extra Notes
                        </Text>
                        <Text className="text-gray-700 font-lexend leading-relaxed">
                            {currentJob.feedback.extra_note}
                        </Text>
                    </View>
                </View>


            </ScrollView>


        </Animated.View>
    );
}

const styles = StyleSheet.create({
    sheet: {
        position: "absolute",
        bottom: -50,
        left: 0,
        right: 0,
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: -3 },
        shadowRadius: 6,
        elevation: 5,
        zIndex: 999,
    },
    text: {
        fontSize: 16,
        marginBottom: 8,
    },
});
