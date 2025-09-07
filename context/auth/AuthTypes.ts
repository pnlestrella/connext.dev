import {User} from 'firebase/auth'

interface UserMDB {
  _id: string;
  seekerUID?: string;
  role: 'jobseeker' | 'employer';
  accountIncomplete: boolean;
  createdAt: string;
  updatedAt: string;
  email: string;
  fullName: string;
  industries?: string[];
  location?: Location;
  skills?: string[] | undefined;
  profileSummary?: string;
  shortlistedJobs?: string[];
  skippedJobs?: string[];
  experience?: string[] | undefined;
  certifications?: string[] | undefined;
  status: boolean;
  __v: number;
}

export type AuthTypes ={
    user: User| null;
    userMDB: UserMDB| null;
    userType: string;
    loading: boolean
    firstLaunch: boolean,
    initializing: boolean,
    shortlistedJobs: object;
    resetSignal:boolean;
    setUserType: (value: string) => void
    setUserMDB: (value: string) => void
    setLoading: (value: boolean) => void
    setFirstLaunch: () => void
    signOutUser:() => void;
    setShortlistedJobs: (value: [object]) => void
    setResetSignal: (value: boolean) => void


}