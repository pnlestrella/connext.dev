import Constants from 'expo-constants';

export async function createMeeting(meetingData: any) {
  const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/oauth/google/createMeeting`;

  const payload = {
    summary : meetingData.title,
    description:meetingData.description,
    start : {
      dateTime: meetingData.startTime,
      timeZone: "Asia/Manila"
    },
    end : {
      dateTime: meetingData.endTime,
      timeZone: "Asia/Manila"
    }
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json()

    console.log(data,'ressyyyyy')
    return(data)
  } catch (err) {
    console.log('Error creating meeting:', err);
    return { success: false, error: err };
  }
}

//updating the meeting

export async function updateMeeting(meetingData: any) {
  const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/oauth/google/updateSchedule`;

  console.log("MEEEETING DATA", meetingData)

  const payload = {
    eventUID: meetingData.eventUID,        
    meetingUID: meetingData.meetingUID,   
    summary: meetingData.title,
    description: meetingData.description,
    start: {
      dateTime: meetingData.startTime,
      timeZone: 'Asia/Manila',
    },
    end: {
      dateTime: meetingData.endTime,
      timeZone: 'Asia/Manila',
    },
    status:meetingData.status
  };

  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('🟢 Update Meeting Response:', data);
    return data;
  } catch (err) {
    console.error('❌ Error updating meeting:', err);
    return { success: false, error: err };
  }
}
