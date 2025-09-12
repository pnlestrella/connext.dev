import Constants from 'expo-constants';

export async function getJobs(employerUID: string[]) {
  const params = new URLSearchParams();

  // Append each employerUID
  employerUID.forEach((uid) => {
    params.append('employerUID', uid);
  });

  const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/joblistings/getJobs?${params.toString()}`;

  try {
    const res = await fetch(url);
    const resJSON = await res.json();

    return resJSON;
  } catch (err) {
    console.log('❌ Error fetching jobs:', err);
    return null;
  }
}

export async function postJob(jobData: any) {
  const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/joblistings/postJobs`;

  try {
    console.log('📤 Posting job:', jobData);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    const resJSON = await res.json();
    console.log('📌 Post Job Response:', resJSON);

    return resJSON;
  } catch (err) {
    console.log('❌ Error posting job:', err);
    return { success: false, error: err };
  }
}

export async function updateJobs(jobUID: string, updates: any) {
  const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/joblistings/updateJobs/${jobUID}`;

  console.log(url,'URLLLLLLLLL')
  try {
    console.log('✏️ Updating job:', jobUID, updates);

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const resJSON = await res.json();
    console.log('📌 Update Job Response:', resJSON);

    return resJSON;
  } catch (err) {
    console.log('❌ Error updating job:', err);
    return { success: false, error: err };
  }
}
