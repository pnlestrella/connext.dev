// JobProvider.tsx
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { JobContext } from "./JobContext";
import { Job, JobContextType, UserProfile } from "./JobTypes";
import { useAuth } from "context/auth/AuthHook";
import { recoSys } from "api/jobseekers/recosys";
import { createJobInteraction, getJobInteraction } from "api/jobseekers/jobinteraction";

const filterOptions = [
  { id: "1", label: "Full-time" },
  { id: "2", label: "Part-time" },
  { id: "3", label: "Contract" },
  { id: "4", label: "Freelance" },
  { id: "5", label: "Internship" },
  { id: "6", label: "OJT (On the job training)" },
  { id: "7", label: "Volunteer" },
];


export const JobProvider = ({ children }: { children: ReactNode }) => {
  const { userMDB, setUserMDB, resetSignal, setResetSignal } = useAuth();

  const [jobPostings, setJobPostings] = useState<Job[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tempSearch, setTempSearch] = useState<BrowseScreenTypes["userSearch"]>();
  const [userSearch, setUserSearch] = useState("");
  const [jobTypesTemp, setJobTypesTemp] = useState<{ [key: string]: boolean }>({});
  //for display only
  const [shortlistedJobs, setShortlistedJobs] = useState([])
  

  //for refreshing the lists
  const [refresh, setRefresh] = useState(false)

  const userPath = userMDB?.role + "s";

  // Reset all state on logout
  useEffect(() => {
    if (!resetSignal) return;
    setJobPostings([]);
    setUserProfile(null);
    setTempSearch(undefined);
    setUserSearch("");
    setJobTypesTemp({});
    setResetSignal(false);
  }, [resetSignal]);

  useEffect(() => {

  }, [refresh])


  //fetching shortlisted jobs
  async function fetchShortlistedJobs() {
    if (!userMDB?.seekerUID) return;

    try {
      const res = await getJobInteraction(userMDB.seekerUID, "shortlisted");
      setShortlistedJobs(res);
    } catch (err) {
      console.error("Failed to fetch shortlisted jobs:", err);
    }
  }


  // Initialize userProfile from userMDB (withou t hydrating shortlist/skipped)
  useEffect(() => {
    if (!userMDB) return;

    setUserProfile({
      seekerUID: userMDB.seekerUID,
      skills: userMDB.skills,
      profileSummary: userMDB.profileSummary,
      industries: userMDB.industries,
      experience: userMDB.experience,
      currentJobPostings: [],
      certifications: userMDB.certifications,
    });

    (async () => {
      const res = await getJobInteraction(userMDB.seekerUID, "shortlisted")
      setShortlistedJobs(res, 'miao')
    })()

  }, [userMDB]);

  console.log(userMDB,'usermdb')


  // Handle swipe action
  async function handleSwipe(job: Job, action: "shortlist" | "skip") {
    if (action === "shortlist") {
      console.log("shortlistessssd: ", job)
      const res = await createJobInteraction(job.jobUID, userMDB.seekerUID, "shortlisted", job.feedback, job.score, job.boostWeight)
      console.log(res, 'shortlisted feedback')
      //   }
    } else {
      const res = await createJobInteraction(job.jobUID, userMDB.seekerUID, "skipped", null)
      console.log(res, 'skipped feedback')
    }
  }

  // Reload jobs when reaching 5 cards
  useEffect(() => {
    if (!userProfile || jobPostings.length !== 5) return;

    const profileCopy: UserProfile = JSON.parse(JSON.stringify(userProfile));
    profileCopy.currentJobPostings = jobPostings.map((job) => job.jobUID);

    // Add filters/search
    profileCopy.jobTypes = filterOptions
      .filter((option) => jobTypesTemp[option.id])
      .map((option) => option.label);

    profileCopy.userSearch = {
      query: tempSearch?.title || "",
      queryIndustry: tempSearch?.industries || [],
    };

    async function reloadJobs() {
      try {
        const res = await recoSys(profileCopy);
        if (Array.isArray(res) && res.length > 0) {
          setJobPostings((prev) => [...prev, ...res]);
        } else {
          console.warn("Unexpected recoSys response:", res);
        }
      } catch (err) {
        console.error("Failed to fetch recommended jobs:", err);
      }
    }

    reloadJobs();
  }, [jobPostings.length]);

  const value: JobContextType = useMemo(
    () => ({
      userProfile,
      setUserProfile,
      jobPostings,
      setJobPostings,
      tempSearch,
      setTempSearch,
      jobTypesTemp,
      setJobTypesTemp,
      userSearch,
      setUserSearch,
      handleSwipe,
      shortlistedJobs,
      fetchShortlistedJobs
    }),
    [
      userProfile,
      jobPostings,
      tempSearch,
      jobTypesTemp,
      userSearch,
      shortlistedJobs
    ]
  );

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};
