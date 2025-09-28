import React, { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { ArrowLeft, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "context/auth/AuthHook";
import { Header } from "components/Header";
import { SkillsModal } from "components/profileScreen/SkillsModal";
import { IndustryModal } from "components/profileScreen/IndustryModal";
import { AddressModal } from "components/profileScreen/AddressModal";
import { Industries } from "../../../data/industries.json";
import { updateProfile } from "api/profile";

type Industry = { id: number; name: string };

export const EditProfileScreen = () => {
    const { userMDB, refreshAuth } = useAuth();
    const navigation = useNavigation();

    // Original values to retain on cancel
    const original = {
        firstName: userMDB?.fullName?.firstName || "",
        middleInitial: userMDB?.fullName?.middleInitial || "",
        lastName: userMDB?.fullName?.lastName || "",
        industries: userMDB?.industries || ["Food & Beverage", "Hospitality"],
        location: userMDB?.location || null,
        skills: userMDB?.skills || [],
    };

    // States
    const [firstName, setFirstName] = useState(original.firstName);
    const [middleInitial, setMiddleInitial] = useState(original.middleInitial);
    const [lastName, setLastName] = useState(original.lastName);
    const [industries, setIndustries] = useState(original.industries);
    const [location, setLocation] = useState(original.location);
    const [skills, setSkills] = useState(original.skills);

    // Modal states
    const [skillsModalVisible, setSkillsModalVisible] = useState(false);
    const [industryModalVisible, setIndustryModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);

    const initialIndustriesForModal = useMemo(() => {
        return industries
            .map((name) => Industries.find((i) => i.name === name))
            .filter((i): i is Industry => Boolean(i));
    }, [industries]);

    const handleSave = async () => {
        if (firstName.length < 2) {
            Alert.alert("Validation Error", "First Name must be at least 2 characters");
            return;
        }
        if (middleInitial && middleInitial.length < 2) {
            Alert.alert("Validation Error", "Middle Initial must be at least 2 characters");
            return;
        }
        if (lastName.length < 2) {
            Alert.alert("Validation Error", "Last Name must be at least 2 characters");
            return;
        }

        const updated = {
            fullName: { firstName, middleInitial, lastName },
            industries,
            location,
            skills
        };

        try {
            const res = await updateProfile(userMDB.role + 's', userMDB.seekerUID, {
                updates: updated
            });
            refreshAuth();
            console.log(res);
            
            Alert.alert("Success", "Profile updated successfully!");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Error", "Failed to update profile. Please try again.");
            console.warn(err, "Error editing profile");
        }
    };

    const handleCancel = () => {
        // Reset to original values
        setFirstName(original.firstName);
        setMiddleInitial(original.middleInitial);
        setLastName(original.lastName);
        setIndustries(original.industries);
        setLocation(original.location);
        setSkills(original.skills);

        navigation.goBack();
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
                <TouchableOpacity onPress={handleCancel} className="mr-3">
                    <ArrowLeft size={24} color="#37424F" />
                </TouchableOpacity>
                <Text
                    style={{
                        fontFamily: "Poppins-Bold",
                        fontSize: 20,
                        color: "#37424F",
                    }}
                >
                    Edit Profile
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}
             showsVerticalScrollIndicator={false}>
                {/* Name Section */}
                <View className="mb-6">
                    {/* First + Last Name Row */}
                    <View className="flex-row justify-between mb-4">
                        <View className="flex-1 mr-2">
                            <Text 
                                style={{ fontFamily: "Lexend-Regular" }}
                                className="mb-2 text-gray-700 text-base"
                            >
                                First Name
                            </Text>
                            <TextInput
                                value={firstName}
                                onChangeText={setFirstName}
                                style={{ fontFamily: "Lexend-Regular" }}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                                placeholder="Enter first name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View className="flex-1 ml-2">
                            <Text 
                                style={{ fontFamily: "Lexend-Regular" }}
                                className="mb-2 text-gray-700 text-base"
                            >
                                Last Name
                            </Text>
                            <TextInput
                                value={lastName}
                                onChangeText={setLastName}
                                style={{ fontFamily: "Lexend-Regular" }}
                                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                                placeholder="Enter last name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    {/* Middle Initial */}
                    <View>
                        <Text 
                            style={{ fontFamily: "Lexend-Regular" }}
                            className="mb-2 text-gray-700 text-base"
                        >
                            Middle Initial (if applicable)
                        </Text>
                        <TextInput
                            value={middleInitial}
                            onChangeText={(val) => setMiddleInitial(val.toUpperCase())}
                            maxLength={5}
                            style={{ fontFamily: "Lexend-Regular" }}
                            className="border border-gray-300 rounded-lg px-4 py-3 text-base w-32"
                            placeholder="M.I."
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                {/* Industries Section */}
                <View className="mb-6">
                    <Text 
                        style={{ fontFamily: "Lexend-Regular" }}
                        className="mb-3 text-gray-700 text-base"
                    >
                        Industries
                    </Text>
                    <View className="flex-row flex-wrap">
                        {industries.map((industry, index) => (
                            <View key={index} className="bg-blue-100 px-3 py-2 rounded-lg mr-2 mb-2">
                                <Text 
                                    style={{ fontFamily: "Lexend-Medium" }}
                                    className="text-blue-700"
                                >
                                    {industry}
                                </Text>
                            </View>
                        ))}
                        <TouchableOpacity
                            onPress={() => setIndustryModalVisible(true)}
                            className="flex-row items-center border border-gray-300 px-3 py-2 rounded-lg"
                        >
                            <Plus size={16} color="#37424F" />
                            <Text 
                                style={{ fontFamily: "Lexend-Regular" }}
                                className="ml-1 text-gray-700"
                            >
                                Add new
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Skills Section */}
                <View className="mb-6">
                    <Text 
                        style={{ fontFamily: "Lexend-Regular" }}
                        className="mb-3 text-gray-700 text-base"
                    >
                        Skills
                    </Text>
                    <View className="flex-row flex-wrap">
                        {skills.map((skill, index) => (
                            <View key={index} className="bg-blue-100 px-3 py-2 rounded-lg mr-2 mb-2">
                                <Text 
                                    style={{ fontFamily: "Lexend-Medium" }}
                                    className="text-blue-700"
                                >
                                    {skill}
                                </Text>
                            </View>
                        ))}
                        <TouchableOpacity
                            onPress={() => setSkillsModalVisible(true)}
                            className="flex-row items-center border border-gray-300 px-3 py-2 rounded-lg"
                        >
                            <Plus size={16} color="#37424F" />
                            <Text 
                                style={{ fontFamily: "Lexend-Regular" }}
                                className="ml-1 text-gray-700"
                            >
                                Add new
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Location Field */}
                <View className="mb-6">
                    <Text 
                        style={{ fontFamily: "Lexend-Regular" }}
                        className="mb-2 text-gray-700 text-base"
                    >
                        Location
                    </Text>
                    <TouchableOpacity
                        onPress={() => setAddressModalVisible(true)}
                        className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                    >
                        <Text 
                            style={{ fontFamily: "Lexend-Regular" }}
                            className={`text-base ${location?.city ? "text-gray-700" : "text-gray-500"}`}
                        >
                            {location?.city
                                ? `${location.city}, ${location.province}, ${location.country} (${location.postalCode})`
                                : "Set your location"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Email Field (Read-only) */}
                <View className="mb-8">
                    <Text 
                        style={{ fontFamily: "Lexend-Regular" }}
                        className="mb-2 text-gray-700 text-base"
                    >
                        Email
                    </Text>
                    <View className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-200">
                        <Text 
                            style={{ fontFamily: "Lexend-Regular" }}
                            className="text-gray-600 text-base"
                        >
                            {userMDB?.email}
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row justify-between gap-3">
                    <TouchableOpacity
                        onPress={handleCancel}
                        className="bg-gray-200 rounded-xl px-6 py-4 flex-1"
                    >
                        <Text 
                            style={{ fontFamily: "Lexend-SemiBold" }}
                            className="text-gray-800 text-center text-base"
                        >
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-blue-600 rounded-xl px-6 py-4 flex-1"
                    >
                        <Text 
                            style={{ fontFamily: "Lexend-SemiBold" }}
                            className="text-white text-center text-base"
                        >
                            Save Changes
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modals */}
            <SkillsModal
                visible={skillsModalVisible}
                onClose={() => setSkillsModalVisible(false)}
                onSave={(selectedSkills) => setSkills(selectedSkills)}
                initialSelected={skills}
            />
            <IndustryModal
                visible={industryModalVisible}
                onClose={() => setIndustryModalVisible(false)}
                onSave={(selectedIndustries) =>
                    setIndustries(selectedIndustries.map(i => i.name))
                }
                initialSelected={initialIndustriesForModal}
                maxSelection={3}
            />
            <AddressModal
                visible={addressModalVisible}
                onClose={() => setAddressModalVisible(false)}
                onSave={(addr) => setLocation(addr)}
                initialAddress={location}
            />
        </SafeAreaView>
    );
};