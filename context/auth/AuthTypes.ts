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
  skills?: string[];
  profileSummary?: string;
  status: boolean;
  __v: number;
}

export type AuthTypes ={
    user: User| null;
    userMDB: UserMDB| null;
    userType: string;
    loading: boolean
    firstLaunch: boolean,
    setUserType: (value: string) => void
    setUserMDB: (value: string) => void
    setLoading: (value: boolean) => void
    setFirstLaunch: () => void
    signOutUser:() => void
}