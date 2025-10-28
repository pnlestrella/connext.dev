import Constants from 'expo-constants';

export const getApplicantCounts = async (employerUID: string, status: string) => {
  try {
    const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/applications/getApplicantCounts?employerUID=${employerUID}&status=${status}`;
    console.log(url, 'Get applicants');
    const res = await fetch(url);
    const resJSON = await res.json();

    return resJSON.payload;
  } catch (err) {
    console.log(err);
  }
};

// getting applicants and displaying it
export const getApplicants = async (jobUID: string, status: string) => {
  try {
    const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/applications/getApplicants?jobUID=${jobUID}&status=${status}`;
    const res = await fetch(url);
    const resJSON = await res.json();

    console.log(url, 'MMMMMMMMMMM');

    console.log(resJSON, 'getting applicants');

    return resJSON.payload;
  } catch (err) {
    console.log(err, 'Cannot get Applicants');
  }
};

//shortlisted applicants
export const getShortlistedApplicants = async (
  jobUID: string,
  status: string,
  page: number = 1,
  limit: number = 20
) => {
  try {
    const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/applications/getShortlistedApplicants?jobUID=${jobUID}&status=${status}&page=${page}&limit=${limit}`;

    const res = await fetch(url);
    const resJSON = await res.json();

    console.log(resJSON, `📄 fetching shortlisted applicants page ${page}`);

    return resJSON;
    // includes { success, page, limit, hasMore, payload }
  } catch (err) {
    console.log(err, '❌ Cannot get Shortlisted Applicants');
    return { success: false, message: err };
  }
};

//patch request

//update THE application status
export const updateApplications = async (applicationID: string, status: string) => {
  try {
    const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/applications/updateApplications`;

    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ applicationID, status }),
    });

    const resJSON = await res.json();
    console.log(resJSON, 'miao');

    return resJSON;
    // includes { success, page, limit, hasMore, payload }
  } catch (err) {
    console.log(err, `❌ Unable to update the APPLICATION: ${applicationID}`);
    return { success: false, message: err };
  }
};

//post request
export const createApplication = async (application: any) => {
  try {
    const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/applications/createApplication`;

    console.log(url)
    console.log(application)

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify( application ),
    });

    const resJSON = await res.json();
    return resJSON;
  } catch (err) {
    console.log(err, `❌ Unable to send application`);
    return { success: false, message: err };
  }
};
