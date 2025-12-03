import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function EditMeetingModal({ visible, meeting, onClose, onConfirm }) {
  // Initialize state from passed meeting data or defaults
  const [meetingData, setMeetingData] = useState({
    title: meeting?.title || "",
    description: meeting?.description || "",
    startTime: meeting?.startTime ? new Date(meeting.startTime) : new Date(),
    endTime: meeting?.endTime
      ? new Date(meeting.endTime)
      : new Date(Date.now() + 30 * 60000),
    meetingLink: meeting?.meetingLink || "",
    eventLink: meeting?.eventLink || "",
    status: meeting?.status || "pending",
  });

  console.log('meeeeeeeeting',meeting)

  const [pickerMode, setPickerMode] = useState(null);
  const [durationPickerVisible, setDurationPickerVisible] = useState(false);

  // Update local state if meeting props change
  useEffect(() => {
    if (meeting) {
      setMeetingData({
        title: meeting.title || "",
        description: meeting.description || "",
        startTime: meeting.startTime ? new Date(meeting.startTime) : new Date(),
        endTime: meeting.endTime ? new Date(meeting.endTime) : new Date(Date.now() + 30 * 60000),
        meetingLink: meeting.meetingLink || "",
        eventLink: meeting.eventLink || "",
            status: meeting?.status || "pending",
      });
    }
  }, [meeting]);

  // Calculate duration string
  const duration = useMemo(() => {
    const diff = (meetingData.endTime - meetingData.startTime) / 60000; // minutes
    if (diff <= 0) return "Invalid duration";
    const hrs = Math.floor(diff / 60);
    const mins = Math.round(diff % 60);
    if (hrs === 0) return `${mins} min${mins !== 1 ? "s" : ""}`;
    if (mins === 0) return `${hrs} hr${hrs > 1 ? "s" : ""}`;
    return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min${mins !== 1 ? "s" : ""}`;
  }, [meetingData.startTime, meetingData.endTime]);

  // Handlers for datetime pickers
  const handleStartConfirm = (date) => {
    let newEnd = new Date(date.getTime() + 30 * 60000);
    setMeetingData((prev) => ({
      ...prev,
      startTime: date,
      endTime: newEnd < prev.endTime ? prev.endTime : newEnd,
    }));
    setPickerMode(null);
  };

  const handleEndConfirm = (date) => {
    if (date <= meetingData.startTime) {
      Alert.alert("⚠️ Invalid Time", "End time must be later than start time.");
      return setPickerMode(null);
    }
    setMeetingData((prev) => ({ ...prev, endTime: date }));
    setPickerMode(null);
  };

  // Duration selector handler
  const handleDurationSelect = (minutes) => {
    const newEnd = new Date(meetingData.startTime.getTime() + minutes * 60000);
    setMeetingData((prev) => ({ ...prev, endTime: newEnd }));
    setDurationPickerVisible(false);
  };

  // Confirm updates - call API or parent callback
  const handleConfirm = async () => {
    if (!meetingData.title.trim()) {
      Alert.alert("Validation Error", "Title cannot be empty.");
      return;
    }
    if (meetingData.endTime <= meetingData.startTime) {
      Alert.alert("Validation Error", "End time must be after start time.");
      return;
    }

    // Pass updated data to parent
    onConfirm({
      ...meeting,
      ...meetingData,
      startTime: meetingData.startTime.toISOString(),
      endTime: meetingData.endTime.toISOString(),
    });

    onClose();
  };

  const formatDateTime = (date) =>
    new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>✏️ Edit Meeting</Text>

          {/* Editable Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={meetingData.title}
              onChangeText={(text) =>
                setMeetingData((prev) => ({ ...prev, title: text }))
              }
              placeholder="Enter meeting title"
            />
          </View>

          {/* Editable Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: "top" }]}
              multiline
              value={meetingData.description}
              onChangeText={(text) =>
                setMeetingData((prev) => ({ ...prev, description: text }))
              }
              placeholder="Enter meeting description"
            />
          </View>

         

          {/* Start Time */}
          <TouchableOpacity
            style={styles.timeCard}
            onPress={() => setPickerMode("start")}
          >
            <Text style={styles.label}>Start Time</Text>
            <Text style={styles.value}>{formatDateTime(meetingData.startTime)}</Text>
          </TouchableOpacity>

          {/* End Time */}
          <TouchableOpacity
            style={styles.timeCard}
            onPress={() => setPickerMode("end")}
          >
            <Text style={styles.label}>End Time</Text>
            <Text style={styles.value}>{formatDateTime(meetingData.endTime)}</Text>
          </TouchableOpacity>

          {/* Duration */}
          <TouchableOpacity
            style={styles.durationContainer}
            onPress={() => setDurationPickerVisible(true)}
          >
            <Text style={styles.durationText}>🕒 Duration: {duration}</Text>
            <Text style={styles.durationSubText}>Tap to adjust meeting duration</Text>
          </TouchableOpacity>

          {/* Duration Picker Modal */}
          <Modal visible={durationPickerVisible} transparent animationType="fade">
            <View style={styles.durationOverlay}>
              <View style={styles.durationPicker}>
                <Text style={styles.durationTitle}>Select Duration</Text>
                {[15, 30, 45, 60, 90, 120, 180].map((min) => (
                  <TouchableOpacity
                    key={min}
                    style={styles.durationOption}
                    onPress={() => handleDurationSelect(min)}
                  >
                    <Text style={styles.durationOptionText}>
                      {min >= 60
                        ? `${Math.floor(min / 60)} hr${min > 60 ? " " + (min % 60) + " mins" : ""}`
                        : `${min} mins`}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.durationCancel}
                  onPress={() => setDurationPickerVisible(false)}
                >
                  <Text style={{ color: "#2563EB", fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.confirmBtn]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* DateTime Pickers */}
          <DateTimePickerModal
            isVisible={pickerMode === "start"}
            mode="datetime"
            onConfirm={handleStartConfirm}
            onCancel={() => setPickerMode(null)}
          />
          <DateTimePickerModal
            isVisible={pickerMode === "end"}
            mode="datetime"
            onConfirm={handleEndConfirm}
            onCancel={() => setPickerMode(null)}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 15,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: "#111827",
  },
  value: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  timeCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  durationContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  durationText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "500",
  },
  durationSubText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },
  durationOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  durationPicker: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
  },
  durationTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  durationOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  durationOptionText: {
    textAlign: "center",
    fontSize: 15,
    color: "#111827",
  },
  durationCancel: {
    marginTop: 10,
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelBtn: {
    backgroundColor: "#F3F4F6",
  },
  confirmBtn: {
    backgroundColor: "#2563EB",
  },
  cancelText: {
    color: "#374151",
    fontWeight: "500",
  },
  confirmText: {
    color: "white",
    fontWeight: "600",
  },
});
