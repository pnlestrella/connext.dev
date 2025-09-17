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
    TextInput
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { OTPModal } from 'components/OTP.modal';
import { useAuth } from 'context/auth/AuthHook';

//firebase imports
import { userRegister } from 'firebase/firebaseAuth';
import { Loading } from 'components/Loading';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PickedFile {
    uri: string;
    name: string;
    mimeType: string;
    size?: number;
}

export const EmployerRegisterScreen = () => {
    const { setLoading, userType, loading } = useAuth();

    //Navigation
    const navigation = useNavigation<NavigationProp>();

    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    // OTP modal
    const [showOTP, setShowOTP] = useState(false);


    // FILE states
    const [documents, setDocuments] = useState<PickedFile[]>([]);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const MAX_FILES = 3;

    // Pick a file
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
                await FileSystem.copyAsync({
                    from: file.uri,
                    to: localUri,
                });

                validFiles.push({ ...file, uri: localUri } as PickedFile);
            }

            setDocuments((prev) => [...prev, ...validFiles]);
        } catch (err) {
            console.log("Error picking file:", err);
        }
    };

    // Open file
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

    // Remove file
    const removeFile = (index: number) => {
        setDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    // Get file icon
    const getIcon = (mimeType: string) => {
        if (mimeType?.includes("pdf")) {
            return require("../../assets/images/pdf-icon.png");
        }
        if (mimeType?.includes("image")) {
            return require("../../assets/images/image-icon.png");
        }
        return require("../../assets/images/file-icon.png");
    };

    // Upload files to ImageKit
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
                    formData.append("folder", "/resumes");         


                    const res = await fetch(
                        "https://upload.imagekit.io/api/v1/files/upload",
                        {
                            method: "POST",
                            headers: { "Content-Type": "multipart/form-data" },
                            body: formData,
                        }
                    );
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
            alert("All files uploaded!");
            return uploadedUrls
        } catch (err) {
            console.error("Upload error:", err);
            Alert.alert("Upload failed. Please try again.");
        }
    };


    async function handleSubmit() {
        // trim inputs
        const trimmedEmail = email.trim();
        const trimmedCompanyName = companyName.trim();

        // --- Email validation ---
        if (!trimmedEmail) {
            alert("Email is required.");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            alert("Please enter a valid email address.");
            return;
        }

        // --- Company name validation ---
        if (!trimmedCompanyName) {
            alert("Company name is required.");
            return;
        }
        if (trimmedCompanyName.length < 3) {
            alert("Company name must be at least 3 characters long.");
            return;
        }

        // --- Documents validation ---
        if (!documents || documents.length === 0) {
            alert("At least one document must be uploaded.");
            return;
        }

        // --- Password validation ---
        if (!password) {
            alert("Password is required.");
            return;
        }
        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        // --- Confirm password validation ---
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        //show OTP modal
        setShowOTP(true)
    }


   async function onVerify() {
        setLoading(true)
        alert("verified")
           //Registration of the EMPLOYER
        try {
            //uploading the company documents to ImageKIT
            const uploadedURLS = await uploadAllDocuments();
            // firebase AUTH registration
            const firebaseRegister = await userRegister(email, password)
            const firebaseUserUID =  firebaseRegister.user.uid
            //MongoDB Employer Registration

            const urls = []

            for(let i = 0 ; i < uploadedURLS.length; i++){
                urls.push(uploadedURLS[i].filePath)
            }

            console.log(urls,'urls')

            const user = {
                employerUID: firebaseUserUID,
                email,
                companyName,
                verificationDocs: urls
            };


            const mongoDBRegister =  await fetch(
                `${Constants?.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/registerEmployers`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(user)
                })

            console.log(mongoDBRegister, '----------------------')
            alert("successfully created the account")
            setLoading(false)
        } catch (err) {
            alert(err);
            setLoading(false)
            return
        }
    }

    return (
        <View className="flex-1 bg-white py-10">
             {loading &&
                    <View className='absolute inset-0 z-50' style={{ backgroundColor: '#fff5f5', opacity: 0.5 }}>
                      <Loading/>
                    </View>
                  }

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
                        <Text style={style.subHeaderText}>
                            Find your employees with one swipe
                        </Text>
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
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Company Name */}
                    <View className="mb-4">
                        <Text style={style.fieldHeader}>Company Name</Text>
                        <TextInput
                            style={style.textInput}
                            placeholder="Ateneo de Naga University"
                            value={companyName}
                            onChangeText={setCompanyName}
                        />
                    </View>

                    {/* Documents */}
                    <View className="mb-4">
                        <Text style={style.fieldHeader}>
                            Company Documents (Required for verification)
                        </Text>
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
                                    <Text
                                        style={{ fontSize: 10, flexShrink: 1 }}
                                        numberOfLines={1}
                                    >
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
                        <TextInput
                            style={style.textInput}
                            placeholder="Create a password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    {/* Confirm Password */}
                    <View className="mb-4">
                        <Text style={style.fieldHeader}>Confirm Password</Text>
                        <TextInput
                            style={style.textInput}
                            placeholder="Confirm your password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>

            
                    <View style={{ height: 10 }} />
                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="bg-[#6C63FF] px-6 py-4 rounded-xl w-full"
                    >
                        <Text className="text-white font-bold text-center">Proceed</Text>
                    </TouchableOpacity>
                    <Text className="mt-4 text-center">
                        Already have an account?{' '}
                        <Text
                            className="text-[#6C63FF] font-bold"
                            onPress={() => navigation.navigate('login')}
                        >
                            Sign In here
                        </Text></Text>
                </View>
            </View>
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
    },
});
