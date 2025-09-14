import React, { useState } from "react";
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
import { Industries } from "../../../data/industries.json"

import { updateProfile } from "api/profile";

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

    console.log(industries, 'industries')

    // Modal states
    const [skillsModalVisible, setSkillsModalVisible] = useState(false);
    const [industryModalVisible, setIndustryModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);

    const initialIndustriesForModal = React.useMemo(() => {
        return industries
            .map((name) => Industries.find((i) => i.name === name))
            .filter((i): i is Industry => Boolean(i)); // filter nulls
    }, [industries]);



    const handleSave = async () => {
        if (firstName.length < 2) {
            alert("First Name must be at least 2 characters");
            return;
        }
        if (middleInitial && middleInitial.length < 2) {
            alert("Middle Initial must be at least 2 characters");
            return;
        }
        if (lastName.length < 2) {
            alert("Last Name must be at least 2 characters");
            return;
        }

        const updated = {
            fullName: { firstName, middleInitial, lastName }, industries, location, skills
        };

        try {
            const res = await updateProfile(userMDB.role + 's', userMDB.seekerUID, {
                updates: updated
            });
            refreshAuth()
            console.log(res)
            navigation.goBack();

            console.log("Updated profile:", updated);
            Alert.alert("Success", "Profile updated successfully!");


        } catch (err) {
            alert("Try again later")
            console.warn(err, "Error editing profile")
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
            <View className="flex-row items-center px-5 py-4 border-b border-gray-200 items-center">
                <TouchableOpacity onPress={handleCancel} className="mr-3">
                    <ArrowLeft size={24} color="black" />
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

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* First + Last Name */}
                <View className="flex-row justify-between mb-4">
                    <View className="flex-1 mr-2">
                        <Text className="mb-1 text-gray-700">First Name</Text>
                        <TextInput
                            value={firstName}
                            onChangeText={setFirstName}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                        />
                    </View>

                    <View className="flex-1 ml-2">
                        <Text className="mb-1 text-gray-700">Last Name</Text>
                        <TextInput
                            value={lastName}
                            onChangeText={setLastName}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                        />
                    </View>
                </View>

                {/* Middle Initial */}
                <Text className="mb-1 text-gray-700">Middle Initial (if applicable)</Text>
                <TextInput
                    value={middleInitial}
                    onChangeText={(val) => setMiddleInitial(val.toUpperCase())} // force uppercase
                    maxLength={5} // limit width
                    className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-24"
                />

                {/* Industry */}
                <Text className="mb-2 text-gray-700">Industries</Text>
                <View className="flex-row flex-wrap mb-4">
                    {industries.map((industry, index) => (
                        <View key={index} className="bg-indigo-100 px-3 py-2 rounded-lg mr-2 mb-2">
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

                {/* Skills */}
                <Text className="mb-2 text-gray-700">Skills</Text>
                <View className="flex-row flex-wrap mb-4">
                    {skills.map((skill, index) => (
                        <View key={index} className="bg-indigo-100 px-3 py-2 rounded-lg mr-2 mb-2">
                            <Text className="text-indigo-600 font-medium">{skill}</Text>
                        </View>
                    ))}
                    <TouchableOpacity
                        onPress={() => setSkillsModalVisible(true)}
                        className="flex-row items-center border border-gray-300 px-3 py-2 rounded-lg"
                    >
                        <Plus size={16} color="#37424F" />
                        <Text className="ml-1 text-gray-700">Add new</Text>
                    </TouchableOpacity>
                </View>

                {/* Location */}
                <Text className="mb-1 text-gray-700">Location</Text>
                <TouchableOpacity
                    onPress={() => setAddressModalVisible(true)}
                    className="border border-gray-300 rounded-lg px-3 py-2 mb-4 bg-gray-50"
                >
                    <Text className="text-gray-700">
                        {location?.city
                            ? `${location.city}, ${location.province}, ${location.country} (${location.postalCode})`
                            : "Set your location"}
                    </Text>
                </TouchableOpacity>

                {/* Email */}
                <Text className="mb-1 text-gray-700">Email</Text>
                <View className="border border-gray-300 rounded-lg px-3 py-2 mb-8 bg-gray-400">
                    <Text className="text-gray-700">{userMDB?.email}</Text>
                </View>

                {/* Buttons */}
                <View className="flex-row justify-between mt-8">
                    <TouchableOpacity
                        onPress={handleCancel}
                        className="bg-gray-200 rounded-xl px-6 py-3 flex-1 mr-2"
                    >
                        <Text className="text-gray-800 font-semibold text-center">Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-blue-600 rounded-xl px-6 py-3 flex-1 ml-2"
                    >
                        <Text className="text-white font-semibold text-center">Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modals */}
            <SkillsModal
                visible={skillsModalVisible}
                onClose={() => setSkillsModalVisible(false)}
                onSave={(selectedSkills) => setSkills(selectedSkills)} // just replace
                initialSelected={skills}
            />
            <IndustryModal
                visible={industryModalVisible}
                onClose={() => setIndustryModalVisible(false)}
                onSave={(selectedIndustries) =>
                    setIndustries(selectedIndustries.map(i => i.name)) // replaces
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
