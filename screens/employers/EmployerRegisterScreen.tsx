import { useState } from 'react';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as IntentLauncher from "expo-intent-launcher";
import {
    Button,
    Linking,
    Platform,
    Pressable,
    Text,
    View,
    Image,
    TouchableOpacity,
    Alert,
    StyleSheet
} from "react-native"; import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/types/RootStackParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from 'context/auth/AuthHook';
import Constants from 'expo-constants'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>


interface PickedFile {
    uri: string;
    name: string;
    mimeType: string;
    size?: number;
}

export const EmployerRegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const [companyAddress, setCompanyAddress] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const navigation = useNavigation<NavigationProp>();


    //FILE & Cloudinary Upload
    const [documents, setDocuments] = useState<PickedFile[]>([]);
    const [filepaths, setFilepaths] = useState<string[]>([])
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const MAX_FILES = 3;

    console.log(documents.length)

    //Uploading Files in Mobile
    const pickFile = async () => {
        console.log(documents.length)
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

    //Opening files Functionality
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

    //Deleting the file
    const removeFile = (index: any) => {
        setDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    //For icon file visibility/UX
    const getIcon = (mimeType: string) => {
        if (mimeType?.includes("pdf")) {
            return require("../../assets/images/pdf-icon.png"); // Replace with your PDF icon
        }
        if (mimeType?.includes("image")) {
            return require("../../assets/images/image-icon.png"); // Replace with your image icon
        }
        return require("../../assets/images/file-icon.png"); // Fallback icon
    };


    //Uploading it to ImageKit
    const uploadAllDocuments = async () => {
        alert("upload")
        if (!documents || documents.length === 0) {
            alert("No files to upload.");
            return;
        }


        try {
            //fetch data from Cloudinary

            //Passing each files into the DB
            const uploadedUrls = await Promise.all(
                documents.map(async (file) => {
                    const getUploadKeys = async () => {
                        const res = await fetch(`${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/imagekit/getUploadKeys`);
                        return res.json();
                    };

                    const { message, public_key } = await getUploadKeys();
                    const authParams = message

                    //Convert the data into object
                    const formData = new FormData();
                    formData.append("file", {
                        uri: file.uri,
                        name: file.name,
                        type: file.mimeType,
                    } as unknown as Blob);
                    formData.append("fileName", file.name);
                    formData.append("isPrivateFile", "true"); // must be string
                    formData.append("signature", authParams.signature);
                    formData.append("expire", authParams.expire.toString());
                    formData.append("token", authParams.token);
                    formData.append("publicKey", public_key);

                    //upload response
                    const res = await fetch(
                        "https://upload.imagekit.io/api/v1/files/upload",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "multipart/form-data"
                            },
                            body: formData
                        }
                    );
                    const data = await res.json();
                    console.log(data)
                    if (data.fileId) {
                        const urlObj = new URL(data.url)
                        const pathParts = urlObj.pathname.split("/");
                        pathParts.shift();
                        pathParts.shift();
                        const filePath = "/" + pathParts.join("/");
                        setFilepaths(prev => [...prev, filePath])
                        return {
                            fileId: data.fileId,
                            url: data.url, // this will be the **unsigned URL**
                            filePath
                        };
                    } else {
                        throw new Error(data.error?.message || "Upload failed");
                    }
                })
            );

            console.log("Uploaded files:", uploadedUrls);
            alert("All files uploaded!");
            // return uploadedUrls; // you can store this in state if needed
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed. Please try again.");
        }
    };

    return (
        <SafeAreaView>
            <Text>EMPLOYERS Register Screen</Text>
            <Button title="Submit files" onPress={pickFile} />
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 16 }}>
                {documents.map((file, i) => (
                    <View
                        key={i}
                        style={{
                            width: 85,
                            height: 25,
                            margin: 2,
                            borderWidth: 1,
                            borderColor: "#ccc",
                            borderRadius: 8,
                            position: "relative",
                            backgroundColor: "#f9f9f9",
                            overflow: "hidden",
                        }}
                    >
                        {/* Clickable area to open */}
                        <Pressable
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                paddingHorizontal: 4,
                            }}
                            onPress={() => openFile(file.uri, file.mimeType)}
                        >
                            <Image
                                source={getIcon(file.mimeType)}
                                style={{ width: 12, height: 12, marginRight: 4 }}
                                resizeMode="contain"
                            />
                            <Text
                                style={{
                                    fontSize: 10,
                                    flexShrink: 1,
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {file.name}
                            </Text>
                        </Pressable>

                        {/* Delete Button */}
                        <TouchableOpacity
                            onPress={() => removeFile(i)}
                            style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                backgroundColor: "#ff4444",
                                width: 14,
                                height: 14,
                                borderRadius: 7,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ color: "#fff", fontSize: 10 }}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                <Button title="Submit" onPress={uploadAllDocuments} />
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16 },
    input: { borderWidth: 1, marginVertical: 8, padding: 8, borderRadius: 4 }
});
