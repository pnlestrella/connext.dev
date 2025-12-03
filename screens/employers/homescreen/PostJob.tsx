import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Keyboard,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { IndustryModal } from 'components/profileScreen/IndustryModal';

import { Industries } from '../../../data/industries.json';
import EmploymentTypes from '../../../data/employmentTypes.json';
import WorkTypes from '../../../data/workTypes.json';
import CurrencyOptions from '../../../data/currency.json';
import FrequencyOptions from '../../../data/frequency.json';
import AutocompleteInput from 'components/profileScreen/AutoCompleteInput';

import { useAuth } from 'context/auth/AuthHook';
import { postJob } from 'api/employers/joblistings';
import { useEmployers } from 'context/employers/EmployerHook';

import Fuse from 'fuse.js';
import Skills from '../../../data/cleaned_skills.json';
import AlertModal from 'components/AlertModal';
import { Loading } from 'components/Loading';
import { createApplication } from 'api/applications';

const fuse = new Fuse(Skills, { threshold: 0.3, includeScore: true });
const BRAND_PURPLE = '#2563EB';
const API_KEY = 'pk.9d1a0a6102b95fdfcab79dc4a5255313'; // LocationIQ
const PH = '#9CA3AF'; // explicit placeholder gray
const DESC_LIMIT = 2000;

// Escape regex special characters in user input
function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Safe highlight matched text
const Highlighted = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <Text>{text}</Text>;
  const safe = escapeRegex(query);
  const regex = new RegExp(`(${safe})`, 'i');
  const parts = text.split(regex);
  return (
    <Text>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <Text key={i} style={{ fontWeight: '700', color: BRAND_PURPLE }}>
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
};

const SectionDivider = () => (
  <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 }} />
);

const CheckboxItem = ({
  label,
  isSelected,
  onToggle,
}: {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}) => (
  <TouchableOpacity onPress={onToggle} className="mb-4 mr-5 flex-row items-center">
    <View
      className={`mr-3 h-8 w-8 items-center justify-center rounded-lg border-2 ${
        isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
      }`}>
      {isSelected && <Check size={20} color="white" />}
    </View>
    <Text style={{ fontFamily: 'Lexend-Regular', fontSize: 16, color: '#37424F' }}>{label}</Text>
  </TouchableOpacity>
);

export const PostJob = () => {
  const { userMDB } = useAuth();
  const { setRefresh, refresh } = useEmployers();
  const navigation = useNavigation();

  // AlertModal state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('Alert');
  const [alertMessage, setAlertMessage] = useState('');
  const openAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Loading modal state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // form state
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [jobSkills, setJobSkills] = useState<string[]>([]);
  const [employment, setEmployment] = useState<string[]>([]);
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('');
  const [frequency, setFrequency] = useState('');

  const profilePic = userMDB.profilePic;
  const companyName = userMDB.companyName;

  // industries modal
  const [industryModalVisible, setIndustryModalVisible] = useState(false);
  const initialIndustriesForModal = useMemo(() => {
    return industries
      .map((name) => Industries.find((i) => i.name === name))
      .filter((i): i is { id: number; name: string } => Boolean(i));
  }, [industries]);

  // location
  const [location, setLocation] = useState<any>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [locLoading, setLocLoading] = useState(false);

  async function searchPlaces(text: string) {
    setLocationQuery(text);
    if (text.length < 2) {
      setLocationResults([]);
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
      setLocationResults(data);
    } catch (err) {
      console.error('Error fetching locations:', err);
      openAlert('Location error', 'Unable to fetch locations right now. Please try again.');
    } finally {
      setLocLoading(false);
    }
  }

  // skills search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search) {
      setDebouncedSearch('');
      return;
    }
    setLoading(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setLoading(false);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return [];
    let results = fuse.search(debouncedSearch).map((r) => r.item);
    results = results.filter((s) => !jobSkills.includes(s));
    return results.slice(0, 8);
  }, [debouncedSearch, jobSkills]);

  // Add skill from suggestion or typed input
  function addSkill(skill: string) {
    if (jobSkills.includes(skill)) return;
    if (jobSkills.length >= 10) {
      openAlert('Limit reached', 'You can only select up to 10 skills.');
      return;
    }
    setJobSkills((prev) => [...prev, skill]);
    setSearch('');
    Keyboard.dismiss();
  }

  // Add skill typed by user if not in suggestions
  function addCustomSkill() {
    const trimmed = search.trim();
    if (!trimmed) return;
    if (jobSkills.includes(trimmed)) return;
    if (jobSkills.length >= 10) {
      openAlert('Limit reached', 'You can only select up to 10 skills.');
      return;
    }
    setJobSkills((prev) => [...prev, trimmed]);
    setSearch('');
    Keyboard.dismiss();
  }

  function removeSkill(skill: string) {
    setJobSkills((prev) => prev.filter((s) => s !== skill));
  }

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) setList(list.filter((i) => i !== item));
    else setList([...list, item]);
  };

  const confirmDiscard = () => {
    openAlert('Discard changes?', 'Unsaved job details will be lost.');
  };

  const handleSubmitJob = async () => {
    if (!jobTitle.trim()) return openAlert('Missing field', 'Job Title is required.');
    if (!jobDescription.trim()) return openAlert('Missing field', 'Job Description is required.');
    if (industries.length === 0) return openAlert('Missing field', 'Select at least one Industry.');
    if (!location) return openAlert('Missing field', 'Please select a valid Location.');
    if (jobSkills.length === 0) return openAlert('Missing field', 'Add at least one Skill.');
    if (employment.length === 0)
      return openAlert('Missing field', 'Select at least one Employment type.');
    if (workTypes.length === 0) return openAlert('Missing field', 'Select at least one Work type.');

    const jobData = {
      employerUID: userMDB.employerUID,
      companyName,
      jobTitle,
      jobIndustry: industries[0] || '',
      jobDescription,
      jobSkills,
      employment,
      workTypes,
      salaryRange: {
        min: salaryMin ? Number(salaryMin) : null,
        max: salaryMax ? Number(salaryMax) : null,
        currency: currency || null,
        frequency: frequency || null,
      },
      location: {
        display_name: location.display_name,
        city: location.city || location.province || null,
        province: location.province || null,
        postalCode: location.postalCode || null,
        country: location.country || null,
        lat: location.lat,
        lon: location.lon,
      },
      profilePic,
    };

    try {
      setIsSubmitting(true);
      const res = await postJob(jobData);
      if (res.success) {
        openAlert('Success', 'Job posted successfully!');
        setRefresh(!refresh);
        setTimeout(() => (navigation as any).goBack(), 100);

        const job = res.payload;
        // FOR TESTING
        const Applicants = [
          {
            email: 'a@gmail.com',
            seekerUID: '559n35MzROUsT4qgLRPKpeBRGuB2',
            resume: '/resumes/res__1__0S5_2aact.pdf',
          },
          {
            email: 'b@gmail.com',
            seekerUID: 'jpJ9dGFfbhTCA2DJfDLAkkrvzWA2',
            resume: '/resumes/res__1__0S5_2aact.pdf',
          },
          {
            email: 'c@gmail.com',
            seekerUID: 'Mt0JxrMFWVOdhAnyogATetCageu2',
            resume: '/resumes/res__1__0S5_2aact.pdf',
          },
          {
            email: 'd@gmail.com',
            seekerUID: '1xGv7CJXafaiGZcmpL8KlFFZCaN2',
            resume: '/resumes/res__1__0S5_2aact.pdf',
          },
          {
            email: 'e@gmail.com',
            seekerUID: 'TIMMhhC9usNkSEkLZduS00N6ZDn2',
            resume: '/resumes/res__1__0S5_2aact.pdf',
          },
          {
            email: 'f@gmail.com',
            seekerUID: 'KfM0UXDxwWOybuUh0NTqyzRiOF33',
            resume: '/resumes/res__1__0S5_2aact.pdf',
          },
          {
            email: 'g@gmail.com',
            seekerUID: 'Rji2QgcXwBfy1EMsegpRQYsqlUr2',
            resume: '/resumes/res__1__0S5_2aact.pdf',
          },
          {
            email: 'h@gmail.com',
            seekerUID: 'zuukB8mzB3RUgkIuSNRiILMITax1',
            resume: '/resumes/res__1__0S5_2aact.pdf',
          },
        ];

        for (const applicant of Applicants) {
          const application = {
            jobUID: job.jobUID,
            employerUID: job.employerUID,
            seekerUID: applicant.seekerUID,
            resume: applicant.resume,
          };

          const appRes = await createApplication(application);
          console.log(`Created application for: ${applicant.email}`, appRes);
        }

        console.log('Application created:', appRes, application);
      } else {
        openAlert('Failed', res.error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('Error posting job:', err);
      openAlert('Error', err?.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 px-5 py-4">
        <TouchableOpacity onPress={() => (navigation as any).goBack()}>
          <ArrowLeft size={28} color="#37424F" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 22, color: '#37424F' }}>
          Post a Job
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Keyboard-aware scroller */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 12}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}>
          {/* Job Title */}
          <Text className="mb-2 text-gray-700">Job Title</Text>
          <TextInput
            value={jobTitle}
            onChangeText={setJobTitle}
            className="mb-5 rounded-xl border border-gray-300 px-4 py-3"
            placeholder="e.g. Senior Frontend Engineer"
            placeholderTextColor={PH}
          />

          {/* Job Description */}
          <Text className="mb-2 text-gray-700">Job Description</Text>
          <View
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden',
              marginBottom: 6,
              shadowColor: '#000',
              shadowOpacity: 0.03,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
            }}>
            <TextInput
              value={jobDescription}
              onChangeText={(val) => {
                if (val.length <= DESC_LIMIT) setJobDescription(val);
              }}
              placeholder="e.g. Outline responsibilities, required skills, years of experience, work hours, and benefits."
              placeholderTextColor={PH}
              multiline
              textAlignVertical="top"
              style={{
                minHeight: 200,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontFamily: 'Poppins-Regular',
                color: '#111827',
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: '#6B7280', fontSize: 12 }}>
              Tip: Use short paragraphs and bullet-like lines for readability.
            </Text>
            <Text
              style={{
                color: jobDescription.length > DESC_LIMIT - 50 ? '#DC2626' : '#6B7280',
                fontSize: 12,
              }}>
              {jobDescription.length} / {DESC_LIMIT}
            </Text>
          </View>

          <SectionDivider />

          {/* Industries */}
          <Text className="mb-2 text-gray-700">Job Industries</Text>
          <View className="mb-3 flex-row flex-wrap">
            {industries.map((industry, idx) => (
              <View key={idx} className="mb-2 mr-2 rounded-lg bg-indigo-100 px-3 py-2">
                <Text className="font-medium text-indigo-600">{industry}</Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => setIndustryModalVisible(true)}
              className="flex-row items-center rounded-lg border border-gray-300 px-3 py-2">
              <Plus size={16} color="#37424F" />
              <Text className="ml-1 text-gray-700">Add new</Text>
            </TouchableOpacity>
          </View>

          <SectionDivider />

          {/* Location */}
          <Text className="mb-2 text-gray-700">Location</Text>
          <TextInput
            value={locationQuery}
            onChangeText={searchPlaces}
            placeholder="e.g. Manila, Metro Manila"
            placeholderTextColor={PH}
            style={{ fontFamily: 'Poppins-Regular' }}
            className="mb-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3"
          />
          {locLoading && (
            <View className="flex-row items-center p-3">
              <ActivityIndicator size="small" color={BRAND_PURPLE} />
              <Text className="ml-2 text-gray-500">Searching...</Text>
            </View>
          )}
          {locationResults.length > 0 && (
            <View className="mb-3 rounded-lg border border-gray-200 bg-white">
              {locationResults.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setLocation({
                      country: item.address?.country || null,
                      country_code: item.address?.country_code || null,
                      name:
                        item.address?.city ||
                        item.address?.town ||
                        item.address?.village ||
                        item.address?.state ||
                        null,
                      display_name: item.display_name,
                      lat: item.lat,
                      lon: item.lon,
                      province: item.address?.state || null,
                      city: item.address?.city || item.address?.town || null,
                      postalCode: item.address?.postcode || null,
                    });
                    setLocationQuery(item.display_name);
                    setLocationResults([]);
                  }}
                  className="border-b border-gray-100 px-3 py-2">
                  <Text className="text-gray-800">{item.display_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {location && <Text className="mb-5 text-gray-700">📍 {location.display_name}</Text>}

          <SectionDivider />

          {/* Skills */}
          <Text className="mb-2 text-gray-700">Skills</Text>
          <View className="mb-2 flex-row flex-wrap">
            {jobSkills.map((skill) => (
              <View
                key={skill}
                style={{
                  flexDirection: 'row',
                  backgroundColor: BRAND_PURPLE,
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  margin: 4,
                }}>
                <Text style={{ color: 'white', marginRight: 6 }}>{skill}</Text>
                <Pressable onPress={() => removeSkill(skill)}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 12,
              paddingHorizontal: 12,
              marginBottom: 8,
            }}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Type a skill to add or select from below"
              placeholderTextColor={PH}
              style={{ flex: 1, height: 44, fontFamily: 'Poppins-Regular', color: '#37424F' }}
              onSubmitEditing={addCustomSkill}
            />
            {search.trim().length > 0 && (
              <Pressable onPress={addCustomSkill} style={{ padding: 8 }}>
                <Check size={20} color={BRAND_PURPLE} />
              </Pressable>
            )}
          </View>
          {search.length > 0 && (
            <View
              style={{
                backgroundColor: '#fff',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 12,
                marginBottom: 16,
              }}>
              {loading ? (
                <View className="flex-row items-center p-3">
                  <ActivityIndicator size="small" color={BRAND_PURPLE} />
                  <Text className="ml-2 text-gray-500">Searching...</Text>
                </View>
              ) : filtered.length > 0 ? (
                <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
                  {filtered.map((skill, idx) => (
                    <Pressable
                      key={skill}
                      onPress={() => addSkill(skill)}
                      android_ripple={{ color: '#EDE9FE' }}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderBottomWidth: idx === filtered.length - 1 ? 0 : 1,
                        borderBottomColor: '#F3F4F6',
                      }}>
                      <Text>
                        <Highlighted text={skill} query={debouncedSearch} />
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <View className="p-3">
                  <Text className="italic text-gray-400">No results found</Text>
                </View>
              )}
            </View>
          )}

          <SectionDivider />

          {/* Employment Type */}
          <Text className="mb-2 text-gray-700">Employment Type</Text>
          <View className="mb-5 flex-row flex-wrap">
            {EmploymentTypes.map((et) => (
              <CheckboxItem
                key={et.id}
                label={et.type}
                isSelected={employment.includes(et.type)}
                onToggle={() => toggleSelection(et.type, employment, setEmployment)}
              />
            ))}
          </View>

          <SectionDivider />

          {/* Work Type */}
          <Text className="mb-2 text-gray-700">Work Type</Text>
          <View className="mb-5 flex-row flex-wrap">
            {WorkTypes.map((wt) => (
              <CheckboxItem
                key={wt.id}
                label={wt.type}
                isSelected={workTypes.includes(wt.type)}
                onToggle={() => toggleSelection(wt.type, workTypes, setWorkTypes)}
              />
            ))}
          </View>

          <SectionDivider />

          {/* Salary */}
          <Text className="mb-2 text-gray-700">Salary (Optional)</Text>
          <View className="mb-5 flex-row">
            <View className="mr-3 flex-1">
              <Text className="mb-2 text-gray-700">Min</Text>
              <TextInput
                value={salaryMin}
                onChangeText={setSalaryMin}
                keyboardType="numeric"
                className="rounded-xl border border-gray-300 px-4 py-3"
                placeholder="e.g. 15000"
                placeholderTextColor={PH}
              />
            </View>
            <View className="ml-3 flex-1">
              <Text className="mb-2 text-gray-700">Max</Text>
              <TextInput
                value={salaryMax}
                onChangeText={setSalaryMax}
                keyboardType="numeric"
                className="rounded-xl border border-gray-300 px-4 py-3"
                placeholder="e.g. 25000"
                placeholderTextColor={PH}
              />
            </View>
          </View>

          {/* Currency & Frequency */}
          <View className="mb-5 flex-row">
            <View className="mr-3 flex-1">
              <AutocompleteInput
                label="Currency"
                value={currency}
                setValue={setCurrency}
                data={CurrencyOptions}
                displayKey="currency"
              />
            </View>
            <View className="ml-3 flex-1">
              <AutocompleteInput
                label="Frequency"
                value={frequency}
                setValue={setFrequency}
                data={FrequencyOptions}
                displayKey="frequency"
              />
            </View>
          </View>

          <SectionDivider />

          {/* Submit */}
          <View className="mb-12 flex-row justify-between px-5">
            <TouchableOpacity
              onPress={confirmDiscard}
              className="mr-3 flex-1 rounded-xl bg-gray-200 px-6 py-4"
              disabled={isSubmitting}>
              <Text className="text-center font-semibold text-gray-700">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmitJob}
              className="ml-3 flex-1 rounded-xl px-6 py-4"
              style={{ backgroundColor: isSubmitting ? '#94a3b8' : '#2563eb' }}
              disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center font-semibold text-white">Post Job</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <IndustryModal
        visible={industryModalVisible}
        onClose={() => setIndustryModalVisible(false)}
        onSave={(selected) => setIndustries(selected.map((i) => i.name))}
        initialSelected={initialIndustriesForModal}
        maxSelection={1}
      />

      {/* Alert Modal */}
      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      {/* Loading overlay */}
      {isSubmitting && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255,255,255,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}>
          <Loading />
        </View>
      )}
    </SafeAreaView>
  );
};
