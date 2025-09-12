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
  shortlistedJobs: string[];
  experience: any;
  currentJobPostings: string[];
  certifications: string[];
};

export type JobContextType = {
  shortlistedJobs: Job[];
  setShortlistedJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  skippedJobs: string[];
  setSkippedJobs: React.Dispatch<React.SetStateAction<string[]>>;
  userProfile: UserProfile | null;
};
