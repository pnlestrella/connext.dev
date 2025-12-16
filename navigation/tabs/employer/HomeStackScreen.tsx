import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreenEmployer } from 'screens/employers/homescreen/HomeScreenEmployer';
import { JobApplications } from 'screens/employers/homescreen/JobApplications';
import { JobDetails } from 'screens/employers/homescreen/JobDetails';
import { PostJob } from 'screens/employers/homescreen/PostJob';
import { EditJobDetails } from 'screens/employers/homescreen/EditJobDetails';
import { ResumeViewer } from 'screens/employers/homescreen/ResumeViewer';

const HomeStack = createNativeStackNavigator();

export default function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <HomeStack.Screen name="mainHome" component={HomeScreenEmployer} />
      <HomeStack.Screen name="postJob" component={PostJob} />
      <HomeStack.Screen name="showDetails" component={JobDetails} />
      <HomeStack.Screen name="editDetails" component={EditJobDetails} />
      <HomeStack.Screen name="jobApplications" component={JobApplications} />
      <HomeStack.Screen name="resumeViewerHome" component={ResumeViewer} />
      
    </HomeStack.Navigator>
  );
}
