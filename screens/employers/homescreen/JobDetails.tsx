import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Edit3,
  CheckCircle2,
  XCircle,
  MapPin,
  Briefcase,
  CalendarDays,
  Tag,
  Trash
} from "lucide-react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { deleteJob, getJob } from "api/employers/joblistings";
import ConfirmationModal from "components/ConfirmationModal";

// Simple divider
const SectionDivider = () => (
  <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 20 }} />
);

// Small pill chip
const Chip = ({
  label,
  color = "#2563EB",
  bg = "#EFF6FF",
}: {
  label: string;
  color?: string;
  bg?: string;
}) => (
  <View
    style={{
      backgroundColor: bg,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      marginRight: 8,
      marginBottom: 8,
    }}
  >
    <Text style={{ color, fontSize: 13, fontWeight: "600" }}>{label}</Text>
  </View>
);

// Helper to format dates
function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toDateString();
}

// Formats plain text to support simple dash lists and keeps line breaks
function renderDescriptionLines(text?: string) {
  if (!text)
    return [
      <Text key="empty" style={{ color: "#9CA3AF", fontStyle: "italic" }}>
        No description provided
      </Text>,
    ];
  const lines = String(text).split(/\r?\n/);
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    const isBullet = /^([-•–])\s+/.test(trimmed);
    if (!trimmed) {
      return <Text key={`br-${idx}`}>{""}</Text>;
    }
    if (isBullet) {
      const content = trimmed.replace(/^([-•–])\s+/, "");
      return (
        <View
          key={`li-${idx}`}
          style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 4 }}
        >
          <Text style={{ color: "#374151", marginRight: 8 }}>•</Text>
          <Text style={{ color: "#111827", flex: 1, lineHeight: 20 }}>{content}</Text>
        </View>
      );
    }
    return (
      <Text key={`p-${idx}`} style={{ color: "#111827", lineHeight: 20, marginBottom: 6 }}>
        {trimmed}
      </Text>
    );
  });
}

// Collapsible description with “Read more”
const CollapsibleDescription = ({ text }: { text?: string }) => {
  const [expanded, setExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  return (
    <View>
      <Text
        numberOfLines={expanded ? 0 : 6}
        onTextLayout={(e) => {
          if (!expanded) {
            const truncated = e.nativeEvent.lines?.length > 6;
            if (truncated !== showToggle) setShowToggle(truncated);
          }
        }}
      >
        {/* Render formatted lines inside a nested wrapper so numberOfLines applies */}
        <Text>{renderDescriptionLines(text)}</Text>
      </Text>
      {showToggle && (
        <Pressable onPress={() => setExpanded((s) => !s)} style={{ marginTop: 8, alignSelf: "flex-start" }}>
          <Text style={{ color: "#2563EB", fontWeight: "700" }}>
            {expanded ? "Show less" : "Read more"}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

// Salary helpers
type Salary = {
  min?: number | null;
  max?: number | null;
  currency?: string | null;
  frequency?: string | null;
};

const FREQ_LABELS: Record<string, string> = {
  hour: "per hour",
  day: "per day",
  week: "per week",
  month: "per month",
  year: "per year",
};

function fmtNumber(n?: number | null) {
  if (typeof n !== "number" || !isFinite(n)) return null;
  return new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(n);
}

function formatSalary(s?: Salary) {
  if (!s) return "—";
  const cur = s.currency || "";
  const freq = s.frequency ? FREQ_LABELS[s.frequency] ?? s.frequency : "";

  const minStr = fmtNumber(s.min);
  const maxStr = fmtNumber(s.max);

  // Both min and max
  if (minStr && maxStr) {
    return `${cur ? cur + " " : ""}${minStr} – ${maxStr}${freq ? " " + freq : ""}`;
  }
  // Only min
  if (minStr && !maxStr) {
    return `${cur ? cur + " " : ""}${minStr}${freq ? " " + freq : ""}`;
  }
  // Only max
  if (!minStr && maxStr) {
    return `${cur ? cur + " up to " : "up to "}${maxStr}${freq ? " " + freq : ""}`;
  }
  // No numbers, but maybe currency/frequency
  if (cur || freq) {
    return `${cur ? cur + " " : ""}${freq || ""}`.trim() || "—";
  }
  return "—";
}

export const JobDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { job } = route.params as { job: any };

  // Seed with nav param for instant paint, then refresh on focus
  const [jobData, setJobData] = useState<any>(job);
  const [loading, setLoading] = useState<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        try {
          setLoading(true);
          const res = await getJob(job.jobUID);
          if (active && res?.success && res?.message) {
            setJobData(res.message);
          }
        } catch (err) {
          console.log(err);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [job?.jobUID])
  );

  if (!jobData) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const isActive = jobData.status === true;
  const statusColor = isActive ? "#065F46" : "#991B1B";
  const statusBg = isActive ? "#ECFDF5" : "#FEF2F2";


  const [showDelete, setShowDelete] = useState(false);

  async function handleJobDeletion(jobUID: string) {
    try {
      setShowDelete(false)
      const res = await deleteJob(jobUID)

      console.log("Successfully deleted: ",res)
      navigation.goBack()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">



      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 12,
          backgroundColor: "#F8FAFC",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
            <ArrowLeft size={28} color="#37424F" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827" }}>Job Details</Text>
          <View className="flex-row gap-5">
            <TouchableOpacity
              onPress={() => (navigation as any).navigate("editDetails", { job: jobData })}
              accessibilityRole="button"
              accessibilityLabel="Edit job"
            >
              <Edit3 size={22} color="#37424F" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDelete(true)}
            >
              <Trash size={22} color="red" />
            </TouchableOpacity>
          </View>

        </View>

        {/* Title + Status */}
        <Text style={{ fontSize: 22, fontWeight: "800", color: "#0F172A", marginTop: 12 }}>
          {(jobData.jobTitle || "").trim() || "Untitled role"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          {isActive ? <CheckCircle2 size={18} color={statusColor} /> : <XCircle size={18} color={statusColor} />}
          <Text
            style={{
              color: statusColor,
              backgroundColor: statusBg,
              marginLeft: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              fontWeight: "700",
            }}
          >
            {isActive ? "Active" : "Closed"}
          </Text>
        </View>

        {/* Meta row */}
        <View style={{ flexDirection: "row", marginTop: 10, flexWrap: "wrap" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16, marginTop: 6 }}>
            <CalendarDays size={16} color="#6B7280" />
            <Text style={{ marginLeft: 6, color: "#6B7280", fontSize: 12 }}>
              Created: {formatDate(jobData.createdAt)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
            <CalendarDays size={16} color="#6B7280" />
            <Text style={{ marginLeft: 6, color: "#6B7280", fontSize: 12 }}>
              Updated: {formatDate(jobData.updatedAt)}
            </Text>
          </View>
        </View>
      </View>

      {loading && (
        <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <ActivityIndicator />
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 140 }}>
        {/* Overview card */}
        <View style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 16, padding: 14 }}>
          {/* Location */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
            <MapPin size={18} color="#374151" style={{ marginTop: 2 }} />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={{ color: "#6B7280", fontSize: 12 }}>Location</Text>
              <Text style={{ color: "#111827", fontWeight: "600" }}>
                {jobData?.location?.display_name || "—"}
              </Text>
            </View>
          </View>
          {/* Industry */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
            <Briefcase size={18} color="#374151" style={{ marginTop: 2 }} />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={{ color: "#6B7280", fontSize: 12 }}>Industry</Text>
              <Text style={{ color: "#111827", fontWeight: "600" }}>
                {jobData?.jobIndustry || "—"}
              </Text>
            </View>
          </View>
          {/* Role */}
          {jobData.jobNormalized ? (
            <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
              <Tag size={18} color="#374151" style={{ marginTop: 2 }} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={{ color: "#6B7280", fontSize: 12 }}>Role</Text>
                <Text style={{ color: "#111827", fontWeight: "600" }}>
                  {jobData.jobNormalized}
                </Text>
              </View>
            </View>
          ) : null}
          {/* Salary */}
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <Tag size={18} color="#374151" style={{ marginTop: 2 }} />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={{ color: "#6B7280", fontSize: 12 }}>Salary</Text>
              <Text style={{ color: "#111827", fontWeight: "600" }}>
                {formatSalary(jobData?.salaryRange)}
              </Text>
            </View>
          </View>
        </View>

        {/* Employment Type */}
        <SectionDivider />
        <Text className="text-gray-800 text-sm mb-2">Employment Type</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
          {Array.isArray(jobData.employment) && jobData.employment.length > 0 ? (
            jobData.employment.map((et: string) => <Chip key={et} label={et} color="#1D4ED8" bg="#DBEAFE" />)
          ) : (
            <Text className="text-gray-400 italic">No employment type listed</Text>
          )}
        </View>

        {/* Work Type */}
        <SectionDivider />
        <Text className="text-gray-800 text-sm mb-2">Work Type</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
          {Array.isArray(jobData.workTypes) && jobData.workTypes.length > 0 ? (
            jobData.workTypes.map((wt: string) => <Chip key={wt} label={wt} color="#065F46" bg="#D1FAE5" />)
          ) : (
            <Text className="text-gray-400 italic">No work type listed</Text>
          )}
        </View>

        {/* Skills */}
        <SectionDivider />
        <Text className="text-gray-800 text-sm mb-2">Skills</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
          {Array.isArray(jobData.jobSkills) && jobData.jobSkills.length > 0 ? (
            jobData.jobSkills.map((skill: string) => <Chip key={skill} label={skill} color="#7C3AED" bg="#EDE9FE" />)
          ) : (
            <Text className="text-gray-400 italic">No skills listed</Text>
          )}
        </View>

        {/* Job Description */}
        <SectionDivider />
        <Text className="text-gray-800 text-sm mb-2">Job Description</Text>
        <View style={{ backgroundColor: "#F9FAFB", borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 12, padding: 12 }}>
          <CollapsibleDescription text={jobData.jobDescription} />
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={showDelete}
        type="delete"
        title="Delete Job?"
        message="This job may already have applications associated with it. Deleting it cannot be undone. Are you sure you want to proceed?"
        onConfirm={() => handleJobDeletion(jobData.jobUID)}
        onCancel={() => setShowDelete(false)}
      />



    </SafeAreaView>
  );
};
