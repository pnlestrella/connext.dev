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
  ScrollView
} from "react-native";
import { Card } from "react-native-paper";
import {
  BriefcaseBusiness,
  PhilippinePeso,
  MapPin,
  Maximize2,
  ChevronUp,
} from "lucide-react-native";
import { useAuth } from "context/auth/AuthHook";
//constants
import Constants from 'expo-constants';
import { Header } from "./Header";

// logos
const Indeed =
  "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/indeed_logo.png?updatedAt=1756757217985";
const ZipRecruiter =
  "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/ZipRecruiter-logo-full-color-black.webp?updatedAt=1756757383134";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;


export default function CardSwipe() {
  const {userMDB} = useAuth()
  
  // Fetching Recommendation system
  const userProfile ={
    seekerUID : userMDB?.seekerUID,
    skills: userMDB?.skills,
    profileSummary: userMDB?.profileSummary,
    industries: userMDB?.industries,
    skippedJobs: userMDB?.skippedJobs,
    experience: userMDB?.experience,
    certifications: userMDB?.certifications
  }
  //-----

  const jobPostings = [
    {
      jobUID: "job54",
      companyName: "Simons Company",
      score: 0.62,
      feedback: {
        match_summary:
          "Warehouse role with a focus on teamwork and inventory handling.",
        skill_note:
          "Requires inventory handling and teamwork skills. Consider highlighting transferable skills like attention to detail.",
        extra_note:
          "No related certifications, but this could still be a solid entry point.",
      },
      boostWeight: 0.0,
      _id: "job54",
      jobTitle: "Warehouse Personnel",
      jobIndustry: "Logistics / Delivery",
      jobDescription: `We are seeking a highly capable, proactive Executive Assistant to support our Executives of multiple fast-paced, growth-focused companies in telecom, tech, and the restaurant industry.

This role goes far beyond calendar management—you will serve as a strategic extension of the executive team, driving research, outreach, and operations with little to no handholding.

About Vivant:

Vivant is a fast-growing provider of managed connectivity solutions, specializing in delivering reliable internet, VoIP, managed networks and security to restaurants, dealerships, healthcare providers, retailers, and small to medium-sized businesses.

We help businesses eliminate outages with 100% uptime solutions that keep your business connected to your business essential tools.

We are looking for a goal-driven, highly organized individual to join our growing team.
If you are extremely organized, pay attention to smallest details, very structured in your day to day and goal-driven, welcome to Vivant, you will fit right in!

A day to day life as an Executive Assistant:

Serve as the CEO’s right hand—manage calendar, emails, priorities, and follow-ups without constant oversight
Conduct deep lead generation using Apollo, RocketReach, Hunter.io, LinkedIn, and other tools with only basic input (e.g., company name, role, or employee name)
Scrub and validate lead lists using ZeroBounce or similar tools, then run outbound campaigns via Lemlist
Execute and manage email marketing campaigns from list building to copywriting, sequencing, and performance tracking
Prepare briefs, research decks, and partnership dossiers by sourcing data from multiple platforms efficiently
Coordinate with vendors, legal, and internal teams on contract prep, signature follow-ups, and operational tasks
Manage podcast and event logistics, including guest sourcing, outreach, scheduling, and tech setup
Troubleshoot tasks independently—think strategically and execute without asking "how"
Table Stakes:

Proven experience as an Executive Assistant or in a high-performance operations or marketing support role
Expert-level skills in Apollo, RocketReach, Hunter.io, LinkedIn, ZeroBounce, Lemlist, and GoDaddy
Strong grasp of email marketing workflows, lead validation, and CRM hygiene
Demonstrated ability to figure out vague or loosely defined tasks and produce results without constant guidance
Fluent in Google Workspace, Notion, Zoom, Canva, etc.
AI-savvy—comfortable working with AI tools, crafting effective prompts, and understanding how to train/customize AI models for productivity
Strong written and verbal communication in English
Bonus: Familiarity with SaaS, telecom, or restaurant tech industries
Benefits:

Service Incentive Leave (SIL) after 6 months
HMO after 6 months
13th month pay
Allowances

Schedule:

8 hour Shift
Graveyard

Application Question(s):

Rate your English speaking skills from 1-10. 10 being the best
Rate your English writing skills from 1-10. 10 being the best
This requires working the night shift. Are you OK with this?
Have you ever worked for a US Executive before?
Job Type:

Full-time, Onsite (Cebu Based)

Experience:

Executive Assistant: 2 years (Required)

The ideal candidate is resourceful, AI-savvy, lead-gen fluent, and operates with extreme ownership. If you can take a task with minimal context and deliver results—this role is for you.

Be so good that you can’t be ignored!

Join Vivant and take your career to the next level!

Tip:
When applying, please include relevant data about your past successful campaign and the results, not the process.Due to the extensive number of resumes, we look for relevant experience, success in past campaigns, and an understanding of marketing when deciding which candidates to interview.

Job Types: Full-time, Permanent

Pay: Php25,000.00 - Php50,000.00 per month

Benefits:

Company Christmas gift
Company events
Health insurance
Paid training
Ability to commute/relocate:

Cebu City: Reliably commute or planning to relocate before starting work (Required)
Experience:

Executive Assistance: 2 years (Required)
Customer service: 3 years (Required)
Language:

English (Required)
Location:

Cebu City (Required)
`,
      jobSkills: ["Inventory Handling", "Teamwork", "Perseverance", "meowmeow"],
      location: {
        city: "Caloocan",
        state: "Metro Manila",
        postalCode: "1400",
      },
      employment: ["Full-time", "Part Time"],
      workTypes: ["Onsite", "Remote"],
      salaryRange: {
        min: 12000,
        max: 16000,
        currency: "PHP",
        frequency: "month",
      },
      jobNormalized: "warehouse personnel",
      profilePic:
        "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/placeholder.png?updatedAt=1756757645263",
      isExternal: false,
      status: true,
    },
    {
      jobUID: "job28",
      score: 0.63,
      feedback: {
        match_summary:
          "Data entry and inventory tracking role in a warehouse setting.",
        skill_note:
          "Requires data entry and inventory tracking skills. Consider developing skills in data management.",
        extra_note:
          "No related certifications, but this could still be a solid entry point.",
      },
      boostWeight: 0.0,
      _id: "job28",
      jobPoster: "EMP028",
      jobTitle: "Warehouse Clerk",
      jobIndustry: "Logistics / Delivery",
      jobDescription:
        "['Maintain records of warehouse inventory.', 'Assist with receiving and dispatching goods.', 'Prepare reports on stock levels.']",
      jobSkills: ["Inventory Tracking", "Data Entry"],
      location: {
        city: "Meycauayan",
        state: "Bulacan",
        postalCode: "3020",
      },
      employment: ["Full-time"],
      workTypes: ["Onsite"],
      salaryRange: {
        min: 7000,
        max: 11000,
        currency: "PHP",
        frequency: "year",
      },
      jobNormalized: "warehouse clerk",
      profilePic: "indeed",
      isExternal: true,
      status: true,
    },
  ];

  /** -----------------------------
   * Bottom Sheet (Tap to open/close)
   * ------------------------------ */
  const sheetHeight = 400;
  const EXPANDED_POSITION = 0;          // fully expanded
  const MID_POSITION = 5; // half-expanded
  const HIDDEN_POSITION = sheetHeight;  // hidden

  const [showModal, setShowModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const translateYAnim = useRef(new Animated.Value(HIDDEN_POSITION)).current;

  const openSheet = () => {
    setShowModal(true);
    Animated.spring(translateYAnim, {
      toValue: MID_POSITION,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start(() => setIsExpanded(false));
  };

  const viewMore = () => {
    setShowModal(true);
    setIsExpanded(true)
    Animated.spring(translateYAnim, {
      toValue: MID_POSITION,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start(() => setIsExpanded(true));
  };

  const closeSheet = () => {
    Animated.timing(translateYAnim, {
      toValue: HIDDEN_POSITION,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShowModal(false);
        setIsExpanded(false);
      }
    });
  };

  const expandToggleSheet = () => {
    setIsExpanded(!isExpanded)
    Animated.spring(translateYAnim, {
      toValue: isExpanded ? MID_POSITION : EXPANDED_POSITION,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start(() => setIsExpanded(!isExpanded));
  };


  /** ------------ Swipe Cards ------------ */
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

            if(toRight){
              console.log("to rIght")
            }else{
              console.log("To left")
            }

            Animated.timing(cardPan, {
              toValue: { x: toX, y: 0 },
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              cardPan.setValue({ x: 0, y: 0 });
              setCurrentIndex((prev) => (prev + 1) % jobPostings.length);
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
    [cardPan, jobPostings.length]
  );

  const currentJob = jobPostings[currentIndex];

  console.log(jobPostings.length,'-------length')

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
                    <Text className="text-white text-xs font-lexend font-bold">Posted By:</Text>
                    <Text className="text-white text-2xl font-lexend font-bold">{currentJob.companyName}</Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white text-xs font-lexend font-bold">External Job From:</Text>
                    <Text className="text-white text-2xl font-lexend font-bold">{currentJob.profilePic}</Text>
                  </>
                )}
              </View>
            </View>

            {/* Job Info */}
            <View className="py-4 px-2">
              <View className="flex-row items-center space-x-2 mb-2">
                <BriefcaseBusiness size={20} color={"white"} />
                <Text className="text-white text-xl font-lexend font-bold ml-2">{currentJob.jobTitle}</Text>
              </View>
              <View className="flex-row items-center space-x-2 mb-2">
                <PhilippinePeso size={20} color={"white"} />
                <Text className="text-white text-lg font-lexend font-bold ml-2">
                  {currentJob.salaryRange.currency} {currentJob.salaryRange.min} - {currentJob.salaryRange.max}/{currentJob.salaryRange.frequency}
                </Text>
              </View>
              <View className="flex-row items-center space-x-2 mb-2">
                <MapPin size={20} color={"white"} />
                <Text className="text-white text-lg font-lexend font-medium ml-2">
                  {currentJob.location.city}, {currentJob.location.state}, {currentJob.location.postalCode}
                </Text>
              </View>

              <View className="border-b border-gray-300 my-5" />
              <Text className="text-white text-base font-lexend text-justify" numberOfLines={2}>
                {currentJob.jobDescription}
              </Text>

              {/* Match buttons */}
              <View className="flex-row items-center justify-evenly mt-4">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={openSheet}
                  className="px-4 py-2 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: "white" }}
                >
                  <Text className="text-blue-500 font-lexend font-bold text-sm">
                    {Math.round((currentJob.score + currentJob.boostWeight) * 100)}% match for you!
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-center mt-1" onPress={viewMore}>
                  <Text className="text-white font-lexend underline pb-1">Tap to view more</Text>
                  <Maximize2 size={20} color={"white"} />
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>

      {/* Bottom Sheet */}
      {/* Bottom Sheet */}
      {showModal && (
        <>
          {/* Overlay */}
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeSheet}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          />

          {/* Animated Sheet */}
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: (!isExpanded ? 400 : 550),
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              transform: [{ translateY: translateYAnim }],
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowOffset: { width: 0, height: -2 },
            }}
          >

            {/* 👆 Clickable Handle */}
            <Animated.View>
              <TouchableOpacity
                onPress={expandToggleSheet}
                style={{ alignItems: "center", marginBottom: 12 }}
              >
                <ChevronUp ></ChevronUp>
              </TouchableOpacity>
            </Animated.View>


            <ScrollView>
              {/* Always visible feedback */}

              {isExpanded && (
                <>
                  <View className="flex justify-center items-center">
                    <Text className="text-black mt-4" style={{ fontFamily: "Lexend-Bold", fontSize: 20 }} >{currentJob.jobTitle}</Text>
                    {!currentJob.isExternal ? (
                      <>
                        <Text style={{ fontFamily: "Lexend-Regular", fontSize: 12 }}>Posted By: <Text >{currentJob.companyName}</Text></Text>

                      </>
                    ) : (
                      <>
                        <Text style={{ fontFamily: "Lexend-Regular", fontSize: 12 }} >External Job From: <Text>{currentJob.profilePic}</Text></Text>

                      </>
                    )}
                  </View>
                  <Text className="text-brand-purpleMain mt-4" style={{ fontFamily: "Lexend-SemiBold", fontSize: 16 }} >Job Details </Text>
                  <Text className="text-brand-purpleMain " style={{ fontFamily: "Lexend-SemiBold", fontSize: 14 }} >Pay: <Text className="text-black" style={{ fontFamily: "Lexend-Regular", fontSize: 12 }} > {currentJob.salaryRange.currency} {currentJob.salaryRange.min} - {currentJob.salaryRange.max}/{currentJob.salaryRange.frequency}</Text></Text>

                  {/* Job Types  */}
                  <View className="my-1" style={{ display: "flex", alignItems: 'center', flexDirection: 'row' }}>
                    <Text className="text-brand-purpleMain" style={{ fontFamily: "Lexend-SemiBold", fontSize: 14 }} >Job Type:  </Text>

                    {currentJob.employment.map((v, i) => (
                      <View key={i} >
                        <Text className="mx-1 p-1 rounded-lg" style={{ fontFamily: "Lexend-Regular", fontSize: 12, backgroundColor: '#c7c3c3', color: '#2e2d2d' }} >{v} </Text>
                      </View>

                    ))}

                    {/* Skills REquired */}
                  </View>
                  <Text className="text-brand-purpleMain" style={{ fontFamily: "Lexend-SemiBold", fontSize: 14 }} >Skills Required:  </Text>

                  <View className="my-1" style={{ display: "flex", alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' }}>

                    {currentJob.jobSkills.map((v, i) => (
                      <View key={i} >
                        <Text className="m-1 p-1 rounded-lg" style={{ fontFamily: "Lexend-Regular", fontSize: 12, backgroundColor: '#c7c3c3', color: '#2e2d2d' }} >{v} </Text>
                      </View>

                    ))}
                  </View>


                  {/* Work types */}
                  <Text className="text-brand-purpleMain" style={{ fontFamily: "Lexend-SemiBold", fontSize: 14 }} >Work Types:  </Text>

                  <View className="my-1" style={{ display: "flex", alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' }}>

                    {currentJob.workTypes.map((v, i) => (
                      <View key={i} >
                        <Text className="m-1 p-1 rounded-lg" style={{ fontFamily: "Lexend-Regular", fontSize: 12, backgroundColor: '#c7c3c3', color: '#2e2d2d' }} >{v} </Text>
                      </View>

                    ))}
                  </View>
                  <View style={{ height: 1, backgroundColor: 'lightgray', marginVertical: 10 }}></View>


                  {/* Location */}
                  <View className="flex-row items-center">
                    <MapPin size={20} color={"#6C63FF"} />
                    <Text className="text-brand-purpleMain my-2" style={{ fontFamily: "Lexend-SemiBold", fontSize: 16 }} > Location: <Text className="text-black">{currentJob.location.city}</Text> </Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: 'lightgray', marginVertical: 10 }}></View>

                  <Text className="text-brand-purpleMain mt-4" style={{ fontFamily: "Lexend-SemiBold", fontSize: 16 }} >Full job description</Text>
                  <Text style={{ fontFamily: "Lexend-SemiBold", fontSize: 14, color: "#5e5c5c" }}>{currentJob.jobDescription}</Text>


                  <View style={{ height: 1, backgroundColor: 'lightgray', marginVertical: 10 }}></View>

                </>

              )}
              <View className="space-y-4">
                <View className="bg-green-50 rounded-2xl p-4 shadow-sm m-1">
                  <Text className="text-green-900 font-lexend font-bold text-base mb-1">
                    Match Summary
                  </Text>
                  <Text className="text-gray-700 font-lexend leading-relaxed">
                    {currentJob.feedback.match_summary}
                  </Text>
                </View>
                <View className="bg-violet-50 rounded-2xl p-4 shadow-sm m-1">
                  <Text className="text-violet-900 font-lexend font-bold text-base mb-1">
                    Skill Notes
                  </Text>
                  <Text className="text-gray-700 font-lexend leading-relaxed">
                    {currentJob.feedback.skill_note}
                  </Text>
                </View>
                <View className="bg-blue-50 rounded-2xl p-4 shadow-sm m-1">
                  <Text className="text-blue  -900 font-lexend font-bold text-base mb-1">
                    Extra Notes
                  </Text>
                  <Text className="text-gray-700 font-lexend leading-relaxed">
                    {currentJob.feedback.extra_note}
                  </Text>
                </View>
              </View>


            </ScrollView>
          </Animated.View>
        </>
      )}

    </SafeAreaView>
  );
};
