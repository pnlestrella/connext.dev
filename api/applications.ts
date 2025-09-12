import Constants from 'expo-constants';

export const getApplicantCounts = async (employerUID: string) => {
  try {
    const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/applications/getApplicantCounts?employerUID=${employerUID}`;
    const res = await fetch(url);
    const resJSON = await res.json();

    return resJSON.payload;
  } catch (err) {
    console.log(err);
  }
};

export const getApplicants = async (
  jobUID: string,
  skippedApplicants: string[] = [],
  shortlistedApplicants: string[] = [],
  currentApplicants: string[] = []
) => {
  try {

    const url = `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/applications/getApplicants?jobUID=${jobUID}&skippedApplicants=${skippedApplicants.join(',')}&shortlistedApplicants=${shortlistedApplicants.join(',')}&currentApplicants=${currentApplicants.join(',')}`;
    const res = await fetch(url);
    const resJSON = await res.json();

    console.log(resJSON, 'getting applicants');

    return resJSON.payload;
  } catch (err) {
    console.log(err, 'Cannot get Applicants');
  }
};
