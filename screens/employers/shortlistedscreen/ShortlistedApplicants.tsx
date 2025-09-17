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
  const { jobUID } = route.params;
  const navigation = useNavigation();


  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const statusOptions = ["shortlisted", "viewed", "contacted"];
  const [activeStatus, setActiveStatus] = useState("shortlisted");

  // Map status to card & top bar styles
  const statusMap = {
    shortlisted: { bgCard: "#E0E7FF", textCard: "#4338CA", icon: <Star size={12} color="#4338CA" />, label: "Shortlisted", topColor: "#4338CA" },
    viewed: { bgCard: "#FECACA", textCard: "#B91C1C", icon: <Star size={12} color="#B91C1C" />, label: "Skipped", topColor: "#B91C1C" },
    contacted: { bgCard: "#FEF3C7", textCard: "#B45309", icon: <Star size={12} color="#B45309" />, label: "Contacted", topColor: "#B45309" },
  };

  const fetchApplicants = useCallback(async (pageToFetch = page) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await getShortlistedApplicants(jobUID, [activeStatus], pageToFetch, 20);
      if (res?.success) {
        setData(prev => pageToFetch === 1 ? res.payload : [...prev, ...res.payload]);
        setHasMore(res.hasMore);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err, '❌ Error fetching applicants');
    } finally {
      setLoading(false);
    }
  }, [jobUID, loading, hasMore, activeStatus]);




  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchApplicants(1); 
  }, [activeStatus]);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleBack = () => {
    navigation.goBack();
    setRefresh(!refresh);
  };

  const renderApplicant = ({ item }) => {
    const { profile, appliedAt, status } = item;
    const fullName = `${profile?.fullName?.firstName || ""} ${profile?.fullName?.lastName || ""}`.trim();

    const style = statusMap[status] || { bgCard: "#E5E7EB", textCard: "#37424F", icon: null, label: status };

    return (
      <Pressable
        className="mb-4 mx-4 rounded-2xl"
        style={{
          backgroundColor: style.bgCard,
          borderBlockColor: "#dbd5d5",
          borderWidth: 0.5,
          shadowColor: "#dbd5d5",
          shadowOpacity: 0.01,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}
        onPress={() => navigation.push("applicantDetail", { applicant: item })}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 14,
            borderBottomWidth: 1,
            borderColor: "#F3F4F6",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            backgroundColor: "#ffffff", // keep top slightly white for contrast
          }}
        >
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

          {status && (
            <View
              style={{
                backgroundColor: style.bgCard,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {style.icon}
              <Text
                style={{
                  marginLeft: 4,
                  fontSize: 12,
                  fontWeight: "600",
                  color: style.textCard,
                }}
              >
                {style.label}
              </Text>
            </View>
          )}
        </View>

        <View className="p-4">
          {profile?.skills?.length > 0 && (
            <View className="flex-row flex-wrap mb-2">
              {profile.skills.slice(0, 3).map((skill, idx) => (
                <View
                  key={idx}
                  className="bg-indigo-50 px-3 py-1 rounded-full mr-2 mb-2"
                >
                  <Text className="text-xs text-indigo-700 font-medium">{skill}</Text>
                </View>
              ))}
            </View>
          )}

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
    <SafeAreaView className="h-full" style={{ backgroundColor: "white" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "white" }}>
        <Pressable onPress={handleBack} className="mr-3">
          <ArrowLeft size={24} color="black" />
        </Pressable>
        <Text style={{ fontFamily: "Poppins-Bold", fontSize: 20, color: "black" }}>
          {statusMap[activeStatus].label} Applicants
        </Text>
      </View>

      {/* Filter bar */}
      <View className="flex-row justify-around my-3 px-4">
        {statusOptions.map((s) => {
          const map = statusMap[s];
          return (
            <Pressable
              key={s}
              className={`px-4 py-2 rounded-full`}
              style={{ backgroundColor: activeStatus === s ? map.topColor : "#E5E7EB" }}
              onPress={() => setActiveStatus(s)}
            >
              <Text style={{ color: activeStatus === s ? "white" : "#37424F", fontWeight: "600" }}>
                {map.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.applicationID}_${index}`}
        renderItem={renderApplicant}
        onEndReached={() => {
          if (!loading && hasMore) fetchApplicants();
        }}
        onEndReachedThreshold={0.5}
      />

    </SafeAreaView>
  );
};
