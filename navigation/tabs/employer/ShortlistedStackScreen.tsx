import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApplicantDetail } from 'screens/employers/shortlistedscreen/ApplicantDetail';
import { ResumeViewer } from 'screens/employers/shortlistedscreen/ResumeViewer';
import { ShortlistedApplicants } from 'screens/employers/shortlistedscreen/ShortlistedApplicants';
import { ShortlistedOverview } from 'screens/employers/shortlistedscreen/ShortlistedOverview';

const ShortlistedStack = createNativeStackNavigator();
export default function ShortlistedStackScreen() {
  return (
    <ShortlistedStack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <ShortlistedStack.Screen name="overview" component={ShortlistedOverview} />
      <ShortlistedStack.Screen name="shortlistedApplicants" component={ShortlistedApplicants} />
      <ShortlistedStack.Screen name="applicantDetail" component={ApplicantDetail} />
      <ShortlistedStack.Screen name="resumeViewer" component={ResumeViewer} />
    </ShortlistedStack.Navigator>
  );
}
