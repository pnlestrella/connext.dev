import React, { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Image,
} from "react-native";
import { ArrowLeft, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "context/auth/AuthHook";
import { Header } from "components/Header";
import { IndustryModal } from "components/profileScreen/IndustryModal";
import { AddressModal } from "components/profileScreen/AddressModal";
import { Industries } from "../../../data/industries.json";
import { updateProfile } from "api/profile";
import Constants from "expo-constants";

//api
import { getJobs } from "api/employers/imagekit";
type Industry = { id: number; name: string }; // ✅ define type

export const EditProfileScreenEmployer = () => {
    const { userMDB, setUserMDB } = useAuth();
    const navigation = useNavigation();

    const original = {
        companyName: userMDB?.companyName || "",
        industries: userMDB?.industries || [],
        location: userMDB?.location || null,
        email: userMDB?.email || "",
        profilePic: userMDB?.profilePic || null,
    };

    const [companyName, setCompanyName] = useState(original.companyName);
    const [industries, setIndustries] = useState(original.industries);
    const [location, setLocation] = useState(original.location);
    const [profilePic, setProfilePic] = useState(original.profilePic);

    const [industryModalVisible, setIndustryModalVisible] = useState(false);
    const [addressModalVisible, setAddressModalVisible] = useState(false);

    const [tempPic, setTempPic] = useState<any>(null); // new file if chosen

    const initialIndustriesForModal = useMemo(() => {
        return industries
            .map((name) => Industries.find((i) => i.name === name))
            .filter((i): i is Industry => Boolean(i));
    }, [industries]);

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*"],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets?.length) return;

            const file = result.assets[0];
            setTempPic(file);
            setProfilePic(file.uri); // ✅ preview immediately
        } catch (err) {
            console.warn("Error picking/uploading:", err);
            Alert.alert("Error", "Unable to pick/upload image");
        }
    };

    const handleSave = async () => {
        if (companyName.length < 2) {
            alert("Company name must be at least 2 characters");
            return;
        }

        try {
            let uploadedUrl = profilePic;

            // ✅ only upload if new image picked
            if (tempPic) {
                const data = await getJobs(tempPic);
                if (data.url) {
                    uploadedUrl = data.url;
                    setTempPic(null);
                }
            }

            const updated = {
                companyName,
                industries,
                location,
                profilePic: uploadedUrl,
            };

            await updateProfile("employers", userMDB.employerUID, { updates: updated });

            setUserMDB((prev: typeof userMDB) => ({
                ...prev,
                ...updated,
            }));

            Alert.alert("Success", "Profile updated successfully!");
            navigation.goBack();
        } catch (err) {
            Alert.alert("Error", "Try again later");
            console.warn("Error editing employer profile:", err);
        }

    };

    const handleCancel = () => {
        setCompanyName(original.companyName);
        setIndustries(original.industries);
        setLocation(original.location);
        setProfilePic(original.profilePic);
        setTempPic(null);
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
                {/* Profile Pic */}
                <View className="items-center mt-6">
                    <TouchableOpacity
                        onPress={pickDocument}
                        className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300"
                    >
                        <View className="w-full h-full justify-center items-center bg-gray-100">
                            {profilePic ? (
                                <Image
                                    source={{ uri: profilePic }}
                                    style={{ width: "100%", height: "100%" }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text className="text-gray-500">Upload</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                    <Text className="mt-2 text-gray-600 font-medium">
                        Company Logo
                    </Text>
                </View>

                {/* Company Name */}
                <Text className="mb-1 text-gray-700">Company Name</Text>
                <TextInput
                    value={companyName}
                    onChangeText={setCompanyName}
                    className="border border-gray-300 rounded-lg px-3 py-2 mb-4"
                />

                {/* Industries */}
                <Text className="mb-2 text-gray-700">Industries</Text>
                <View className="flex-row flex-wrap mb-4">
                    {industries.map((industry, index) => (
                        <View
                            key={index}
                            className="bg-indigo-100 px-3 py-2 rounded-lg mr-2 mb-2"
                        >
                            <Text className="text-indigo-600 font-medium">
                                {industry}
                            </Text>
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

                {/* Location */}
                <Text className="mb-1 text-gray-700">Location</Text>
                <TouchableOpacity
                    onPress={() => setAddressModalVisible(true)}
                    className="border border-gray-300 rounded-lg px-3 py-2 mb-4 bg-gray-50"
                >
                    <Text className="text-gray-700">
                        {location?.city
                            ? `${location.city}, ${location.province}, ${location.country} (${location.postalCode})`
                            : "Set company location"}
                    </Text>
                </TouchableOpacity>

                {/* Email */}
                <Text className="mb-1 text-gray-700">Email</Text>
                <View className="border border-gray-300 rounded-lg px-3 py-2 mb-8 bg-gray-200">
                    <Text className="text-gray-700">{original.email}</Text>
                </View>

                {/* Buttons */}
                <View className="flex-row justify-between mt-8">
                    <TouchableOpacity
                        onPress={handleCancel}
                        className="bg-gray-200 rounded-xl px-6 py-3 flex-1 mr-2"
                    >
                        <Text className="text-gray-800 font-semibold text-center">
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-blue-600 rounded-xl px-6 py-3 flex-1 ml-2"
                    >
                        <Text className="text-white font-semibold text-center">
                            Save Changes
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modals */}
            <IndustryModal
                visible={industryModalVisible}
                onClose={() => setIndustryModalVisible(false)}
                onSave={(selectedIndustries) =>
                    setIndustries(selectedIndustries.map((i) => i.name))
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
