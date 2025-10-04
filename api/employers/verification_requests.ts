import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.BACKEND_BASE_URL; 
// 👆 or use Constants.manifest.extra.API_URL depending on your Expo SDK version

export const getVerification = async (employerUID:string) => {
  try {
    const response = await fetch(`${API_URL}/api/admins/getVerification/${employerUID}`);
    const data = await response.json();

    return data.data;
  } catch (error) {
    console.error("❌ Error fetching verification:", error);
    throw error;
  }
};
