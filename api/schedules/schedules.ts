import Constants from 'expo-constants';

export const getSchedulesByConversation = async (conversationUID: string) => {
  try {
    const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/schedules/getSchedulesByConversation/${conversationUID}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }
    const resJSON = await res.json();
    return resJSON.message;  
  } catch (err) {
    console.log('Error fetching schedules:', err);
    return null;
  }
};


export const createSchedule = async (schedulePayload: any) => {
  try {
    const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/schedules/createSchedule`;
    console.log(schedulePayload)
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify( schedulePayload ),
    });

    const resJSON = await res.json();
    return resJSON;
  } catch (err) {
    console.log(err, `❌ Unable to send application`);
    return { success: false, message: err };
  }
};
