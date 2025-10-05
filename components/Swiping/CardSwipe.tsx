import React, { useRef, useState, useMemo, useEffect } from "react";
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
  StyleSheet,
  Pressable,
} from "react-native";
import { Card } from "react-native-paper";
import {
  BriefcaseBusiness,
  PhilippinePeso,
  MapPin,
  Maximize2,
  XCircle,
  CheckCircle2,
} from "lucide-react-native";
import BottomSheet from "./BottomSheet";
import { useJobs } from "context/jobs/JobHook";

const INDEED =
  "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/indeed_logo.png?updatedAt=1756757217985";
const ZIPRECRUITER =
  "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/ZipRecruiter-logo-full-color-black.webp?updatedAt=1756757383134";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type Job = {
  boostWeight: number;
  company: { name?: string; profilePic?: string };
  employment: string[];
  feedback?: { match_summary?: string; skill_note?: string; extra_note?: string };
  isExternal: boolean;
  jobDescription: string;
  jobIndustry: string;
  jobNormalized: string;
  jobSkills: string[];
  jobTitle: string;
  jobUID: string;
  location?: { display_name?: string; city?: string; state?: string; postalCode?: string };
  salaryRange?: { currency?: string; frequency?: string; max?: number; min?: number };
  score: number;
  status: boolean;
  workTypes: string[];
};

type Props = {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
};

export default function CardSwipe({ showModal, setShowModal, isExpanded, setIsExpanded }: Props) {
  const { handleSwipe, jobPostings } = useJobs();

  const [swipeDone, setSwipeDone] = useState(false);
  const [index, setIndex] = useState(0);
  const cardPan = useRef(new Animated.ValueXY()).current;

  // Guard to prevent double trigger during programmatic animation
  const isProgrammaticSwipe = useRef(false);

  function triggerSwipe(toRight: boolean) {
    if (isProgrammaticSwipe.current) return;
    const currentJob = jobPostings[index];
    if (!currentJob) return;

    isProgrammaticSwipe.current = true;
    const toX = toRight ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;

    Animated.timing(cardPan, {
      toValue: { x: toX, y: 0 },
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(() => {
      handleSwipe(currentJob, toRight ? "shortlist" : "skip");
      setIndex((prev) => prev + 1);
      setSwipeDone(true);
      isProgrammaticSwipe.current = false;
    });
  }

  // 🔄 Reset index when jobs refresh
  useEffect(() => {
    if (jobPostings && jobPostings.length > 0) {
      setIndex(0);
      setSwipeDone(false);
      cardPan.setValue({ x: 0, y: 0 });
    }
  }, [jobPostings]);

  useEffect(() => {
    if (swipeDone) {
      cardPan.setValue({ x: 0, y: 0 });
      setSwipeDone(false);
    }
  }, [swipeDone, cardPan]);

  const rotate = cardPan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const opacity = cardPan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0.9, 1, 0.9],
    extrapolate: "clamp",
  });

  const bgColor = cardPan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    outputRange: [
      "rgba(239,68,68,1)", // left
      "rgb(108,99,255)",   // middle
      "rgba(5,150,105,1)", // right
    ],
    extrapolate: "clamp",
  });

  const shortlistOpacity = cardPan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const skipOpacity = cardPan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const nextCardScale = cardPan.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [0.95, 0.9, 0.95],
    extrapolate: "clamp",
  });

  const cardStyle = {
    transform: [{ translateX: cardPan.x }, { translateY: cardPan.y }, { rotate }],
    opacity,
    width: SCREEN_WIDTH - 40,
    alignSelf: "center" as const,
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 5 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: Animated.event([null, { dx: cardPan.x, dy: cardPan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, g) => {
          const { dx, vx } = g;
          const absDx = Math.abs(dx);
          const fling = Math.abs(vx) > 0.8;

          const currentJob = jobPostings[index];
          if (!currentJob) return;

          if (absDx > SWIPE_THRESHOLD || fling) {
            const toRight = dx > 0;
            const toX = toRight ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;

            Animated.timing(cardPan, {
              toValue: { x: toX, y: 0 },
              duration: 220,
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            }).start(() => {
              handleSwipe(currentJob, toRight ? "shortlist" : "skip");
              setIndex((prev) => prev + 1);
              setSwipeDone(true);
            });
          } else {
            Animated.spring(cardPan, {
              toValue: { x: 0, y: 0 },
              friction: 6,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [cardPan, handleSwipe, jobPostings, index]
  );

  const renderCards = () => {
    const currentJob = jobPostings[index];
    const nextJob = jobPostings[index + 1];

    return (
      <>
        {nextJob && (
          <Animated.View
            key={`${nextJob.jobUID || index}-next`}
            style={[styles.nextCard, { transform: [{ scale: nextCardScale }] }]}
            pointerEvents="none"
          >
            {renderCard(nextJob, false)}
          </Animated.View>
        )}
        {currentJob && (
          <Animated.View
            key={`${currentJob.jobUID || index}-current`}
            {...panResponder.panHandlers}
            style={[cardStyle, { zIndex: 15 }]}
          >
            {renderCard(currentJob, true)}
          </Animated.View>
        )}
      </>
    );
  };

  const renderCard = (currentJob: Job, isActive: boolean) => {
    if (!currentJob) return null;

    const coName = currentJob.company?.name || "";
    const provider = (currentJob.company?.profilePic || "").toLowerCase();
    const brandLogo =
      provider === "indeed"
        ? INDEED
        : provider === "ziprecruiter"
        ? ZIPRECRUITER
        : currentJob.company?.profilePic;

    const payMin = currentJob.salaryRange?.min;
    const payMax = currentJob.salaryRange?.max;
    const payCur = currentJob.salaryRange?.currency || "";
    const payFreq = currentJob.salaryRange?.frequency || "";
    const payDisplay =
      typeof payMin === "number" && typeof payMax === "number"
        ? `${payCur} ${payMin} - ${payMax}/${payFreq}`
        : payCur || payFreq
        ? `${payCur} ${payFreq}`
        : "—";

    const locationDisplay =
      currentJob.location?.display_name ||
      [currentJob.location?.city, currentJob.location?.state].filter(Boolean).join(", ") ||
      "—";

    const matchPct = Math.round((currentJob.score + (currentJob.boostWeight || 0)) * 100);

    return (
      <Animated.View style={{ borderRadius: 20, overflow: "hidden" }}>
        <Card
          style={{
            borderRadius: 20,
            backgroundColor: isActive ? bgColor : "#6C63FF",
            elevation: 0,
            shadowOpacity: 0,
            marginBottom:60
          }}
        >
          <Card.Content style={{ padding: 0 }}>
            {isActive && (
              <>
                <Animated.View
                  style={[
                    styles.badge,
                    { left: 14, backgroundColor: "rgba(6,95,70,0.9)", opacity: shortlistOpacity },
                  ]}
                  pointerEvents="none"
                >
                  <CheckCircle2 size={14} color="#ECFDF5" />
                  <Text style={styles.badgeText}>Shortlist</Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.badge,
                    { right: 14, backgroundColor: "rgba(153,27,27,0.9)", opacity: skipOpacity },
                  ]}
                  pointerEvents="none"
                >
                  <XCircle size={14} color="#FEF2F2" />
                  <Text style={styles.badgeText}>Skip</Text>
                </Animated.View>
              </>
            )}

            {/* Header */}
            <View className="flex-row items-center">
              <View
                className="rounded-full overflow-hidden"
                style={{ width: 60, height: 60, justifyContent: "center", alignItems: "center" }}
              >
                {!!brandLogo ? (
                  <Image
                    source={{ uri: brandLogo }}
                    style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                  />
                ) : (
                  <View style={styles.noLogo}>
                    <Text style={{ color: "#6B7280" }}>N/A</Text>
                  </View>
                )}
              </View>

              <View className="ml-3" style={{ flex: 1 }}>
                {!currentJob.isExternal ? (
                  <>
                    <Text className="text-white text-xs font-bold">Posted By:</Text>
                    <Text numberOfLines={1} className="text-white text-2xl font-bold">
                      {coName || "—"}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white text-xs font-bold">External Job From:</Text>
                    <Text numberOfLines={1} className="text-white text-2xl font-bold">
                      {provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "—"}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Job Info */}
            <View className="py-4 px-2">
              <View className="flex-row items-center mb-2" style={{ flexWrap: "wrap" }}>
                <BriefcaseBusiness size={20} color={"white"} />
                <Text
                  className="text-white text-xl ml-2"
                  style={{ fontFamily: "Lexend-SemiBold" }}
                  numberOfLines={2}
                >
                  {(currentJob.jobTitle || "").trim() || "—"}
                </Text>
              </View>

              <View className="flex-row items-center mb-2">
                <PhilippinePeso size={20} color={"white"} />
                <Text className="text-white text-lg font-bold ml-2">{payDisplay}</Text>
              </View>

              <View className="flex-row items-center mb-2" style={{ flexWrap: "wrap" }}>
                <MapPin size={20} color={"white"} />
                <Text className="text-white text-lg ml-2" numberOfLines={1}>
                  {locationDisplay}
                </Text>
              </View>

              <View className="border-b border-indigo-200 my-6" />

              <Text className="text-white text-base" numberOfLines={3}>
                {(currentJob.jobDescription || "").trim() || "—"}
              </Text>

              <View className="flex-row items-center justify-between mt-14">
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowModal(true)}
                  className="px-4 py-2 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: "white", minHeight: 42 }}
                >
                  <Text className="text-blue-500 font-bold text-sm">
                    {isFinite(matchPct) ? `${matchPct}% match for you!` : "View match"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center justify-center mt-1"
                  onPress={() => {
                    setShowModal(true);
                    setIsExpanded(true);
                  }}
                >
                  <Text className="text-white underline pb-1">Tap to view more</Text>
                  <Maximize2 size={20} color={"white"} />
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Shortlisted Text */}
        <Animated.View style={{ position: 'absolute', top: 50, right: 50, transform: [{ rotate: '30deg' }] }}>
          <Animated.Text style={{ fontFamily: 'Lexend-Bold' ,opacity: shortlistOpacity, fontSize: 24, color: 'green', }}>
            Shortlisted!
          </Animated.Text>
        </Animated.View>

        {/* Skipped Text */}
        <Animated.View style={{ position: 'absolute', top: 50, left: 50, transform: [{ rotate: '-30deg' }] }}>
          <Animated.Text style={{ fontFamily: 'Lexend-Bold', opacity: skipOpacity, fontSize: 24, color: 'red', }}>
            Skipped!
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    );
  };

  if (!jobPostings || jobPostings.length === 0 || index >= jobPostings.length) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text style={{ fontFamily: "Lexend-Regular", color: "#9CA3AF" }}>No jobs Available</Text>
      </SafeAreaView>
    );
  }

  const currentJob = jobPostings[index];
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
      {renderCards()}

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar} pointerEvents="box-none">
        <View style={styles.bottomBarInner}>
          <Pressable
            activeOpacity={0.9}
            onPress={() => triggerSwipe(false)}
            disabled={!currentJob}
            accessibilityRole="button"
            accessibilityLabel="Skip this job"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.actionBtn, styles.skipBtn]}
          >
            <XCircle size={28} color="#EF4444" />
            <Text style={styles.actionText}>Skip</Text>
          </Pressable>

          <Pressable
            activeOpacity={0.9}
            onPress={() => triggerSwipe(true)}
            disabled={!currentJob}
            accessibilityRole="button"
            accessibilityLabel="Shortlist this job"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.actionBtn, styles.shortlistBtn]}
          >
            <CheckCircle2 size={28} color="#059669" />
            <Text style={styles.actionText}>Shortlist</Text>
          </Pressable>
        </View>
      </View>

      {currentJob && (
        <BottomSheet
          showModal={showModal}
          currentJob={currentJob}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nextCard: {
    position: "absolute",
    top: 90, // peek
    width: SCREEN_WIDTH - 40,
    alignSelf: "center",
    borderRadius: 20,
    overflow: "hidden",
    zIndex: 1,
  },
  badge: {
    position: "absolute",
    top: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: { color: "white", marginLeft: 6, fontWeight: "700" },
  noLogo: {
    backgroundColor: "#F3F4F6",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  // Bottom bar styles
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: "center",
  },
  bottomBarInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    width: SCREEN_WIDTH - 40,
  },
  actionBtn: {
    flex: 1,
    height: 56,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  actionText: {
    marginLeft: 8,
    fontWeight: "700",
    color: "#111827",
  },
  skipBtn: {
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  shortlistBtn: {
    borderWidth: 1,
    borderColor: "rgba(5,150,105,0.2)",
  },
});
