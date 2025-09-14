// JobTypes.ts
export type Job = {
  _id: any,
  jobUID: string;
  employerUID: string;
  jobTitle: string;
  companyName?: string;
  profilePic?: string;
  score: number;
  boostWeight: number;
  isExternal: boolean;
  createdAt?: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
    frequency: string;
  };
  location?: {
    city: string;
    state: string;
    postalCode: string;
  };
};

export type UserProfile = {
  seekerUID: string;
  skills: string[];
  profileSummary: string;
  industries: string[];
  skippedJobs: string[];
  experience: any;
  currentJobPostings: string[];
  certifications: string[];
};

export type JobContextType = {
  skippedJobs: string[];
  setSkippedJobs: React.Dispatch<React.SetStateAction<string[]>>;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  jobPostings: Job[];
  setJobPostings: React.Dispatch<React.SetStateAction<Job[]>>;
  tempSearch: any;
  setTempSearch: React.Dispatch<React.SetStateAction<any>>;
  jobTypesTemp: { [key: string]: boolean };
  setJobTypesTemp: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  userSearch: string;
  setUserSearch: React.Dispatch<React.SetStateAction<string>>;
  handleSwipe: (job: Job, action: "shortlist" | "skip") => Promise<void>;
};
