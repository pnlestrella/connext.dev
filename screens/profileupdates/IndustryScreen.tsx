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
import { Button } from "components/Button";
import { Industries } from "../../data/industries.json";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Industry = { name: string; id: number };

export const IndustryScreen = () => {
  const { user, userType, setUserMDB } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const userPath = userType + "s";
  const [selected, setSelected] = useState<Industry[]>([]);
  const [search, setSearch] = useState("");

  function handleSelect(industry: Industry) {
    setSelected((prev) => {
      const exists = prev.some((item) => item.name === industry.name);
      if (exists) {
        return prev.filter((item) => item.name !== industry.name);
      } else if (prev.length >= 3) {
        alert("⚠️ You can only pick up to 3 industries");
        return prev;
      } else {
        return [...prev, industry];
      }
    });
  }

  async function handleSubmit() {
    if (selected.length < 1) {
      alert("⚠️ Please select at least one industry");
      return;
    }

    const data: string[] = selected.map((item) => item.name);
    const payload = {
      editType: "industries",
      data,
    };

    const res = await updateProfile(userPath, user?.uid, payload);
    if (res.success === false) {
      alert(res.error);
      return;
    }

    setUserMDB(res);
    alert("✅ Successfully added industries");
  }

  const filtered = Industries.filter((ind) =>
    ind.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Which industry are you in?</Text>
          <Text style={styles.subtitle}>
            Knowing your industry helps us show you the right opportunities.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Search industry..."
            value={search}
            onChangeText={setSearch}
          />

          {/* Selected tags */}
          {selected.length > 0 && (
            <View style={styles.selectedContainer}>
              {selected.map((item) => (
                <Pressable
                  key={item.id.toString()}
                  onPress={() => handleSelect(item)}
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>{item.name}</Text>
                  <Text style={styles.tagRemove}>×</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.helperText}>
            Select up to 3 industries you belong to:
          </Text>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = selected.some((sel) => sel.id === item.id);
              return (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        <Pressable style={styles.button} onPress={handleSubmit}>
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
    marginBottom: 10,
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
    marginBottom: 10,
  },
  selectedContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 4,
  },
  tagText: {
    color: "white",
    marginRight: 5,
    fontSize: 14,
  },
  tagRemove: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 16,
  },
  helperText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  option: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  optionSelected: {
    backgroundColor: "#6C63FF",
    borderColor: "#6C63FF",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  optionTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#6C63FF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
