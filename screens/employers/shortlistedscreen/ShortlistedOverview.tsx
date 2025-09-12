import { useNavigation } from '@react-navigation/native';
import { getApplicantCounts } from 'api/applications';
import { Header } from 'components/Header';
import { useAuth } from 'context/auth/AuthHook';
import { useEmployers } from 'context/employers/EmployerHook';
import { Search, SlidersHorizontal, Pencil, User, Edit, Maximize2, XCircle, CalendarDays } from 'lucide-react-native';
import { useState } from 'react';
import { Text, Pressable, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export const ShortlistedOverview = () => {
  const { setUserMDB, userMDB } = useAuth();
  const { jobOpenings, applicationCounts } = useEmployers();

  const navigation = useNavigation()

  function handleApplicantScreen(jobUID: string) {
    navigation.push("shortlistedApplicants", { jobUID: jobUID })

  }



  // ✅ Job Card UI
  const renderJob = (item: any) => (
    <View
      key={item.jobUID}
      style={{
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: "white",
        overflow: "hidden", // keeps corners rounded
      }}
    >
      {/* Job Info */}
      <Pressable style={{ padding: 16, backgroundColor: '#6C63FF' }}
        onPress={() => handleApplicantScreen(item.jobUID)}

      >
        {/* Title + applicants */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Poppins-Bold",
              fontSize: 16,
              color: "white",
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
            className="rounded-md"
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              padding: 5,
            }}
          >
            <User size={16} color="#1572DB" />
            <Text
              style={{
                marginLeft: 4,
                color: "#1572DB",
                fontSize: 13,
                fontFamily: "Poppins-Medium",
              }}
            >
              {applicationCounts?.find(e => e._id === item.jobUID)?.count || 0} applicants
            </Text>
          </Pressable>
        </View>


        {/* Employment */}
        <Text style={{ fontSize: 14, color: "white", marginTop: 4 }}>
          {item.employment?.join(", ")}
        </Text>

        {/* Posted date */}
        <View className='flex-row' style={{ fontSize: 12, color: "white", marginTop: 8, alignItems: 'center' }}>
          <CalendarDays width={20} color={"white"} style={{ right: 2 }}></CalendarDays>
          <Text className='text-white'>
            Posted on {item.createdAt ? new Date(item.createdAt).toDateString() : "—"}
          </Text>
        </View>
      </Pressable>


    </View>
  );


  return (
    <SafeAreaView className="bg-white" style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header />

        {/* Top bar */}
        <View className="flex-row justify-between px-1 m-4 ">
          <View>
            <Text style={{ fontFamily: "Poppins-Bold", fontSize: 24, color: "#37424F" }}>
              Shortlisted
            </Text>
            <Text style={{ fontFamily: "Poppins-Bold", fontSize: 24, color: "#37424F" }}>
              Overview
            </Text>
          </View>

          {/* Search Bar */}
          <Pressable
            className="flex-1 ml-4 rounded-xl justify-center p-2 h-12"
            style={{ backgroundColor: "#EFEFEF" }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Search />
                <Text className="font-lexend text-slate-600 text-base ml-1">Search Here</Text>
              </View>
              <SlidersHorizontal width={18} />
            </View>
          </Pressable>
        </View>

        {/* Jobs */}
        {jobOpenings?.map(renderJob)}
      </ScrollView>


    </SafeAreaView>
  );
};
