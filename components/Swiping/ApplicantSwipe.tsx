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
} from "react-native";
import { Card } from "react-native-paper";
import { MapPin, GraduationCap } from "lucide-react-native";
import { updateApplications } from "api/applications";



const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

type Applicant = {
    _id: string;
    status: string;
    appliedAt: string;
    profile: {
        fullName: {
            firstName: string;
            middleInitial?: string;
            lastName: string;
        };
        email: string;
        profilePic?: string;
        location: {
            city: string;
            province: string;
            postalCode?: string;
        };
        skills: string[];
    };
};

type Props = {
    applicants: Applicant[];
};

export default function ApplicantSwipe({ applicants }: Props) {

    const [swipeDone, setSwipeDone] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const cardPan = useRef(new Animated.ValueXY()).current;

    useEffect(() => {
        if (swipeDone) {
            cardPan.setValue({ x: 0, y: 0 });
            setSwipeDone(false);
        }
    }, [applicants, swipeDone]);

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
                onMoveShouldSetPanResponder: (_, g) =>
                    Math.abs(g.dx) > 5 && Math.abs(g.dx) > Math.abs(g.dy),
                onPanResponderMove: Animated.event([null, { dx: cardPan.x, dy: cardPan.y }], {
                    useNativeDriver: false,
                }),
                onPanResponderRelease: (_, g) => {
                    const { dx, vx } = g;
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
                            if (applicants.length > 0) {
                                if (toRight) {
                                    const res = updateApplications(applicants[0]._id, 'shortlisted')
                                        .then((res) => console.log(res))
                                        .catch(err => console.log(err))

                                    console.log(applicants[0]._id, 'shortlisted')
                                } else {
                                    const res = updateApplications(applicants[0]._id, 'viewed')
                                        .then((res) => console.log(res))
                                        .catch(err => console.log(err))
                                }
                            }
                            applicants.shift(); // remove current
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
        [cardPan, applicants]
    );

    const currentApplicant = applicants[currentIndex];

    if (!currentApplicant || applicants.length === 0) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text>No applicants available</Text>
            </SafeAreaView>
        );
    }

    const { profile } = currentApplicant;

    return (
        <SafeAreaView className="flex-1 items-center justify-center">
            <Animated.View {...panResponder.panHandlers} style={cardStyle}>
                <Card style={{ borderRadius: 15, backgroundColor: "#6C63FF" }}>
                    <Card.Content>
                        {/* Profile picture */}
                        <View className="ml-2 items-center">
                            <Text className="text-white text-2xl" style={{ fontSize: 20, fontFamily: 'Lexend-Bold' }}>
                                {profile.fullName.firstName}{" "}
                                {profile.fullName.middleInitial || ""} {profile.fullName.lastName}
                            </Text>
                        </View>

                        {/* Applicant Info */}
                        <View className="py-4 px-2">
                            {(currentApplicant?.highestLevelAttained) &&
                                <View className="flex-row items-center mb-2">
                                    <GraduationCap size={20} color={"white"} />
                                    <Text className="text-white text-lg ml-2">{currentApplicant?.highestLevelAttained}</Text>
                                </View>
                            }

                            <View className="flex-row items-center mb-2">
                                <MapPin size={20} color={"white"} />
                                <Text className="text-white text-lg ml-2">
                                    {profile.location.city}, {profile.location.province}
                                </Text>
                            </View>

                            <View className="border-b border-gray-300 my-5" />

                            <Text className="text-white text-base" numberOfLines={3}>
                                Skills: {profile.skills.join(", ")}
                            </Text>

                            <View className="flex-row items-center justify-evenly mt-4">
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    className="px-4 py-2 rounded-full justify-center items-center mr-3"
                                    style={{ backgroundColor: "white" }}
                                >
                                    <Text className="text-blue-500 font-bold text-sm">
                                        Applied on {new Date(currentApplicant.appliedAt).toLocaleDateString()}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Card.Content>
                </Card>
            </Animated.View>
        </SafeAreaView>
    );
}
