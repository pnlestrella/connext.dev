import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Edit, RefreshCcw } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { CommonActions } from '@react-navigation/native';

import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";

// Modals
import { IndustryModal } from "components/profileScreen/IndustryModal";
import { AddressModal } from "components/profileScreen/AddressModal";
import { SkillsModal } from "components/profileScreen/SkillsModal";

// Data
import { default as EmploymentTypes } from "../../../data/employmentTypes.json";
import { default as WorkTypes } from "../../../data/workTypes.json";
import { Industries } from "../../../data/industries.json";

import { useAuth } from "context/auth/AuthHook";
import { useEmployers } from "context/employers/EmployerHook";
import { updateJobs } from "api/employers/joblistings";

// Section divider
const SectionDivider = () => (
    <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 20 }} />
);

export const JobDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { job } = route.params as { job: any };
    const { edit } = route.params as { edit: boolean };
    const { setRefresh, refresh } = useEmployers();

    console.log("JOBBBBBBBBBBBBB", job)

    const richText = useRef<RichEditor>(null);

    const [isEditing, setIsEditing] = useState(edit);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const [jobTitle, setJobTitle] = useState(job.jobTitle || "");
    const [jobDescription, setJobDescription] = useState(
        job.jobDescription ? job.jobDescription.replace(/<[^>]+>/g, "") : ""
    );
    const [industry, setIndustry] = useState<string>(job.jobIndustry || "");
    const [location, setLocation] = useState<any>(job.location || {});
    const [jobSkills, setJobSkills] = useState<string[]>(job.jobSkills || []);
    const [employment, setEmployment] = useState<string[]>(job.employment || []);
    const [workTypes, setWorkTypes] = useState<string[]>(job.workTypes || []);

    const [industryModalVisible, setIndustryModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [skillsModalVisible, setSkillsModalVisible] = useState(false);

    const toggleSelection = (
        item: string,
        list: string[],
        setList: (val: string[]) => void
    ) => {
        if (list.includes(item)) setList(list.filter((i) => i !== item));
        else setList([...list, item]);
    };

    const handleSave = async () => {
        // Basic validation rules
        if (!jobTitle.trim()) {
            alert("Job title is required");
            return;
        }

        if (!jobDescription.trim()) {
            alert("Job description is required");
            return;
        }

        if (!industry) {
            alert("Please select an industry");
            return;
        }

        if (employment.length === 0) {
            alert("Select at least one employment type");
            return;
        }

        if (workTypes.length === 0) {
            alert("Select at least one work type");
            return;
        }

        if (!location || !location.city) {
            alert("Please set a location");
            return;
        }

        const updatedJob = {
            jobTitle,
            jobDescription,
            jobSkills,
            jobIndustry: industry,
            employment,
            workTypes,
            location,
        };

        console.log('==========================', job.jobUID)

        try {
            const res = await updateJobs(job.jobUID, updatedJob);
            if (res.success) {
                console.log("✅ Job updated:", res.payload);
                setRefresh(!refresh);
            } else {
                console.error("❌ Failed to update job:", res.error || res);
                alert("Failed to update job. Please try again.");
            }
        } catch (err) {
            console.error("⚠️ Error in handleSave:", err);
            alert("Something went wrong. Please try again later.");
        }

        setIsEditing(false);
    };

    const handleCancel = () => {
        // Open confirmation modal instead of immediately cancelling
        setShowCancelModal(true);
    };

    const confirmCancel = () => {
        setJobTitle(job.jobTitle || "");
        setJobDescription(job.jobDescription || "");
        setJobSkills(job.jobSkills || []);
        setIndustry(job.jobIndustry || "");
        setEmployment(job.employment || []);
        setWorkTypes(job.workTypes || []);
        setLocation(job.location || {});
        setIsEditing(false);
        setShowCancelModal(false);
    };

    const closeCancelModal = () => setShowCancelModal(false);

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-5 py-4 border-b border-gray-200 relative">
                {/* Back button */}
                <TouchableOpacity
                    onPress={() => {
                        if (isEditing) {
                            handleCancel();
                        } else {
                            navigation.dispatch(
                                CommonActions.reset({
                                    index: 0,
                                    routes: [{ name: 'mainHome' }],
                                })
                            );
                        }
                    }}
                >
                    <ArrowLeft size={28} color="#37424F" />
                </TouchableOpacity>


                {/* Title */}
                <Text
                    className="absolute left-0 right-0 text-xl font-bold text-gray-800 text-center"
                >
                    Job Details
                </Text>

                {/* Only show edit icon if not editing */}
                {!isEditing && (
                    <TouchableOpacity onPress={() => setIsEditing(true)} className="ml-auto">
                        <Edit size={24} color="#2563EB" />
                    </TouchableOpacity>
                )}
            </View>


            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150 }}>
                <Text className="text-gray-800 text-sm mb-2">Job Title</Text>
                {isEditing ? (
                    <TextInput
                        value={jobTitle}
                        onChangeText={setJobTitle}
                        editable={true}
                        className="border rounded-xl px-4 py-3 mb-5 bg-gray-50 border-gray-300"
                    />
                ) : (
                    <Text className="text-lg text-gray-900 font-semibold mb-5">
                        {jobTitle}
                    </Text>
                )}


                {/* Job Description */}
                <Text className="text-gray-800 text-sm mb-2">Job Description</Text>
                {isEditing ? (
                    <>
                        <View className="rounded-xl border border-gray-300 overflow-hidden mb-2 w-full bg-gray-50">
                            <RichEditor
                                ref={richText}
                                style={{ minHeight: 180, width: "100%" }}
                                placeholder="Write a clear job description..."
                                initialContentHTML={jobDescription}
                                disabled={false}
                                editorStyle={{
                                    backgroundColor: "#F9FAFB",
                                    color: "#37424F",
                                }}
                                onChange={(text) => setJobDescription(text.slice(0, 2000))}
                            />
                        </View>
                        <RichToolbar
                            editor={richText}
                            actions={["bold", "italic", "underline", "unorderedList", "orderedList"]}
                            iconTint="#6B7280"
                            selectedIconTint="#2563EB"
                            style={{
                                width: "100%",
                                borderColor: "#E5E7EB",
                                borderWidth: 1,
                                borderRadius: 12,
                                marginBottom: 8,
                                backgroundColor: "#F9FAFB",
                            }}
                        />
                    </>
                ) : (
                    <Text className="text-base text-gray-700 mb-5 leading-relaxed">
                        {jobDescription || "No description provided"}
                    </Text>
                )}


                {/* Industry */}
                <SectionDivider />
                <Text className="text-gray-800 text-sm mb-2">Job Industry</Text>
                <View className="flex-row items-center mb-3">
                    <Text className="text-indigo-600 font-medium mr-3">{industry || "No industry set"}</Text>
                    {isEditing && (
                        <TouchableOpacity
                            onPress={() => setIndustryModalVisible(true)}
                            className="flex-row items-center border border-gray-300 px-3 py-2 rounded-lg"
                        >
                            <Text className="ml-1 text-gray-700">Edit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Location */}
                <SectionDivider />
                <Text className="text-gray-800 text-sm mb-2">Location</Text>
                {isEditing && (
                    <TouchableOpacity
                        onPress={() => setAddressModalVisible(true)}
                        className="border border-gray-300 rounded-xl px-4 py-3 mb-2 bg-gray-50"
                    >
                        <Text className="text-gray-800 text-base">Set company location</Text>
                    </TouchableOpacity>
                )}
                {location && location.city && (
                    <Text className="text-gray-800 mb-5">
                        📍 {location.city}, {location.province}, {location.country}
                        {location.postalCode ? ` (${location.postalCode})` : ""}
                    </Text>
                )}
                {/* Skills */}
                <SectionDivider />
                <Text className="text-gray-800 text-sm mb-2">Skills</Text>
                {isEditing && (
                    <TouchableOpacity
                        onPress={() => setSkillsModalVisible(true)}
                        className="border border-gray-300 rounded-xl px-4 py-3 mb-3 bg-gray-50"
                    >
                        <Text className="text-gray-800 text-base">Select skills</Text>
                    </TouchableOpacity>
                )}
                <View className="flex-row flex-wrap mb-5">
                    {jobSkills.map((skill, idx) => (
                        <View key={idx} className="bg-green-100 px-3 py-1 rounded-lg mr-2 mb-2">
                            <Text className="text-green-700">{skill}</Text>
                        </View>
                    ))}
                </View>

                {/* Employment Type */}
                <SectionDivider />
                <Text className="text-gray-800 text-sm mb-2">Employment Type</Text>
                <View className="flex-row flex-wrap mb-5">
                    {isEditing
                        ? EmploymentTypes.map((et) => {
                            const selected = employment.includes(et.type);
                            return (
                                <TouchableOpacity
                                    key={et.id}
                                    onPress={() => toggleSelection(et.type, employment, setEmployment)}
                                    className={`px-3 py-2 rounded-lg mr-2 mb-2 ${selected ? "bg-blue-600" : "bg-gray-100"}`}
                                >
                                    <Text className={`${selected ? "text-white" : "text-gray-800"} font-medium`}>
                                        {et.type}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })
                        : employment.map((et) => (
                            <View key={et} className="bg-blue-100 px-3 py-2 rounded-lg mr-2 mb-2">
                                <Text className="text-blue-700 font-medium">{et}</Text>
                            </View>
                        ))}
                </View>

                {/* Work Type */}
                <SectionDivider />
                <Text className="text-gray-800 text-sm mb-2">Work Type</Text>
                <View className="flex-row flex-wrap mb-5">
                    {isEditing
                        ? WorkTypes.map((wt) => {
                            const selected = workTypes.includes(wt.type);
                            return (
                                <TouchableOpacity
                                    key={wt.id}
                                    onPress={() => toggleSelection(wt.type, workTypes, setWorkTypes)}
                                    className={`px-3 py-2 rounded-lg mr-2 mb-2 ${selected ? "bg-blue-600" : "bg-gray-100"}`}
                                >
                                    <Text className={`${selected ? "text-white" : "text-gray-800"} font-medium`}>
                                        {wt.type}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })
                        : workTypes.map((wt) => (
                            <View key={wt} className="bg-blue-100 px-3 py-2 rounded-lg mr-2 mb-2">
                                <Text className="text-blue-700 font-medium">{wt}</Text>
                            </View>
                        ))}
                </View>

                {/* Save / Cancel */}
                {isEditing && (
                    <View className="flex-row justify-between mt-5 mb-12">
                        <TouchableOpacity
                            onPress={handleCancel}
                            className="bg-gray-300 rounded-xl px-6 py-4 flex-1 mr-2"
                        >
                            <Text className="text-center font-semibold text-gray-800">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-blue-600 rounded-xl px-6 py-4 flex-1 ml-2"
                        >
                            <Text className="text-center font-semibold text-white">Save</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Cancel confirmation modal */}
            <Modal visible={showCancelModal} transparent animationType="fade">
                <View className="flex-1 justify-center items-center bg-black/30">
                    <View className="bg-white rounded-xl p-6 w-80">
                        <Text className="text-gray-800 text-lg mb-4">Are you sure you want to cancel?</Text>
                        <View className="flex-row justify-end">
                            <TouchableOpacity onPress={closeCancelModal} className="px-4 py-2 mr-2">
                                <Text className="text-gray-700">No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmCancel} className="px-4 py-2">
                                <Text className="text-red-600 font-semibold">Yes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modals */}
            <IndustryModal
                visible={industryModalVisible}
                onClose={() => setIndustryModalVisible(false)}
                onSave={(selected) => setIndustry(selected[0]?.name || "")}
                initialSelected={industry ? [Industries.find(i => i.name === industry)!] : []}
                maxSelection={1}
            />
            <AddressModal
                visible={addressModalVisible}
                onClose={() => setAddressModalVisible(false)}
                onSave={(addr) => setLocation(addr)}
                initialAddress={location}
            />
            <SkillsModal
                visible={skillsModalVisible}
                onClose={() => setSkillsModalVisible(false)}
                onSave={(selectedSkills) => setJobSkills(selectedSkills)}
                initialSelected={jobSkills}
            />
        </SafeAreaView>
    );
};
