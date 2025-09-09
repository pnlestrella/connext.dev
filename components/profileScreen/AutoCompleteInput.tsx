import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, FlatList } from "react-native";

const AutocompleteInput = ({
  label,
  value,
  setValue,
  data,
  keyExtractor = (item: any) => item.id.toString(),
  displayKey, // required now
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  data: any[];
  keyExtractor?: (item: any) => string;
  displayKey: string;
}) => {
  const [query, setQuery] = useState(value);
  const [showList, setShowList] = useState(false);

  const filtered = data.filter((item) => {
    const field = item[displayKey];
    return (
      typeof field === "string" &&
      field.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <View className="mb-5">
      <Text className="mb-2 text-gray-700">{label}</Text>
      <TextInput
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setShowList(true);
        }}
        onFocus={() => setShowList(true)}
        className="border border-gray-300 rounded-xl px-4 py-3"
      />
      {showList && filtered.length > 0 && (
        <View className="border border-gray-200 rounded-lg bg-white mt-1 max-h-40">
          <FlatList
            data={filtered}
            keyExtractor={keyExtractor}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                className="px-4 py-3 border-b border-gray-100"
                onPress={() => {
                  setValue(item[displayKey]);
                  setQuery(item[displayKey]);
                  setShowList(false);
                }}
              >
                <Text>{item[displayKey]}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default AutocompleteInput;
