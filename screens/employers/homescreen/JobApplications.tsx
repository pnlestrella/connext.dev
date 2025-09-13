import { useNavigation, useRoute } from '@react-navigation/native';
import { getApplicants } from 'api/applications';
import { Header } from 'components/Header';
import ApplicantSwipe from 'components/Swiping/ApplicantSwipe';
import { useEmployers } from 'context/employers/EmployerHook';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Text, View, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const JobApplications = () => {
  const {refresh, setRefresh} = useEmployers()
  //for da route
  const route = useRoute();
  const { jobUID, jobTitle } = route.params;

  //storing applications
  const [applications, setApplications] = useState([]);
  console.log(applications?.length)
  //navigations
  const navigation = useNavigation()

  //in mount get the first batch

  //getting the applications that has status of pending
  const status = "pending"

  useEffect(() => {
    (async () => {
      const res = await getApplicants(jobUID, status); // fetch from applications API
      setApplications(res);
    })();
  }, [jobUID]);

  const handleBack = () => {
    navigation.goBack()
    setRefresh(!refresh)

  }


  return (
    <SafeAreaView className="h-full">
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 items-center">
        <Pressable onPress={handleBack} className="mr-3">
          <ArrowLeft size={24} color="black" />
        </Pressable>
        <Text
          style={{
            fontFamily: "Poppins-Bold",
            fontSize: 20,
            color: "#37424F",
          }}
        >
          Swiping Applicants
        </Text>
      </View>
      <Text className="text-xl font-bold p-4">Applicants for Job: {jobTitle}</Text>

      {applications?.length > 0 ? (
        <ApplicantSwipe applicants={applications} />
      ) : (
        <Text className="text-center mt-10">No applicants yet.</Text>
      )}
    </SafeAreaView>
  );
};
