import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

//screens
import { HomeScreenEmployer } from 'screens/employers/HomeScreenEmployer';
import { ApplicantsScreen } from 'screens/employers/ApplicantsScreen';
import { MessageScreenEmployer } from 'screens/employers/MessageScreenEmployer';
import { ProfileScreenEmployer } from 'screens/employers/ProfileScreenEmployer';

//icons
import HomeIcon from '../../assets/icons/home_icon.svg'
import JobProspectIcon from '../../assets/icons/job_prospect_icon.svg'
import MessageIcon from '../../assets/icons/message_icon.svg'
import ProfileIcon from '../../assets/icons/profile_icon.svg'



const Tab = createBottomTabNavigator();

export default function EmployerTabs(){
    return(
        <Tab.Navigator screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {

                if(route.name === 'Home'){
                     return<HomeIcon width={size-5} height={size-5} style={{color:color}}/>
                }else if(route.name === 'Applicants'){
                    return <JobProspectIcon width={size-5} height={size-5} style={{color:color}}/>
                }else if(route.name === 'Message'){
                    return <MessageIcon width={size-5} height={size-5} style={{color:color}}/>
                }else{
                    return <ProfileIcon width={size-5} height={size-5} style={{color:color}}/>                    
                }
            },
            tabBarActiveTintColor: '#6C63FF',
            tabBarInactiveTintColor: 'gray'
            
        })}>
            <Tab.Screen name="Home"  component={HomeScreenEmployer}/>
            <Tab.Screen name="Applicants"  component={ApplicantsScreen}/>
            <Tab.Screen name="Message"  component={MessageScreenEmployer}/>
            <Tab.Screen name="Profile"  component={ProfileScreenEmployer}/>
        </Tab.Navigator>
    )
}