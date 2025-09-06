import Constants from 'expo-constants';

export async function recoSys(profileQuery: object) {
  console.log('testa = ', profileQuery)
  const url = `${Constants.expoConfig?.extra?.RECO_BASE_URL}/api/getReco`;

  try {
    // const profileQuery.skippedJobs =  

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({profileQuery}),
    });

    const resJSON = await res.json()


    return resJSON
  } catch (err) {
    console.log(err)
    throw err
  }
}
