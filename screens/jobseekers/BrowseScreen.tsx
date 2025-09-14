import {
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CardSwipe from "components/Swiping/CardSwipe";
import { Header } from "components/Header";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react-native";

//Filtering & Searching
import { Filtering } from "components/Filtering&Searching/Filtering";
import { SearchSheet } from "components/Filtering&Searching/SearchSheet";

import { useJobs } from "context/jobs/JobHook";


type Job = {
  jobUID: string;
  companyName?: string;
  score: number;
  feedback: {
    match_summary: string;
    skill_note: string;
    extra_note: string;
  };
  boostWeight: number;
  _id: string;
  jobPoster?: string;
  jobTitle: string;
  jobIndustry: string;
  jobDescription: string;
  jobSkills: string[];
  location: {
    city: string;
    state: string;
    postalCode: string;
  };
  employment: string[];
  workTypes: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
    frequency: string;
  };
  jobNormalized: string;
  profilePic: string;
  isExternal: boolean;
  status: boolean;
};

type BrowseScreenTypes = {
  userSearch: { title: string; industries: string[] };
};


export const BrowseScreen = () => {
  const { jobPostings, setJobPostings, tempSearch, setTempSearch, userSearch, setUserSearch } = useJobs()


  // Filter
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({});


  //For Card Swiping & Bottom Sheets effect of it
  const [showModal, setShowModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  //for Filtering & Search
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

  console.log(jobPostings.length,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')

  return (
    <SafeAreaView className="bg-white" style={{ flex: 1 }}>
      <Header />

      <View className="flex-row justify-between px-6">
        <Text
          style={{
            fontFamily: "Poppins-Bold",
            fontSize: 24,
            color: "#37424F",
          }}
        >
          Find Jobs
        </Text>

        {/* For Filtering & Searchng */}
        <Pressable
          onPress={() => setShowFilter(true)}
          className="w-[62%] rounded-xl justify-center p-2"
          style={{ backgroundColor: "#EFEFEF" }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Search />
              <Text className="font-lexend color-slate-600 text-base">
                {(userSearch || "Search Here").length > 16
                  ? (userSearch || "Search Here").slice(0, 16) + "..."
                  : userSearch || "Search Here"}
              </Text>
            </View>
            <SlidersHorizontal width={18} />
          </View>
        </Pressable>
      </View>


      <CardSwipe
        showModal={showModal}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        setShowModal={setShowModal}
        jobPostings={jobPostings}
        setJobPostings={setJobPostings}
      />

      {/* Search And Filtering Components  */}
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

      {/* for the black screen */}
      {(showModal || showFilter || showSearch) && (
        <Pressable
          onPress={handleBG}
          className="absolute inset-0 bg-black z-[100]"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        />
      )}
    </SafeAreaView>
  );
};
