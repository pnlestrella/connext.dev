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

  // ✅ Job Card UI with NativeWind
  const renderJob = (item: any) => (
    <View
      key={item.jobUID}
      className="rounded-xl mx-2 my-2 bg-indigo-500 shadow-lg shadow-black/10"
      style={{
        shadowOffset: { width: 0, height: 3 },
        elevation: 4, // Android shadow
      }}
    >
      <Pressable
        className="p-4 bg-gray-50 rounded-xl m-0.5"
        onPress={() => handleApplicantScreen(item.jobUID, item.jobTitle)}
      >
        {/* Title + applicants */}
        <View className="flex-row justify-between items-center">
          <Text
            className="text-lg text-gray-900 flex-1 mr-2"
            style={{ fontFamily: "Poppins-Bold" }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.jobTitle}
          </Text>

          <View className="flex-row items-center bg-indigo-500 py-2 px-2 rounded-lg">
            <User size={16} color="white" />
            <Text
              className="ml-1 text-white text-xs font-medium"
              style={{ fontFamily: "Poppins-Medium" }}
            >
              {applicationCounts?.find(e => e._id === item.jobUID)?.shortlisted || 0} shortlisted
            </Text>
          </View>
        </View>

        {/* Posted date */}
        <View className="flex-row mt-2 items-center">
          <CalendarDays width={18} color="#1572DB" />
          <Text style={{fontFamily: 'Lexend-Regular'}} className="ml-1 text-slate-700 text-sm">
            Posted on {item.createdAt ? new Date(item.createdAt).toDateString() : "—"}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView className="bg-white" style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Header />

        {/* Top bar */}
        <View className="flex-row justify-between px-2 items-center">
          <View>
            <Text style={{ fontFamily: "Poppins-Bold", color: "#37424F" }} className='text-2xl'>
              Shortlisted Overview
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