import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "context/auth/AuthHook";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/types/RootStackParamList";
import { updateProfile } from "api/profile";

const API_KEY = "pk.9d1a0a6102b95fdfcab79dc4a5255313"; // your key

export const AddressScreen = () => {
  const { user, userType, setUserMDB } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const userPath = userType + "s";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  async function searchPlaces(text: string) {
    setQuery(text);
    setSelectedPlace(null); // reset if typing again
    if (text.length < 2) {
      setResults([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.locationiq.com/v1/autocomplete.php?key=${API_KEY}&q=${encodeURIComponent(
          text
        )}&limit=5&countrycodes=PH&format=json`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  }

  async function handleProceed() {
    if (!selectedPlace) {
      alert("⚠️ Please select a location from the list");
      return;
    }

    const payload = {
      editType: "location",
      data: {
        country: selectedPlace.address.country,         // "Philippines"
        country_code: selectedPlace.address.country_code, // "ph"
        name: selectedPlace.address.name,               // "Naga"
        province: selectedPlace.address.state || null,  // "Bicol Region"
        city: selectedPlace.address.name || null,       // "Naga" (or adjust if API gives a city field)
        postalCode: selectedPlace.address.postcode || null, // "4400"
        display_name: selectedPlace.display_name,       // "Naga, Bicol Region, 4400, Philippines"
        lat: selectedPlace.lat,                         // "13.6240122"
        lon: selectedPlace.lon,                         // "123.1850318"
      },
    };


    console.log("Saving payload:", payload);

    const res = await updateProfile(userPath, user?.uid, payload);
    if (res.success === false) {
      alert(res.error);
      return;
    }
    setUserMDB(res);
    alert("Successfully added address");
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Where are you located?</Text>
          <Text style={styles.subtitle}>
            Add your city so employers can find you more easily.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Type a city..."
            value={query}
            onChangeText={searchPlaces}
          />

          <FlatList
            data={results}
            keyExtractor={(item, idx) => item.place_id + idx}
            renderItem={({ item }) => (
              <Pressable
                style={styles.suggestion}
                onPress={() => {
                  setSelectedPlace(item);
                  setQuery(item.display_name);
                  setResults([]);
                }}
              >
                <Text style={styles.suggestionText}>{item.display_name}</Text>
              </Pressable>
            )}
          />
        </View>

        <Pressable style={styles.button} onPress={handleProceed}>
          <Text style={styles.buttonText}>Save & Continue</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#6C63FF",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  suggestion: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  suggestionText: {
    fontSize: 15,
    color: "#333",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
