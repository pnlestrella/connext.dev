import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Briefcase, Clock, User as UserIcon, Star } from 'lucide-react-native';
import { Text, View, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';
import { getShortlistedApplicants } from 'api/applications';
import { useEmployers } from 'context/employers/EmployerHook';

export const ShortlistedApplicants = () => {
  const { refresh, setRefresh } = useEmployers();
  const route = useRoute();
  const { jobUID, jobTitle } = route.params;
  const navigation = useNavigation();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const status = "shortlisted";

  const fetchApplicants = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await getShortlistedApplicants(jobUID, status, page, 20);
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
  }, [jobUID, page, loading, hasMore]);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleBack = () => {
    navigation.goBack();
    setRefresh(!refresh);
  };

  const renderApplicant = ({ item }) => {
    const { profile, appliedAt } = item;
    const fullName = `${profile?.fullName?.firstName || ""} ${profile?.fullName?.lastName || ""}`.trim();

    return (
      <Pressable
        className="mb-4 mx-4 rounded-2xl"
        style={{
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
        onPress={() => navigation.push("applicantDetail", { applicant: item })}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 14,
            borderBottomWidth: 1,
            borderColor: "#F3F4F6",
            backgroundColor: "#F9FAFB",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          {/* Avatar */}
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
                backgroundColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserIcon size={20} color="#6B7280" />
            </View>
          )}

          {/* Name + Location */}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{ fontFamily: "Poppins-Bold", fontSize: 16, color: "#111827" }}
              numberOfLines={1}
            >
              {fullName || "Unnamed Applicant"}
            </Text>
            <View className="flex-row items-center mt-1">
              <MapPin size={14} color="#6B7280" />
              <Text className="ml-1 text-gray-600 text-sm" numberOfLines={1}>
                {profile?.location?.city}, {profile?.location?.province}
              </Text>
            </View>
          </View>

          {/* Shortlisted badge */}
          <View
            style={{
              backgroundColor: "#E0E7FF",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Star size={12} color="#4338CA" />
            <Text style={{ marginLeft: 4, fontSize: 12, fontWeight: "600", color: "#4338CA" }}>
              Shortlisted
            </Text>
          </View>
        </View>

        {/* Body */}
        <View className="p-4">
          {/* Skills */}
          {profile?.skills?.length > 0 && (
            <View className="flex-row flex-wrap mb-2">
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

          {/* Industries */}
          {profile?.industries?.length > 0 && (
            <View className="flex-row items-center mt-1">
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
  };

  return (
    <SafeAreaView className="h-full bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 bg-white">
        <Pressable onPress={handleBack} className="mr-3">
          <ArrowLeft size={24} color="black" />
        </Pressable>
        <Text style={{ fontFamily: "Poppins-Bold", fontSize: 20, color: "#37424F" }}>
          Shortlisted Applicants
        </Text>
      </View>

      {/* Title */}
      <Text className="text-lg font-semibold px-5 py-3 text-gray-800">
        Applicants for: <Text className="text-indigo-600">{jobTitle}</Text>
      </Text>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.applicationID}
        renderItem={renderApplicant}
        onEndReached={fetchApplicants}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="small" color="#000" className="my-4" />
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <View className="flex-1 items-center justify-center py-20">
              <UserIcon size={40} color="#9CA3AF" />
              <Text className="mt-3 text-gray-500">No shortlisted applicants yet</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};
