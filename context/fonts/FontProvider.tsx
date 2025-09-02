import { useFonts } from "expo-font";
import { ReactNode } from "react";


export default function FontProvider({children}: {children:ReactNode} ){
    const [fontsLoaded] = useFonts({
    "Lexend-Regular": require("../../assets/fonts/Lexend-Regular.ttf"),
    "Lexend-Medium": require("../../assets/fonts/Lexend-Medium.ttf"),
    "Lexend-SemiBold": require("../../assets/fonts/Lexend-SemiBold.ttf"),
    "Lexend-Bold": require("../../assets/fonts/Lexend-Bold.ttf"),
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
  });
  
  if(!fontsLoaded) return null; //should be changed later

  return children
}