import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { Text, View, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export const ShortlistedApplicants = () => {
  const route = useRoute();
  const { jobUID } = route.params;

  const navigation = useNavigation()


  return (
    <SafeAreaView className="h-full">
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 items-center">
        <Pressable onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color="black" />
        </Pressable>
        <Text
          style={{
            fontFamily: "Poppins-Bold",
            fontSize: 20,
            color: "#37424F",
          }}
        >
          Shortlisted Applicants
        </Text>
      </View>      
       <Text className="text-xl font-bold p-4">Applicants for Job: {jobUID}</Text>

    </SafeAreaView>
  );
};
