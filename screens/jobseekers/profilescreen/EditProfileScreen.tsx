import React, { useState, useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, Plus } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "context/auth/AuthHook";
import { IndustryModal } from "components/profileScreen/IndustryModal";
import { Industries } from "../../../data/industries.json";
import { updateProfile } from "api/profile";

import Skills from "../../../data/cleaned_skills.json";
import Fuse from "fuse.js";

const BRAND_PURPLE = "#2563EB";

// fuzzy search for skills
const fuse = new Fuse(Skills, { threshold: 0.3, includeScore: true });

// highlight matching part
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

export const EditProfileScreen = () => {
  const { userMDB, refreshAuth } = useAuth();
  const navigation = useNavigation();

  // original values
  const original = {
    firstName: userMDB?.fullName?.firstName || "",
    middleInitial: userMDB?.fullName?.middleInitial || "",
    lastName: userMDB?.fullName?.lastName || "",
    industries: userMDB?.industries || [],
    location: userMDB?.location || null,
    skills: userMDB?.skills || [],
    profileSummary: userMDB?.profileSummary || "",
  };

  // states
  const [firstName, setFirstName] = useState(original.firstName);
  const [middleInitial, setMiddleInitial] = useState(original.middleInitial);
  const [lastName, setLastName] = useState(original.lastName);
  const [industries, setIndustries] = useState(original.industries);
  const [location, setLocation] = useState<any>(original.location);
  const [skills, setSkills] = useState(original.skills);
  const [profileSummary, setProfileSummary] = useState(original.profileSummary);

  // modals
  const [industryModalVisible, setIndustryModalVisible] = useState(false);

  const initialIndustriesForModal = useMemo(() => {
    return industries
      .map((name) => Industries.find((i) => i.name === name))
      .filter((i) => Boolean(i));
  }, [industries]);

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
    results = results.filter((s) => !skills.includes(s));
    return results.slice(0, 8);
  }, [debouncedSearch, skills]);

  function addSkill(skill: string) {
    if (skills.includes(skill)) return;
    if (skills.length >= 10) {
      alert("You can only select up to 10 skills");
      return;
    }
    setSkills((prev) => [...prev, skill]);
    setSearch("");
    Keyboard.dismiss();
  }

  function removeSkill(skill: string) {
    setSkills((prev) => prev.filter((s) => s !== skill));
  }

  // ===== Location search =====
  const [locQuery, setLocQuery] = useState(location?.display_name || "");
  const [locResults, setLocResults] = useState<any[]>([]);
  const [locLoading, setLocLoading] = useState(false);
  const API_KEY = "pk.9d1a0a6102b95fdfcab79dc4a5255313"; // move to env later

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

  // ===== Save / Cancel =====
  const handleSave = async () => {
    if (firstName.length < 2) return alert("First Name must be at least 2 chars");
    if (lastName.length < 2) return alert("Last Name must be at least 2 chars");
    if (skills.length === 0) return alert("Please add at least one skill");
    if (!location?.display_name) return alert("Please set your location");

    const updated = {
      fullName: { firstName, middleInitial, lastName },
      industries,
      location,
      skills,
      profileSummary,
    };

    try {
      const res = await updateProfile(
        userMDB.role + "s",
        userMDB.seekerUID,
        { updates: updated }
      );
      refreshAuth();
      navigation.goBack();
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err) {
      alert("Try again later");
      console.warn(err, "Error editing profile");
    }
  };

  const handleCancel = () => {
    setFirstName(original.firstName);
    setMiddleInitial(original.middleInitial);
    setLastName(original.lastName);
    setIndustries(original.industries);
    setLocation(original.location);
    setSkills(original.skills);
    setProfileSummary(original.profileSummary);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 items-center">
        <TouchableOpacity onPress={handleCancel} className="mr-3">
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Poppins-Bold", fontSize: 20, color: "#37424F" }}>
          Edit Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Names */}
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
          onChangeText={(val) => setMiddleInitial(val.toUpperCase())}
          maxLength={5}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-4 w-24"
        />

        {/* Profile Summary */}
        <Text className="mb-1 text-gray-700">Profile Summary</Text>
        <TextInput
          value={profileSummary}
          onChangeText={(val) => {
            if (val.length <= 500) setProfileSummary(val);
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 mb-1"
          multiline
          numberOfLines={4}
          placeholder="Write a short summary..."
          textAlignVertical="top"
        />
        <Text className="text-right text-gray-500 mb-4">{profileSummary.length} / 500</Text>

        {/* Industries */}
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
        <View className="flex-row flex-wrap mb-2">
          {skills.map((skill) => (
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
          className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
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
                {filteredSkills.map((skill) => (
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

        {/* Location */}
        <Text className="mb-1 text-gray-700">Location</Text>
        <TextInput
          value={locQuery}
          onChangeText={searchPlaces}
          placeholder="Search for a city..."
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
          <Text className="text-gray-700 mb-4">📍 {location.display_name}</Text>
        )}

        {/* Email */}
        <Text className="mb-1 text-gray-700">Email</Text>
        <View className="border border-gray-300 rounded-lg px-3 py-2 mb-8 bg-gray-100">
          <Text className="text-gray-700">{userMDB?.email}</Text>
        </View>

        {/* Buttons */}
        <View className="flex-row justify-between mt-8 mb-12">
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
            <Text className="text-white font-semibold text-center">
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    </SafeAreaView>
  );
};
