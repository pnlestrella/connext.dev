import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatScreen } from 'screens/employers/message/ChatScreen';
import { ConversationsScreen } from 'screens/employers/message/ConversationsScreen';

const MessageStack = createNativeStackNavigator();
export default function MessageStackScreen() {
  return (
    <MessageStack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
      <MessageStack.Screen name="conversation" component={ConversationsScreen} />
      <MessageStack.Screen name="chats" component={ChatScreen} />
    </MessageStack.Navigator>
  );
}
