import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "components/Button";
import { useAuth } from "context/auth/AuthHook";
import { updateProfile } from "api/profile";
import { generateProfileSummary } from "api/groq/groqAPI";
import AlertModal from "components/AlertModal";
import { Loading } from "components/Loading";

const BRAND_PURPLE = "#6D28D9";
const BRAND_PURPLE_DARK = "#5B21B6";
const BRAND_PURPLE_LIGHT = "#8B5CF6";

export const ProfileSummaryScreen = () => {
  const { user, userType, userMDB, setUserMDB } = useAuth();
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const userPath = userType + "s";

  // Alert Modal state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("Alert");
  const [alertMessage, setAlertMessage] = useState("");
  const [onSuccessAction, setOnSuccessAction] = useState<(() => void) | null>(null);

  // Save profile summary handler with modal instead of alert
  async function handleSave() {
    if (!summary.trim()) {
      setAlertTitle("Validation error");
      setAlertMessage("Please enter your profile summary");
      setAlertVisible(true);
      setOnSuccessAction(null);
      return;
    }
    try {
      setLoading(true);
      const payload = { editType: "profileSummary", data: summary.trim() };
      const res = await updateProfile(userPath, user?.uid, payload);
      setUserMDB(res);
      setAlertTitle("Success");
      setAlertMessage("Profile summary updated successfully!");
      setAlertVisible(true);
      setOnSuccessAction(() => () => {
        // You can optionally execute navigation or other actions here
      });
    } catch (err) {
      console.error(err);
      setAlertTitle("Save error");
      setAlertMessage("Failed to update summary. Try again.");
      setAlertVisible(true);
      setOnSuccessAction(null);
    } finally {
      setLoading(false);
      Keyboard.dismiss();
    }
  }

  // Generate AI summary handler with modal error feedback
  async function handleGenerateAI() {
    if (generating) return;
    setGenerating(true);

    try {
      const name =
        userMDB.fullName.firstName +
          " " +
          userMDB.fullName.middleInitial +
          " " +
          userMDB.fullName.lastName || "Your name here";
      const skills = userMDB.skills; // can make dynamic

      const generatedText = await generateProfileSummary(name, skills);

      if (generatedText && generatedText !== "Error generating profile summary.") {
        setSummary(generatedText);
      } else {
        setAlertTitle("AI Generation Failed");
        setAlertMessage("AI failed to generate a summary. Try again later.");
        setAlertVisible(true);
        setOnSuccessAction(null);
      }
    } catch (err) {
      console.error("Groq AI Error:", err);
      setAlertTitle("AI Generation Error");
      setAlertMessage("AI generation failed. Try again.");
      setAlertVisible(true);
      setOnSuccessAction(null);
    } finally {
      setGenerating(false);
    }
  }

  // Alert modal OK handler triggers success action or nothing
  function handleAlertClose() {
    setAlertVisible(false);
    if (onSuccessAction) {
      onSuccessAction();
      setOnSuccessAction(null);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text style={styles.title}>Profile Summary</Text>
          <Text style={styles.subtitle}>
            Write a short summary about yourself. This will appear on your public
            profile and help others understand your strengths and personality.
          </Text>

          <View style={styles.aiHelpBox}>
            <Text style={styles.aiHelpText}>
              Need inspiration?{" "}
              <Text style={{ fontWeight: "700", color: BRAND_PURPLE }}>
                Use AI to generate
              </Text>{" "}
              a professional and concise profile summary instantly.
            </Text>
          </View>

          <View style={styles.aiContainer}>
            <Pressable
              onPress={handleGenerateAI}
              style={({ pressed }) => [
                styles.aiButton,
                pressed && styles.aiButtonPressed,
              ]}
              disabled={loading || generating}
            >
              {generating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.aiButtonText}>✨ Generate with AI</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.textAreaContainer}>
            <TextInput
              value={summary}
              onChangeText={setSummary}
              placeholder="Write something about yourself..."
              placeholderTextColor="#9CA3AF"
              style={styles.textArea}
              multiline
              textAlignVertical="top"
              maxLength={750}
              editable={!loading && !generating}
            />

            <Text style={styles.charCount}>{summary.length}/750</Text>

            {(loading || generating) && (
              <View style={styles.inputLoader}>
                <Loading />
                <Text style={styles.loadingText}>
                  {loading ? "Saving summary..." : "Generating with AI..."}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Button
              title={loading ? "Saving..." : "Save Summary"}
              onPress={handleSave}
              disabled={loading || generating}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={handleAlertClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "700", color: BRAND_PURPLE, marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#4B5563", marginBottom: 20, lineHeight: 22 },
  aiHelpBox: {
    backgroundColor: "#F3E8FF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  aiHelpText: { color: "#4B5563", fontSize: 15, lineHeight: 20 },
  aiContainer: { marginBottom: 16 },
  aiButton: {
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 30,
    shadowColor: BRAND_PURPLE_LIGHT,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  aiButtonPressed: {
    backgroundColor: BRAND_PURPLE_DARK,
    transform: [{ scale: 0.97 }],
  },
  aiButtonText: { color: "black", fontSize: 16, fontWeight: "700" },
  textAreaContainer: {
    position: "relative",
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: "#111827",
    minHeight: 160,
  },
  charCount: {
    position: "absolute",
    bottom: 8,
    right: 16,
    fontSize: 13,
    color: "#9CA3AF",
  },
  footer: { marginTop: "auto" },
  inputLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: BRAND_PURPLE_DARK,
    fontWeight: "600",
  },
});
