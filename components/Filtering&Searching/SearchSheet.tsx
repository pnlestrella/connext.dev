import { useEffect, useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";

import searchDataset from "../../data/searchJobs.json";

type Job = {
  title: string;
  industries: string[];
};

type SearchSheetProps = {
  showSearch: boolean;
  tempSearch: Job;
  setTempSearch: (job: Job) => void;
  setShowSearch: (show: boolean) => void;
};

const { height } = Dimensions.get("window");

export const SearchSheet = ({
  showSearch,
  tempSearch,
  setTempSearch,
  setShowSearch,
}: SearchSheetProps) => {
  const [filterSearch, setFilterSearch] = useState<string>("");

  // animation
  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (showSearch) {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 160,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [showSearch, translateY]);

  function handleSearching(item: Job) {
    setTempSearch(item);
    setShowSearch(false);
  }

  const filtered = searchDataset.filter((prev: Job) =>
    prev.title.toLowerCase().includes(filterSearch.toLowerCase())
  );

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <Text
        style={{
          fontFamily: "Poppins-Bold",
          fontSize: 24,
          color: "#37424F",
        }}
        className="mb-4"
      >
        Search Jobs
      </Text>

      <TextInput
        className="w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-base font-lexend text-slate-700 mb-4"
        placeholder="Search Here"
        placeholderTextColor="#94a3b8"
        onChangeText={(e) => setFilterSearch(e)}
        value={filterSearch}
      />

      <FlatList
        data={filtered}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Pressable
            className="my-1"
            onPress={() => handleSearching(item)}
          >
            <Text
              className="font-lexend text-base text-slate-700 border px-4 py-3 rounded-xl shadow-sm"
              style={{
                backgroundColor:
                  item.title === tempSearch?.title ? "#6C63FF" : "white",
                color:
                  item.title === tempSearch?.title ? "white" : "black",
              }}
            >
              {item.title}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text className="text-center text-slate-500">
            Try a different keyword
          </Text>
        }
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    height: 630,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
    elevation: 5,
    zIndex: 999,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});
