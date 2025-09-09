import { useNavigation } from '@react-navigation/native';
import { Header } from 'components/Header';
import { useAuth } from 'context/auth/AuthHook';
import { useEmployers } from 'context/employers/EmployerHook';
import { Search, SlidersHorizontal, Pencil, User, Edit, Maximize2, XCircle } from 'lucide-react-native';
import { Text, Pressable, View, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export const HomeScreenEmployer = () => {
  const { setUserMDB, userMDB } = useAuth();
  const { jobOpenings } = useEmployers(); 
  const insets = useSafeAreaInsets();

  const navigation = useNavigation()

  


  const handlePost = () => {
    console.log("Post an opening pressed");
    navigation.navigate('postJob')
  };

  // ✅ Job Card UI
  const renderJob = (item: any) => (
    <View
      key={item._id}
      style={{
        borderWidth: 1,
        borderColor: "#000000",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: "white",
      }}
    >
      {/* Title + applicants */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16, color: "#6C63FF" }}>
          {item.jobTitle}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <User size={16} color="#37424F" />
          <Text style={{ marginLeft: 4, color: "#37424F", fontSize: 13 }}>
            {item.appliedJS?.length || 0} applicants
          </Text>
        </View>
      </View>

      {/* Employment */}
      <Text style={{ fontSize: 14, color: "#4B5563", marginTop: 4 }}>
        {item.employment?.join(", ")}
      </Text>

      {/* Posted date */}
      <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>
        Posted on {item.createdAt ? new Date(item.createdAt).toDateString() : "—"}
      </Text>

      {/* Actions */}
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
        <Pressable style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
          <Edit size={14} color="#1572DB" />
          <Text style={{ color: "#1572DB", marginLeft: 4, fontSize: 13, fontFamily: 'Poppins-Bold' }}>Edit</Text>
        </Pressable>

        <Pressable style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}>
          <Maximize2 size={14} color="#1572DB" />
          <Text style={{ color: "#1572DB", marginLeft: 4, fontSize: 13, fontFamily: 'Poppins-Bold' }}>Show details</Text>
        </Pressable>

        <Pressable style={{ flexDirection: "row", alignItems: "center" }}>
          <XCircle size={14} color="#DC2626" />
          <Text style={{ color: "#DC2626", marginLeft: 4, fontSize: 13, fontFamily: 'Poppins-Bold' }}>Close Posting</Text>
        </Pressable>
      </View>
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
              Your
            </Text>
            <Text style={{ fontFamily: "Poppins-Bold", fontSize: 24, color: "#37424F" }}>
              Openings
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

      {/* Floating button */}
      <Pressable
        onPress={handlePost}
        style={{
          backgroundColor: "#007AFF",
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 30,
          position: "absolute",
          bottom: insets.bottom + 20,
          right: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Text
          style={{
            color: "white",
            fontFamily: "Poppins-SemiBold",
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
