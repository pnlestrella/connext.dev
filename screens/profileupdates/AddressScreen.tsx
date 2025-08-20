import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import locations from "../../data/locations.json";
import { useAuth } from "context/auth/AuthHook";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/types/RootStackParamList";
import { updateProfile } from "api/profile";
const COUNTRY_LABELS: Record<string, string> = {
  PH: "Philippines",
  US: "United States",
  CA: "Canada",
};


export const AddressScreen = () => {
  const { user, userType, setUserMDB } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  //jobseeker+s
  const userPath = userType + 's'

  const [countryQuery, setCountryQuery] = useState("");
  const [provinceQuery, setProvinceQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [postal, setPostal] = useState("");

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // --- Countries
  const countryList = [...new Set(locations.map((l: any) => l.country))].map(
    (code) => ({
      code,
      name: COUNTRY_LABELS[code] || code,
    })
  );
  const filteredCountries = countryList.filter((c) =>
    c.name.toLowerCase().includes(countryQuery.toLowerCase())
  );

  // --- Provinces
  const provinces = selectedCountry
    ? [
      ...new Set(
        locations
          .filter((l: any) => l.country === selectedCountry)
          .map((l: any) => l.province)
      ),
    ]
    : [];
  const filteredProvinces = provinces.filter((p) =>
    p.toLowerCase().includes(provinceQuery.toLowerCase())
  );

  // --- Cities
  const cities =
    selectedCountry && selectedProvince
      ? [
        ...new Set(
          locations
            .filter(
              (l: any) =>
                l.country === selectedCountry && l.province === selectedProvince
            )
            .map((l: any) => l.city)
        ),
      ]
      : [];
  const filteredCities = cities.filter((c) =>
    c.toLowerCase().includes(cityQuery.toLowerCase())
  );

  async function handleProceed() {
    if (!selectedCountry || !selectedProvince || !selectedCity || !postal) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      editType: "location",
      data: {
        country: selectedCountry,
        province: selectedProvince,
        city: selectedCity,
      }
    }
    console.log(payload)

    const res = await updateProfile(userPath, user?.uid, payload)
    if (res.success === false) {
      console.log(res.error)
      alert(res.error)
    }

    setUserMDB(res)
    alert(res.message)
  };

  const renderInput = (
    label: string,
    query: string,
    setQuery: (val: string) => void,
    selected: string | null,
    setSelected: (val: string | null) => void,
    data: string[] | { code: string; name: string }[],
    onSelect: (val: any) => void,
    placeholder: string,
    keyExtractor: (item: any) => string,
    getLabel: (item: any) => string
  ) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, selected && { color: "#555" }]}
          value={selected || query}
          editable={!selected}
          onChangeText={(t) => {
            setSelected(null);
            setQuery(t);
          }}
          placeholder={placeholder}
        />
        {selected && (
          <Pressable
            style={styles.clearBtn}
            onPress={() => {
              setSelected(null);
              setQuery("");
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#666" }}>✕</Text>
          </Pressable>
        )}
      </View>
      {!selected && query.length > 0 && (
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => (
            <Pressable
              style={styles.suggestion}
              onPress={() => onSelect(item)}
            >
              <Text>{getLabel(item)}</Text>
            </Pressable>
          )}
        />
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Where are you located?</Text>

      {renderInput(
        "Country",
        countryQuery,
        setCountryQuery,
        selectedCountry,
        setSelectedCountry,
        filteredCountries,
        (item) => {
          setSelectedCountry(item.code);
          setCountryQuery(item.name);
          setSelectedProvince(null);
          setProvinceQuery("");
          setSelectedCity(null);
          setCityQuery("");
          setPostal("");
        },
        "Type country...",
        (item) => item.code,
        (item) => item.name
      )}

      {selectedCountry &&
        renderInput(
          "Province",
          provinceQuery,
          setProvinceQuery,
          selectedProvince,
          setSelectedProvince,
          filteredProvinces,
          (item) => {
            setSelectedProvince(item);
            setProvinceQuery(item);
            setSelectedCity(null);
            setCityQuery("");
            setPostal("");
          },
          "Type province...",
          (item) => item,
          (item) => item
        )}

      {selectedProvince &&
        renderInput(
          "City",
          cityQuery,
          setCityQuery,
          selectedCity,
          setSelectedCity,
          filteredCities,
          (item) => {
            setSelectedCity(item);
            setCityQuery(item);
            setPostal("");
          },
          "Type city...",
          (item) => item,
          (item) => item
        )}

      {/* Postal is free input */}
      {selectedCity && (
        <>
          <Text style={styles.label}>Postal Code</Text>
          <TextInput
            style={styles.input}
            value={postal}
            onChangeText={setPostal}
            placeholder="Enter postal code..."
            keyboardType="numeric"
            maxLength={4}
          />
        </>
      )}

      <Pressable style={styles.button} onPress={handleProceed}>
        <Text style={styles.buttonText}>Proceed</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6C63FF",
    marginBottom: 20,
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  inputWrapper: { position: "relative" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    paddingRight: 32,
  },
  clearBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  suggestion: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  button: {
    marginTop: 30,
    backgroundColor: "#6C63FF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
