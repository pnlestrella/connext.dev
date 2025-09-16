import React, { useState, useMemo, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";

import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Plus, Check } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

// modals
import { IndustryModal } from "components/profileScreen/IndustryModal";
import { AddressModal } from "components/profileScreen/AddressModal";
import { Industries } from "../../../data/industries.json";
import { SkillsModal } from "components/profileScreen/SkillsModal";

// data
import { default as EmploymentTypes } from "../../../data/employmentTypes.json";
import { default as WorkTypes } from "../../../data/workTypes.json";
import { default as CurrencyOptions } from "../../../data/currency.json";
import { default as FrequencyOptions } from "../../../data/frequency.json";
import AutocompleteInput from "components/profileScreen/AutoCompleteInput";
import { useAuth } from "context/auth/AuthHook";
import { postJob } from "api/employers/joblistings";
import { useEmployers } from "context/employers/EmployerHook";

const CheckboxItem = ({
    label,
    isSelected,
    onToggle,
}: {
    label: string;
    isSelected: boolean;
    onToggle: () => void;
}) => (
    <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center mb-4 mr-5"
    >
        <View
            className={`w-8 h-8 mr-3 border-2 rounded-lg justify-center items-center ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-400"
                }`}
        >
            {isSelected && <Check size={20} color="white" />}
        </View>
        <Text
            style={{ fontFamily: "Lexend-Regular", fontSize: 16, color: "#37424F" }}
        >
            {label}
        </Text>
    </TouchableOpacity>
);




// ✅ Section Divider
const SectionDivider = () => (
    <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 20 }} />
);

export const PostJob = () => {
    const { userMDB,user } = useAuth()
    const { setRefresh, refresh } = useEmployers()

    const navigation = useNavigation();
    const richText = useRef<RichEditor>(null);


    // form state
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [industries, setIndustries] = useState<string[]>([]);
    const [location, setLocation] = useState<any>(null);
    const [jobSkills, setJobSkills] = useState<string[]>([]);
    const [employment, setEmployment] = useState<string[]>([]);
    const [workTypes, setWorkTypes] = useState<string[]>([]);
    const [salaryMin, setSalaryMin] = useState("");
    const [salaryMax, setSalaryMax] = useState("");
    const [currency, setCurrency] = useState("");
    const [frequency, setFrequency] = useState("");
    const profilePic = userMDB.profilePic
    const companyName = userMDB.companyName


    const [industryModalVisible, setIndustryModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [skillsModalVisible, setSkillsModalVisible] = useState(false);

    const initialIndustriesForModal = useMemo(() => {
        return industries
            .map((name) => Industries.find((i) => i.name === name))
            .filter((i): i is { id: number; name: string } => Boolean(i));
    }, [industries]);

    const toggleSelection = (
        item: string,
        list: string[],
        setList: (val: string[]) => void
    ) => {
        if (list.includes(item)) {
            setList(list.filter((i) => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    // discard alert
    const confirmDiscard = () => {
        Alert.alert(
            "Discard changes?",
            "If you leave now, any unsaved job details will be lost.",
            [
                { text: "Stay", style: "cancel" },
                {
                    text: "Discard",
                    style: "destructive",
                    onPress: () => navigation.goBack(),
                },
            ]
        );
    };

    const handleSubmitJob = async () => {
        // ✅ Validation for required fields
        if (!jobTitle.trim()) {
            alert("Job Title is required");
            return;
        }

        if (!jobDescription.trim()) {
            alert("Job Description is required");
            return;
        }

        if (industries.length === 0) {
            alert("Please select at least one Industry");
            return;
        }

        if (!location || !location.city || !location.province || !location.postalCode) {
            alert("Please provide a valid Location (City, Province, Postal Code)");
            return;
        }

        if (jobSkills.length === 0) {
            alert("Please add at least one Skill");
            return;
        }

        if (employment.length === 0) {
            alert("Please select at least one Employment type");
            return;
        }

        if (workTypes.length === 0) {
            alert("Please select at least one Work type");
            return;
        }

        const jobData = {
            employerUID: userMDB.employerUID,
            companyName,
            jobTitle,
            jobIndustry: industries[0] || "",
            jobDescription,
            jobSkills,
            employment,
            workTypes,
            salary: {
                min: salaryMin ? Number(salaryMin) : null,
                max: salaryMax ? Number(salaryMax) : null,
                currency: currency || null,
                frequency: frequency || null,
            },
            location,
            profilePic,
        };

        try {
            const res = await postJob(jobData); // ✅ wait for DB operation
            if (res.success) {
                alert("✅ Job posted successfully!");
                setRefresh(!refresh); // refresh state after success
                // wait a tiny bit to ensure UI updates before navigating
                setTimeout(() => {
                    navigation.goBack();
                }, 100);
            } else {
                alert("❌ Failed to post job: " + (res.error || "Unknown error"));
            }
        } catch (err) {
            console.error("⚠️ Error posting job:", err);
            alert("❌ An error occurred while posting the job.");
        }
    };




    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header + Page Title */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
                <TouchableOpacity onPress={() => confirmDiscard()}>
                    <ArrowLeft size={28} color="#37424F" />
                </TouchableOpacity>
                <Text
                    style={{ fontFamily: "Poppins-Bold", fontSize: 22, color: "#37424F" }}
                >
                    Post a Job
                </Text>
                <View style={{ width: 28 }} /> {/* placeholder */}
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
            >
                {/* Job Title */}
                <Text
                    style={{ fontFamily: "Lexend-Regular", fontSize: 14, color: "#37424F" }}
                    className="mb-2"
                >
                    Job Title
                </Text>
                <TextInput
                    value={jobTitle}
                    onChangeText={setJobTitle}
                    className="border border-gray-300 rounded-xl px-4 py-3 mb-5"
                    style={{ fontFamily: "Lexend-Regular", fontSize: 15, color: "#111827" }}
                />

                {/* Job Description */}
                <Text
                    style={{ fontFamily: "Lexend-Regular", fontSize: 14, color: "#37424F" }}
                    className="mb-2"
                >
                    Job Description
                </Text>

                <View className="rounded-xl border border-gray-300 overflow-hidden mb-2 w-full">
                    <RichEditor
                        ref={richText}
                        style={{ minHeight: 180, width: "100%" }} // ✅ full width
                        placeholder="Write a clear, detailed job description..."
                        initialContentHTML={jobDescription}
                        onChange={(text) => setJobDescription(text.slice(0, 2000))}
                        editorStyle={{
                            backgroundColor: "#F9FAFB",
                            color: "#37424F",
                            placeholderColor: "#9CA3AF",
                            contentCSSText: `
        font-family: Lexend-Regular;
        font-size: 15px;
        padding: 14px;
        line-height: 1.6;
      `,
                        }}
                    />
                </View>

                {/* Toolbar */}
                <RichToolbar
                    editor={richText}
                    actions={["bold", "italic", "underline", "unorderedList", "orderedList"]}
                    iconTint="#6B7280"
                    selectedIconTint="#2563EB"
                    style={{
                        width: "100%", // ✅ full width
                        borderColor: "#E5E7EB",
                        borderWidth: 1,
                        borderRadius: 12,
                        marginBottom: 8,
                        paddingVertical: 6,
                        backgroundColor: "#F9FAFB",
                    }}
                />

                {/* Character Count */}
                <Text
                    style={{ fontFamily: "Lexend-Regular" }}
                    className="text-gray-500 text-xs text-right mb-5"
                >
                    {jobDescription.length} / 2000 characters
                </Text>

                <SectionDivider />

                {/* Industries */}
                <Text
                    style={{ fontFamily: "Lexend-Regular", fontSize: 14, color: "#37424F" }}
                    className="mb-2"
                >
                    Job Industries
                </Text>
                <View className="flex-row flex-wrap mb-3">
                    {industries.map((industry, idx) => (
                        <View
                            key={idx}
                            className="bg-indigo-100 px-3 py-2 rounded-lg mr-2 mb-2"
                        >
                            <Text className="text-indigo-600 font-medium">{industry}</Text>
                        </View>
                    ))}
                    <TouchableOpacity
                        onPress={() => setIndustryModalVisible(true)}
                        className="flex-row items-center border border-gray-300 px-3 py-2 rounded-lg"
                    >
                        <Plus size={16} color="#37424F" />
                        <Text className="ml-1 text-gray-700">Add new</Text>
                    </TouchableOpacity>
                </View>

                {/* Recommendation for Industries */}
                <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5">
                    <Text className="text-blue-800 text-sm">
                        💡 Adding relevant{" "}
                        <Text className="font-semibold">industries</Text> helps improve your
                        job visibility and ensures it shows up in more relevant searches.
                    </Text>
                </View>

                <SectionDivider />

                {/* Location */}
                <Text
                    style={{ fontFamily: "Lexend-Regular", fontSize: 14, color: "#37424F" }}
                    className="mb-2"
                >
                    Location
                </Text>
                <TouchableOpacity
                    onPress={() => setAddressModalVisible(true)}
                    className="border border-gray-300 rounded-xl px-4 py-3 mb-3 bg-gray-50"
                >
                    <Text
                        style={{ fontFamily: "Lexend-Regular", fontSize: 15, color: "#37424F" }}
                    >
                        Set company location
                    </Text>
                </TouchableOpacity>
                {location && (
                    <Text
                        style={{ fontFamily: "Lexend-Regular", fontSize: 14, color: "#37424F" }}
                        className="mb-5"
                    >
                        📍 {location.city}, {location.province}, {location.country} (
                        {location.postalCode})
                    </Text>
                )}

                <SectionDivider />

                {/* Skills */}
                <Text
                    style={{ fontFamily: "Lexend-Regular", fontSize: 14, color: "#37424F" }}
                    className="mb-2"
                >
                    Skills
                </Text>
                <TouchableOpacity
                    onPress={() => setSkillsModalVisible(true)}
                    className="border border-gray-300 rounded-xl px-4 py-3 mb-3 bg-gray-50"
                >
                    <Text
                        style={{ fontFamily: "Lexend-Regular", fontSize: 15, color: "#37424F" }}
                    >
                        Select skills
                    </Text>
                </TouchableOpacity>

                {/* Recommendation */}
                <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-5">
                    <Text className="text-yellow-800 text-sm">
                        💡 We recommend adding at least{" "}
                        <Text className="font-semibold">3 skills</Text> to make your job
                        more searchable and visible to qualified candidates.
                    </Text>
                </View>

                {jobSkills.length > 0 && (
                    <View className="flex-row flex-wrap mb-5">
                        {jobSkills.map((skill, idx) => (
                            <View
                                key={idx}
                                className="bg-green-100 px-3 py-1 rounded-lg mr-2 mb-2"
                            >
                                <Text className="text-green-700">{skill}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <SectionDivider />

                {/* Employment Type */}
                <Text
                    style={{ fontFamily: "Lexend-Regular", fontSize: 14, color: "#37424F" }}
                    className="mb-2"
                >
                    Employment Type
                </Text>
                <View className="flex-row flex-wrap mb-5">
                    {EmploymentTypes.map((et) => (
                        <CheckboxItem
                            key={et.id}
                            label={et.type}
                            isSelected={employment.includes(et.type)}
                            onToggle={() =>
                                toggleSelection(et.type, employment, setEmployment)
                            }
                        />
                    ))}
                </View>

                <SectionDivider />

                {/* Work Type */}
                <Text
                    style={{ fontFamily: "Lexend-Regular", fontSize: 14, color: "#37424F" }}
                    className="mb-2"
                >
                    Work Type
                </Text>
                <View className="flex-row flex-wrap mb-5">
                    {WorkTypes.map((wt) => (
                        <CheckboxItem
                            key={wt.id}
                            label={wt.type}
                            isSelected={workTypes.includes(wt.type)}
                            onToggle={() => toggleSelection(wt.type, workTypes, setWorkTypes)}
                        />
                    ))}
                </View>

                <SectionDivider />

                {/* Salary (Optional) */}
                <Text
                    style={{ fontFamily: "Lexend-Regular", fontSize: 14, color: "#37424F" }}
                    className="mb-2"
                >
                    Salary (Optional)
                </Text>
                <View className="flex-row mb-5">
                    <View className="flex-1 mr-3">
                        <Text className="mb-2 text-gray-700">Min</Text>
                        <TextInput
                            value={salaryMin}
                            onChangeText={setSalaryMin}
                            keyboardType="numeric"
                            className="border border-gray-300 rounded-xl px-4 py-3"
                            style={{ fontFamily: "Lexend-Regular", fontSize: 15 }}
                            placeholder="e.g. 15000"
                        />
                    </View>
                    <View className="flex-1 ml-3">
                        <Text className="mb-2 text-gray-700">Max</Text>
                        <TextInput
                            value={salaryMax}
                            onChangeText={setSalaryMax}
                            keyboardType="numeric"
                            className="border border-gray-300 rounded-xl px-4 py-3"
                            style={{ fontFamily: "Lexend-Regular", fontSize: 15 }}
                            placeholder="e.g. 25000"
                        />
                    </View>
                </View>

                {/* Currency & Frequency (Optional) */}
                {/* Currency & Frequency */}
                <View className="flex-row mb-5">
                    <View className="flex-1 mr-3">
                        <AutocompleteInput
                            label="Currency"
                            value={currency}
                            setValue={setCurrency}
                            data={CurrencyOptions}
                            displayKey="currency"   // ✅ matches JSON
                        />
                    </View>
                    <View className="flex-1 ml-3">
                        <AutocompleteInput
                            label="Frequency"
                            value={frequency}
                            setValue={setFrequency}
                            data={FrequencyOptions}
                            displayKey="frequency"   // ✅ matches JSON
                        />
                    </View>
                </View>


                <SectionDivider />

                {/* Submit + Cancel */}
                <View className="flex-row justify-between px-5 mb-12">
                    {/* Cancel */}
                    <TouchableOpacity
                        onPress={confirmDiscard}
                        className="flex-1 bg-gray-200 rounded-xl px-6 py-4 mr-3"
                    >
                        <Text
                            style={{
                                fontFamily: "Lexend-Regular",
                                fontSize: 16,
                                fontWeight: "600",
                                color: "#37424F",
                                textAlign: "center",
                            }}
                        >
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    {/* Post Job */}
                    <TouchableOpacity
                        onPress={handleSubmitJob}
                        className="flex-1 bg-blue-600 rounded-xl px-6 py-4 ml-3"
                    >
                        <Text
                            style={{
                                fontFamily: "Lexend-Regular",
                                fontSize: 16,
                                fontWeight: "600",
                                color: "white",
                                textAlign: "center",
                            }}
                        >
                            Post Job
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            {/* Modals */}
            <IndustryModal
                visible={industryModalVisible}
                onClose={() => setIndustryModalVisible(false)}
                onSave={(selected) => setIndustries(selected.map((i) => i.name))}
                initialSelected={initialIndustriesForModal}
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
