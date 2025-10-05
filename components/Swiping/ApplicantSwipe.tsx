import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Easing,
  StyleSheet,
  Pressable,
  Linking,
} from "react-native";
import { Card } from "react-native-paper";
import {
  MapPin,
  GraduationCap,
  XCircle,
  CheckCircle2,
  Mail,
  BriefcaseBusiness,
} from "lucide-react-native";
import { updateApplications } from "api/applications";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type Applicant = {
  _id: string;
  applicationID?: string;
  jobUID?: string;
  seekerUID?: string;
  status: string;
  appliedAt: string;
  highestLevelAttained?: string;
  profile: {
    fullName:
      | {
          firstName?: string;
          middleInitial?: string;
          lastName?: string;
        }
      | string;
    email: string;
    profilePic?: string;
    location?: {
      city?: string;
      province?: string;
      postalCode?: string;
      display_name?: string;
    };
    skills?: string[];
    industries?: string[];
    profileSummary?: string;
    resume?: string;
    highestLevelAttained?: string;
  };
};

type Props = {
  applicants: Applicant[];
};

export default function ApplicantSwipe({ applicants }: Props) {
  const [swipeDone, setSwipeDone] = useState(false);
  const [index, setIndex] = useState(0);
  const cardPan = useRef(new Animated.ValueXY()).current;
  const isProgrammaticSwipe = useRef(false);

  useEffect(() => {
    if (applicants && applicants.length > 0) {
      setIndex(0);
      setSwipeDone(false);
      cardPan.setValue({ x: 0, y: 0 });
    }
  }, [applicants, cardPan]);

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
    outputRange: ["rgba(239,68,68,1)", "rgb(108,99,255)", "rgba(5,150,105,1)"],
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

  function triggerSwipe(toRight: boolean) {
    if (isProgrammaticSwipe.current) return;
    const current = applicants[index];
    if (!current) return;

    isProgrammaticSwipe.current = true;
    const toX = toRight ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;

    Animated.timing(cardPan, {
      toValue: { x: toX, y: 0 },
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false, // backgroundColor is animated
    }).start(() => {
      if (toRight) {
        updateApplications(current._id, "shortlisted").then(console.log).catch(console.log);
      } else {
        updateApplications(current._id, "viewed").then(console.log).catch(console.log);
      }
      setIndex((prev) => prev + 1);
      setSwipeDone(true);
      isProgrammaticSwipe.current = false;
    });
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 5 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: Animated.event([null, { dx: cardPan.x, dy: cardPan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, g) => {
          const { dx, vx } = g;
          const absDx = Math.abs(dx);
          const fling = Math.abs(vx) > 0.8;

          const current = applicants[index];
          if (!current) return;

          if (absDx > SWIPE_THRESHOLD || fling) {
            const toRight = dx > 0;
            const toX = toRight ? SCREEN_WIDTH * 1.2 : -SCREEN_WIDTH * 1.2;

            Animated.timing(cardPan, {
              toValue: { x: toX, y: 0 },
              duration: 220,
              easing: Easing.out(Easing.ease),
              useNativeDriver: false,
            }).start(() => {
              if (toRight) {
                updateApplications(current._id, "shortlisted").then(console.log).catch(console.log);
              } else {
                updateApplications(current._id, "viewed").then(console.log).catch(console.log);
              }
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
    [cardPan, applicants, index]
  );

  const currentApplicant = applicants[index];
  const nextApplicant = applicants[index + 1];

  if (!currentApplicant || applicants.length === 0 || index >= applicants.length) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>No applicants available</Text>
      </SafeAreaView>
    );
  }

  const renderCard = (a: Applicant, isActive: boolean) => {
    const fullName =
      typeof a.profile.fullName === "string"
        ? a.profile.fullName
        : [a.profile.fullName?.firstName, a.profile.fullName?.middleInitial, a.profile.fullName?.lastName]
            .filter(Boolean)
            .join(" ");
    const city = a.profile.location?.city || "";
    const province = a.profile.location?.province || "";
    const postal = a.profile.location?.postalCode || "";
    const displayName = a.profile.location?.display_name || "";
    const locationDisplay =
      displayName || [city, province, postal].filter(Boolean).join(", ") || "—";
    const highest =
      a.highestLevelAttained || a.profile.highestLevelAttained || undefined;
    const industries = Array.isArray(a.profile.industries) ? a.profile.industries : [];
    const skills = Array.isArray(a.profile.skills) ? a.profile.skills : [];
    const summary = a.profile.profileSummary || "";
    const resumeUrl = a.profile.resume || "";

    const isAbsoluteUrl = (u: string) => /^https?:\/\//i.test(u);

    return (
      <Animated.View style={{ borderRadius: 20, overflow: "hidden" }}>
        <Card
          style={{
            borderRadius: 20,
            backgroundColor: isActive ? (bgColor as any) : "#6C63FF",
            elevation: 0,
            shadowOpacity: 0,
            marginBottom: 60,
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
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              <Text
                style={{ color: "white", fontSize: 22, fontFamily: "Lexend-Bold" }}
                numberOfLines={1}
              >
                {fullName || "—"}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                <Mail size={18} color={"white"} />
                <Text style={{ color: "white", fontSize: 14, marginLeft: 8 }} numberOfLines={1}>
                  {a.profile.email || "—"}
                </Text>
              </View>
            </View>

            {/* Applicant Info */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
              {!!highest && (
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <GraduationCap size={20} color={"white"} />
                  <Text style={{ color: "white", fontSize: 16, marginLeft: 8 }}>
                    {highest}
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                <MapPin size={20} color={"white"} />
                <Text style={{ color: "white", fontSize: 16, marginLeft: 8 }} numberOfLines={1}>
                  {locationDisplay}
                </Text>
              </View>

              {!!industries.length && (
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                  <BriefcaseBusiness size={20} color={"white"} />
                  <Text style={{ color: "white", fontSize: 14, marginLeft: 8 }} numberOfLines={2}>
                    {industries.join(", ")}
                  </Text>
                </View>
              )}

              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                  marginVertical: 16,
                }}
              />

              {!!summary && (
                <Text style={{ color: "white", fontSize: 14, marginBottom: 10 }} numberOfLines={4}>
                  {summary}
                </Text>
              )}

              {!!skills.length && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {skills.slice(0, 8).map((s, i) => (
                    <View
                      key={`${s}-${i}`}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        backgroundColor: "rgba(255,255,255,0.15)",
                        borderRadius: 999,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12 }}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}

            

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 20,
                  gap: 12,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: "white",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ color: "#3B82F6", fontWeight: "700", fontSize: 12 }}>
                    Applied on {new Date(a.appliedAt).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={resumeUrl && isAbsoluteUrl(resumeUrl) ? 0.85 : 1}
                  onPress={() => {
                    if (resumeUrl && isAbsoluteUrl(resumeUrl)) {
                      Linking.openURL(resumeUrl).catch(() => {});
                    }
                  }}
                  style={{
                    backgroundColor: "rgba(255,255,255,0.18)",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 999,
                    opacity: resumeUrl && isAbsoluteUrl(resumeUrl) ? 1 : 0.6,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "700", fontSize: 12 }}>
                    View resume
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: "#F9FAFB" }}>
      {!!nextApplicant && (
        <Animated.View
          key={`${nextApplicant._id}-next`}
          style={[styles.nextCard, { transform: [{ scale: nextCardScale }] }]}
          pointerEvents="none"
        >
          {renderCard(nextApplicant, false)}
        </Animated.View>
      )}

      <Animated.View
        key={`${currentApplicant._id}-current`}
        {...panResponder.panHandlers}
        style={[cardStyle, { zIndex: 15 }]}
      >
        {renderCard(currentApplicant, true)}
      </Animated.View>

      <View style={styles.bottomBar} pointerEvents="box-none">
        <View style={styles.bottomBarInner}>
          <Pressable
            onPress={() => triggerSwipe(false)}
            accessibilityRole="button"
            accessibilityLabel="Skip this applicant"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.actionBtn, styles.skipBtn]}
          >
            <XCircle size={28} color="#EF4444" />
            <Text style={styles.actionText}>Skip</Text>
          </Pressable>

          <Pressable
            onPress={() => triggerSwipe(true)}
            accessibilityRole="button"
            accessibilityLabel="Shortlist this applicant"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.actionBtn, styles.shortlistBtn]}
          >
            <CheckCircle2 size={28} color="#059669" />
            <Text style={styles.actionText}>Shortlist</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nextCard: {
    position: "absolute",
    top: 90,
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
