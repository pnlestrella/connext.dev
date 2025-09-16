import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConversationsScreen } from 'screens/jobseekers/message/ConversationsScreen';
import { ChatScreen } from 'screens/jobseekers/message/ChatScreen';


const MessageStack = createNativeStackNavigator();
export default function MessageStackScreenJS() {
  return (
    <MessageStack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <MessageStack.Screen name="conversation" component={ConversationsScreen} />
      <MessageStack.Screen name="chats" component={ChatScreen} />
    </MessageStack.Navigator>
  );
}
