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

//api
import { getUploadKeys } from "api/employers/imagekit";
type Industry = { id: number; name: string };

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

    const [tempPic, setTempPic] = useState<any>(null);

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
            setProfilePic(file.uri);
        } catch (err) {
            console.warn("Error picking/uploading:", err);
            Alert.alert("Error", "Unable to pick/upload image");
        }
    };

    const handleSave = async () => {
        if (companyName.length < 2) {
            Alert.alert("Validation Error", "Company name must be at least 2 characters");
            return;
        }

        try {
            let uploadedUrl = profilePic;

            if (tempPic) {
                const data = await getUploadKeys(tempPic, "/images");
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
            Alert.alert("Error", "Failed to update profile. Please try again.");
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

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Profile Picture Section */}
                <View className="items-center mb-8">
                    <TouchableOpacity
                        onPress={pickDocument}
                        className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 mb-3"
                    >
                        <View className="w-full h-full justify-center items-center bg-gray-100">
                            {profilePic ? (
                                <Image
                                    source={{ uri: profilePic }}
                                    style={{ width: "100%", height: "100%" }}
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text 
                                    style={{ fontFamily: "Lexend-Regular" }}
                                    className="text-gray-500"
                                >
                                    Upload
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                    <Text 
                        style={{ fontFamily: "Lexend-Medium" }} 
                        className="text-blue-600"
                    >
                        Change company photo
                    </Text>
                </View>

                {/* Company Name Field */}
                <View className="mb-6">
                    <Text 
                        style={{ fontFamily: "Lexend-Regular" }}
                        className="mb-2 text-gray-700 text-base"
                    >
                        Company Name
                    </Text>
                    <TextInput
                        value={companyName}
                        onChangeText={setCompanyName}
                        style={{ fontFamily: "Lexend-Regular" }}
                        className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                        placeholder="Enter company name"
                        placeholderTextColor="#9CA3AF"
                    />
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
                            <View
                                key={index}
                                className="bg-blue-100 px-3 py-2 rounded-lg mr-2 mb-2"
                            >
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
                                : "Set company location"}
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
                            {original.email}
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