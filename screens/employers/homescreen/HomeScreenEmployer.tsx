import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Header } from 'components/Header';
import { useEmployers } from 'context/employers/EmployerHook';
import { Search, SlidersHorizontal, Pencil, User, Edit, Maximize2, XCircle, CalendarDays, CheckCircle } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Text, Pressable, View, ScrollView, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmationModal from 'components/ConfirmationModal';
import { updateJobs } from 'api/employers/joblistings';

export const HomeScreenEmployer = () => {
  const { jobOpenings, applicationCounts, setRefresh } = useEmployers();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Refresh on focus (functional update avoids stale closure)
  useFocusEffect(
    useCallback(() => {
      setRefresh(v => !v);
    }, [setRefresh])
  );

  // Sort newest first
  const sortedJobs = useMemo(() => {
    if (!Array.isArray(jobOpenings)) return [];
    return [...jobOpenings].sort((a, b) => {
      const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }, [jobOpenings]);

  const handleApplicationScreen = (jobUID: string, jobTitle: string) => {
    navigation.push('jobApplications', { jobUID, jobTitle });
  };

  const handlePost = () => {
    navigation.navigate('postJob');
  };

  // Modal state for toggling open/close
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [jobToToggle, setJobToToggle] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const openStatusModal = (job: any) => {
    setJobToToggle(job);
    setStatusModalVisible(true);
  };

  const confirmTogglePosting = async () => {
    if (!jobToToggle) return;
    try {
      setSaving(true);
      const desiredStatus = !jobToToggle.status;
      const res = await updateJobs(jobToToggle.jobUID, { status: desiredStatus });
      if (!res?.success) {
        alert('Failed to update posting.');
        return;
      }
      // Optional toast/alert
      setRefresh(v => !v);
    } catch (e) {
      alert('Something went wrong.');
    } finally {
      setSaving(false);
      setStatusModalVisible(false);
      setJobToToggle(null);
    }
  };

  const cancelTogglePosting = () => {
    setStatusModalVisible(false);
    setJobToToggle(null);
  };

  const renderJob = (item: any) => {
    console.log(item.jobUID,'item', item.jobTitle)
    const isClosed = item.status === false;
    const headerBg = isClosed ? '#9CA3AF' : '#6C63FF';
    const cardOpacity = isClosed ? 0.6 : 1;
    const titleColor = isClosed ? '#F3F4F6' : 'white';
    const subTextColor = isClosed ? '#F9FAFB' : 'white';
    const actionColor = isClosed ? '#059669' : '#DC2626'; // green for Open, red for Close
    const ActionIcon = isClosed ? CheckCircle : XCircle;
    const actionLabel = isClosed ? 'Open Posting' : 'Close Posting';

    return (
      <View
        key={item.jobUID}
        style={{
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 12,
          marginHorizontal: 16,
          marginVertical: 8,
          backgroundColor: 'white',
          overflow: 'hidden',
          opacity: cardOpacity,
        }}
      >
        {/* Job Info */}
        <View style={{ padding: 16, backgroundColor: headerBg }}>
          {/* Title + applicants */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: 'Poppins-Bold',
                fontSize: 16,
                color: titleColor,
                flex: 1,
                flexShrink: 1,
                marginRight: 8,
              }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.jobTitle}
            </Text>

            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'white',
                padding: 5,
                borderRadius: 8,
              }}
              onPress={() => handleApplicationScreen(item.jobUID, item.jobTitle)}
            >
              <User size={16} color="#1572DB" />
              <Text
                style={{
                  marginLeft: 4,
                  color: '#1572DB',
                  fontSize: 13,
                  fontFamily: 'Poppins-Medium',
                }}
              >
                {applicationCounts?.find(e => e._id === item.jobUID)?.pending || 0} applicants
              </Text>
            </Pressable>
          </View>

          {/* Employment */}
          <Text style={{ fontSize: 14, color: subTextColor, marginTop: 4 }}>
            {Array.isArray(item.employment) ? item.employment.join(', ') : '—'}
          </Text>

          {/* Posted date + Status chip */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CalendarDays width={20} color={subTextColor} style={{ marginRight: 4 }} />
              <Text style={{ color: subTextColor, fontSize: 12 }}>
                Posted on {item.createdAt ? new Date(item.createdAt).toDateString() : '—'}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isClosed ? '#FEF2F2' : '#ECFDF5',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text style={{ color: isClosed ? '#991B1B' : '#065F46', fontWeight: '700', fontSize: 12 }}>
                {isClosed ? 'Closed' : 'Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: 'white',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.navigate('editDetails', { job: item, edit: true })}
            >
              <Edit size={14} color="#1572DB" />
              <Text
                style={{
                  color: '#1572DB',
                  marginLeft: 4,
                  fontSize: 13,
                  fontFamily: 'Poppins-Bold',
                }}
              >
                Edit
              </Text>
            </Pressable>

            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => navigation.navigate('showDetails', { job: item, edit: false })}
            >
              <Maximize2 size={14} color="#1572DB" />
              <Text
                style={{
                  color: '#1572DB',
                  marginLeft: 4,
                  fontSize: 13,
                  fontFamily: 'Poppins-Bold',
                }}
              >
                Show details
              </Text>
            </Pressable>

            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => openStatusModal(item)}
            >
              <ActionIcon size={14} color={actionColor} />
              <Text
                style={{
                  color: actionColor,
                  marginLeft: 4,
                  fontSize: 13,
                  fontFamily: 'Poppins-Bold',
                }}
              >
                {actionLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Header />

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 28, color: '#37424F' }}>
            Your Openings
          </Text>

          {/* Search Bar */}
          <Pressable
            style={{
              marginTop: 12,
              backgroundColor: '#EFEFEF',
              borderRadius: 12,
              height: 48,
              justifyContent: 'center',
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Search />
              <Text
                style={{
                  marginLeft: 8,
                  fontFamily: 'Poppins-Regular',
                  color: '#6B7280',
                  fontSize: 14,
                }}
              >
                Search Here
              </Text>
            </View>
            <SlidersHorizontal width={20} />
          </Pressable>
        </View>

        {/* Jobs */}
        {sortedJobs.map(renderJob)}
      </ScrollView>

      {/* Floating button */}
      <Pressable
        onPress={handlePost}
        style={{
          backgroundColor: '#007AFF',
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 30,
          position: 'absolute',
          bottom: insets.bottom + 40,
          right: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontFamily: 'Poppins-SemiBold',
            fontSize: 14,
            marginRight: 6,
          }}
        >
          Post an opening
        </Text>
        <Pencil size={16} color="white" />
      </Pressable>

      {/* Open/Close Posting Confirmation Modal */}
      <ConfirmationModal
        visible={statusModalVisible}
        title={jobToToggle?.status ? 'Close posting?' : 'Open posting?'}
        message={
          jobToToggle
            ? `${jobToToggle.status ? 'Closing' : 'Opening'} “${(jobToToggle.jobTitle || '').trim() || 'this job'}”.`
            : 'Confirm action.'
        }
        confirmText={saving ? (jobToToggle?.status ? 'Closing...' : 'Opening...') : jobToToggle?.status ? 'Close' : 'Open'}
        cancelText="Cancel"
        onConfirm={saving ? undefined : confirmTogglePosting}
        onCancel={saving ? undefined : cancelTogglePosting}
      />
    </SafeAreaView>
  );
};
