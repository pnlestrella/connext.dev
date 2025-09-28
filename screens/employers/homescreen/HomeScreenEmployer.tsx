import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getApplicantCounts } from 'api/applications';
import { Header } from 'components/Header';
import { useAuth } from 'context/auth/AuthHook';
import { useEmployers } from 'context/employers/EmployerHook';
import { Search, SlidersHorizontal, Pencil, User, Edit, Maximize2, XCircle, CalendarDays } from 'lucide-react-native';
import { useCallback } from 'react';
import { Text, Pressable, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export const HomeScreenEmployer = () => {
  const { jobOpenings, applicationCounts, refresh, setRefresh } = useEmployers();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // for updates
  useFocusEffect(
    useCallback(() => {
      setRefresh(!refresh);
    }, [])
  );

  const handleApplicationScreen = (jobUID: string, jobTitle: string) => {
    navigation.push('jobApplications', { jobUID, jobTitle });
  };

  const handlePost = () => {
    navigation.navigate('postJob');
  };

  // Job Card UI
  const renderJob = (item: any) => (
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
      }}
    >
      {/* Job Info */}
      <View style={{ padding: 16, backgroundColor: '#6C63FF' }}>
        {/* Title + applicants */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Poppins-Bold',
              fontSize: 16,
              color: 'white',
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
              {applicationCounts?.find((e) => e._id === item.jobUID)?.pending || 0} applicants
            </Text>
          </Pressable>
        </View>

        {/* Employment */}
        <Text style={{ fontSize: 14, color: 'white', marginTop: 4 }}>{item.employment?.join(', ')}</Text>

        {/* Posted date */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <CalendarDays width={20} color="white" style={{ marginRight: 4 }} />
          <Text style={{ color: 'white', fontSize: 12 }}>
            Posted on {item.createdAt ? new Date(item.createdAt).toDateString() : '—'}
          </Text>
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
            onPress={() => navigation.navigate('showDetails', { job: item, edit: true })}
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

          <Pressable style={{ flexDirection: 'row', alignItems: 'center' }}>
            <XCircle size={14} color="#DC2626" />
            <Text
              style={{
                color: '#DC2626',
                marginLeft: 4,
                fontSize: 13,
                fontFamily: 'Poppins-Bold',
              }}
            >
              Close Posting
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Header />

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header inside scroll */}


        {/* Top Bar */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 28, color: '#37424F' }}>Your Openings</Text>

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
              <Text style={{ marginLeft: 8, fontFamily: 'Poppins-Regular', color: '#6B7280', fontSize: 14 }}>Search Here</Text>
            </View>
            <SlidersHorizontal width={20} />
          </Pressable>
        </View>

        {/* Jobs */}
        {jobOpenings?.map(renderJob)}
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
          bottom: insets.bottom + 20,
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
    </SafeAreaView>
  );
};
