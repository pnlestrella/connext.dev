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
  //employers global wrapper
  const { skippedApplicants, shortlistedApplicants, setSyncTrigger } = useEmployers()

  const route = useRoute();
  const { jobUID } = route.params;
  const [applications, setApplications] = useState([]);
  const navigation = useNavigation()


  console.log(applications?.length)
  useEffect(() => {
    if (applications?.length === 5) {
      (async () => {
        const res = await getApplicants(jobUID, skippedApplicants, shortlistedApplicants); // fetch from applications API
        setApplications(res);
        console.log("Replenishing job applicants array")
      })();
    }

    if ((applications?.length % 15) === 5) {
      setSyncTrigger(prev => prev + 1)
    }
  }, [applications?.length])


  useEffect(() => {
    (async () => {
      const res = await getApplicants(jobUID, skippedApplicants, shortlistedApplicants); // fetch from applications API
      setApplications(res);
    })();
  }, [jobUID]);

  return (
    <SafeAreaView className="h-full">
      <View className="flex-row items-center px-5 py-4 border-b border-gray-200 items-center">
        <Pressable onPress={() => navigation.goBack() } className="mr-3">
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
      <Text className="text-xl font-bold p-4">Applicants for Job: {jobUID}</Text>

      {applications?.length > 0 ? (
        <ApplicantSwipe applicants={applications} />
      ) : (
        <Text className="text-center mt-10">No applicants yet.</Text>
      )}
    </SafeAreaView>
  );
};
