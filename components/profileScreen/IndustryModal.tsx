import React, { useState, useEffect, useRef } from "react";
import { Modal, View, Text, FlatList, Pressable, TextInput, Animated } from "react-native";
import { Industries } from '../../data/industries.json';

type Industry = {
  id: number;
  name: string;
};

type IndustryModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (selectedIndustries: Industry[]) => void;
  initialSelected?: Industry[];
  maxSelection?: number;
};

export const IndustryModal = ({
  visible,
  onClose,
  onSave,
  initialSelected = [],
  maxSelection = 3,
}: IndustryModalProps) => {
  const [selected, setSelected] = useState<Industry[]>(initialSelected);
  const [search, setSearch] = useState("");
  const fadeAnim = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSelect = (industry: Industry) => {
    const exists = selected.some((i) => i.id === industry.id);

    if (exists) {
      // if (selected.length === 1) {
      //   alert("You must keep at least 1 industry selected");
      //   return;
      // }
      setSelected((prev) => prev.filter((i) => i.id !== industry.id));
    } else if (selected.length >= maxSelection) {
      alert(`You can select up to ${maxSelection} industries`);
    } else {
      setSelected((prev) => [...prev, industry]);
    }
  };


  const filtered = Industries.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#6C63FF" }}>Select Industries</Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search industries..."
            className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = selected.some((i) => i.id === item.id);
              return (
                <Pressable
                  className={`border m-1 p-3 rounded-xl ${isSelected ? "bg-brand-purpleMain" : "bg-white"
                    }`}
                  onPress={() => handleSelect(item)}
                >
                  <Text className={isSelected ? "text-white" : "text-black"}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
          />

          <View className="flex-row justify-end mt-4">
            <Pressable
              onPress={onClose}
              className="bg-gray-200 px-4 py-2 rounded-lg mr-2"
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
    </Modal>
  );
};
