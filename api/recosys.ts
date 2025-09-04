import Constants from 'expo-constants';

export async function recoSys(profileQuery: object, setJobPostings : (value: [object])=> void) {
  const url = `${Constants.expoConfig?.extra?.RECO_BASE_URL}/api/getReco`;

  try {
    // const profileQuery.skippedJobs =  


    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({profileQuery}),
    });

    const resJSON = await res.json()

    console.log(resJSON, '------------- AAAAAAAAAAAAAAAAAAAAAAA');
    setJobPostings(resJSON)
  } catch (err) {
    throw err
  }
}
