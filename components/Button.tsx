import { Text, Pressable } from "react-native";

type BtnProps = {
    onPress: () => void;
    title: String
}

export const Button = ({ onPress, title = "Proceed" }: BtnProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="bg-[#6C63FF] mt-2 px-2 py-4 rounded-lg items-center justify-center"
    >
      <Text className="text-white font-bold text-center">{title}</Text>
    </Pressable>
  );
};
