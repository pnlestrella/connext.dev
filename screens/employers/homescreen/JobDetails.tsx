import React, { useState, useRef, useMemo, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
    Keyboard,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Edit } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RichEditor, RichToolbar } from "react-native-pell-rich-editor";

import EmploymentTypes from "../../../data/employmentTypes.json";
import WorkTypes from "../../../data/workTypes.json";
import { Industries } from "../../../data/industries.json";
import Skills from "../../../data/cleaned_skills.json";

import Fuse from "fuse.js";
import { useEmployers } from "context/employers/EmployerHook";
import { updateJobs } from "api/employers/joblistings";

const BRAND_PURPLE = "#2563EB";

// fuzzy search for skills
const fuse = new Fuse(Skills, { threshold: 0.3, includeScore: true });

// highlight text matches
const Highlighted = ({ text, query }: { text: string; query: string }) => {
    if (!query) return <Text>{text}</Text>;
    const regex = new RegExp(`(${query})`, "i");
    const parts = text.split(regex);
    return (
        <Text>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <Text key={i} style={{ fontWeight: "700", color: BRAND_PURPLE }}>
                        {part}
                    </Text>
                ) : (
                    <Text key={i}>{part}</Text>
                )
            )}
        </Text>
    );
};

const SectionDivider = () => (
    <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 20 }} />
);

export const JobDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { job, edit } = route.params as { job: any; edit: boolean };
    const { setRefresh, refresh } = useEmployers();

    const richText = useRef<RichEditor>(null);

    const [isEditing, setIsEditing] = useState(edit);

    const [jobTitle, setJobTitle] = useState(job.jobTitle || "");
    const [jobDescription, setJobDescription] = useState(
        job.jobDescription ? job.jobDescription.replace(/<[^>]+>/g, "") : ""
    );
    const [industry, setIndustry] = useState<string>(job.jobIndustry || "");
    const [location, setLocation] = useState<any>(job.location || {});
    const [jobSkills, setJobSkills] = useState<string[]>(job.jobSkills || []);
    const [employment, setEmployment] = useState<string[]>(job.employment || []);
    const [workTypes, setWorkTypes] = useState<string[]>(job.workTypes || []);

    // ===== Location search state =====
    const [locQuery, setLocQuery] = useState("");
    const [locResults, setLocResults] = useState<any[]>([]);
    const [locLoading, setLocLoading] = useState(false);
    const API_KEY = "pk.9d1a0a6102b95fdfcab79dc4a5255313"; // replace with env

    async function searchPlaces(text: string) {
        setLocQuery(text);
        if (text.length < 2) {
            setLocResults([]);
            return;
        }
        setLocLoading(true);
        try {
            const res = await fetch(
                `https://api.locationiq.com/v1/autocomplete.php?key=${API_KEY}&q=${encodeURIComponent(
                    text
                )}&limit=5&countrycodes=PH&format=json`
            );
            const data = await res.json();
            setLocResults(data || []);
        } catch (err) {
            console.error("Error fetching locations:", err);
        } finally {
            setLocLoading(false);
        }
    }

    // ===== Skills search state =====
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!search) {
            setDebouncedSearch("");
            return;
        }
        setLoading(true);
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setLoading(false);
        }, 250);
        return () => clearTimeout(handler);
    }, [search]);

    const filteredSkills = useMemo(() => {
        if (!debouncedSearch) return [];
        let results = fuse.search(debouncedSearch).map((r) => r.item);
        results = results.filter((s) => !jobSkills.includes(s));
        return results.slice(0, 8);
    }, [debouncedSearch, jobSkills]);

    function addSkill(skill: string) {
        if (jobSkills.includes(skill)) return;
        if (jobSkills.length >= 10) {
            alert("You can only select up to 10 skills");
            return;
        }
        setJobSkills((prev) => [...prev, skill]);
        setSearch("");
        Keyboard.dismiss();
    }

    function removeSkill(skill: string) {
        setJobSkills((prev) => prev.filter((s) => s !== skill));
    }

    const toggleSelection = (
        item: string,
        list: string[],
        setList: (val: string[]) => void
    ) => {
        if (list.includes(item)) setList(list.filter((i) => i !== item));
        else setList([...list, item]);
    };

    const handleSave = async () => {
        if (!jobTitle.trim()) return alert("Job title is required");
        if (!jobDescription.trim()) return alert("Job description is required");
        if (!industry) return alert("Please select an industry");
        if (jobSkills.length === 0) return alert("Please add at least one skill");
        if (employment.length === 0) return alert("Select at least one employment type");
        if (workTypes.length === 0) return alert("Select at least one work type");

        // 🔹 Location validation
        if (!location || !location.display_name) {
            return alert("Please select a location from the suggestions");
        }

        const updatedJob = {
            jobTitle,
            jobDescription,
            jobSkills,
            jobIndustry: industry,
            employment,
            workTypes,
            location: {
                display_name: location.display_name,
                city: location.city || null,
                province: location.province || null,
                country: location.country || null,
                postalCode: location.postalCode || null,
                lat: location.lat,
                lon: location.lon,
            },
        };

        try {
            const res = await updateJobs(job.jobUID, updatedJob);
            if (res.success) {
                setRefresh(!refresh);
                alert("✅ Job updated!");
                setIsEditing(false);
            } else {
                alert("❌ Failed to update job");
            }
        } catch (err) {
            console.error("⚠️ Error in handleSave:", err);
            alert("Something went wrong");
        }
    };

    const confirmDiscard = () => {
        Alert.alert(
            "Discard changes?",
            "If you leave now, unsaved changes will be lost.",
            [
                { text: "Stay", style: "cancel" },
                {
                    text: "Discard",
                    style: "destructive",
                    onPress: () => {
                        // reset form values
                        setJobTitle(job.jobTitle || "");
                        setJobDescription(job.jobDescription || "");
                        setJobSkills(job.jobSkills || []);
                        setIndustry(job.jobIndustry || "");
                        setEmployment(job.employment || []);
                        setWorkTypes(job.workTypes || []);
                        setLocation(job.location || {});
                        setIsEditing(false);
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-5 py-4 border-b border-gray-200 relative">
                <TouchableOpacity
                    onPress={() => {
                        if (isEditing) {
                            // warn only when editing
                            confirmDiscard();
                        } else {
                            navigation.goBack(); // simple back in view mode
                        }
                    }}
                >
                    <ArrowLeft size={28} color="#37424F" />
                </TouchableOpacity>

                <Text className="absolute left-0 right-0 text-xl font-bold text-gray-800 text-center">
                    Job Details
                </Text>

                {!isEditing && (
                    <TouchableOpacity onPress={() => setIsEditing(true)} className="ml-auto">
                        <Edit size={24} color="#2563EB" />
                    </TouchableOpacity>
                )}
            </View>


            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150 }}>
                {/* Job Title */}
                <Text className="text-gray-800 text-sm mb-2">Job Title</Text>
                {isEditing ? (
                    <TextInput
                        value={jobTitle}
                        onChangeText={setJobTitle}
                        className="border rounded-xl px-4 py-3 mb-5 bg-gray-50 border-gray-300"
                    />
                ) : (
                    <Text className="text-lg text-gray-900 font-semibold mb-5">{jobTitle}</Text>
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
                                onChange={(text) => setJobDescription(text.slice(0, 2000))}
                            />
                        </View>
                        <RichToolbar
                            editor={richText}
                            actions={["bold", "italic", "underline", "unorderedList", "orderedList"]}
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
                <Text className="text-indigo-600 font-medium mb-3">{industry || "No industry set"}</Text>

                {/* Location */}
                <SectionDivider />
                <Text className="text-gray-800 text-sm mb-2">Location</Text>
                {isEditing ? (
                    <>
                        <TextInput
                            value={locQuery}
                            onChangeText={searchPlaces}
                            placeholder="Search for a city..."
                            className="border border-gray-300 rounded-xl px-4 py-3 mb-2"
                        />
                        {locLoading ? (
                            <View className="flex-row items-center p-3">
                                <ActivityIndicator size="small" color={BRAND_PURPLE} />
                                <Text className="ml-2 text-gray-500">Searching...</Text>
                            </View>
                        ) : locResults.length > 0 ? (
                            <View className="border border-gray-200 rounded-lg bg-white mb-3">
                                {locResults.map((item, idx) => (
                                    <Pressable
                                        key={idx}
                                        onPress={() => {
                                            setLocation({
                                                country: item.address?.country || null,
                                                country_code: item.address?.country_code || null,
                                                display_name: item.display_name,
                                                lat: item.lat,
                                                lon: item.lon,
                                                province: item.address?.state || null,
                                                city: item.address?.city || item.address?.town || null,
                                                postalCode: item.address?.postcode || null,
                                            });
                                            setLocQuery(item.display_name);
                                            setLocResults([]);
                                        }}
                                        className="px-3 py-2 border-b border-gray-100"
                                    >
                                        <Text className="text-gray-800">{item.display_name}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        ) : null}
                        {location?.display_name && (
                            <Text className="text-gray-700 mb-3">📍 {location.display_name}</Text>
                        )}
                    </>
                ) : (
                    location?.display_name && (
                        <Text className="text-gray-800 mb-5">📍 {location.display_name}</Text>
                    )
                )}

                {/* Skills */}
                <SectionDivider />
                <Text className="text-gray-800 text-sm mb-2">Skills</Text>
                {isEditing ? (
                    <>
                        <View className="flex-row flex-wrap mb-2">
                            {jobSkills.map((skill) => (
                                <View
                                    key={skill}
                                    style={{
                                        flexDirection: "row",
                                        backgroundColor: BRAND_PURPLE,
                                        borderRadius: 20,
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        margin: 4,
                                    }}
                                >
                                    <Text style={{ color: "white", marginRight: 6 }}>{skill}</Text>
                                    <Pressable onPress={() => removeSkill(skill)}>
                                        <Text style={{ color: "white", fontWeight: "700" }}>×</Text>
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Search a skill..."
                            className="border border-gray-300 rounded-xl px-4 py-3 mb-2"
                        />
                        {search.length > 0 && (
                            <View className="bg-white border border-gray-200 rounded-lg mb-3">
                                {loading ? (
                                    <View className="flex-row items-center p-3">
                                        <ActivityIndicator size="small" color={BRAND_PURPLE} />
                                        <Text className="ml-2 text-gray-500">Searching...</Text>
                                    </View>
                                ) : filteredSkills.length > 0 ? (
                                    <ScrollView style={{ maxHeight: 200 }}>
                                        {filteredSkills.map((skill, idx) => (
                                            <Pressable
                                                key={skill}
                                                onPress={() => addSkill(skill)}
                                                className="px-3 py-2 border-b border-gray-100"
                                            >
                                                <Text>
                                                    <Highlighted text={skill} query={debouncedSearch} />
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View className="p-3">
                                        <Text className="text-gray-400 italic">No results found</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </>
                ) : (
                    <View className="flex-row flex-wrap mb-5">
                        {jobSkills.map((skill, idx) => (
                            <View key={idx} className="bg-green-100 px-3 py-1 rounded-lg mr-2 mb-2">
                                <Text className="text-green-700">{skill}</Text>
                            </View>
                        ))}
                    </View>
                )}

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
                                    className={`px-3 py-2 rounded-lg mr-2 mb-2 ${selected ? "bg-blue-600" : "bg-gray-100"
                                        }`}
                                >
                                    <Text className={selected ? "text-white" : "text-gray-800"}>
                                        {et.type}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })
                        : employment.map((et) => (
                            <View
                                key={et}
                                className="bg-blue-100 px-3 py-2 rounded-lg mr-2 mb-2"
                            >
                                <Text className="text-blue-700">{et}</Text>
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
                                    className={`px-3 py-2 rounded-lg mr-2 mb-2 ${selected ? "bg-blue-600" : "bg-gray-100"
                                        }`}
                                >
                                    <Text className={selected ? "text-white" : "text-gray-800"}>
                                        {wt.type}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })
                        : workTypes.map((wt) => (
                            <View
                                key={wt}
                                className="bg-blue-100 px-3 py-2 rounded-lg mr-2 mb-2"
                            >
                                <Text className="text-blue-700">{wt}</Text>
                            </View>
                        ))}
                </View>

                {/* Save / Cancel */}
                {isEditing && (
                    <View className="flex-row justify-between mt-5 mb-12">
                        <TouchableOpacity
                            onPress={confirmDiscard}
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
        </SafeAreaView>
    );
};
