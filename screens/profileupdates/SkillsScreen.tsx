import React, { useMemo, useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "components/Button";
import { useAuth } from "context/auth/AuthHook";
import { updateProfile } from "api/profile";
import Fuse from "fuse.js";
import Skills from "../../data/cleaned_skills.json"; // array of strings

// 🔹 synonyms dictionary
const synonyms: Record<string, string[]> = {
  js: ["javascript"],
  py: ["python"],
  ts: ["typescript"],
};

const fuse = new Fuse(Skills, {
  threshold: 0.3, // fuzzy tolerance
  includeScore: true,
});

export const SkillsScreen = () => {
  const { user, userType, setUserMDB } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const userPath = userType + "s";

  // 🔹 debounce search input
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

  function addSkill(skill: string) {
    if (selected.includes(skill)) return;
    if (selected.length >= 10) {
      alert("You can only select up to 10 skills");
      return;
    }
    setSelected((p) => [...p, skill]);
    setSearch("");
    Keyboard.dismiss();
  }

  function removeSkill(skill: string) {
    setSelected((p) => p.filter((s) => s !== skill));
  }

  async function handleSubmit() {
    if (selected.length < 1) {
      alert("Please select at least 1 skill");
      return;
    }
    try {
      const payload = { editType: "skills", data: selected };
      const res = await updateProfile(userPath, user?.uid, payload);
      setUserMDB(res);
      alert("Skills updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update skills. Try again.");
    }
  }

  // 🔹 expand query with synonyms
  function expandQuery(query: string) {
    const lower = query.toLowerCase();
    return [lower, ...(synonyms[lower] || [])];
  }

  // 🔹 fuzzy + prefix boosting
  const filtered = useMemo(() => {
    if (!debouncedSearch) return [];

    const queries = expandQuery(debouncedSearch);
    let results: string[] = [];

    queries.forEach((q) => {
      results = results.concat(fuse.search(q).map((r) => r.item));
    });

    // dedupe
    const unique = Array.from(new Set(results));

    // prefix boosting
    unique.sort((a, b) => {
      const q = debouncedSearch.toLowerCase();
      const aStarts = a.toLowerCase().startsWith(q);
      const bStarts = b.toLowerCase().startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;
      return a.localeCompare(b);
    });

    return unique.slice(0, 8);
  }, [debouncedSearch, selected]);

  // 🔹 highlight component
  function Highlighted({ text, query }: { text: string; query: string }) {
    if (!query) return <Text>{text}</Text>;
    const regex = new RegExp(`(${query})`, "i");
    const parts = text.split(regex);
    return (
      <Text>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <Text key={i} style={{ fontWeight: "700", color: "#6D28D9" }}>
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add your skills</Text>
      <Text style={styles.subtitle}>
        Select up to 10 skills that describe you. These help us match you with
        better opportunities.
      </Text>

      {/* Selected skills as chips */}
      <View style={styles.chipsContainer}>
        {selected.length === 0 ? (
          <Text style={styles.helperText}>No skills selected yet</Text>
        ) : (
          selected.map((skill) => (
            <View key={skill} style={styles.chip}>
              <Text style={styles.chipText}>{skill}</Text>
              <Pressable
                onPress={() => removeSkill(skill)}
                style={styles.chipClose}
                android_ripple={{ color: "#ffffff55", borderless: true }}
              >
                <Text style={styles.chipCloseText}>×</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      {/* Search input */}
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search a skill..."
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        autoCorrect={false}
        returnKeyType="done"
      />

      {/* Dropdown suggestions */}
      {search.length > 0 && (
        <View style={styles.dropdown}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={BRAND_PURPLE} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : filtered.length > 0 ? (
            <ScrollView
              style={{ maxHeight: 250 }}
              keyboardShouldPersistTaps="handled"
            >
              {filtered.map((skill, idx) => (
                <Pressable
                  key={skill}
                  onPress={() => addSkill(skill)}
                  android_ripple={{ color: "#EDE9FE" }}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    pressed && styles.dropdownItemPressed,
                    idx === filtered.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Text style={styles.dropdownText}>
                    <Highlighted text={skill} query={debouncedSearch} />
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No results found</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          onPress={handleSubmit}
          title={`Save Skills (${selected.length}/10)`}
          disabled={selected.length < 1}
        />
      </View>
    </SafeAreaView>
  );
};

const BRAND_PURPLE = "#6D28D9";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "700", color: "#6C63FF", marginBottom: 8 },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 20,
    lineHeight: 22,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    minHeight: 44,
  },
  helperText: { color: "#9CA3AF", fontSize: 15 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_PURPLE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    marginBottom: 10,
    elevation: 3,
  },
  chipText: { color: "#fff", fontSize: 16, fontWeight: "500", marginRight: 8 },
  chipClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff22",
  },
  chipCloseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: Platform.OS === "ios" ? 20 : 18,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 17,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  dropdown: {
    backgroundColor: "#fff",
    padding:10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 10,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 50,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemPressed: {
    backgroundColor: "#F3F4F6",
  },
  dropdownText: { fontSize: 17, color: "#111827", fontWeight: "500" },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginLeft: 10,
    color: "#6B7280",
    fontSize: 15,
  },
  noResults: { padding: 16 },
  noResultsText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontStyle: "italic",
  },
  footer: { marginTop: "auto" },
});
