import React, { useState, useEffect, useRef } from "react";
import { Modal, View, Text, FlatList, Pressable, TextInput, Animated } from "react-native";
import Skills from '../../data/skills.json';

type SkillsModalProps = {
    visible: boolean;
    onClose: () => void;
    onSave: (selectedSkills: string[]) => void;
    initialSelected?: string[];
};

export const SkillsModal = ({ visible, onClose, onSave, initialSelected = [] }: SkillsModalProps) => {
    const [selected, setSelected] = useState<string[]>(initialSelected);
    const [search, setSearch] = useState("");
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200, // fade-in duration
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200, // fade-out duration
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleSelect = (skill: string) => {
        if (selected.includes(skill)) {
            if (selected.length === 1) {
                alert("You must keep at least 1 skill selected");
                return;
            }
            setSelected(prev => prev.filter(s => s !== skill));
        } else if (selected.length >= 10) {
            alert("You can select up to 10 skills");
        } else {
            setSelected(prev => [...prev, skill]);
        }
    };


    return (
        <Modal transparent visible={visible} onRequestClose={onClose}>
            <Animated.View
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: fadeAnim,
                }}
            >
                <View className="w-[90%] bg-white rounded-lg p-5 max-h-[80%]">
                    <Text className="text-lg font-bold mb-3" style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#6C63FF" }}> Select Skills</Text>

                <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search skills..."
                    className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
                />

                <FlatList
                    data={Skills.filter(item =>
                        item.Skills.toLowerCase().includes(search.toLowerCase())
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => {
                        const isSelected = selected.includes(item.Skills);
                        return (
                            <Pressable
                                className={`border m-1 p-3 rounded-xl ${isSelected ? "bg-brand-purpleMain" : "bg-white"}`}
                                onPress={() => handleSelect(item.Skills)}
                            >
                                <Text className={isSelected ? "text-white" : "text-black"}>{item.Skills}</Text>
                            </Pressable>
                        );
                    }}
                />

                <View className="flex-row justify-end mt-4">
                    <Pressable onPress={onClose} className="bg-gray-200 px-4 py-2 rounded-lg mr-2"
                        style={{ backgroundColor: "#f06767", padding: 14, borderRadius: 8, alignItems: "center" }}

                    >
                        <Text className="text-white">Cancel</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {
                            onSave(selected);
                            onClose();
                        }}
                        style={{ backgroundColor: "#6C63FF", padding: 14, borderRadius: 8, alignItems: "center" }}
                        className="bg-blue-600 px-4 py-2 rounded-lg"
                    >
                        <Text className="text-white">Add Selected</Text>
                    </Pressable>
                </View>
            </View>
        </Animated.View>
        </Modal >
    );
};
