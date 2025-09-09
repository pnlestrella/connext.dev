import Constants from 'expo-constants';

export async function getJobs(jobUID: string[]) {
  const params = new URLSearchParams();

  console.log("Get Jobs Executed with: ",jobUID )

  // Append each jobUID
  jobUID.forEach((uid) => {
    params.append('jobUID', uid);
  });

  const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/joblistings/getJobs?${params.toString()}`;

  try {
    const res = await fetch(url);
    const resJSON = await res.json();

    console.log(resJSON, '------------- AAAAAAAAAAAAAAAAAAAAAAA');
    return resJSON;
  } catch (err) {
    console.log('❌ Error fetching jobs:', err);
    return null;
  }
}

export async function postJob(jobData: any) {
  const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/joblistings/postJobs`;

  try {
    console.log("📤 Posting job:", jobData);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    const resJSON = await res.json();
    console.log("📌 Post Job Response:", resJSON);

    return resJSON;
  } catch (err) {
    console.log("❌ Error posting job:", err);
    return { success: false, error: err };
  }
}
