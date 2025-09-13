import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { View, ActivityIndicator,Pressable, Text } from "react-native";
import { WebView } from "react-native-webview";
export const ResumeViewer = ({ route }: any) => {
  const { resumeUrl } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
        <Pressable onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="black" />
        </Pressable>
        <Text className="font-bold text-lg text-gray-900">
          Applicant Detail
        </Text>
      </View>
      <WebView
        source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(resumeUrl)}` }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#37424F"
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          />
        )}
      />
    </View>
  );
};
