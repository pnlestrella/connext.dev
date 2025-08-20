import Constants from 'expo-constants';



export async function registerUser(
  userPath: string,
  user: object
) {
  try {
    let registerPath= '';
    if(userPath === 'jobseekers'){
        registerPath = 'registerJobSeeker'
    }else{
        registerPath = 'registerEmployer'
    }

    const response = await fetch(
        `${Constants?.expoConfig?.extra?.BACKEND_BASE_URL}/api/${userPath}/${registerPath}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        }
      );

      console.log(await response.json());
      console.log('Account created successfully');
  } catch (error) {
    console.error("updateLocation error:", error);
    throw error;
  }
}