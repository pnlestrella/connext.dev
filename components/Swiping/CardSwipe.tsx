import React, { useRef, useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Easing,
} from "react-native";
import { Card } from "react-native-paper";
import {
  BriefcaseBusiness,
  PhilippinePeso,
  MapPin,
  Maximize2,
} from "lucide-react-native";
import BottomSheet from "./BottomSheet";
import { useJobs } from "context/jobs/JobHook";


// For images
const Indeed =
  "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/indeed_logo.png?updatedAt=1756757217985";
const ZipRecruiter =
  "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/ZipRecruiter-logo-full-color-black.webp?updatedAt=1756757383134";

const sheetHeight = 400;

// Sample job postings

type Job = {
  boostWeight: number;
  companyName: string;
  employment: string[];
  feedback: {
    match_summary: string;
    skill_note: string;
    extra_note: string,
  };
  isExternal: boolean;
  jobDescription: string;
  jobIndustry: string;
  jobNormalized: string;
  jobSkills: string[];
  jobTitle: string;
  jobUID: string;
  location: {
    city: string;
    postalCode: string;
    state: string;
  };
  profilePic: string;
  salaryRange: {
    currency: string;
    frequency: string;
    max: number;
    min: number;
  };
  score: number;
  status: boolean;
  workTypes: string[];
};

type CStypes = {
  showModal: boolean,
  setShowModal: (value: boolean) => void
  isExpanded: boolean,
  setIsExpanded: (value: boolean) => void
  jobPostings: Job
}
export default function CardSwipe({ showModal, setShowModal, isExpanded, setIsExpanded }: CStypes) {
  // BottomSheet state
  const {setShortlistedJobs, setSkippedJobs, jobPostings,setJobPostings} = useJobs()

  const viewMore = () => {
    setShowModal(true);
    setIsExpanded(true);
  };

  // Swipe constants
  const { width: SCREEN_WIDTH } = Dimensions.get("window");
  const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

  /** ------------ Swipe Cards ------------ */

  // Track when a swipe finishes
  const [swipeDone, setSwipeDone] = useState(false);

  // Reset cardPan only AFTER the list updates
  React.useEffect(() => {
    if (swipeDone) {
      cardPan.setValue({ x: 0, y: 0 });
      setSwipeDone(false);
    }
  }, [jobPostings, swipeDone]);




  const [currentIndex, setCurrentIndex] = useState(0);
  const cardPan = useRef(new Animated.ValueXY()).current;

  const rotate = cardPan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const opacity = cardPan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0.7, 1, 0.7],
    extrapolate: "clamp",
  });

  const cardStyle = {
    transform: [{ translateX: cardPan.x }, { translateY: cardPan.y }, { rotate }],
    opacity,
    width: SCREEN_WIDTH - 40,
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 5 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: Animated.event([null, { dx: cardPan.x, dy: cardPan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          const { dx, vx } = gesture;
          const absDx = Math.abs(dx);

          if (absDx > SWIPE_THRESHOLD || Math.abs(vx) > 0.8) {
            const toRight = dx > 0;
            const toX = toRight ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;

            Animated.timing(cardPan, {
              toValue: { x: toX, y: 0 },
              duration: 200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            }).start(() => {
              // Remove the swiped card
              setJobPostings((prev: any) => {
                if (prev.length > 0) {
                  if (toRight) {
                    setShortlistedJobs((p: any) => [...p, prev[0]]);
                  } else {
                    setSkippedJobs((p: any) => [...p, prev[0].jobUID]);
                  }
                }
                return prev.slice(1);
              });

              // Tell the effect hook to reset AFTER re-render
              setSwipeDone(true);
            });
          } else {
            Animated.spring(cardPan, {
              toValue: { x: 0, y: 0 },
              friction: 6,
              useNativeDriver: false,
            }).start();
          }
        }

      }),
    [cardPan]
  );

  const currentJob = jobPostings[currentIndex];


  if (!currentJob || jobPostings.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>No jobs available</Text>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView className="flex-1 items-center justify-center">

      {/* Swipe Card */}
      <Animated.View {...panResponder.panHandlers} style={cardStyle}>
        <Card style={{ borderRadius: 15, backgroundColor: "#6C63FF" }}>
          <Card.Content>
            {/* Logo + Company */}
            <View className="flex-row items-center space-x-3">
              <View
                className="rounded-full border-2 border-white overflow-hidden"
                style={{ width: 60, height: 60, justifyContent: "center", alignItems: "center" }}
              >
                <Image
                  source={{
                    uri:
                      currentJob.profilePic === "indeed"
                        ? Indeed
                        : currentJob.profilePic === "ziprecruiter"
                          ? ZipRecruiter
                          : currentJob.profilePic,
                  }}
                  style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                />
              </View>

              <View className="ml-2">
                {!currentJob.isExternal ? (
                  <>
                    <Text className="text-white text-xs font-bold">Posted By:</Text>
                    <Text className="text-white text-2xl font-bold">{currentJob.companyName}</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white text-xs font-bold">External Job From:</Text>
                    <Text className="text-white text-2xl font-bold">{currentJob.profilePic}</Text>
                  </>
                )}
              </View>
            </View>

            {/* Job Info */}
            <View className="py-4 px-2">
              <View className="flex-row items-center mb-2">
                <BriefcaseBusiness size={20} color={"white"} />
                <Text className="text-white text-xl ml-2 " style={{ fontFamily: "Lexend-SemiBold" }} >{currentJob.jobTitle}</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <PhilippinePeso size={20} color={"white"} />
                <Text className="text-white text-lg font-bold ml-2">
                  {currentJob.salaryRange.currency} {currentJob.salaryRange.min} - {currentJob.salaryRange.max}/
                  {currentJob.salaryRange.frequency}
                </Text>
              </View>
              <View className="flex-row items-center mb-2">
                <MapPin size={20} color={"white"} />
                <Text className="text-white text-lg ml-2">
                  {currentJob.location.city}, {currentJob.location.state}, {currentJob.location.postalCode}
                </Text>
              </View>

              <View className="border-b border-gray-300 my-5" />
              <Text className="text-white text-base" numberOfLines={2}>
                {currentJob.jobDescription}
              </Text>

              {/* Buttons */}
              <View className="flex-row items-center justify-evenly mt-4">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowModal(true)}
                  className="px-4 py-2 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: "white" }}
                >
                  <Text className="text-blue-500 font-bold text-sm">
                    {Math.round((currentJob.score + currentJob.boostWeight) * 100)}% match for you!
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-center mt-1" onPress={viewMore}>
                  <Text className="text-white underline pb-1">Tap to view more</Text>
                  <Maximize2 size={20} color={"white"} />
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>

      <BottomSheet
        showModal={showModal}
        currentJob={currentJob}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      ></BottomSheet>
    </SafeAreaView>
  );
}
