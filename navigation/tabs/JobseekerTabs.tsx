import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//screens
import { BrowseScreen } from '../../screens/jobseekers/BrowseScreen'
import { MessageScreenJS } from 'screens/jobseekers/MessageScreenJS';
import ProfileStackScreen from './jobseeker/ProfileStackScreen';
import MessageStackScreenJS from './jobseeker/MessageStackScreenJS';

//icons
import BrowseIcon from '../../assets/icons/browse_icon.svg'
import JobProspectIcon from '../../assets/icons/job_prospect_icon.svg'
import MessageIcon from '../../assets/icons/message_icon.svg'
import ProfileIcon from '../../assets/icons/profile_icon.svg'
import JobProspectStackScreen from './jobseeker/JobProspectStackScreen';

const Tab = createBottomTabNavigator();

export default function JobseekerTabs() {
    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {

                if (route.name === 'Browse') {
                    return <BrowseIcon width={size} height={size} style={{ color: color }} />
                } else if (route.name === 'Job Prospect') {
                    return <JobProspectIcon width={size - 5} height={size - 5} style={{ color: color }} />
                } else if (route.name === 'Message') {
                    return <MessageIcon width={size - 5} height={size - 5} style={{ color: color }} />
                } else {
                    return <ProfileIcon width={size - 5} height={size - 5} style={{ color: color }} />
                }
            },
            tabBarActiveTintColor: '#6C63FF',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
            tabBarHideOnKeyboard:true

        })}>
            <Tab.Screen name="Browse" component={BrowseScreen} />
            <Tab.Screen name="Job Prospect" component={JobProspectStackScreen} />
            <Tab.Screen name="Message" component={MessageStackScreenJS} />
            <Tab.Screen name="Profile" component={ProfileStackScreen} />
        </Tab.Navigator>
    )
}