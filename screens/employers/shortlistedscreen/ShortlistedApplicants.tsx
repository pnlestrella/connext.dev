import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Briefcase, Clock } from 'lucide-react-native';
import { Text, View, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import { getShortlistedApplicants } from 'api/applications'; // ✅ adjust path
import { useAuth } from 'context/auth/AuthHook';

export const ShortlistedApplicants = () => {
  const route = useRoute();
  const { userMDB } = useAuth();
  const shortlistedApplicants = userMDB.shortlistedApplicants;
  const { jobUID, jobTitle } = route.params;

  const navigation = useNavigation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ✅ Fetch data
  const fetchApplicants = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await getShortlistedApplicants(jobUID, shortlistedApplicants, page, 20);

      if (res?.success) {
        setData((prev) => [...prev, ...res.payload]);
        setHasMore(res.hasMore);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err, '❌ Error fetching shortlisted applicants');
    } finally {
      setLoading(false);
    }
  }, [jobUID, shortlistedApplicants, page, loading, hasMore]);

  // ✅ Initial load
  useEffect(() => {
    fetchApplicants();
  }, []);

  return (
    <SafeAreaView className="h-full bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
        <Pressable onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="black" />
        </Pressable>
        <Text
          style={{
            fontFamily: 'Poppins-Bold',
            fontSize: 20,
            color: '#37424F',
          }}
        >
          Shortlisted Applicants
        </Text>
      </View>

      {/* Title */}
      <Text className="text-xl font-bold p-4 text-gray-800">
        Applicants for Job: {jobTitle}
      </Text>

      {/* Applicants List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.applicationID}
        renderItem={({ item }) => {
          const { profile, appliedAt } = item;
          return (
            <Pressable
              className="mb-4 mx-4 rounded-2xl shadow-lg"
              style={{
                backgroundColor: "white", // solid white card
                borderWidth: 2,
                borderColor: "#E0E0E0",
                elevation: 3, // Android shadow
              }}
              onPress={() =>
                navigation.push("applicantDetail", { applicant: item })
              }
            >
              {/* Top Section (with accent bar) */}
              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: "#F3F4F6",
                  backgroundColor: "#F9FAFB", // light gray header bg
                  padding: 12,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <Text
                  className="text-lg font-bold text-gray-900"
                  numberOfLines={1}
                >
                  {profile?.fullName?.firstName} {profile?.fullName?.lastName}
                </Text>
                <View className="flex-row items-center mt-1">
                  <MapPin size={14} color="#6B7280" />
                  <Text className="ml-1 text-gray-600 text-sm" numberOfLines={1}>
                    {profile?.location?.city}, {profile?.location?.province}
                  </Text>
                </View>
              </View>

              {/* Body Section */}
              <View className="p-4">
                {/* Skills */}
                {profile?.skills?.length > 0 && (
                  <View className="flex-row flex-wrap">
                    {profile.skills.slice(0, 3).map((skill, idx) => (
                      <View
                        key={idx}
                        className="bg-indigo-50 px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        <Text className="text-xs text-indigo-700 font-medium">
                          {skill}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Industry */}
                {profile?.industries?.length > 0 && (
                  <View className="flex-row items-center mt-2">
                    <Briefcase size={14} color="#6B7280" />
                    <Text
                      className="ml-1 text-gray-700 text-sm font-medium"
                      numberOfLines={1}
                    >
                      {profile.industries.slice(0, 2).join(" · ")}
                    </Text>
                  </View>
                )}

                {/* Applied Date */}
                <View className="flex-row items-center mt-3">
                  <Clock size={14} color="#9CA3AF" />
                  <Text className="ml-1 text-gray-500 text-xs">
                    Applied {new Date(appliedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </Pressable>

          );
        }}
        onEndReached={fetchApplicants} // ✅ infinite scroll
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="small" color="#000" className="my-4" />
          ) : null
        }
      />
    </SafeAreaView>
  );
};
