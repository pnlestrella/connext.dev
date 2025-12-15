import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  Animated,
  ScrollView,
  Switch,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { X, Trash2 } from "lucide-react-native";
import Fuse from "fuse.js";
import ConfirmationModal from "components/ConfirmationModal";


export type Education = {
  schoolName: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number | null;
  endYear: number | null;
  isCurrent: boolean;
};

// Example data
const schoolOptions = [
  { name: "Ateneo de Naga University" },
  { name: "Ateneo de Manila University" },
  { name: "University of Santo Tomas" },
  { name: "De La Salle University" },
];

const degrees = [
  { name: "Bachelor's" },
  { name: "Master's" },
  { name: "PhD" },
  { name: "Associate" },
];

const fieldsOfStudy = [
  { name: "Computer Science" },
  { name: "Business Administration" },
  { name: "Mechanical Engineering" },
  { name: "Psychology" },
  { name: "Biology" },
  { name: "Economics" },
];

type EditSchoolModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (education: Education) => void;
  initialEducation?: Education | null;
  onDelete?: () => void;
};

export const EditSchoolModal = ({
  visible,
  onClose,
  onSave,
  initialEducation,
  onDelete,
}: EditSchoolModalProps) => {
  const [school, setSchool] = useState("");
  const [degree, setDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [startYear, setStartYear] = useState<number | null>(null);
  const [endYear, setEndYear] = useState<number | null>(null);
  const [isCurrent, setIsCurrent] = useState(false);

  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const [isSchoolFocused, setIsSchoolFocused] = useState(false);
  const [isDegreeFocused, setIsDegreeFocused] = useState(false);
  const [isFieldFocused, setIsFieldFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { height } = Dimensions.get("window");

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // Fuse instances
  const fuseSchools = useMemo(
    () => new Fuse(schoolOptions, { keys: ["name"], threshold: 0.3 }),
    []
  );
  const fuseDegrees = useMemo(
    () => new Fuse(degrees, { keys: ["name"], threshold: 0.3 }),
    []
  );
  const fuseFields = useMemo(
    () => new Fuse(fieldsOfStudy, { keys: ["name"], threshold: 0.3 }),
    []
  );

  // Filtered school options (with free-typed option)
  const filteredSchools = useMemo(() => {
    if (!school.trim()) return [];
    const baseResults = fuseSchools.search(school).map((r) => r.item);
    const hasExact = baseResults.some(
      (item) => item.name.toLowerCase() === school.trim().toLowerCase()
    );
    const withTyped =
      hasExact || !school.trim()
        ? baseResults
        : [{ name: school.trim() }, ...baseResults];
    return withTyped;
  }, [school]);

  const filteredDegrees = useMemo(
    () => (degree ? fuseDegrees.search(degree).map((r) => r.item) : []),
    [degree]
  );
  const filteredFields = useMemo(
    () => (fieldOfStudy ? fuseFields.search(fieldOfStudy).map((r) => r.item) : []),
    [fieldOfStudy]
  );

  const handleSelectSchool = (item: { name: string }) => {
    setSchool(item.name);
    setSelectedSchool(item.name);
    setIsSchoolFocused(false);
  };
  const handleSelectDegree = (item: { name: string }) => {
    setDegree(item.name);
    setSelectedDegree(item.name);
    setIsDegreeFocused(false);
  };
  const handleSelectField = (item: { name: string }) => {
    setFieldOfStudy(item.name);
    setSelectedField(item.name);
    setIsFieldFocused(false);
  };

  const handleClearSchool = () => {
    setSchool("");
    setSelectedSchool(null);
    setIsSchoolFocused(true);
  };
  const handleClearDegree = () => {
    setDegree("");
    setSelectedDegree(null);
    setIsDegreeFocused(true);
  };
  const handleClearField = () => {
    setFieldOfStudy("");
    setSelectedField(null);
    setIsFieldFocused(true);
  };

  const resetState = () => {
    setSchool("");
    setDegree("");
    setFieldOfStudy("");
    setStartYear(null);
    setEndYear(null);
    setIsCurrent(false);
    setSelectedSchool(null);
    setSelectedDegree(null);
    setSelectedField(null);
    setIsSchoolFocused(false);
    setIsDegreeFocused(false);
    setIsFieldFocused(false);
  };

  const parseYear = (text: string): number | null => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) ? num : null;
  };

  const validateYears = () => {
    const currentYear = new Date().getFullYear();
    const minYear = 1900;
    const maxYear = currentYear + 5;

    if (!startYear) {
      Alert.alert("Invalid year", "Start year is required.");
      return false;
    }
    if (startYear < minYear || startYear > maxYear) {
      Alert.alert(
        "Invalid year",
        `Start year must be between ${minYear} and ${maxYear}.`
      );
      return false;
    }

    if (!isCurrent) {
      if (!endYear) {
        Alert.alert("Invalid year", "End year is required.");
        return false;
      }
      if (endYear < minYear || endYear > maxYear) {
        Alert.alert(
          "Invalid year",
          `End year must be between ${minYear} and ${maxYear}.`
        );
        return false;
      }
      if (endYear < startYear) {
        Alert.alert("Invalid range", "End year cannot be earlier than start year.");
        return false;
      }
    }

    return true;
  };

  // Prefill in edit mode / clear in add mode
  useEffect(() => {
    if (!visible) return;
    if (initialEducation) {
      setSchool(initialEducation.schoolName || "");
      setDegree(initialEducation.degree || "");
      setFieldOfStudy(initialEducation.fieldOfStudy || "");
      setStartYear(initialEducation.startYear);
      setEndYear(initialEducation.endYear);
      setIsCurrent(initialEducation.isCurrent);
      setSelectedSchool(initialEducation.schoolName || null);
    } else {
      resetState();
    }
  }, [visible, initialEducation]);

  const handleSave = () => {
    if (!school.trim()) {
      Alert.alert("Required", "School is required.");
      return;
    }
    if (!validateYears()) return;

    onSave({
      schoolName: school.trim(),
      degree,
      fieldOfStudy,
      startYear,
      endYear: isCurrent ? null : endYear,
      isCurrent,
    });

    resetState();
    onClose();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleDelete = () => {
    if (!initialEducation || !onDelete) return;
    Alert.alert("Delete education", "Remove this education entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          onDelete();
          onClose();
        },
      },
    ]);
  };

  const [showDelete, setShowDelete] = useState(false)
  const renderDropdownInput = (
    value: string,
    setValue: (text: string) => void,
    selected: string | null,
    setSelected: (text: string | null) => void,
    isFocused: boolean,
    setIsFocused: (val: boolean) => void,
    filteredOptions: { name: string }[],
    handleSelect: (item: { name: string }) => void,
    handleClear: () => void,
    placeholder: string
  ) => (
    <View className="relative mb-3">
      <TextInput
        value={value}
        onChangeText={(text) => {
          if (!selected) setValue(text);
        }}
        placeholder={placeholder}
        onFocus={() => {
          if (!selected) setIsFocused(true);
        }}
        editable={!selected}
        className={`border border-gray-300 rounded-lg px-3 py-2 ${selected ? "bg-gray-100" : ""
          }`}
      />
      {selected && (
        <Pressable
          onPress={handleClear}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: [{ translateY: -12 }],
          }}
        >
          <X size={20} color="#888" />
        </Pressable>
      )}
      {isFocused && !selected && value.length > 0 && filteredOptions.length > 0 && (
        <ScrollView
          style={{
            maxHeight: 120,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            marginTop: 4,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {filteredOptions.map((item) => (
            <Pressable
              key={item.name}
              onPress={() => handleSelect(item)}
              style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}
            >
              <Text>{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
          opacity: fadeAnim,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "flex-end" }}
        >
          <View
            style={{
              width: "100%",
              minHeight: height * 0.6,
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
            }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#6C63FF" }}>
                {initialEducation ? "Edit Education" : "Add Education"}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {initialEducation && onDelete && (
                  <Pressable
                    onPress={() => setShowDelete(true)}
                    style={{ marginRight: 12, padding: 4 }}
                  >
                    <Trash2 size={20} color="#DC2626" />
                  </Pressable>
                )}
                <Pressable onPress={handleClose}>
                  <X size={23} />
                </Pressable>
              </View>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* School */}
              {renderDropdownInput(
                school,
                setSchool,
                selectedSchool,
                setSelectedSchool,
                isSchoolFocused,
                setIsSchoolFocused,
                filteredSchools,
                handleSelectSchool,
                handleClearSchool,
                "School *"
              )}

              {/* Degree */}
              {renderDropdownInput(
                degree,
                setDegree,
                selectedDegree,
                setSelectedDegree,
                isDegreeFocused,
                setIsDegreeFocused,
                filteredDegrees,
                handleSelectDegree,
                handleClearDegree,
                "Degree (optional)"
              )}

              {/* Field of Study */}
              {renderDropdownInput(
                fieldOfStudy,
                setFieldOfStudy,
                selectedField,
                setSelectedField,
                isFieldFocused,
                setIsFieldFocused,
                filteredFields,
                handleSelectField,
                handleClearField,
                "Field of Study (optional)"
              )}

              {/* Start / End Years */}
              <View className="flex-row justify-between mb-3">
                <View className="flex-1 mr-2">
                  <Text className="mb-1 text-gray-700">Start Year *</Text>
                  <TextInput
                    value={startYear?.toString() || ""}
                    onChangeText={(text) => setStartYear(parseYear(text))}
                    placeholder="YYYY"
                    keyboardType="numeric"
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="mb-1 text-gray-700">
                    {isCurrent ? "End Year (disabled)" : "End Year *"}
                  </Text>
                  <TextInput
                    value={endYear?.toString() || ""}
                    onChangeText={(text) => setEndYear(parseYear(text))}
                    placeholder="YYYY"
                    keyboardType="numeric"
                    editable={!isCurrent}
                    className={`border border-gray-300 rounded-lg px-3 py-2 ${isCurrent ? "bg-gray-100" : ""
                      }`}
                  />
                </View>
              </View>

              {/* Current Checkbox */}
              <View className="flex-row items-center mb-4">
                <Switch
                  value={isCurrent}
                  onValueChange={(val) => {
                    setIsCurrent(val);
                    if (val) setEndYear(null);
                  }}
                />
                <Text className="ml-2">I currently study here</Text>
              </View>

              {/* Footer buttons */}
              <View className="flex-row justify-end mt-3">
                <Pressable
                  onPress={handleClose}
                  className="px-4 py-2 mr-2 rounded-lg bg-gray-200"
                >
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  className="px-4 py-2 rounded-lg bg-blue-600"
                >
                  <Text className="text-white font-semibold">
                    {initialEducation ? "Save changes" : "Save"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>

      <ConfirmationModal
        visible={showDelete}
        type="delete"
        title="Delete Education?"
        message="This action will permanently delete this education entry. Continue?"
        onConfirm={() => {
          onDelete();
          onClose();
          setShowDelete(false)
        }}
        onCancel={() => setShowDelete(false)}
      />
    </Modal>
  );
};
