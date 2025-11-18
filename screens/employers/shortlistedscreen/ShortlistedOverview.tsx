// ShortlistedOverview.tsx
import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigation } from '@react-navigation/native';
import { Header } from 'components/Header';
import { useEmployers } from 'context/employers/EmployerHook';
import { Search, SlidersHorizontal, CalendarDays, X, ChevronDown } from 'lucide-react-native';
import { Text, Pressable, View, ScrollView, TextInput, Modal, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ShortlistedOverview = () => {
  const { jobOpenings, applicationCounts } = useEmployers();
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);

  const [selectedEmployment, setSelectedEmployment] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | null>(null);

  const [tempEmployment, setTempEmployment] = useState<string | null>(null);
  const [tempSortOrder, setTempSortOrder] = useState<"newest" | "oldest" | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (filterVisible) {
      setTempEmployment(selectedEmployment);
      setTempSortOrder(sortOrder);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    }
  }, [filterVisible]);

  const handleApplicantScreen = (jobUID: string, jobTitle: string) => {
    navigation.push("shortlistedApplicants", { jobUID, jobTitle });
  };

  const statusColors = {
    shortlisted: "#6C63FF",
    viewed: "#EF4444",
    contacted: "#F59E0B",
    hired: "#10B981",
  };

  const displayedJobs = useMemo(() => {
    let filtered = jobOpenings?.filter(job => {
      const matchSearch = job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          job.jobNormalized?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchEmployment = selectedEmployment ? job.employment.includes(selectedEmployment) : true;
      return matchSearch && matchEmployment;
    }) || [];

    if (sortOrder === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    return filtered;
  }, [jobOpenings, searchQuery, selectedEmployment, sortOrder]);

  const renderJob = (item: any) => {
    const counts = applicationCounts?.find(e => e._id === item.jobUID) || {};
    const totalApplicants = ['shortlisted', 'viewed', 'contacted', 'hired'].reduce(
      (sum, key) => sum + (counts[key] || 0),
      0
    );

    return (
      <Pressable
        key={item.jobUID}
        style={{
          backgroundColor: "#fff",
          borderRadius: 12,
          marginHorizontal: 16,
          marginVertical: 6,
          padding: 14,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
        onPress={() => handleApplicantScreen(item.jobUID, item.jobTitle)}
      >
        <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16, color: "#111827", marginBottom: 6 }} numberOfLines={2}>
          {item.jobTitle}
        </Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 6 }}>
          {['shortlisted', 'viewed', 'contacted', 'hired'].map(status => (
            <View
              key={status}
              style={{
                backgroundColor: statusColors[status] + "20",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                marginBottom: 4,
                minWidth: 70,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 11, color: statusColors[status], fontWeight: "600" }}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
              <Text style={{ fontSize: 12, color: "#111827", fontWeight: "700" }}>
                {counts[status] || 0}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 4 }}>
          <Text style={{ fontSize: 12, fontFamily: "Poppins-Medium", color: "#37424F" }}>Total: {totalApplicants}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {item.workTypes?.map((type: string, i: number) => (
              <View key={i} style={{ backgroundColor: "#F3F4F6", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginRight: 4, marginTop: 4 }}>
                <Text style={{ fontSize: 10, color: "#37424F", fontWeight: "500" }}>{type}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <CalendarDays width={14} color="#6B7280" />
          <Text style={{ marginLeft: 4, fontSize: 11, color: "#6B7280" }}>
            Posted: {item.createdAt ? new Date(item.createdAt).toDateString() : "—"}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Header />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, marginVertical: 8 }}>
          <View>
            <Text style={{ fontFamily: "Poppins-Bold", fontSize: 24, color: "#37424F" }}>Shortlisted</Text>
            <Text style={{ fontFamily: "Poppins-Bold", fontSize: 24, color: "#37424F" }}>Overview</Text>
          </View>

          <View style={{ flex: 1, marginLeft: 12, flexDirection: "row" }}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search jobs..."
              style={{ flex: 1, borderRadius: 12, backgroundColor: "#EFEFEF", paddingHorizontal: 12, height: 44 }}
            />
            <Pressable
              onPress={() => setFilterVisible(true)}
              style={{ marginLeft: 8, width: 44, height: 44, borderRadius: 12, backgroundColor: "#6C63FF", justifyContent: "center", alignItems: "center" }}
            >
              <SlidersHorizontal width={18} color="#fff" />
            </Pressable>
          </View>
        </View>

        {displayedJobs?.map(renderJob)}

        {/* Filter Modal with Fade */}
        <Modal visible={filterVisible} animationType="none" transparent>
          <Animated.View style={{ flex:1, backgroundColor: "#00000066", justifyContent: "center", padding: 16, opacity: fadeAnim }}>
            <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>Filter Jobs</Text>
                <Pressable onPress={() => setFilterVisible(false)}><X size={20} /></Pressable>
              </View>

              {/* Employment Dropdown */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: "600", marginBottom: 4 }}>Employment Type</Text>
                <Pressable
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#ddd"
                  }}
                  onPress={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Text>{tempEmployment || "Select employment type"}</Text>
                  <ChevronDown size={18} />
                </Pressable>

                {dropdownOpen && ["Full-time", "Part-time", "Contract"].map(type => (
                  <Pressable
                    key={type}
                    onPress={() => setTempEmployment(type)}
                    style={{ padding: 10, marginTop: 4, borderRadius: 8, backgroundColor: "#F3F4F6" }}
                  >
                    <Text>{type}</Text>
                  </Pressable>
                ))}
              </View>

              {/* Sort by Date */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: "600", marginBottom: 4 }}>Sort by Date</Text>
                {["newest", "oldest"].map(order => (
                  <Pressable
                    key={order}
                    onPress={() => setTempSortOrder(order as "newest"|"oldest")}
                    style={{
                      padding: 10,
                      marginTop: 4,
                      borderRadius: 8,
                      backgroundColor: tempSortOrder === order ? "#6C63FF" : "#F3F4F6"
                    }}
                  >
                    <Text style={{ color: tempSortOrder === order ? "#fff" : "#37424F" }}>
                      {order === "newest" ? "Newest First" : "Oldest First"}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* OK Button */}
              <Pressable
                onPress={() => {
                  setSelectedEmployment(tempEmployment);
                  setSortOrder(tempSortOrder);
                  setFilterVisible(false);
                  setDropdownOpen(false);
                }}
                style={{
                  marginTop: 12,
                  backgroundColor: "#6C63FF",
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: "center"
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>OK</Text>
              </Pressable>

              {/* Clear Filter */}
              <Pressable
                onPress={() => {
                  setSelectedEmployment(null);
                  setSortOrder(null);
                  setTempEmployment(null);
                  setTempSortOrder(null);
                  setFilterVisible(false);
                  setDropdownOpen(false);
                }}
                style={{ marginTop: 8, alignItems:"center" }}
              >
                <Text style={{ color: "#EF4444", fontWeight:"700" }}>Clear Filter</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};
