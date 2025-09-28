// ShortlistedOverview.tsx
import { useNavigation } from '@react-navigation/native';
import { getApplicantCounts } from 'api/applications';
import { Header } from 'components/Header';
import { useAuth } from 'context/auth/AuthHook';
import { useEmployers } from 'context/employers/EmployerHook';
import { Search, SlidersHorizontal, User, CalendarDays } from 'lucide-react-native';
import { Text, Pressable, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ShortlistedOverview = () => {
  const { userMDB } = useAuth();
  const { jobOpenings, applicationCounts } = useEmployers();
  const navigation = useNavigation();

  function handleApplicantScreen(jobUID: string, jobTitle: string) {
    navigation.push("shortlistedApplicants", { jobUID, jobTitle });
  }

  // ✅ Job Card UI
  const renderJob = (item: any) => (
    <View
      key={item.jobUID}
      style={{
        borderRadius: 14,
        marginHorizontal: 16,
        marginVertical: 10,
        backgroundColor: "#6C63FF", // outer frame
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4, // Android shadow
      }}
    >
      <Pressable
        style={{
          padding: 16,
          backgroundColor: "#F9FAFB", // light gray, not pure white
          borderRadius: 12,
          margin: 2, // spacing so purple shows around edges
        }}
        onPress={() => handleApplicantScreen(item.jobUID, item.jobTitle)}
      >
        {/* Title + applicants */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Poppins-Bold",
              fontSize: 16,
              color: "#111827", // darker text for contrast
              flex: 1,
              flexShrink: 1,
              marginRight: 8,
            }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.jobTitle}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#6C63FF", // purple badge
              paddingVertical: 4,
              paddingHorizontal: 8,
              borderRadius: 8,
            }}
          >
            <User size={16} color="white" />
            <Text
              style={{
                marginLeft: 4,
                color: "white",
                fontSize: 13,
                fontFamily: "Poppins-Medium",
              }}
            >
              {applicationCounts?.find(e => e._id === item.jobUID)?.shortlisted || 0} shortlisted
            </Text>
          </View>
        </View>

        {/* Posted date */}
        <View className="flex-row" style={{ marginTop: 8, alignItems: "center" }}>
          <CalendarDays width={18} color="#37424F" />
          <Text className="ml-1 text-slate-700 text-sm">
            Posted on {item.createdAt ? new Date(item.createdAt).toDateString() : "—"}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView className="bg-white" style={{ flex: 1 }}>
      {/* Header */}
      <Header />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >


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
                <Search color="#6B7280" />
                <Text className="font-lexend text-slate-600 text-base ml-1">Search Here</Text>
              </View>
              <SlidersHorizontal width={18} color="#6B7280" />
            </View>
          </Pressable>
        </View>

        {/* Jobs */}
        {jobOpenings?.map(renderJob)}
      </ScrollView>
    </SafeAreaView>
  );
};
