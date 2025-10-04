import { useState } from 'react';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import {
  Linking,
  Platform,
  Pressable,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { OTPModal } from 'components/OTP.modal';
import { useAuth } from 'context/auth/AuthHook';
// firebase
import { userRegister } from 'firebase/firebaseAuth';
import { Loading } from 'components/Loading';
// icons (replace with your icon lib if different)
import { Eye, EyeOff } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

export const EmployerRegisterScreen = () => {
  const { setLoading, userType, loading } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // show/hide toggles
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [showOTP, setShowOTP] = useState(false);

  const [documents, setDocuments] = useState<PickedFile[]>([]);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const MAX_FILES = 3;

  const pickFile = async () => {
    try {
      if (documents.length >= MAX_FILES) {
        Alert.alert(`You can only upload up to ${MAX_FILES} documents.`);
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/png", "image/jpeg"],
        multiple: true,
      });

      if (!result.assets?.length) return;

      if (documents.length + result.assets.length > MAX_FILES) {
        Alert.alert(`You can only upload up to ${MAX_FILES} documents.`);
        return;
      }

      const validFiles: PickedFile[] = [];

      for (const file of result.assets) {
        if (file.size && file.size > MAX_FILE_SIZE) {
          Alert.alert(`File ${file.name} is too large. Max size is 5MB`);
          return;
        }

        const localUri = FileSystem.cacheDirectory + file.name;
        await FileSystem.copyAsync({ from: file.uri, to: localUri });

        validFiles.push({ ...file, uri: localUri } as PickedFile);
      }

      setDocuments((prev) => [...prev, ...validFiles]);
    } catch (err) {
      console.log("Error picking file:", err);
    }
  };

  const openFile = async (uri: string, mimeType: string) => {
    if (Platform.OS === "android") {
      const cUri = await FileSystem.getContentUriAsync(uri);
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: cUri,
        flags: 1,
        type: mimeType || "*/*",
      });
    } else {
      await Linking.openURL(uri);
    }
  };

  const removeFile = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const getIcon = (mimeType: string) => {
    if (mimeType?.includes("pdf")) return require("../../assets/images/pdf-icon.png");
    if (mimeType?.includes("image")) return require("../../assets/images/image-icon.png");
    return require("../../assets/images/file-icon.png");
  };

  const uploadAllDocuments = async () => {
    if (!documents || documents.length === 0) {
      Alert.alert("No files to upload.");
      return;
    }

    try {
      const uploadedUrls = await Promise.all(
        documents.map(async (file) => {
          const getUploadKeys = async () => {
            const res = await fetch(
              `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/imagekit/getUploadKeys`
            );
            return res.json();
          };

          const { message, public_key } = await getUploadKeys();
          const authParams = message;

          const formData = new FormData();
          formData.append("file", {
            uri: file.uri,
            name: file.name,
            type: file.mimeType,
          } as unknown as Blob);
          formData.append("fileName", file.name);
          formData.append("isPrivateFile", "true");
          formData.append("signature", authParams.signature);
          formData.append("expire", authParams.expire.toString());
          formData.append("token", authParams.token);
          formData.append("publicKey", public_key);
          formData.append("folder", "/verifications");

          const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
            method: "POST",
            headers: { "Content-Type": "multipart/form-data" },
            body: formData,
          });
          const data = await res.json();
          if (data.fileId) {
            const urlObj = new URL(data.url);
            const pathParts = urlObj.pathname.split("/");
            pathParts.shift();
            pathParts.shift();
            const filePath = "/" + pathParts.join("/");
            return { fileId: data.fileId, url: data.url, filePath };
          } else {
            throw new Error(data.error?.message || "Upload failed");
          }
        })
      );

      console.log("Uploaded files:", uploadedUrls);
      Alert.alert("Success", "All files uploaded!");
      return uploadedUrls;
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Upload failed. Please try again.");
    }
  };

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    const trimmedCompanyName = companyName.trim();

    if (!trimmedEmail) return Alert.alert("Email is required.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) return Alert.alert("Please enter a valid email address.");

    if (!trimmedCompanyName) return Alert.alert("Company name is required.");
    if (trimmedCompanyName.length < 3) return Alert.alert("Company name must be at least 3 characters long.");

    if (!documents || documents.length === 0) return Alert.alert("At least one document must be uploaded.");

    if (!password) return Alert.alert("Password is required.");
    if (password.length < 6) return Alert.alert("Password must be at least 6 characters long.");

    if (password !== confirmPassword) return Alert.alert("Passwords do not match.");

    setShowOTP(true);
  }

  async function onVerify() {
    try {
      setLoading(true);
      // 1) Upload docs
      const uploadedURLS = await uploadAllDocuments();
      // 2) Firebase auth
      const firebaseRegister = await userRegister(email, password);
      const firebaseUserUID = firebaseRegister.user.uid;

      // 3) Gather file paths
      const urls: string[] = [];
      if (uploadedURLS?.length) {
        for (let i = 0; i < uploadedURLS.length; i++) {
          urls.push(uploadedURLS[i].filePath);
        }
      }

      // 4) MongoDB Employer
      const user = { employerUID: firebaseUserUID, email, companyName };
      const verification = { employerUID: firebaseUserUID, verificationDocs: urls };

      await fetch(`${Constants?.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/registerEmployers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      await fetch(`${Constants?.expoConfig?.extra?.BACKEND_BASE_URL}/api/admins/submitVerification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verification),
      });

      Alert.alert("Success", "Successfully created the account");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">
      {loading && (
        <View className="absolute inset-0 z-50" style={{ backgroundColor: '#fff5f5', opacity: 0.5 }}>
          <Loading />
        </View>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 12}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 28 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center justify-center pt-6 mt-10 px-10">
            {/* Header */}
            <View className="flex-row items-center w-full max-w-md">
              <Image
                source={require("../../assets/images/justLogo.png")}
                className="w-20 h-20"
                resizeMode="contain"
              />
              <View className="ml-4 flex-1">
                <Text style={style.titleText}>Create an account</Text>
                <Text style={style.subHeaderText}>Find your employees with one swipe</Text>
              </View>
            </View>

            {/* Form */}
            <View className="w-full max-w-md mt-8">
              {/* Email */}
              <View className="mb-4">
                <Text style={style.fieldHeader}>Email</Text>
                <TextInput
                  style={style.textInput}
                  placeholder="companyname@gmail.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                />
              </View>

              {/* Company Name */}
              <View className="mb-4">
                <Text style={style.fieldHeader}>Company Name</Text>
                <TextInput
                  style={style.textInput}
                  placeholder="Ateneo de Naga University"
                  placeholderTextColor="#9CA3AF"
                  value={companyName}
                  onChangeText={setCompanyName}
                  returnKeyType="next"
                />
              </View>

              {/* Documents */}
              <View className="mb-4">
                <Text style={style.fieldHeader}>Company Documents (Required for verification)</Text>
                <Pressable
                  onPress={pickFile}
                  className="border border-gray-300 rounded-md p-3 bg-gray-100"
                >
                  <Text className="text-gray-700">Upload Documents</Text>
                </Pressable>
              </View>

              {/* File List */}
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {documents.map((file, i) => (
                  <View
                    key={i}
                    style={{
                      width: 100,
                      margin: 4,
                      padding: 6,
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 8,
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <Pressable
                      style={{ flexDirection: "row", alignItems: "center" }}
                      onPress={() => openFile(file.uri, file.mimeType)}
                    >
                      <Image
                        source={getIcon(file.mimeType)}
                        style={{ width: 16, height: 16, marginRight: 6 }}
                        resizeMode="contain"
                      />
                      <Text style={{ fontSize: 10, flexShrink: 1 }} numberOfLines={1}>
                        {file.name}
                      </Text>
                    </Pressable>

                    <TouchableOpacity
                      onPress={() => removeFile(i)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "#ff4444",
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 10 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Password */}
              <View className="mb-4">
                <Text style={style.fieldHeader}>Password</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={[style.textInput, styles.textInputNoBorder]}
                    placeholder="Create a password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPass}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable onPress={() => setShowPass((p) => !p)} hitSlop={8} style={styles.eyeBtn}>
                    {showPass ? <Eye size={20} color="#37424F" /> : <EyeOff size={20} color="#9CA3AF" />}
                  </Pressable>
                </View>
              </View>

              {/* Confirm Password */}
              <View className="mb-4">
                <Text style={style.fieldHeader}>Confirm Password</Text>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={[style.textInput, styles.textInputNoBorder]}
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPass}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <Pressable onPress={() => setShowConfirmPass((p) => !p)} hitSlop={8} style={styles.eyeBtn}>
                    {showConfirmPass ? <Eye size={20} color="#37424F" /> : <EyeOff size={20} color="#9CA3AF" />}
                  </Pressable>
                </View>
              </View>

              <View style={{ height: 10 }} />
              <TouchableOpacity onPress={handleSubmit} className="bg-[#6C63FF] px-6 py-4 rounded-xl w-full">
                <Text className="text-white font-bold text-center">Proceed</Text>
              </TouchableOpacity>

              <Text className="mt-4 text-center">
                Already have an account?{' '}
                <Text className="text-[#6C63FF] font-bold" onPress={() => navigation.navigate('login')}>
                  Sign In here
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* OTP Modal */}
      <OTPModal
        loading={loading}
        setLoading={setLoading}
        userType={userType}
        email={email}
        onVerify={onVerify}
        visible={showOTP}
        onClose={() => setShowOTP(false)}
        onSubmit={() => setShowOTP(false)}
      />
    </View>
  );
};

const style = StyleSheet.create({
  titleText: {
    fontFamily: "Lexend-Bold",
    fontSize: 24,
    marginBottom: 2,
    color: "#000000",
  },
  subHeaderText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#A1A1A1",
  },
  fieldHeader: {
    fontFamily: "Lexend-Bold",
    color: "#37424F",
    fontSize: 14,
    marginBottom: 6,
  },
  textInput: {
    fontFamily: "Poppins-Regular",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    color: "#000",
  },
});

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingRight: 8,
    backgroundColor: "#fff",
  },
  textInputNoBorder: {
    borderWidth: 0,
    flex: 1,
    paddingRight: 8,
  },
  eyeBtn: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
