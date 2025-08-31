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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>


type Industry = {
  name: String,
  id: Number
}

export const IndustryScreen = () => {
  const {user,userType,setUserMDB} = useAuth()
  const [selected, setSelected] = useState<Industry[]>([])
  const [search, setSearch] = useState("")

  const navigation = useNavigation()

  //jobseeker+s
  const userPath = userType + 's'
  console.log(userPath)
  console.log(user?.uid)

  function handleSelect(industry: object) {
    setSelected((prev) => {
      const exist = prev.some(item => item.name === industry.name)
      if (exist) {
        return prev.filter(item => item.name !== industry.name)
      } else if (prev.length >= 3) {
        alert("You can only pick 3 industries")
        return prev;
      } else {
        return [...prev, industry]
      }
    })
  }


  async function handleSubmit() {
    if (selected.length < 1) {
      alert("Please pick atleast 1 Industry")
      return;
    }
    //PAYLOAD Data
   const data: String[] = []
    selected.map(item => (
      data.push(item.name)
    ))

    const payload = {
      editType: "industries",
      data: data
    }

    const res = await updateProfile(userPath,user?.uid,payload);
    console.log(res)

    setUserMDB(res)
    alert("Successfully edited industries")
  }

  const filtered = Industries.filter(ind => {
    return ind.name.toLowerCase().includes(search.toLowerCase())
  }
  )

  return (
    <SafeAreaView className='flex-1 p-5 m-5 '>

      <View >
        <Text className='text-2xl mb-4 text-brand-purpleMain'>Which Industry are you in?</Text>
        <Text className='text-base'>Knowing what industry you’re in will help us in choosing the right offers to you!</Text>
        <View className='w-[100%] border-b-2 border-gray-300   my-3'></View>

      </View>

      <View className='my-2'>
        <TextInput value={search} onChangeText={setSearch} placeholder='Search industry here' className='border border-gray-300 bg-gray-200 rounded-lg p-3 mb-3' />
        <View className="flex flex-row flex-wrap">
          {selected.map((item) => (
            <Pressable
              key={item.id.toString()}
              className="bg-brand-purpleMain px-0.5 py-0.5 m-1 rounded-full justify-center"
              onPress={() => handleSelect(item)}
            >
              <View className="flex flex-row bg-brand-purpleMain px-0.5 py-0.5 m-1 rounded-full items-center">
                <Text className="text-white mr-2">{item.name}</Text>
                <Text className="text-white font-bold">×</Text>
              </View>

            </Pressable>
          ))}
        </View>

        <Text>Please select atleast 1 Industries, Max of 3: </Text>

      </View >



      <FlatList
        data={filtered}
        keyExtractor={(ind) => ind.id.toString()}
        renderItem={({ item }) => (
          <Pressable className={`border border-gray-500 m-1 p-3 rounded-xl
            ${selected.includes(item) ? 'bg-brand-purpleMain' : null} 
            `}
            onPress={() => handleSelect(item)}
          >
            <Text>
              {item.name}
            </Text>
          </Pressable>
        )}
      />

      <Button onPress={handleSubmit} title={"Submit"} />


    </SafeAreaView>
  );
};

