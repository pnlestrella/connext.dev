import React, { useState, useMemo, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { RichEditor, RichToolbar } from 'react-native-pell-rich-editor';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Check } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// modals
import { IndustryModal } from 'components/profileScreen/IndustryModal';
import { AddressModal } from 'components/profileScreen/AddressModal';
import { Industries } from '../../../data/industries.json';
import { SkillsModal } from 'components/profileScreen/SkillsModal';

// data
import { default as EmploymentTypes } from '../../../data/employmentTypes.json';
import { default as WorkTypes } from '../../../data/workTypes.json';
import { default as CurrencyOptions } from '../../../data/currency.json';
import { default as FrequencyOptions } from '../../../data/frequency.json';
import AutocompleteInput from 'components/profileScreen/AutoCompleteInput';
import { useAuth } from 'context/auth/AuthHook';
import { postJob } from 'api/employers/joblistings';
import { useEmployers } from 'context/employers/EmployerHook';

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
    <Text className="text-base text-gray-700 font-normal" style={{ fontFamily: 'Lexend-Regular' }}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Section Divider
const SectionDivider = () => (
  <View className="h-px bg-gray-200 my-5" />
);

export const PostJob = () => {
  const { userMDB, user } = useAuth();
  const { setRefresh, refresh } = useEmployers();

  const navigation = useNavigation();
  const richText = useRef<RichEditor>(null);

  // form state
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [industries, setIndustries] = useState<string[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [jobSkills, setJobSkills] = useState<string[]>([]);
  const [employment, setEmployment] = useState<string[]>([]);
  const [workTypes, setWorkTypes] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('');
  const [frequency, setFrequency] = useState('');
  const profilePic = userMDB.profilePic;
  const companyName = userMDB.companyName;

  const [industryModalVisible, setIndustryModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [skillsModalVisible, setSkillsModalVisible] = useState(false);

  const initialIndustriesForModal = useMemo(() => {
    return industries
      .map((name) => Industries.find((i) => i.name === name))
      .filter((i): i is { id: number; name: string } => Boolean(i));
  }, [industries]);

  const toggleSelection = (item: string, list: string[], setList: (val: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // discard alert
  const confirmDiscard = () => {
    Alert.alert('Discard changes?', 'If you leave now, any unsaved job details will be lost.', [
      { text: 'Stay', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleSubmitJob = async () => {
    // Validation for required fields
    if (!jobTitle.trim()) {
      alert('Job Title is required');
      return;
    }

    if (!jobDescription.trim()) {
      alert('Job Description is required');
      return;
    }

    if (industries.length === 0) {
      alert('Please select at least one Industry');
      return;
    }

    if (!location || !location.city || !location.province || !location.postalCode) {
      alert('Please provide a valid Location (City, Province, Postal Code)');
      return;
    }

    if (jobSkills.length === 0) {
      alert('Please add at least one Skill');
      return;
    }

    if (employment.length === 0) {
      alert('Please select at least one Employment type');
      return;
    }

    if (workTypes.length === 0) {
      alert('Please select at least one Work type');
      return;
    }

    const jobData = {
      employerUID: userMDB.employerUID,
      companyName,
      jobTitle,
      jobIndustry: industries[0] || '',
      jobDescription,
      jobSkills,
      employment,
      workTypes,
      salary: {
        min: salaryMin ? Number(salaryMin) : null,
        max: salaryMax ? Number(salaryMax) : null,
        currency: currency || null,
        frequency: frequency || null,
      },
      location,
      profilePic,
    };

    try {
      const res = await postJob(jobData);
      if (res.success) {
        alert('✅ Job posted successfully!');
        setRefresh(!refresh);
        setTimeout(() => {
          navigation.goBack();
        }, 100);
      } else {
        alert('❌ Failed to post job: ' + (res.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('⚠️ Error posting job:', err);
      alert('❌ An error occurred while posting the job.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header + Page Title */}
      <View className="flex-row items-center justify-between border-b border-gray-200 px-5 py-4">
        <TouchableOpacity onPress={() => confirmDiscard()}>
          <ArrowLeft size={28} color="#37424F" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-700" style={{ fontFamily: 'Poppins-Bold' }}>
          Post a Job
        </Text>
        <View className="w-7" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20,}}
        showsVerticalScrollIndicator={false}>
        
        {/* Job Title */}
        <Text className="text-sm text-gray-700 mb-2 mt-5" style={{ fontFamily: 'Lexend-Regular' }}>
          Job Title
        </Text>
        <TextInput
          value={jobTitle}
          onChangeText={setJobTitle}
          className="mb-5 rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
          style={{ fontFamily: 'Lexend-Regular', fontSize: 15 }}
        />

        {/* Job Description */}
        <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Lexend-Regular' }}>
          Job Description
        </Text>

        <View className="mb-2 w-full overflow-hidden rounded-xl border border-gray-300">
          <RichEditor
            ref={richText}
            style={{ minHeight: 180, width: '100%' }}
            placeholder="Write a clear, detailed job description..."
            initialContentHTML={jobDescription}
            onChange={(text) => setJobDescription(text.slice(0, 2000))}
            editorStyle={{
              backgroundColor: '#F9FAFB',
              color: '#37424F',
              placeholderColor: '#9CA3AF',
              contentCSSText: `
                font-family: Lexend-Regular;
                font-size: 15px;
                padding: 14px;
                line-height: 1.6;
              `,
            }}
          />
        </View>

        {/* Character Count */}
        <Text className="mb-5 text-right text-xs text-gray-500" style={{ fontFamily: 'Lexend-Regular' }}>
          {jobDescription.length} / 2000 characters
        </Text>

        <SectionDivider />

        {/* Industries */}
        <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Lexend-Regular' }}>
          Job Industries
        </Text>
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

        {/* Recommendation for Industries */}
        <View className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <Text className="text-sm text-blue-800">
            💡 Adding relevant <Text className="font-semibold">industries</Text> helps improve your
            job visibility and ensures it shows up in more relevant searches.
          </Text>
        </View>

        <SectionDivider />

        {/* Location */}
        <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Lexend-Regular' }}>
          Location
        </Text>

        <TouchableOpacity
          onPress={() => setAddressModalVisible(true)}
          className="mb-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
          <Text className="text-base text-gray-700" style={{ fontFamily: 'Lexend-Regular' }}>
            Set company location
          </Text>
        </TouchableOpacity>
        {location && (
          <Text className="text-sm text-gray-700 mb-5" style={{ fontFamily: 'Lexend-Regular' }}>
            📍 {location.city}, {location.province}, {location.country} ({location.postalCode})
          </Text>
        )}

        <SectionDivider />

        {/* Skills */}
        <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Lexend-Regular' }}>
          Skills
        </Text>
        <TouchableOpacity
          onPress={() => setSkillsModalVisible(true)}
          className="mb-3 rounded-xl border border-gray-300 bg-gray-50 px-4 py-3">
          <Text className="text-base text-gray-700" style={{ fontFamily: 'Lexend-Regular' }}>
            Select skills
          </Text>
        </TouchableOpacity>

        {/* Recommendation */}
        <View className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <Text className="text-sm text-yellow-800">
            💡 We recommend adding at least <Text className="font-semibold">3 skills</Text> to make
            your job more searchable and visible to qualified candidates.
          </Text>
        </View>

        {jobSkills.length > 0 && (
          <View className="flex-row flex-wrap">
            {jobSkills.map((skill, idx) => (
              <View key={idx} className="mb-2 mr-2 rounded-lg bg-green-100 px-3 py-1">
                <Text className="text-green-700">{skill}</Text>
              </View>
            ))}
          </View>
        )}

        <SectionDivider />

        {/* Employment Type */}
        <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Lexend-Regular' }}>
          Employment Type
        </Text>
        <View className="flex-row flex-wrap items-center">
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
        <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Lexend-Regular' }}>
          Work Type
        </Text>
        <View className="flex-row flex-wrap items-center">
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

        {/* Salary (Optional) */}
        <Text className="text-sm text-gray-700 mb-2" style={{ fontFamily: 'Lexend-Regular' }}>
          Salary (Optional)
        </Text>

        <View className="mb-5 flex-row">
          <View className="mr-3 flex-1">
            <Text className="mb-2 text-gray-700">Min</Text>
            <TextInput
              value={salaryMin}
              onChangeText={setSalaryMin}
              keyboardType="numeric"
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
              style={{ fontFamily: 'Lexend-Regular', fontSize: 15 }}
              placeholder="e.g. 15000"
            />
          </View>

          <View className="ml-3 flex-1">
            <Text className="mb-2 text-gray-700">Max</Text>
            <TextInput
              value={salaryMax}
              onChangeText={setSalaryMax}
              keyboardType="numeric"
              className="rounded-xl border border-gray-300 px-4 py-3 text-gray-900"
              style={{ fontFamily: 'Lexend-Regular', fontSize: 15 }}
              placeholder="e.g. 25000"
            />
          </View>
        </View>

        {/* Currency & Frequency (Optional) */}
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

        {/* Submit + Cancel */}
        <View className="mb-12 flex-row justify-between px-5">
          {/* Cancel */}
          <TouchableOpacity
            onPress={confirmDiscard}
            className="mr-3 flex-1 rounded-xl bg-gray-200 px-6 py-4">
            <Text
              className="text-base font-semibold text-gray-700 text-center"
              style={{ fontFamily: 'Lexend-Regular' }}>
              Cancel
            </Text>
          </TouchableOpacity>

          {/* Post Job */}
          <TouchableOpacity
            onPress={handleSubmitJob}
            className="ml-3 flex-1 rounded-xl bg-blue-600 px-6 py-4">
            <Text
              className="text-base font-semibold text-white text-center"
              style={{ fontFamily: 'Lexend-Regular' }}>
              Post Job
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <IndustryModal
        visible={industryModalVisible}
        onClose={() => setIndustryModalVisible(false)}
        onSave={(selected) => setIndustries(selected.map((i) => i.name))}
        initialSelected={initialIndustriesForModal}
        maxSelection={1}
      />
      <AddressModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onSave={(addr) => setLocation(addr)}
        initialAddress={location}
      />
      <SkillsModal
        visible={skillsModalVisible}
        onClose={() => setSkillsModalVisible(false)}
        onSave={(selectedSkills) => setJobSkills(selectedSkills)}
        initialSelected={jobSkills}
      />
    </SafeAreaView>
  );
};