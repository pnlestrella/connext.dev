import Constants from 'expo-constants';

export async function createJobInteraction(
  jobUID: string,
  seekerUID: string,
  action: string,
  feedback: object,
  score: number,
  boostWeight: number
) {
  const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/jobinteraction/createJobInteraction`;

  const payload = {
    jobUID,
    seekerUID,
    action,
    feedback,
    score,
    boostWeight
  };

  try {
    console.log('📤 Creating Job Interaction:', payload);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resJSON = await res.json();
    console.log('📌 Job Interaction Response:', resJSON);

    return resJSON;
  } catch (err) {
    console.log('❌ Error Creating Job Interaction:', err);
    return { success: false, error: err };
  }
}


//update

export async function updateJobInteraction(
  jobUID: string,
  jobInteractionID:string,
  action: string,
  feedback: object | null,
  score: number | null,
  boostWeight: number | null
) {
  const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/jobinteraction/updateJobInteraction/${jobInteractionID}`;

  const payload = {
    jobUID,
    action,
    feedback,
    score,
    boostWeight
  };

  try {
    console.log('📤 Creating Job Interaction:', payload);

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const resJSON = await res.json();
    console.log('📌 Job Interaction Response:', resJSON);

    return resJSON;
  } catch (err) {
    console.log('❌ Error Updating Job Interaction:', err);
    return { success: false, error: err };
  }
}

export const getJobInteraction = async (seekerUID: string, action: string) => {
  console.log('actionnnnnn',action, seekerUID)
  const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/jobinteraction/getJobInteraction?seekerUID=${seekerUID}&action=${action}`;

  try {

    const res = await fetch(url)

    const resJSON = await res.json();
    console.log('📌 Get Job Interaction Request:', resJSON);

    return resJSON.payload;
  } catch (err) {
    console.log('❌ Error Getting Job interaction:', err);
    return { success: false, error: err };
  }
};
