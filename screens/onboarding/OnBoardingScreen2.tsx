import { StyleSheet, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from 'navigation/types/RootStackParamList'
import { useNavigation } from "@react-navigation/native";

import { Button } from "components/Button";
import { useAuth } from "context/auth/AuthHook";

export default function OnboardingScreen2() {
  const {setFirstLaunch} = useAuth()

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  return (
    <SafeAreaView className="flex-1 items-center px-5 bg-white">
      {/* Header Section */}
      <View className="flex-row items-center justify-between w-full my-8">
        <Text style={styles.titleText}>
          Welcome to{"\n"}
          <Text style={styles.highlight}>connext</Text>
        </Text>
        <Image
          source={require("../../assets/images/justLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Introduction Text */}
      <Text style={styles.subHeaderText}>
        Please follow these guidelines so that both sides are satisfied.
      </Text>

      {/* Guidelines List */}
      <View className="w-full space-y-6">
        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineHeader}>Be professional.</Text>
          <Text style={styles.guidelineText}>
            When talking to each other, maintain a level of courtesy.
          </Text>
        </View>

        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineHeader}>Protect your privacy.</Text>
          <Text style={styles.guidelineText}>
            Be careful in sharing any personal details.
          </Text>
        </View>

        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineHeader}>Show interest.</Text>
          <Text style={styles.guidelineText}>
            Engage with each other. Both sides will only benefit if there&apos;s an
            agreement.
          </Text>
        </View>

        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineHeader}>Report any issues.</Text>
          <Text style={styles.guidelineText}>
            If you encounter any issues, report it to our team to maintain the
            level of professionalism in the community.
          </Text>
        </View>
      </View>

      {/* Proceed Button */}
      <Button title="Let's get started!" onPress={() => setFirstLaunch(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleText: {
    fontFamily: "Lexend-Medium",
    fontSize: 24,
    fontWeight: "500",
  },
  highlight: {
    color: "#6C63FF",
  },
  logo: {
    width: 80,
    height: 80,
  },
  subHeaderText: {
    fontFamily: "Poppins-Medium",
    color: "#1A1A2E",
    textAlign: "center",
    marginHorizontal: 40,
    marginBottom: 20,
  },
  guidelineCard: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
  },
  guidelineHeader: {
    fontFamily: "Poppins-Bold",
    marginBottom: 2,
  },
  guidelineText: {
    fontFamily: "Poppins-Regular",
    color: "#4B5563",
  },
});
