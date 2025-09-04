import Constants from 'expo-constants';

export async function getJobs(shortlistedJobs: [string]) {
  const params = new URLSearchParams([shortlistedJobs])

  const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/joblistings/getJobs`;
    console.log("CALLED aa", url)

    return "hey sir"


//   try {
//     const res = await fetch(`${url}?${params}`)

//     const resJSON = await res.json()

//     console.log(resJSON, '------------- AAAAAAAAAAAAAAAAAAAAAAA');
//   } catch (err) {
//     console.log(err);
//   }
}
