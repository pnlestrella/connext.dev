import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

const COLORS = {
  logout: { action: "#2563EB", danger: false }, // blue
  delete: { action: "#DC2626", danger: true },  // red
  hire: { action: "#2563EB", danger: false },   // blue (positive action)
};

export default function ConfirmationModal({
  visible,
  type = "logout", // "logout" | "delete" | "hire"
  title,
  message,
  onConfirm,
  onCancel,
}) {
  const theme = COLORS[type] || COLORS.logout;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            width: "90%",
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#111827", // neutral black
              marginBottom: 8,
              textAlign: "left",
            }}
          >
            {title || "Are you sure?"}
          </Text>

          {/* Message */}
          <Text
            style={{
              fontSize: 15,
              color: "#6B7280", // gray-500
              marginBottom: 28,
              lineHeight: 22,
            }}
          >
            {message}
          </Text>

          {/* Buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            {/* Cancel */}
            <TouchableOpacity
              onPress={onCancel}
              style={{
                backgroundColor: "#F3F4F6",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
                marginRight: 8,
              }}
            >
              <Text style={{ color: "#374151", fontWeight: "600" }}>
                Cancel
              </Text>
            </TouchableOpacity>

            {/* Confirm */}
            <TouchableOpacity
              onPress={onConfirm}
              style={{
                backgroundColor: theme.action,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                {theme.danger ? "Delete" : "Confirm"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
