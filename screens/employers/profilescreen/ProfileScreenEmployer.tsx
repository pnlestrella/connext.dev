import { Text, View, Pressable, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "navigation/types/RootStackParamList";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "context/auth/AuthHook";

// Header icons
import { Settings, SendHorizonal, Star, LogOut } from "lucide-react-native";
import { useState } from "react";
import ConfirmationModal from "components/ConfirmationModal";

type NavigationType = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreenEmployer = () => {
  const { userMDB, signOutUser } = useAuth();
  const navigation = useNavigation<NavigationType>();

  console.log(userMDB,'awaw')

  // Modal state
  const [logoutVisible, setLogoutVisible] = useState(false);

  const handleLogoutConfirm = async () => {
    try {
      await signOutUser();
      setLogoutVisible(false);
      alert("Signed out successfully");
      navigation.navigate("login");
    } catch (err) {
      alert("Failed to sign out. Try again.");
      console.error(err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white mt-10">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
      >
        {/* Profile Image */}
        <View className="justify-center items-center">
          <View className="border rounded-full w-32 h-32 overflow-hidden">
            <Image
              source={{ uri: userMDB?.profilePic }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
          <Text
            style={{
              fontFamily: "Poppins-Bold",
              fontSize: 21,
              color: "#37421F",
              marginTop: 12,
            }}
          >
            {userMDB?.companyName}
          </Text>
        </View>

        {/* Profile Title */}
        <View className="flex-row justify-between items-center" style={{ marginTop: 24 }}>
          <Text
            style={{
              fontFamily: "Poppins-Bold",
              fontSize: 24,
              color: "#37424F",
            }}
          >
            Your Profile
          </Text>

          <Pressable
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 16, // rounded pill
              justifyContent: "center",
              alignItems: "center",
            }}
            android_ripple={{ color: "rgba(0,0,0,0.1)" }}
            onPress={() => {
              navigation.navigate("editProfile");
            }}
          >
            <Text
              style={{
                fontFamily: "Poppins-SemiBold",
                fontSize: 12,
                color: "#007AFF",
              }}
            >
              Edit Profile
            </Text>
          </Pressable>
        </View>

        {/* Profile Info */}
        <View style={{ marginTop: 16 }}>
          <View className="flex-row items-center" style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: "Lexend-Regular", fontSize: 14, width: 100 }}>Profile</Text>
            <Text
              style={{
                fontFamily: "Lexend-Regular",
                fontSize: 14,
                color: "#747474",
                flex: 1,
                textAlign: "right",
              }}
              numberOfLines={1}
            >
              {userMDB?.companyName}
            </Text>
          </View>

          {/* Industry */}
          <View className="flex-row items-center" style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: "Lexend-Regular", fontSize: 14, width: 100 }}>Industry</Text>
            <Text
              style={{
                fontFamily: "Lexend-Regular",
                fontSize: 14,
                color: "#747474",
                flex: 1,
                textAlign: "right",
              }}
              numberOfLines={2}
            >
              {userMDB?.industries?.join(", ")}
            </Text>
          </View>

          {/* Location */}
          <View className="flex-row items-center" style={{ marginBottom: 8 }}>
            <Text style={{ fontFamily: "Lexend-Regular", fontSize: 14, width: 100 }}>Location</Text>
            <Text
              style={{
                fontFamily: "Lexend-Regular",
                fontSize: 14,
                color: "#747474",
                flex: 1,
                textAlign: "right",
              }}
              numberOfLines={1}
            >
              {userMDB?.location?.display_name}
            </Text>
          </View>

          {/* Email */}
          <View className="flex-row items-center">
            <Text style={{ fontFamily: "Lexend-Regular", fontSize: 14, width: 100 }}>Email</Text>
            <Text
              style={{
                fontFamily: "Lexend-Regular",
                fontSize: 14,
                color: "#747474",
                flex: 1,
                textAlign: "right",
              }}
              numberOfLines={1}
            >
              {userMDB?.email}
            </Text>
          </View>
        </View>

        {/* Miscellaneous Section */}
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              fontFamily: "Lexend-SemiBold",
              fontSize: 18,
              color: "#37424F",
              marginBottom: 12,
            }}
          >
            Miscellaneous
          </Text>

          <View className="space-y-2 justify-between">
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: "Lexend-Regular", fontSize: 14, width: 100 }}>
                Settings
              </Text>
              <Settings width={20} color={"#37424F"} />
            </View>
          </View>

          <View className="space-y-2 justify-between" style={{ marginTop: 12 }}>
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: "Lexend-Regular", fontSize: 14, width: 200 }}>
                Send us feedback
              </Text>
              <SendHorizonal width={20} color={"#37424F"} />
            </View>
          </View>

          <View className="space-y-2 justify-between" style={{ marginTop: 12 }}>
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: "Lexend-Regular", fontSize: 14, width: 200 }}>
                Give us Rating
              </Text>
              <Star width={20} color={"#37424F"} />
            </View>
          </View>
        </View>

        {/* Exit Section */}
        <View style={{ marginTop: 32, marginBottom: 12 }}>
          <Text
            style={{
              fontFamily: "Lexend-SemiBold",
              fontSize: 18,
              color: "#37424F",
              marginBottom: 12,
            }}
          >
            Exit
          </Text>

          <Pressable
            className="flex-row items-center justify-between"
            onPress={() => setLogoutVisible(true)}
          >
            <Text style={{ fontFamily: "Lexend-Bold", fontSize: 14, width: 100 }}>Logout</Text>
            <LogOut width={20} color={"#37424F"} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <ConfirmationModal
        visible={logoutVisible}
        type="logout"
        title="Logout"
        message="Are you sure you want to log out of your account?"
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleLogoutConfirm}
      />
    </SafeAreaView>
  );
};
