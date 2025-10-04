import React, { useState } from "react";
import { StyleSheet, Text, View, Image, Pressable, Dimensions, Linking, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/types/RootStackParamList";
import AlertModal from "components/AlertModal";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get("window");

const TERMS_URL = ""; // keep empty until live

export const RegistrationConfirmationScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  // AlertModal state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("Alert");
  const [alertMessage, setAlertMessage] = useState("");

  const openAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleUnderstand = () => {
    // Redirect as needed (consider routing to a pending dashboard instead of login)
    navigation.navigate("login");
  };

  const handleTerms = async () => {
    // 1) Guard when URL not set
    if (!TERMS_URL) {
      openAlert(
        "Terms & Conditions unavailable",
        "This page isn’t ready yet. Please check back soon or contact support if anything needs clarification."
      );
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(TERMS_URL);
      if (!canOpen) {
        openAlert(
          "Couldn’t open link",
          "We couldn’t open the Terms & Conditions right now. Please try again later."
        );
        return;
      }
      await Linking.openURL(TERMS_URL);
    } catch {
      openAlert(
        "Couldn’t open link",
        "We couldn’t open the Terms & Conditions right now. Please try again later."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Image
          source={require("../../assets/images/app_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Title */}
        <Text style={styles.title}>Thank you for registering!</Text>

        {/* Body copy */}
        <View style={styles.paragraphs}>
          <Text style={styles.body}>
            Please wait while we verify your status as an Employer. As a platform that provides opportunities, it is important that we be careful in verifying our Employers.
          </Text>
          <Text style={styles.body}>
            After verification, we will be sending you an email regarding your status.
          </Text>
          <Text style={styles.body}>Thank you!</Text>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomArea}>
        <Pressable onPress={handleUnderstand} style={styles.cta} android_ripple={{ color: "rgba(0,0,0,0.08)" }}>
          <Text style={styles.ctaText}>I understand</Text>
        </Pressable>

        <Pressable onPress={handleTerms} hitSlop={8} style={styles.termsWrap}>
          <Text style={styles.termsText}>
            Read our terms and conditions <Text style={styles.link}>here</Text>.
          </Text>
        </Pressable>
      </View>

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

const P = {
  primary: "#6C63FF",
  text: "#111827",
  subtext: "#6B7280",
  bg: "#FFFFFF",
  muted: "#9CA3AF",
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  logo: {
    width: 220,
    height: 80,
    marginTop: 8,
    marginBottom: 20,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 22,
    color: P.text,
    textAlign: "left",
    width: "100%",
    marginTop: 8,
    marginBottom: 14,
  },
  paragraphs: {
    width: "100%",
  },
  body: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    lineHeight: 22,
    color: P.subtext,
    marginBottom: 12,
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  cta: {
    width: 200,
    height: 44,
    borderRadius: 12,
    backgroundColor: P.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  ctaText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  termsWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  termsText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: P.subtext,
    textAlign: "center",
  },
  link: {
    color: P.primary,
    fontFamily: "Poppins-SemiBold",
  },
});
