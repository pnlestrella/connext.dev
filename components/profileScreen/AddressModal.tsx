import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import locations from "../../data/locations.json";

type AddressModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (address: any) => void;
  initialAddress?: any;
};

const COUNTRY_LABELS: Record<string, string> = {
  PH: "Philippines",
  US: "United States",
  CA: "Canada",
};

export const AddressModal: React.FC<AddressModalProps> = ({
  visible,
  onClose,
  onSave,
  initialAddress,
}) => {
  const [countryQuery, setCountryQuery] = useState(initialAddress?.country || "");
  const [provinceQuery, setProvinceQuery] = useState(initialAddress?.province || "");
  const [cityQuery, setCityQuery] = useState(initialAddress?.city || "");
  const [postal, setPostal] = useState(initialAddress?.postalCode || "");

  const [selectedCountry, setSelectedCountry] = useState<string | null>(initialAddress?.country || null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(initialAddress?.province || null);
  const [selectedCity, setSelectedCity] = useState<string | null>(initialAddress?.city || null);

  const countryList = [...new Set(locations.map((l: any) => l.country))].map(code => ({
    code,
    name: COUNTRY_LABELS[code] || code,
  }));
  const filteredCountries = countryList.filter(c =>
    c.name.toLowerCase().includes(countryQuery.toLowerCase())
  );

  const provinces = selectedCountry
    ? [...new Set(locations.filter((l: any) => l.country === selectedCountry).map(l => l.province))]
    : [];
  const filteredProvinces = provinces.filter(p =>
    p.toLowerCase().includes(provinceQuery.toLowerCase())
  );

  const cities =
    selectedCountry && selectedProvince
      ? [...new Set(
        locations
          .filter(l => l.country === selectedCountry && l.province === selectedProvince)
          .map(l => l.city)
      )]
      : [];
  const filteredCities = cities.filter(c =>
    c.toLowerCase().includes(cityQuery.toLowerCase())
  );

  const handleSave = () => {
    if (!selectedCountry || !selectedProvince || !selectedCity || !postal) {
      alert("Please fill all fields");
      return;
    }
    onSave({
      country: selectedCountry,
      province: selectedProvince,
      city: selectedCity,
      postalCode: postal,
    });
    onClose();
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
    getLabel: (item: any) => string,
    clearDependencies?: () => void
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
            if (clearDependencies) clearDependencies();
          }}
          placeholder={placeholder}
        />
        {(selected || query) && (
          <Pressable
            style={styles.clearBtn}
            onPress={() => {
              setSelected(null);
              setQuery("");
              if (clearDependencies) clearDependencies();
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
    <Modal visible={visible} transparent animationType="fade">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Set Your Address</Text>

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
            (item) => item.name,
            () => { // Clear dependent inputs when Country cleared
              setSelectedProvince(null);
              setProvinceQuery("");
              setSelectedCity(null);
              setCityQuery("");
              setPostal("");
            }
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
              (item) => item,
              () => { // Clear dependent inputs when Province cleared
                setSelectedCity(null);
                setCityQuery("");
                setPostal("");
              }
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
              (item) => item,
              () => { // Clear dependent inputs when City cleared
                setPostal("");
              }
            )}

          {selectedCity &&
            <View style={{ marginTop: 16 }}>
              <Text style={styles.label}>Postal Code</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={postal}
                  onChangeText={(t) => setPostal(t.replace(/[^0-9]/g, ""))} // only allow numbers
                  placeholder="Enter postal code..."
                  keyboardType="numeric"
                  maxLength={8}
                />
                {postal.length > 0 && (
                  <Pressable
                    style={styles.clearBtn}
                    onPress={() => setPostal("")}
                  >
                    <Text style={{ fontWeight: "bold", color: "#666" }}>✕</Text>
                  </Pressable>
                )}
              </View>
            </View>
          }


          <View style={{ flexDirection: "row", marginTop: 20 }}>
            <Pressable style={[styles.button, { flex: 1, marginRight: 10 }]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, { flex: 1 }]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: "#6C63FF" },
  label: { marginTop: 16, marginBottom: 6, fontWeight: "bold", color: "#1A1A1A" },
  inputWrapper: { position: "relative" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, paddingRight: 32 },
  clearBtn: { position: "absolute", right: 10, top: "50%", transform: [{ translateY: -10 }] },
  suggestion: { padding: 10, backgroundColor: "#f9f9f9", borderBottomWidth: 1, borderColor: "#eee" },
  button: { backgroundColor: "#6C63FF", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold" },
});
