import {
  Pressable,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CardSwipe from "components/Swiping/CardSwipe";
import { Header } from "components/Header";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react-native";

// Filtering & Searching
import { Filtering } from "components/Filtering&Searching/Filtering";
import { SearchSheet } from "components/Filtering&Searching/SearchSheet";

import { useJobs } from "context/jobs/JobHook";

export const BrowseScreen = () => {
  const {
    jobPostings,
    setJobPostings,
    tempSearch,
    setTempSearch,
    userSearch,
    setUserSearch,
  } = useJobs();

  // Filter
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({});

  // For Card Swiping & Bottom Sheets effect of it
  const [showModal, setShowModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // for Filtering & Search
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  function handleBG() {
    setShowModal(false);
    setShowFilter(false);
    setShowSearch(false);
    if (showSearch) {
      setShowFilter(true);
    }
  }

  return (
    <SafeAreaView className="bg-white flex-1">
      {/* Top App Header */}
      <Header />

      {/* Title + Search/Filter Bar */}
      <View className="flex-row justify-between items-center px-6 mt-2 mb-4">
        <Text
          style={{
            fontFamily: "Poppins-Bold",
            fontSize: 26,
            color: "#1E293B",
          }}
        >
          Find Jobs
        </Text>

        {/* Search + Filter trigger */}
        <TouchableOpacity
          onPress={() => setShowFilter(true)}
          activeOpacity={0.8}
          className="w-[62%] flex-row items-center justify-between px-3 py-2 rounded-full bg-slate-100 shadow-sm"
        >
          <View className="flex-row items-center">
            <Search size={18} color="#475569" />
            <Text
              className="ml-2 font-lexend text-slate-600"
              style={{ fontSize: 14 }}
              numberOfLines={1}
            >
              {userSearch || "Search Here"}
            </Text>
          </View>
          <SlidersHorizontal size={18} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Swiping Cards */}
        <CardSwipe
          
          showModal={showModal}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          setShowModal={setShowModal}
          jobPostings={jobPostings}
          setJobPostings={setJobPostings}
        />

      {/* Search & Filtering Components */}
      <Filtering
        showFilter={showFilter}
        selected={selected}
        userSearch={userSearch}
        setSelected={setSelected}
        setShowSearch={setShowSearch}
        setUserSearch={setUserSearch}
        setShowFilter={setShowFilter}
      />
      <SearchSheet
        setShowSearch={setShowSearch}
        setTempSearch={setTempSearch}
        tempSearch={tempSearch}
        showSearch={showSearch}
      />

      {/* Dark Backdrop when modal/search/filter open */}
      {(showModal || showFilter || showSearch) && (
        <Pressable
          onPress={handleBG}
          className="absolute inset-0 z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        />
      )}
    </SafeAreaView>
  );
};
