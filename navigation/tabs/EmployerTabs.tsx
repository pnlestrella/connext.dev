import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserCheck } from 'lucide-react-native';


//screens
import HomeStackScreen from './employer/HomeStackScreen';
import ShortlistedStackScreen from './employer/ShortlistedStackScreen';
import ProfileStackScreen from './employer/ProfileStackScreen';
import MessageStackScreen from './employer/MessageStackScreen';


//icons
import HomeIcon from '../../assets/icons/home_icon.svg'
import JobProspectIcon from '../../assets/icons/job_prospect_icon.svg'
import MessageIcon from '../../assets/icons/message_icon.svg'
import ProfileIcon from '../../assets/icons/profile_icon.svg'


const Tab = createBottomTabNavigator();

export default function EmployerTabs() {
    return (
        <Tab.Navigator screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {

                if (route.name === 'Home') {
                    return <HomeIcon width={size - 5} height={size - 5} style={{ color: color }} />
                } else if (route.name === 'Applicants') {
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
            tabBarHideOnKeyboard:true,
            tabBarLabelStyle: {
                fontFamily: 'Lexend-Regular'
            }

        })}>
            <Tab.Screen name="Home" component={HomeStackScreen} />
            <Tab.Screen name="Shortlisted" component={ShortlistedStackScreen} />
            <Tab.Screen name="Message" component={MessageStackScreen} />
            <Tab.Screen name="Profile" component={ProfileStackScreen} />
        </Tab.Navigator>
    )
}
