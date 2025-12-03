import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Briefcase, Clock, User as UserIcon, Star } from 'lucide-react-native';
import {
  Text,
  View,
  FlatList,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState, useCallback } from 'react';
import { getShortlistedApplicants } from 'api/applications';
import { useEmployers } from 'context/employers/EmployerHook';
import { getJob } from 'api/employers/joblistings';

import { useFocusEffect } from '@react-navigation/native';

export const ShortlistedApplicants = () => {
  const { refresh, setRefresh, applicationCounts } = useEmployers();
  const navigation = useNavigation();
  const route = useRoute();
  const [job, setJob] = useState(null);
  const { jobUID } = route.params;

  useFocusEffect(
    useCallback(() => {
      setRefresh(!refresh);
      return () => {};
    }, [])
  );

  useEffect(() => {
    // When refresh changes then reload applicants
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchApplicants(1, true);
  }, [refresh]);

  useEffect(() => {
    const getJobDesc = async () => {
      const res = await getJob(jobUID);
      setJob(res.message);
    };
    getJobDesc();
  }, []);

  console.log(job, 'jobbb');

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const statusOptions = ['shortlisted', 'viewed', 'contacted', 'hired'];
  const [activeStatus, setActiveStatus] = useState('shortlisted');

  const statusMap = {
    shortlisted: {
      bgCard: '#E0E7FF',
      textCard: '#4338CA',
      icon: <Star size={12} color="#4338CA" />,
      label: 'Shortlisted',
      topColor: '#4338CA',
      boxBg: '#EEF2FF',
      boxBorder: '#4338CA',
      boxText: '#4338CA',
    },
    viewed: {
      bgCard: '#FECACA',
      textCard: '#B91C1C',
      icon: <Star size={12} color="#B91C1C" />,
      label: 'Skipped',
      topColor: '#B91C1C',
      boxBg: '#FEE2E2',
      boxBorder: '#B91C1C',
      boxText: '#B91C1C',
    },
    contacted: {
      bgCard: '#FEF3C7',
      textCard: '#B45309',
      icon: <Star size={12} color="#B45309" />,
      label: 'Contacted',
      topColor: '#B45309',
      boxBg: '#FFFAEB',
      boxBorder: '#B45309',
      boxText: '#B45309',
    },
    hired: {
      bgCard: '#D1FAE5',
      textCard: '#047857',
      icon: <Star size={12} color="#047857" />,
      label: 'Hired',
      topColor: '#047857',
      boxBg: '#DCFCE7',
      boxBorder: '#047857',
      boxText: '#047857',
    },
  };

  const currentCounts = applicationCounts?.find((c) => c._id === jobUID) || {};
  const generalCount = statusOptions.reduce((sum, status) => {
    const count = currentCounts[status];
    return sum + (typeof count === 'number' ? count : 0);
  }, 0);

  /** FIXED FETCH FUNCTION */
  const fetchApplicants = useCallback(
    async (pageToFetch = page, isInitial = false) => {
      if (loading) return;
      if (!hasMore && !isInitial) return;

      setLoading(true);

      try {
        const res = await getShortlistedApplicants(jobUID, [activeStatus], pageToFetch, 20);

        if (res?.success) {
          setData((prev) => {
            const base = isInitial ? [] : prev;
            const unique = res.payload.filter(
              (newItem) => !base.some((oldItem) => oldItem._id === newItem._id)
            );
            return [...base, ...unique];
          });

          setHasMore(res.hasMore);

          if (!isInitial) {
            setPage((prev) => prev + 1);
          }
        } else {
          setHasMore(false);
        }
      } catch (e) {
        console.log('❌ fetchApplicants error:', e);
      } finally {
        setLoading(false);
      }
    },
    [jobUID, activeStatus, page, loading, hasMore]
  );

  /** WHEN STATUS CHANGES — RESET + FETCH FIRST PAGE */
  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchApplicants(1, true); // first load for new tab
  }, [activeStatus]);

  /** PAGINATION FETCH */
  useEffect(() => {
    if (page > 1) {
      fetchApplicants(page);
    }
  }, [page]);

  const handleBack = () => {
    navigation.goBack();
    setRefresh(!refresh);
  };

  /** RENDER APPLICANT CARD */
  const renderApplicant = ({ item }) => {
    const { profile, appliedAt, status } = item;
    const fullName = `${profile?.fullName?.firstName || ''} ${
      profile?.fullName?.lastName || ''
    }`.trim();

    const style = statusMap[status] || {
      bgCard: '#E5E7EB',
      textCard: '#37424F',
      icon: null,
      label: 'Unknown',
      boxBorder: '#9CA3AF',
      boxText: '#37424F',
    };

    return (
      <Pressable
        style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          marginHorizontal: 16,
          marginVertical: 8,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
        onPress={() => navigation.push('applicantDetail', { applicant: item })}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            padding: 14,
            borderBottomWidth: 1,
            borderColor: '#F3F4F6',
          }}>
          {profile?.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={{ width: 44, height: 44, borderRadius: 22 }}
            />
          ) : (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#E5E7EB',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <UserIcon size={20} color="#6B7280" />
            </View>
          )}

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                color: '#111827',
                fontFamily: 'Poppins-Bold',
              }}
              numberOfLines={1}>
              {fullName || 'Unnamed Applicant'}
            </Text>

            <View style={{ flexDirection: 'row', marginTop: 4, alignItems: 'center' }}>
              <MapPin size={14} color="#6B7280" />
              <Text style={{ marginLeft: 4, color: '#6B7280' }} numberOfLines={1}>
                {profile?.location?.city || 'N/A'}, {profile?.location?.province || 'N/A'}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: style.bgCard,
              borderColor: style.boxBorder,
              borderWidth: 1,
              borderRadius: 16,
              paddingHorizontal: 8,
              paddingVertical: 4,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {style.icon}
            <Text
              style={{
                marginLeft: 6,
                fontSize: 13,
                fontWeight: '700',
                color: style.boxText,
              }}>
              {style.label}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={{ padding: 16 }}>
          {/* Skills */}
          {profile?.skills?.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
              {profile.skills.slice(0, 3).map((skill, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: '#E0E7FF',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    marginRight: 8,
                    marginBottom: 8,
                  }}>
                  <Text style={{ fontSize: 12, color: '#4338CA', fontWeight: '600' }}>{skill}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Industries */}
          {profile?.industries?.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Briefcase size={14} color="#6B7280" />
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 12,
                  color: '#37424F',
                  fontWeight: '600',
                }}
                numberOfLines={1}>
                {profile.industries.slice(0, 2).join(' · ')}
              </Text>
            </View>
          )}

          {/* Applied date */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Clock size={14} color="#9CA3AF" />
            <Text style={{ marginLeft: 4, fontSize: 11, color: '#9CA3AF' }}>
              Applied {new Date(appliedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  /** EMPTY STATE */
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={{ paddingTop: 80, alignItems: 'center' }}>
        <Text style={{ color: '#6B7280', fontSize: 16, fontFamily: 'Poppins-Medium' }}>
          No applicants found.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Minimal Header */}
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderColor: '#e5e7eb',
          backgroundColor: 'white',
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <Pressable onPress={handleBack} style={{ marginRight: 12 }}>
            <ArrowLeft size={24} color="black" />
          </Pressable>
          <Text
            style={{
              fontFamily: 'Poppins-Bold',
              fontSize: 20,
              color: '#111827',
              flex: 1,
            }}
            numberOfLines={1}>
            {job?.jobTitle || 'Job Title'}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            fontSize: 14,
            color: '#6B7280',
            marginBottom: 4,
          }}>
          Total Applicants: {generalCount}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
          {job?.workTypes?.map((type, i) => (
            <View
              key={i}
              style={{
                backgroundColor: '#F3F4F6',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
              <Text style={{ fontSize: 12, color: '#37424F', fontWeight: '500' }}>{type}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 12, color: '#9CA3AF' }}>
          Posted: {job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
      </View>

      {/* Fixed Filter Bar */}
      <View style={{ backgroundColor: 'white', paddingVertical: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}>
          {statusOptions.map((s) => {
            const map = statusMap[s];
            const isActive = activeStatus === s;

            return (
              <Pressable
                key={s}
                onPress={() => setActiveStatus(s)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: isActive ? map.topColor : '#F3F4F6',
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 10,
                  minWidth: 90,
                  justifyContent: 'center',
                  elevation: isActive ? 3 : 0,
                }}>
                {map.icon && React.cloneElement(map.icon, { size: 10 })}
                <Text
                  style={{
                    marginLeft: 4,
                    color: isActive ? 'white' : '#37424F',
                    fontWeight: '600',
                    fontSize: 12,
                  }}>
                  {map.label} {typeof currentCounts[s] === 'number' ? currentCounts[s] : 0}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={data}
        ListEmptyComponent={renderEmpty}
        keyExtractor={(item) => item._id}
        renderItem={renderApplicant}
        onEndReached={() => {
          if (!loading && hasMore) setPage((prev) => prev + 1);
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ marginVertical: 20 }} size="small" /> : null
        }
      />
    </SafeAreaView>
  );
};
