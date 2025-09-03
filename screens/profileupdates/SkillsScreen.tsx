import { useState } from 'react';
import { Text, View, TextInput, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Industries } from '../../data/industries.json'
import { Button } from 'components/Button';
import Constants from 'expo-constants'
import { useAuth } from 'context/auth/AuthHook';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "navigation/types/RootStackParamList";
//api
import { updateProfile } from 'api/profile';
//data
import Skills from '../../data/skills.json'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>


type SkillsType = {
  Skills: string
}

export const SkillsScreen = () => {
  const { user, userType, setUserMDB } = useAuth()
  const [selected, setSelected] = useState<String[]>([])
  const [search, setSearch] = useState("")

  const navigation = useNavigation()

  //jobseeker+s
  const userPath = userType + 's'
  console.log(userPath)
  console.log(user?.uid)

  function handleSelect(skill: String) {
    console.log(skill)

    if (selected.includes(skill)) {

      console.log("Already Selected")
      setSelected(selected.filter(item => item !== skill))
    } else if(selected.length > 10){
      alert("You've selected 10 already")
      return;
    } else {
      setSelected(prev => [...prev, skill])

    }
  }

  console.log(selected)

  async function handleSubmit() {
    if (selected.length < 1) {
      alert("Please pick atleast 3 Skills")
      return;
    }
    //PAYLOAD Data

    const payload = {
      editType: "skills",
      data: selected
    }

    console.log(payload)

    const res = await updateProfile(userPath, user?.uid, payload);
    console.log(res)

    setUserMDB(res)
    alert("Successfully edited Skills")
  }

  const filtered = Skills.filter(prev => {
    return prev.Skills.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <SafeAreaView className='flex-1 p-5 m-5 '>

      <View >
        <Text className='text-2xl mb-4 text-brand-purpleMain'>What skills do you have?</Text>
        <Text className='text-base'>Adding your skills will help us match you with the best opportunities and employers!</Text>
        <View className='w-[100%] border-b-2 border-gray-300   my-3'></View>

      </View>

      <View className='my-2'>
        <TextInput value={search} onChangeText={setSearch} placeholder='Search skills ...' className='border border-gray-300 bg-gray-200 rounded-lg p-3 mb-3' />

        <Text>Please select atleast 1 Skill, Max of 10: </Text>

      </View >

      <FlatList
        data={filtered}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Pressable className={`border border-gray-500 m-1 p-3 rounded-xl
            ${selected.includes(item.Skills) ? 'bg-brand-purpleMain' : null}
            `}
            onPress={() => handleSelect(item.Skills)}
          >
            <Text>
              {item.Skills}
            </Text>
          </Pressable>
        )}
      />

      <Button onPress={handleSubmit} title={"Submit"} />


    </SafeAreaView>
  );
};

