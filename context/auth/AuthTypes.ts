import { User } from 'firebase/auth';

interface BaseUserMDB {
  _id: string;
  role: 'jobseeker' | 'employer';
  accountIncomplete: boolean;
  createdAt: string;
  updatedAt: string;
  email: string;
  status: boolean;
  __v: number;
}

// 🎯 Jobseeker-specific fields
interface JobseekerMDB extends BaseUserMDB {
  role: 'jobseeker';
  seekerUID: string;
  fullName: string;
  industries?: string[];
  location?: Location;
  skills?: string[];
  profileSummary?: string;
  shortlistedJobs?: string[];
  skippedJobs?: string[];
  experience?: string[];
  certifications?: string[];
}

// 🎯 Employer-specific fields
interface EmployerMDB extends BaseUserMDB {
  role: 'employer';
  employerUID: string;
  companyName: string;
  industries: string[];
  location?: Location;
  profilePic?: string;
}

// Union type — can be either
export type UserMDB = JobseekerMDB | EmployerMDB;

export type AuthTypes = {
  user: User | null;
  userMDB: UserMDB | null; // can be jobseeker or employer
  userType: 'jobseeker' | 'employer' | '';
  loading: boolean;
  firstLaunch: boolean;
  initializing: boolean;
  shortlistedJobs: object;
  resetSignal: boolean;

  setUserType: (value: string) => void;
  setUserMDB: (value: UserMDB) => void; // ⚡ fix: was string
  setLoading: (value: boolean) => void;
  setFirstLaunch: () => void;
  signOutUser: () => void;
  setShortlistedJobs: (value: object[]) => void;
  setResetSignal: (value: boolean) => void;
};
