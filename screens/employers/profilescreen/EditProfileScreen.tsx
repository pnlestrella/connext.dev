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
  Pressable,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ActivityIndicator,
  Modal,
} from "react-native";
import { ArrowLeft, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import { useAuth } from "context/auth/AuthHook";
import { IndustryModal } from "components/profileScreen/IndustryModal";
import { Industries } from "../../../data/industries.json";
import { updateProfile } from "api/profile";
import { getUploadKeys } from "api/employers/imagekit";
import { Loading } from "components/Loading";
import ConfirmationModal from "components/ConfirmationModal";

type Industry = { id: number; name: string };

const BRAND_PURPLE = "#2563EB";
const API_KEY = "pk.9d1a0a6102b95fdfcab79dc4a5255313"; // 🔑 move to env later

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
  const [location, setLocation] = useState<any>(original.location);
  const [profilePic, setProfilePic] = useState(original.profilePic);

  const [industryModalVisible, setIndustryModalVisible] = useState(false);
  const [tempPic, setTempPic] = useState<any>(null);

  // Location state
  const [locQuery, setLocQuery] = useState(location?.display_name || "");
  const [locResults, setLocResults] = useState<any[]>([]);
  const [locLoading, setLocLoading] = useState(false);

  // New states
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const initialIndustriesForModal = useMemo(() => {
    return industries
      .map((name) => Industries.find((i) => i.name === name))
      .filter((i): i is Industry => Boolean(i));
  }, [industries]);

  // 📍 Location search
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
      alert("Company name must be at least 2 characters");
      return;
    }
    if (!location?.display_name) {
      alert("Please set your company location");
      return;
    }

    setLoading(true);
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
      Alert.alert("Error", "Try again later");
      console.warn("Error editing employer profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmCancel = () => {
    setCompanyName(original.companyName);
    setIndustries(original.industries);
    setLocation(original.location);
    setProfilePic(original.profilePic);
    setTempPic(null);
    setShowCancelConfirm(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View className="flex-row items-center px-5 py-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setShowCancelConfirm(true)} className="mr-3">
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

            <ScrollView
              contentContainerStyle={{ padding: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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
              <TextInput
                value={locQuery}
                onChangeText={searchPlaces}
                placeholder="Search company location..."
                className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
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
                <Text className="text-gray-700 mb-4">
                  📍 {location.display_name}
                </Text>
              )}

              {/* Email */}
              <Text className="mb-1 text-gray-700">Email</Text>
              <View className="border border-gray-300 rounded-lg px-3 py-2 mb-8 bg-gray-200">
                <Text className="text-gray-700">{original.email}</Text>
              </View>

              {/* Buttons */}
              <View className="flex-row justify-between mt-8 mb-12">
                <TouchableOpacity
                  onPress={() => setShowCancelConfirm(true)}
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Industry Modal */}
      <IndustryModal
        visible={industryModalVisible}
        onClose={() => setIndustryModalVisible(false)}
        onSave={(selectedIndustries) =>
          setIndustries(selectedIndustries.map((i) => i.name))
        }
        initialSelected={initialIndustriesForModal}
        maxSelection={3}
      />

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        visible={showCancelConfirm}
        type="logout"
        title="Discard Changes?"
        message="Are you sure you want to discard your changes? They will not be saved."
        onCancel={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancel}
      />

      {/* Loading Modal */}
      <Modal visible={loading} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white p-6 rounded-2xl items-center">
            <ActivityIndicator size="large" color={BRAND_PURPLE} />
            <Text className="mt-3 text-gray-700 font-medium">
              Saving changes...
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};