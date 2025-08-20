// /context/api/profile.ts
import { useAuth } from 'context/auth/AuthHook';
import Constants from 'expo-constants';
type UpdateProfilePayload = {
  editType: string;
  data: any;
};

export async function updateProfile(
  userPath: string,
  uid: string,
  payload: UpdateProfilePayload
) {
    
  try {
    const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/${userPath}/updateProfile/${uid}`;
    
    console.log("PATCH Request URL:", url);
    console.log("Payload:", payload);

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const resJSON = await res.json();

    return resJSON.data;
  } catch (error) {
    console.error("updateProfile error:", error);
    throw error;
  }
}

