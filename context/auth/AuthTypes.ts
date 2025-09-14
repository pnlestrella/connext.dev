// Jobseeker-specific
type JobseekerUser = {
  user: any; // Firebase user
  userMDB: any;
  userType: "jobseeker";
};

// Employer-specific
type EmployerUser = {
  user: any;
  userMDB: any;
  userType: "employer";
  // no shortlistedJobs here
};

// Common across both
type CommonAuth = {
  loading: boolean | null;
  firstLaunch: boolean | null;
  initializing: boolean;
  resetSignal: boolean;
  accountType: string;
  setUserType: (t: AuthTypes["userType"] | null) => void;
  setUserMDB: (mdb: any) => void;
  setLoading: (l: boolean | null) => void;
  setFirstLaunch: (f: boolean | null) => void;
  signOutUser: () => Promise<void>;
  setResetSignal: (val: boolean) => void;
  setAccountType: (val: string) => void;

};

export type AuthTypes = (JobseekerUser | EmployerUser) & CommonAuth;
