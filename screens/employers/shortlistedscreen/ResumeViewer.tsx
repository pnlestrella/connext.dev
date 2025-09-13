import React from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";

export const ResumeViewer = ({ route }: any) => {
  const { resumeUrl } = route.params;

  return (
    <View style={{ flex: 1 }}>
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
