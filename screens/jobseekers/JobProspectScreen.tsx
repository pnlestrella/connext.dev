import { Header } from 'components/Header';
import { BriefcaseBusiness, PhilippinePeso, MapPin } from 'lucide-react-native';
import { Text, View, TouchableOpacity, Image, FlatList, Pressable, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

//for time & date
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime"
import { useJobs } from 'context/job/JobHook';


dayjs.extend(relativeTime);

export function formatTimeAgo(dateString:any) {
  return dayjs(dateString).fromNow();
}


//profile pics
const Indeed =
  "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/indeed_logo.png?updatedAt=1756757217985";
const ZipRecruiter =
  "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/ZipRecruiter-logo-full-color-black.webp?updatedAt=1756757383134";

export const JobProspectScreen = () => {
  const { shortlistedJobs } = useJobs();



  return (
    <SafeAreaView className='bg-white mb-5 h-full'>
      <Header />

      <View className="flex-row justify-between px-6">
        <Text
          style={{
            fontFamily: "Poppins-Bold",
            fontSize: 24,
            color: "#37424F",
          }}
        >
          Job Prospects
        </Text>
      </View>

      <FlatList
        data={[...shortlistedJobs].reverse()}
        keyExtractor={(_, i) => i.toString()} // or job.id if available
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 40 }}
        renderItem={({ item: job }) => (
          <Pressable
            className="rounded-2xl p-4 mb-4 w-full"
            style={{ backgroundColor: "#6C63FF" }}
            onPress={() => alert("Card popping Feature is on progress")}
          >
            {/* Logo + Company */}
            <View className="flex-row items-center space-x-3 mb-3">
              <View
                className="rounded-full border-2 border-white overflow-hidden mr-2"
                style={{ width: 60, height: 60, justifyContent: "center", alignItems: "center" }}
              >
                <Image
                  source={{
                    uri:
                      job.profilePic === "indeed"
                        ? Indeed
                        : job.profilePic === "ziprecruiter"
                          ? ZipRecruiter
                          : job.profilePic,
                  }}
                  style={{ width: "100%", height: "100%", resizeMode: "cover" }}
                />
              </View>

              <View >
                {!job.isExternal ? (
                  <>
                    <View className='flex-row items-end justify-between '>
                      <Text className="text-white text-xs font-bold mr-10">Posted By:</Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        className="px-4 py-2 rounded-full justify-center items-center"
                        style={{ backgroundColor: "white" }}
                      >
                        <Text className="text-blue-500 font-bold text-sm">
                          {Math.round((job.score + job.boostWeight) * 100)}% match for you!
                        </Text>
                      </TouchableOpacity>

                    </View>
                    <Text className="text-white text-2xl font-bold">{job.companyName}</Text>
                  </>
                ) : (
                  <>
                  {/* External job postings */}
                    <View className='flex-row items-end justify-between '>
                      <Text className="text-white text-xs font-bold mr-4">External Job From:</Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        className="px-4 py-2 rounded-full justify-center items-center"
                        style={{ backgroundColor: "white" }}
                        onPress={()=> console.log(job)}
                      >
                        <Text className="text-blue-500 font-bold text-sm">
                          {Math.round((job.score + job.boostWeight) * 100)}% match for you!
                        </Text>
                      </TouchableOpacity>

                    </View>

                    <Text className="text-white text-2xl font-bold">{job.profilePic}</Text>
                  </>
                )}
              </View>
            </View>

            {/* Job Info */}
            <View className="py-2">
              <View className="flex-row items-center mb-1">
                <BriefcaseBusiness size={20} color="white" />
                <Text className="text-white text-xl ml-2" style={{ fontFamily: 'Lexend-SemiBold' }}>{job.jobTitle}</Text>
              </View>
              <View className="flex-row items-center mb-1">
                <PhilippinePeso size={20} color="white" />
                <Text className="text-white text-lg font-bold ml-2">
                  {job.salaryRange.currency} {job.salaryRange.min} - {job.salaryRange.max}/
                  {job.salaryRange.frequency}
                </Text>
              </View>
              <View className="flex-row items-center mb-1">
                <MapPin size={20} color="white" />
                <Text className="text-white text-lg ml-2">
                  {job.location.city}, {job.location.state}, {job.location.postalCode}
                </Text>
              </View>

              {/* Buttons */}
              <View className="flex-row items-center justify-between mt-3">
                <Text className='text-white text-xs' style={{fontSize:12, fontFamily:'Lexend-Bold'}} >Posted {formatTimeAgo(job.createdAt)}</Text>
                <Pressable 
                  onPress={() => alert("Apply feature is in progress")}
                className='bg-red-50 px-16 py-2 rounded-xl' style={{backgroundColor:'#154588'}}><Text className='text-white' style={{fontFamily:'Lexend-Bold', fontSize:12}}>Apply</Text></Pressable>
              </View>
            </View>
          </Pressable>
        )}
      />


    </SafeAreaView>
  );
};
