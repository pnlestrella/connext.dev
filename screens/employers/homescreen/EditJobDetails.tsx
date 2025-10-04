import React, { useMemo, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import EmploymentTypes from "../../../data/employmentTypes.json";
import WorkTypes from "../../../data/workTypes.json";
import { Industries } from "../../../data/industries.json";
import Skills from "../../../data/cleaned_skills.json";
import CurrencyOptions from "../../../data/currency.json";
import FrequencyOptions from "../../../data/frequency.json";
import AutocompleteInput from "components/profileScreen/AutoCompleteInput";

import Fuse from "fuse.js";
import { useEmployers } from "context/employers/EmployerHook";
import { updateJobs } from "api/employers/joblistings";
import { IndustryModal } from "components/profileScreen/IndustryModal";
import ConfirmationModal from "components/ConfirmationModal";
import AlertModal from "components/AlertModal"; // ✅ your alert modal

const BRAND_PURPLE = "#2563EB";
const MAX_DESC = 2000;

const SectionDivider = () => (
  <View style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 20 }} />
);

const Highlighted = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <Text>{text}</Text>;
  const regex = new RegExp(`(${query})`, "i");
  const parts = text.split(regex);
  return (
    <Text>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <Text key={`highlight-${i}`} style={{ fontWeight: "700", color: BRAND_PURPLE }}>
            {part}
          </Text>
        ) : (
          <Text key={`plain-${i}`}>{part}</Text>
        )
      )}
    </Text>
  );
};

export const EditJobDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { job } = route.params as { job: any };
  const { setRefresh, refresh } = useEmployers();

  const [jobTitle, setJobTitle] = useState(job.jobTitle || "");
  const [jobDescription, setJobDescription] = useState(
    job.jobDescription ? job.jobDescription.replace(/<[^>]+>/g, "") : ""
  );
  const [descHeight, setDescHeight] = useState(140);
  const [industry, setIndustry] = useState<string>(job.jobIndustry || "");
  const [location, setLocation] = useState<any>(job.location || {});
  const [jobSkills, setJobSkills] = useState<string[]>(job.jobSkills || []);
  const [employment, setEmployment] = useState<string[]>(job.employment || []);
  const [workTypes, setWorkTypes] = useState<string[]>(job.workTypes || []);

  // Salary state
  const [salaryMin, setSalaryMin] = useState(
    typeof job?.salaryRange?.min === "number" ? String(job.salaryRange.min) : ""
  );
  const [salaryMax, setSalaryMax] = useState(
    typeof job?.salaryRange?.max === "number" ? String(job.salaryRange.max) : ""
  );
  const [currency, setCurrency] = useState(job?.salaryRange?.currency || "PHP");
  const [frequency, setFrequency] = useState(job?.salaryRange?.frequency || "month");

  // Alert Modal state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Location search
  const [locQuery, setLocQuery] = useState("");
  const [locResults, setLocResults] = useState<any[]>([]);
  const [locLoading, setLocLoading] = useState(false);
  const API_KEY = "pk.9d1a0a6102b95fdfcab79dc4a5255313"; // move to env in prod

  async function searchPlaces(text: string) {
    setLocQuery(text);
    if (text.length < 2) {
      setLocResults([]);
      return;
    }
    setLocLoading(true);
    try {
      const res = await fetch(
        `https://api.locationiq.com/v1/autocomplete.php?key=${API_KEY}&q=${encodeURIComponent(
          text
        )}&limit=5&countrycodes=PH&format=json`
      );
      const data = await res.json();
      setLocResults(data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLocLoading(false);
    }
  }

  // Skills search
  const fuse = useMemo(() => new Fuse(Skills, { threshold: 0.3, includeScore: true }), []);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search) {
      setDebouncedSearch("");
      return;
    }
    setLoading(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setLoading(false);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  const filteredSkills = useMemo(() => {
    if (!debouncedSearch) return [];
    let results = fuse.search(debouncedSearch).map((r) => r.item);
    results = results.filter((s) => !jobSkills.includes(s));
    return results.slice(0, 8);
  }, [debouncedSearch, jobSkills, fuse]);

  function addSkill(skill: string) {
    if (jobSkills.includes(skill)) return;
    if (jobSkills.length >= 10) return;
    setJobSkills((prev) => [...prev, skill]);
    setSearch("");
    Keyboard.dismiss();
  }
  function removeSkill(skill: string) {
    setJobSkills((prev) => prev.filter((s) => s !== skill));
  }

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  };

  // Unsaved changes
  const originalRef = useRef({
    jobTitle: job.jobTitle || "",
    jobDescription: job.jobDescription ? job.jobDescription.replace(/<[^>]+>/g, "") : "",
    industry: job.jobIndustry || "",
    location: job.location || {},
    jobSkills: job.jobSkills || [],
    employment: job.employment || [],
    workTypes: job.workTypes || [],
    salaryMin: typeof job?.salaryRange?.min === "number" ? String(job.salaryRange.min) : "",
    salaryMax: typeof job?.salaryRange?.max === "number" ? String(job.salaryRange.max) : "",
    currency: job?.salaryRange?.currency || "PHP",
    frequency: job?.salaryRange?.frequency || "month",
  });

  const isDirty = useMemo(() => {
    const o = originalRef.current;
    return !(
      o.jobTitle === jobTitle &&
      o.jobDescription === jobDescription &&
      o.industry === industry &&
      JSON.stringify(o.location) === JSON.stringify(location) &&
      JSON.stringify(o.jobSkills) === JSON.stringify(jobSkills) &&
      JSON.stringify(o.employment) === JSON.stringify(employment) &&
      JSON.stringify(o.workTypes) === JSON.stringify(workTypes) &&
      o.salaryMin === salaryMin &&
      o.salaryMax === salaryMax &&
      o.currency === currency &&
      o.frequency === frequency
    );
  }, [jobTitle, jobDescription, industry, location, jobSkills, employment, workTypes, salaryMin, salaryMax, currency, frequency]);

  const allowLeaveRef = useRef(false);
  const [unsavedVisible, setUnsavedVisible] = useState(false);
  const [saveVisible, setSaveVisible] = useState(false);
  const [pendingNavAction, setPendingNavAction] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const sub = (navigation as any).addListener("beforeRemove", (e: any) => {
      if (allowLeaveRef.current || !isDirty) return;
      e.preventDefault();
      setPendingNavAction(e.data.action);
      setUnsavedVisible(true);
    });
    return sub;
  }, [navigation, isDirty]);

  const performSave = async () => {
    // ✅ Validation checks with alert
    if (!jobTitle.trim()) {
      setAlertMessage("Job Title is required.");
      setAlertVisible(true);
      return false;
    }
    if (!jobDescription.trim()) {
      setAlertMessage("Job Description is required.");
      setAlertVisible(true);
      return false;
    }
    if (!industry) {
      setAlertMessage("Job Industry is required.");
      setAlertVisible(true);
      return false;
    }
    if (jobSkills.length === 0) {
      setAlertMessage("At least one skill is required.");
      setAlertVisible(true);
      return false;
    }
    if (employment.length === 0) {
      setAlertMessage("Select at least one Employment Type.");
      setAlertVisible(true);
      return false;
    }
    if (workTypes.length === 0) {
      setAlertMessage("Select at least one Work Type.");
      setAlertVisible(true);
      return false;
    }
    if (!location || !location.display_name) {
      setAlertMessage("Job Location is required.");
      setAlertVisible(true);
      return false;
    }

    // Salary validation (optional but helpful)
    const minNum = salaryMin ? Number(salaryMin) : null;
    const maxNum = salaryMax ? Number(salaryMax) : null;
    if (salaryMin && isNaN(minNum!)) {
      setAlertMessage("Min salary must be a number.");
      setAlertVisible(true);
      return false;
    }
    if (salaryMax && isNaN(maxNum!)) {
      setAlertMessage("Max salary must be a number.");
      setAlertVisible(true);
      return false;
    }
    if (minNum !== null && maxNum !== null && minNum > maxNum) {
      setAlertMessage("Min salary cannot be greater than Max salary.");
      setAlertVisible(true);
      return false;
    }

    const updatedJob = {
      jobTitle,
      jobDescription,
      jobSkills,
      jobIndustry: industry,
      employment,
      workTypes,
      salaryRange: {
        min: minNum,
        max: maxNum,
        currency: currency || null,
        frequency: frequency || null,
      },
      location: {
        display_name: location.display_name,
        city: location.city || null,
        province: location.province || null,
        country: location.country || null,
        postalCode: location.postalCode || null,
        lat: location.lat,
        lon: location.lon,
      },
    };

    setIsSaving(true);
    try {
      const res = await updateJobs(job.jobUID, updatedJob);
      if (res?.success) {
        setRefresh(!refresh);
        originalRef.current = {
          jobTitle: updatedJob.jobTitle,
          jobDescription: updatedJob.jobDescription,
          industry: updatedJob.jobIndustry,
          location: updatedJob.location as any,
          jobSkills: updatedJob.jobSkills,
          employment: updatedJob.employment,
          workTypes: updatedJob.workTypes,
          salaryMin: salaryMin,
          salaryMax: salaryMax,
          currency: currency,
          frequency: frequency,
        };
        return true;
      }
      setAlertMessage(res?.error || "Failed to save changes.");
      setAlertVisible(true);
      return false;
    } catch (err: any) {
      console.error("Save error:", err);
      setAlertMessage(err?.message || "An unexpected error occurred.");
      setAlertVisible(true);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const [industryModalVisible, setIndustryModalVisible] = useState(false);
  const initialIndustriesForModal = useMemo(() => {
    if (!industry) return [];
    const found = Industries.find((i) => i.name === industry);
    return found ? [found] : [];
  }, [industry]);

  const descCountColor =
    jobDescription.length > 1800
      ? "#DC2626"
      : jobDescription.length > 1500
      ? "#D97706"
      : "#6B7280";

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => (navigation as any).goBack()}>
          <ArrowLeft size={28} color="#37424F" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Edit Job Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150 }}>
        {/* Job Title */}
        <Text className="text-gray-800 text-sm mb-2">Job Title</Text>
        <TextInput
          value={jobTitle}
          onChangeText={setJobTitle}
          className="border rounded-xl px-4 py-3 mb-5 bg-gray-50 border-gray-300"
          placeholder="e.g. Frontend Developer"
        />

        {/* Job Description */}
        <Text className="text-gray-800 text-sm mb-2">Job Description</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: "#D1D5DB",
            borderRadius: 12,
            backgroundColor: "#F9FAFB",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <TextInput
            value={jobDescription}
            onChangeText={(t) => setJobDescription(t.slice(0, MAX_DESC))}
            multiline
            maxLength={MAX_DESC}
            onContentSizeChange={(e) => {
              const h = e.nativeEvent.contentSize.height || 0;
              setDescHeight(Math.max(140, Math.min(h, 440)));
            }}
            style={{
              minHeight: 140,
              height: descHeight,
              maxHeight: 440,
              textAlignVertical: "top",
              lineHeight: 20,
              color: "#111827",
            }}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
          <Text style={{ color: "#6B7280", fontSize: 12 }}>Tip: Use concise bullet-style lines</Text>
          <Text style={{ color: descCountColor, fontSize: 12 }}>
            {jobDescription.length} / {MAX_DESC}
          </Text>
        </View>

        {/* Industry */}
        <SectionDivider />
        <Text className="text-gray-800 text-sm mb-2">Job Industry</Text>
        <View className="flex-row items-center flex-wrap mb-3">
          {industry ? (
            <View className="bg-indigo-100 px-3 py-2 rounded-lg mr-2 mb-2">
              <Text className="text-indigo-600 font-medium">{industry}</Text>
            </View>
          ) : (
            <Text className="text-gray-400 italic mr-2 mb-2">No industry selected</Text>
          )}
          <TouchableOpacity
            onPress={() => setIndustryModalVisible(true)}
            className="flex-row items-center border border-gray-300 px-3 py-2 rounded-lg"
          >
            <Text className="text-gray-700">Change</Text>
          </TouchableOpacity>
          {industry ? (
            <TouchableOpacity
              onPress={() => setIndustry("")}
              className="ml-2 px-3 py-2 border border-gray-300 rounded-lg"
            >
              <Text className="text-gray-700">Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Location */}
        <SectionDivider />
        <Text className="text-gray-800 text-sm mb-2">Location</Text>
        <TextInput
          value={locQuery}
          onChangeText={searchPlaces}
          placeholder="Search for a city..."
          className="border border-gray-300 rounded-xl px-4 py-3 mb-2"
        />
        {locLoading ? (
          <View className="flex-row items-center p-3">
            <ActivityIndicator size="small" color={BRAND_PURPLE} />
            <Text className="ml-2 text-gray-500">Searching...</Text>
          </View>
        ) : locResults.length > 0 ? (
          <View className="border border-gray-200 rounded-lg bg-white mb-3">
            {locResults.map((item, idx) => (
              <Pressable
                key={`loc-${idx}`}
                onPress={() => {
                  setLocation({
                    country: item.address?.country || null,
                    country_code: item.address?.country_code || null,
                    display_name: item.display_name,
                    lat: item.lat,
                    lon: item.lon,
                    province: item.address?.state || null,
                    city: item.address?.city || item.address?.town || null,
                    postalCode: item.address?.postcode || null,
                  });
                  setLocQuery(item.display_name);
                  setLocResults([]);
                }}
                className="px-3 py-2 border-b border-gray-100"
              >
                <Text className="text-gray-800">{item.display_name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {location?.display_name && (
          <Text className="text-gray-700 mb-3">📍 {location.display_name}</Text>
        )}

        {/* Skills */}
        <SectionDivider />
        <Text className="text-gray-800 text-sm mb-2">Skills</Text>
        <View className="flex-row flex-wrap mb-2">
          {jobSkills.map((skill) => (
            <View
              key={`skill-${skill}`}
              style={{
                flexDirection: "row",
                backgroundColor: BRAND_PURPLE,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
                margin: 4,
              }}
            >
              <Text style={{ color: "white", marginRight: 6 }}>{skill}</Text>
              <Pressable onPress={() => removeSkill(skill)}>
                <Text style={{ color: "white", fontWeight: "700" }}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search a skill..."
          className="border border-gray-300 rounded-xl px-4 py-3 mb-2"
        />
        {search.length > 0 && (
          <View className="bg-white border border-gray-200 rounded-lg mb-3">
            {loading ? (
              <View className="flex-row items-center p-3">
                <ActivityIndicator size="small" color={BRAND_PURPLE} />
                <Text className="ml-2 text-gray-500">Searching...</Text>
              </View>
            ) : filteredSkills.length > 0 ? (
              <ScrollView style={{ maxHeight: 200 }}>
                {filteredSkills.map((skill, i) => (
                  <Pressable
                    key={`filtered-${typeof skill === "string" ? skill : i}`}
                    onPress={() => addSkill(skill)}
                    className="px-3 py-2 border-b border-gray-100"
                  >
                    <Text>
                      <Highlighted text={skill} query={debouncedSearch} />
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View className="p-3">
                <Text className="text-gray-400 italic">No results found</Text>
              </View>
            )}
          </View>
        )}

        {/* Employment */}
        <SectionDivider />
        <Text className="text-gray-800 text-sm mb-2">Employment Type</Text>
        <View className="flex-row flex-wrap mb-5">
          {EmploymentTypes.map((et) => {
            const selected = employment.includes(et.type);
            return (
              <TouchableOpacity
                key={`emp-${et.id}`}
                onPress={() => toggleSelection(et.type, employment, setEmployment)}
                className={`px-3 py-2 rounded-lg mr-2 mb-2 ${
                  selected ? "bg-blue-600" : "bg-gray-100"
                }`}
              >
                <Text className={selected ? "text-white" : "text-gray-800"}>{et.type}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Work Type */}
        <SectionDivider />
        <Text className="text-gray-800 text-sm mb-2">Work Type</Text>
        <View className="flex-row flex-wrap mb-5">
          {WorkTypes.map((wt) => {
            const selected = workTypes.includes(wt.type);
            return (
              <TouchableOpacity
                key={`work-${wt.id}`}
                onPress={() => toggleSelection(wt.type, workTypes, setWorkTypes)}
                className={`px-3 py-2 rounded-lg mr-2 mb-2 ${
                  selected ? "bg-blue-600" : "bg-gray-100"
                }`}
              >
                <Text className={selected ? "text-white" : "text-gray-800"}>{wt.type}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Salary */}
        <SectionDivider />
        <Text className="text-gray-800 text-sm mb-2">Salary</Text>
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <Text style={{ color: "#374151", marginBottom: 6 }}>Min</Text>
            <TextInput
              value={salaryMin}
              onChangeText={setSalaryMin}
              keyboardType="numeric"
              placeholder="e.g. 15000"
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <Text style={{ color: "#374151", marginBottom: 6 }}>Max</Text>
            <TextInput
              value={salaryMax}
              onChangeText={setSalaryMax}
              keyboardType="numeric"
              placeholder="e.g. 25000"
              className="border border-gray-300 rounded-xl px-4 py-3 bg-white"
            />
          </View>
        </View>

        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 6 }}>
            <AutocompleteInput
              label="Currency"
              value={currency}
              setValue={setCurrency}
              data={CurrencyOptions}
              displayKey="currency"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 6 }}>
            <AutocompleteInput
              label="Frequency"
              value={frequency}
              setValue={setFrequency}
              data={FrequencyOptions}
              displayKey="frequency"
            />
          </View>
        </View>

        {/* Footer */}
        <View className="flex-row justify-between mt-5 mb-12">
          <TouchableOpacity
            onPress={() => {
              if (isDirty) setUnsavedVisible(true);
              else (navigation as any).goBack();
            }}
            className="flex-1 border border-gray-300 rounded-xl py-4 mr-2"
          >
            <Text className="text-center text-gray-700 font-medium">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSaveVisible(true)}
            disabled={isSaving}
            className="flex-1 bg-blue-600 rounded-xl py-4 ml-2"
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-white font-medium">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Industry Modal */}
      <IndustryModal
        visible={industryModalVisible}
        initialIndustries={initialIndustriesForModal}
        onClose={() => setIndustryModalVisible(false)}
        onSave={(selected) => {
          setIndustry(selected.length > 0 ? selected[0].name : "");
          setIndustryModalVisible(false);
        }}
        isMultiSelect={false}
        maxSelection={1}
      />

      {/* Confirm Modals */}
      <ConfirmationModal
        visible={unsavedVisible}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmText="Discard"
        cancelText="Stay"
        onConfirm={() => {
          setUnsavedVisible(false);
          allowLeaveRef.current = true;
          if (pendingNavAction) (navigation as any).dispatch(pendingNavAction);
          else (navigation as any).goBack();
        }}
        onCancel={() => setUnsavedVisible(false)}
      />

      <ConfirmationModal
        visible={saveVisible}
        title="Save changes?"
        message="Do you want to save your edits to this job listing?"
        confirmText="Save"
        cancelText="Cancel"
        onConfirm={async () => {
          setSaveVisible(false);
          const ok = await performSave();
          if (ok) {
            allowLeaveRef.current = true;
            (navigation as any).goBack();
          }
        }}
        onCancel={() => setSaveVisible(false)}
      />

      {/* Alert Modal for validation */}
      <AlertModal
        visible={alertVisible}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};
