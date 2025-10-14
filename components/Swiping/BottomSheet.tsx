import { ChevronUp, MapPin } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  View,
  Pressable,
} from "react-native";

const { height } = Dimensions.get("window");

type Job = {
  boostWeight: number;
  companyName: string;
  employment: string[];
  feedback: {
    match_summary: string;
    skill_note: string;
    extra_note: string;
  };
  isExternal: boolean;
  jobDescription: string;
  jobIndustry: string;
  jobNormalized: string;
  jobSkills: string[];
  jobTitle: string;
  jobUID: string;
  location: {
    city: string;
    postalCode: string;
    state: string;
  };
  profilePic: string;
  salaryRange: {
    currency: string;
    frequency: string;
    max: number;
    min: number;
  };
  score: number;
  status: boolean;
  workTypes: string[];
};

type BStypes = {
  showModal: boolean;
  currentJob?: Partial<Job> | null;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
};

const DEFAULT_JOB: Job = {
  boostWeight: 0,
  companyName: "",
  employment: [],
  feedback: {
    match_summary: "",
    skill_note: "",
    extra_note: "",
  },
  isExternal: false,
  jobDescription: "",
  jobIndustry: "",
  jobNormalized: "",
  jobSkills: [],
  jobTitle: "",
  jobUID: "",
  location: {
    city: "",
    postalCode: "",
    state: "",
  },
  profilePic: "",
  salaryRange: {
    currency: "",
    frequency: "",
    max: 0,
    min: 0,
  },
  score: 0,
  status: true,
  workTypes: [],
};

// Show "-" when pay is missing or no numeric range is provided
function formatSalary(sr?: Partial<Job["salaryRange"]>) {
  const currency = sr?.currency ?? "";
  const freq = sr?.frequency ?? "";
  const min = sr?.min ?? null;
  const max = sr?.max ?? null;

  const haveMin = typeof min === "number";
  const haveMax = typeof max === "number";

  // If neither min nor max is provided, consider pay missing entirely
  if (!haveMin && !haveMax) return "-";

  const range =
    haveMin && haveMax
      ? `${min} - ${max}`
      : haveMin
      ? `${min}`
      : haveMax
      ? `${max}`
      : "";

  // If we somehow have no range, still fallback to "-"
  if (!range) return "-";

  // Build final string with currency and frequency if present
  return [currency, range, freq && `/${freq}`]
    .filter(Boolean)
    .join(" ")
    .replace(" /", "/");
}

function formatLocation(loc?: Partial<Job["location"]>) {
  const city = loc?.city ?? "";
  const state = loc?.state ?? "";
  const postal = loc?.postalCode ?? "";
  const parts = [city, state, postal].filter(Boolean);
  return parts.length ? parts.join(", ") : "Not specified";
}

const SKILLS_PREVIEW_COUNT = 8;

export default function BottomSheet({
  showModal,
  currentJob,
  isExpanded,
  setIsExpanded,
}: BStypes) {
  const translateY = useRef(new Animated.Value(height)).current;

  // Build a null-safe job object via deep defaulting
  const job = useMemo(() => {
    const src = currentJob ?? {};
    return {
      ...DEFAULT_JOB,
      ...src,
      feedback: { ...DEFAULT_JOB.feedback, ...(src.feedback ?? {}) },
      location: { ...DEFAULT_JOB.location, ...(src.location ?? {}) },
      salaryRange: { ...DEFAULT_JOB.salaryRange, ...(src.salaryRange ?? {}) },
      employment: Array.isArray(src.employment) ? src.employment : [],
      jobSkills: Array.isArray(src.jobSkills) ? src.jobSkills : [],
      workTypes: Array.isArray(src.workTypes) ? src.workTypes : [],
    } as Job;
  }, [currentJob]);

  // Animate in/out
  useEffect(() => {
    if (showModal) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 160,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showModal, translateY]);

  // Derived display values
  const title = job.jobTitle || "Untitled role";
  const postedBy = job.isExternal ? "External Job From" : "Posted By";
  const company = job.companyName || "Unknown company";
  const salaryText = formatSalary(job.salaryRange);
  const locationText = formatLocation(job.location);

  const skills = job.jobSkills;
  const employments = job.employment;
  const workTypes = job.workTypes;

  const matchSummary = job.feedback?.match_summary || "No summary available.";
  const skillNote = job.feedback?.skill_note || "No skill notes available.";
  const extraNote = job.feedback?.extra_note || "No extra notes available.";

  // Skills See more / See less
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const hasManySkills = Array.isArray(skills) && skills.length > SKILLS_PREVIEW_COUNT;
  const visibleSkills = (Array.isArray(skills) ? skills : []).slice(
    0,
    skillsExpanded ? skills.length : SKILLS_PREVIEW_COUNT
  );

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          transform: [{ translateY }],
          height: isExpanded ? 550 : 400,
        },
      ]}
    >
      <TouchableOpacity
        style={{ width: "100%", alignItems: "center" }}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        <ChevronUp />
      </TouchableOpacity>

      <ScrollView>
        {isExpanded && (
          <>
            <View style={{ justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "#000", marginTop: 16, fontFamily: "Lexend-Bold", fontSize: 20 }}>
                {title}
              </Text>

              <Text style={{ fontFamily: "Lexend-Regular", fontSize: 12, marginTop: 2 }}>
                {postedBy}: <Text>{company}</Text>
              </Text>
            </View>

            <Text style={{ color: "#6C63FF", marginTop: 16, fontFamily: "Lexend-SemiBold", fontSize: 16 }}>
              Job Details
            </Text>

            <Text style={{ color: "#6C63FF", fontFamily: "Lexend-SemiBold", fontSize: 15, marginTop: 4 }}>
              Pay:{" "}
              <Text style={{ color: "#000", fontFamily: "Lexend-Regular", fontSize: 14 }}>
                {salaryText}
              </Text>
            </Text>

            {/* Job Types */}
            <View style={{ marginVertical: 4, flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
              <Text style={{ color: "#6C63FF", fontFamily: "Lexend-SemiBold", fontSize: 15 }}>
                Job Type:{" "}
              </Text>
              {(Array.isArray(employments) ? employments : []).map((v, i) => (
                <View key={`emp-${i}`} style={{ marginHorizontal: 4 }}>
                  <Text
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 4,
                      borderRadius: 8,
                      fontFamily: "Lexend-Regular",
                      fontSize: 12,
                      backgroundColor: "#c7c3c3",
                      color: "#2e2d2d",
                    }}
                  >
                    {v || "—"}
                  </Text>
                </View>
              ))}
              {(!employments || employments.length === 0) && (
                <Text style={{ fontFamily: "Lexend-Regular", fontSize: 12, color: "#6b6b6b" }}>Not specified</Text>
              )}
            </View>

            <Text style={{ color: "#6C63FF", fontFamily: "Lexend-SemiBold", fontSize: 14, marginTop: 6 }}>
              Skills Required:
            </Text>
            <View style={{ marginVertical: 4, flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
              {visibleSkills.map((v, i) => (
                <View key={`skill-${i}`} style={{ margin: 4 }}>
                  <Text
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 4,
                      borderRadius: 8,
                      fontFamily: "Lexend-Regular",
                      fontSize: 12,
                      backgroundColor: "#c7c3c3",
                      color: "#2e2d2d",
                    }}
                  >
                    {v || "—"}
                  </Text>
                </View>
              ))}
              {(!skills || skills.length === 0) && (
                <Text style={{ fontFamily: "Lexend-Regular", fontSize: 12, color: "#6b6b6b" }}>Not specified</Text>
              )}
            </View>

            {hasManySkills && (
              <Pressable
                onPress={() => setSkillsExpanded((s) => !s)}
                style={{ alignSelf: "flex-start", marginLeft: 4, paddingVertical: 4, paddingHorizontal: 8 }}
              >
                <Text style={{ color: "#6C63FF", fontFamily: "Lexend-SemiBold", fontSize: 13 }}>
                  {skillsExpanded ? "See less" : "See more"}
                </Text>
              </Pressable>
            )}

            <Text style={{ color: "#6C63FF", fontFamily: "Lexend-SemiBold", fontSize: 14, marginTop: 6 }}>
              Work Types:
            </Text>
            <View style={{ marginVertical: 4, flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
              {(Array.isArray(workTypes) ? workTypes : []).map((v, i) => (
                <View key={`work-${i}`} style={{ margin: 4 }}>
                  <Text
                    style={{
                      paddingHorizontal: 6,
                      paddingVertical: 4,
                      borderRadius: 8,
                      fontFamily: "Lexend-Regular",
                      fontSize: 12,
                      backgroundColor: "#c7c3c3",
                      color: "#2e2d2d",
                    }}
                  >
                    {v || "—"}
                  </Text>
                </View>
              ))}
              {(!workTypes || workTypes.length === 0) && (
                <Text style={{ fontFamily: "Lexend-Regular", fontSize: 12, color: "#6b6b6b" }}>Not specified</Text>
              )}
            </View>

            <View style={{ height: 1, backgroundColor: "lightgray", marginVertical: 10 }} />

            {/* Location */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MapPin size={20} color={"#6C63FF"} />
              <Text style={{ color: "#6C63FF", marginVertical: 8, fontFamily: "Lexend-SemiBold", fontSize: 16 }}>
                {" "}
                Location: <Text style={{ color: "#000" }}>{locationText}</Text>
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: "lightgray", marginVertical: 10 }} />

            <Text style={{ color: "#6C63FF", marginTop: 16, fontFamily: "Lexend-SemiBold", fontSize: 16 }}>
              Full job description
            </Text>
            <Text style={{ fontFamily: "Lexend-SemiBold", fontSize: 14, color: "#5e5c5c" }}>
              {job.jobDescription || "No description provided."}
            </Text>

            <View style={{ height: 1, backgroundColor: "lightgray", marginVertical: 10 }} />
          </>
        )}

        <Text style={{ color: "#6C63FF", marginTop: 16, fontFamily: "Lexend-SemiBold", fontSize: 16 }}>
          Feedback
        </Text>
        <Text
          style={{
            fontFamily: "Lexend-Regular",
            fontSize: 10,
            marginTop: 4,
            color: "gray",
          }}
        >
          ⚠️ This is AI-generated feedback and may not be 100% accurate.
        </Text>

        <View style={{ gap: 8 }}>
          <View style={{ backgroundColor: "#ecfdf5", borderRadius: 16, padding: 16, margin: 4, shadowOpacity: 0.1 }}>
            <Text style={{ color: "#14532d", fontFamily: "Lexend-Bold", fontSize: 16, marginBottom: 4 }}>
              Match Summary
            </Text>
            <Text style={{ color: "#374151", fontFamily: "Lexend-Regular", lineHeight: 20 }}>
              {matchSummary}
            </Text>
          </View>

          <View style={{ backgroundColor: "#f5f3ff", borderRadius: 16, padding: 16, margin: 4, shadowOpacity: 0.1 }}>
            <Text style={{ color: "#4c1d95", fontFamily: "Lexend-Bold", fontSize: 16, marginBottom: 4 }}>
              Skill Notes
            </Text>
            <Text style={{ color: "#374151", fontFamily: "Lexend-Regular", lineHeight: 20 }}>
              {skillNote}
            </Text>
          </View>

          <View style={{ backgroundColor: "#eff6ff", borderRadius: 16, padding: 16, margin: 4, shadowOpacity: 0.1 }}>
            <Text style={{ color: "#1e3a8a", fontFamily: "Lexend-Bold", fontSize: 16, marginBottom: 4 }}>
              Extra Notes
            </Text>
            <Text style={{ color: "#374151", fontFamily: "Lexend-Regular", lineHeight: 20 }}>
              {extraNote}
            </Text>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: -5,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "100%",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    elevation: 5,
    zIndex: 999,
  },
  text: {
    fontSize: 16,
  },
});
