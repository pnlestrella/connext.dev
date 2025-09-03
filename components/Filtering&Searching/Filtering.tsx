import { Button } from 'components/Button';
import { useEffect, useRef, useState } from 'react';
import {
    Text,
    View,
    StyleSheet,
    Dimensions,
    Animated,
    Pressable,
} from 'react-native';

import { Checkbox } from "react-native-paper";
import Constants from 'expo-constants'
import { recoSys } from 'api/recosys';


const filterOptions = [
    { id: "1", label: "Full-time" },
    { id: "2", label: "Part-time" },
    { id: "3", label: "Contract" },
    { id: "4", label: "Freelance" },
    { id: "5", label: "Internship" },
    { id: "6", label: "OJT (On the job training)" },
    { id: "7", label: "Volunteer" },
];

type filteringTypes = {
    showFilter: boolean,
    userSearch: String
    selected: [String];
    tempSearch: { title: String, industries: [String] } | null
}

const { height } = Dimensions.get("window");

export const Filtering = ({ showFilter, selected, userSearch, tempSearch, setUserSearch, setShowSearch, setSelected, userProfile, setJobPostings, setShowFilter }: filteringTypes) => {

    const [jobTypesTemp, setJobTypesTemp] = useState<{ [key: string]: boolean }>({});

    const toggle = (id: string) => {
        setJobTypesTemp((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    async function HandleSave() {
        if (!tempSearch) {
            alert("Please search a Job First")
            return
        }
        let profileQuery = userProfile

        const arr = filterOptions
            .filter(option => jobTypesTemp[option.id]) // keep only checked
            .map(option => option.label)               // extract labels

        //Job types
        profileQuery.jobTypes = arr
        //User Query
        const search = { "query": tempSearch.title, "queryIndustry": tempSearch.industries }
        profileQuery.userSearch = search


        // connect to Recosys
        console.log(await recoSys(profileQuery, setJobPostings))

        //after success
        setUserSearch(tempSearch.title)
        setShowFilter(false)
    }




    // for the effects
    const translateY = useRef(new Animated.Value(height)).current;

    useEffect(() => {
        if (showFilter) {
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
    }, [showFilter]);


    return (
        <>
            <Animated.View style={[styles.sheet, {
                transform: [{ translateY }]
            }]}>
                <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 24, color: '#37424F' }}>Search Jobs</Text>
                <Pressable className='my-2'
                    onPress={setShowSearch}
                >
                    <View className='w-full justify-center p-3  h-12 rounded-md border border-gray-400'>
                        <Text className='font-lexend color-slate-600 text-base'>{tempSearch?.title || "Search Jobs"}</Text>
                    </View>
                </Pressable>

                <View style={{ height: 1, backgroundColor: 'lightgray', marginVertical: 10 }}></View>

                <Text
                    className="text-brand-purpleMain mt-4"
                    style={{ fontFamily: "Lexend-SemiBold", fontSize: 16 }}
                >
                    Job Types
                </Text>

                <View className="flex-row flex-wrap">
                    {filterOptions.map((item) => (
                        <View key={item.id} className="w-1/2 px-2">
                            <Checkbox.Item
                                label={item.label}
                                status={jobTypesTemp[item.id] ? "checked" : "unchecked"}
                                onPress={() => toggle(item.id)}
                                labelStyle={{ fontSize: 16 }}
                                className="rounded-lg"
                            />
                        </View>
                    ))}
                </View>
                <Text className="mt-4 text-gray-500">
                    Selected:{" "}
                    {Object.keys(selected)
                        .filter((id) => selected[id])
                        .map((id) => filterOptions.find((opt) => opt.id === id)?.label)
                        .join(", ") || "None"}
                </Text>

                <Button title={'Save'} onPress={HandleSave}></Button>

            </Animated.View>
        </>

    );
};

const styles = StyleSheet.create({
    sheet: {
        position: "absolute",
        bottom: -50,
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
