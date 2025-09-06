// JobProvider.tsx
import { ReactNode, useEffect, useMemo, useState } from "react";
import { JobContext } from "./JobContext";
import { Job, JobContextType, UserProfile } from "./JobTypes";
import { useAuth } from "context/auth/AuthHook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { recoSys } from "api/recosys";
import { updateProfile } from "api/profile";

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
    const { userMDB, setUserMDB, userType } = useAuth();

    const [shortlistedJobs, setShortlistedJobs] = useState<Job[]>([]);
    const [skippedJobs, setSkippedJobs] = useState<string[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [tempSearch, setTempSearch] = useState<BrowseScreenTypes['userSearch']>();
    const [userSearch, setUserSearch] = useState("");

    //for profile updates
    const userPath = userType + 's'




    //for filtering
    const [jobTypesTemp, setJobTypesTemp] = useState<{ [key: string]: boolean }>({});


    //load the cache jobs search
    useEffect(() => {

    }, [])

    console.log("TESTTT", shortlistedJobs)

    //jobpostings
    const [jobPostings, setJobPostings] = useState<Job[]>([]);

    console.log("Jobposting length: ", jobPostings.length);

    for (let i in jobPostings) {
        console.log(jobPostings[i].jobUID, jobPostings[i].jobTitle, 'jobuid')
    }

    // 1. Initialize from userMDB once
    useEffect(() => {
        if (userMDB) {
            const initialSkipped = userMDB.skippedJobs || [];

            setShortlistedJobs(userMDB.shortlistedJobs)
            setSkippedJobs(userMDB.skippedJobs)

            const initialShortlisted =
                userMDB.shortlistedJobs?.map((val: any) => {
                    if (typeof val === "string") {
                        try {
                            return JSON.parse(val);
                        } catch (e) {
                            console.warn("Could not parse job:", val);
                            return null;
                        }
                    }
                    return val;
                }).filter(Boolean) || [];

            setShortlistedJobs(initialShortlisted);
            setSkippedJobs(initialSkipped);

            setUserProfile({
                seekerUID: userMDB.seekerUID,
                skills: userMDB.skills,
                profileSummary: userMDB.profileSummary,
                industries: userMDB.industries,
                skippedJobs: initialSkipped,
                shortlistedJobs: initialShortlisted.map((j: any) => j.jobUID),
                experience: userMDB.experience,
                currentJobPostings: [],
                certifications: userMDB.certifications,
            });
        }
    }, [userMDB]);


    // 2. Keep userProfile in sync whenever shortlist/skip changes
    useEffect(() => {
        if (!userMDB) return;

        setUserProfile((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                skippedJobs: [...skippedJobs],
                shortlistedJobs: shortlistedJobs.map((j) => j.jobUID),
            };
        });
    }, [shortlistedJobs, skippedJobs]);



    function profileCopyer(profileCopy) {
        const currentJobPostings = jobPostings.map(job => job.jobUID);
        profileCopy.currentJobPostings = currentJobPostings;
        profileCopy.skippedJobs = skippedJobs;
        profileCopy.shortlistedJobs = shortlistedJobs.map(jobs => jobs.jobUID)

        console.log(profileCopy, 'profileCopy ------------------------')

        // Build jobTypes array from filters
        const jobTypesArr = filterOptions
            .filter(option => jobTypesTemp[option.id])
            .map(option => option.label);
        profileCopy.jobTypes = jobTypesArr

        // Add search details
        profileCopy.userSearch = {
            query: tempSearch?.title || "",
            queryIndustry: tempSearch?.industries || [],
        };


        //synch with DB and local 
        setUserMDB((prev) => ({
            ...prev,
            skippedJobs: [...skippedJobs],
            shortlistedJobs: [...shortlistedJobs]
        }))



        return profileCopy

    }

    //for reloading the job every time the cards went to 5
    useEffect(() => {
        if (!userProfile) return;
        let profileCopy: UserProfile = JSON.parse(JSON.stringify(userProfile));



        if (jobPostings.length === 5) {

            profileCopy = profileCopyer(profileCopy)

            // async function syncDB() {
            //     try {
            //         // const shortlistedtoDB = JSON.parse(JSON.stringify(shortlistedJobs));
            //         // const payload= {
            //         //     "skippedJobs": skippedJobs,
            //         //     "shortlistedJobs": shortlistedtoDB
            //         // }

            //         const payload = {
            //             editType: "shortlistedJobs",
            //             data: shortlistedJobs
            //         }

            //         const res = await updateProfile(userPath, userMDB?.seekerUID, payload);


            //         console.log(payload, 'APPPPPPPPPPPPPPPPPPPPPPPPP')

            //         await updateProfile(userPath, userMDB?.seekerUID, {
            //             updates: payload
            //         });



            //         console.log("Profile synced in background");
            //     } catch (err) {
            //         console.error("Background profile sync failed:", err);
            //     }
            // }

            // syncDB()



            async function jobReload() {
                try {
                    console.log("Reload now")
                    const profileQuery = profileCopy

                    console.log(profileQuery, 'PROFIELEEEEEEEEEEEEEEEEEEEEEEEEEEE')

                    //call the recommendation module
                    const res = await recoSys(profileQuery)

                    if (Array.isArray(res) && res.length > 0) {
                        setJobPostings((prev) => [...prev, ...res]);
                    } else {
                        console.log("Unexpected res format:", res);
                    }
                } catch (err) {
                    console.log(err)
                }
            }

            jobReload()
        }

        console.log(profileCopy, 'prf')

    }, [jobPostings.length])



    const value: JobContextType = useMemo(
        () => ({
            shortlistedJobs,
            setShortlistedJobs,
            skippedJobs,
            setSkippedJobs,
            userProfile,
            setUserProfile,
            jobPostings,
            setJobPostings,
            tempSearch,
            setTempSearch,
            jobTypesTemp,
            setJobTypesTemp,
            profileCopyer,
            userSearch,
            setUserSearch
        }),
        [shortlistedJobs, skippedJobs, userProfile, jobPostings, tempSearch, jobTypesTemp]
    );

    return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};
