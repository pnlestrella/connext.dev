import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JobProspectDetails } from 'screens/jobseekers/jobprospectscreen/JobProspectDetails';
import { JobProspectScreen } from 'screens/jobseekers/jobprospectscreen/JobProspectScreen';
import { ResumeViewer } from 'screens/jobseekers/profilescreen/ResumeViewer';
const JobProspectStack = createNativeStackNavigator();

export default function JobProspectStackScreen() {
  return (
    <JobProspectStack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <JobProspectStack.Screen name="jobProspect" component={JobProspectScreen} />
      <JobProspectStack.Screen name="jobProspectDetails" component={JobProspectDetails} />
      <JobProspectStack.Screen name="resumeViewerProspect" component={ResumeViewer} />

    </JobProspectStack.Navigator>
  );
}
