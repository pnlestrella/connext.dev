import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
} from "react-native";

export default function AlertModal({
  visible,
  title = "Alert",
  message,
  onClose,
}: {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.45)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 22,
            paddingVertical: 24,
            paddingHorizontal: 22,
            width: "85%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: 19,
              fontFamily: "Poppins-Bold",
              color: "#111827",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {title}
          </Text>

          {/* Message */}
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Poppins-Regular",
              color: "#6B7280",
              textAlign: "center",
              marginBottom: 22,
              lineHeight: 21,
            }}
          >
            {message}
          </Text>

          {/* Thinner Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: "#2563EB",
              borderRadius: 14,
              paddingVertical: 10, // thinner
              alignItems: "center",
            }}
            activeOpacity={0.85}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Poppins-Medium",
                color: "white",
              }}
            >
              OK
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
