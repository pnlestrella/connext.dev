// JobProvider.tsx
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { JobContext } from "./JobContext";
import { Job, JobContextType, UserProfile } from "./JobTypes";
import { useAuth } from "context/auth/AuthHook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { recoSys } from "api/jobseekers/recosys";
import { updateProfile } from "api/profile";
import { AppState } from "react-native";

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

    const [shortlistedJobs, setShortlistedJobs] = useState<Job[]>([]);
    const [skippedJobs, setSkippedJobs] = useState<string[]>([]);
    const shortlistedRef = useRef<Job[]>([]);
    const skippedRef = useRef<string[]>([]);
    const syncedRef = useRef(false);


    useEffect(() => { shortlistedRef.current = shortlistedJobs }, [shortlistedJobs]);
    useEffect(() => { skippedRef.current = skippedJobs }, [skippedJobs]);



    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [tempSearch, setTempSearch] = useState<BrowseScreenTypes['userSearch']>();
    const [userSearch, setUserSearch] = useState("");

    //for profile updates
    const userPath = userMDB?.role + 's'




    //for filtering
    const [jobTypesTemp, setJobTypesTemp] = useState<{ [key: string]: boolean }>({});


    //load the cache jobs search
    // useEffect(() => {

    // }, [])

    //forlogout
    useEffect(() => {
        if (resetSignal) {
            setShortlistedJobs([]);
            setSkippedJobs([]);
            setUserProfile(null);
            setJobPostings([]);
            setTempSearch(undefined);
            setUserSearch("");
            setJobTypesTemp({});

            setResetSignal(false)

        }
    }, [resetSignal]);




    //jobpostings
    const [jobPostings, setJobPostings] = useState<Job[]>([]);

    console.log("Jobposting length: ", jobPostings.length);

    for (let i in jobPostings) {
        console.log(jobPostings[i].jobUID, jobPostings[i].jobTitle, 'jobuid')
    }



    //check the last synch
    const lastSyncSnapshot = useRef<{ shortlistedJobs: string[], skippedJobs: string[] }>({
        shortlistedJobs: [],
        skippedJobs: [],
    });

    // 1. Initialize from userMDB OR AsyncStorage
    const hydrated = useRef(false);
    useEffect(() => {
        if (!userMDB) {
            hydrated.current = false; // reset hydration for next login
            return;
        }

        if (hydrated.current) return;
        hydrated.current = true;

        (async () => {
            try {
                const cached = await AsyncStorage.getItem("unsyncedActions");

                if (cached) {
                    // Hydrate from local unsyncedActions
                    const parsed = JSON.parse(cached);
                    const localShortlisted = parsed.shortlistedJobs || [];
                    const localSkipped = parsed.skippedJobs || [];

                    console.log("✅ Hydrating from AsyncStorage fallback");

                    setShortlistedJobs(localShortlisted);
                    setSkippedJobs(localSkipped);
                    lastSyncSnapshot.current = {
                        shortlistedJobs: localShortlisted.map(j => j.jobUID || j),
                        skippedJobs: localSkipped.map(j => (typeof j === "string" ? j : j.jobUID)),
                    };

                    setUserProfile({
                        seekerUID: userMDB.seekerUID,
                        skills: userMDB.skills,
                        profileSummary: userMDB.profileSummary,
                        industries: userMDB.industries,
                        skippedJobs: localSkipped.map(j => (typeof j === "string" ? j : j.jobUID)),
                        shortlistedJobs: localShortlisted.map(j => j.jobUID || j),
                        experience: userMDB.experience,
                        currentJobPostings: [],
                        certifications: userMDB.certifications,
                    });

                    // Sync to DB
                    const shortlistedToDB = localShortlisted.map(job => ({
                        ...job,
                        feedback: job.feedback || { match_summary: "", skill_note: "", extra_note: "" },
                    }));

                    await updateProfile(userMDB.role + 's', userMDB.seekerUID, {
                        updates: {
                            shortlistedJobs: shortlistedToDB,
                            skippedJobs: localSkipped.map(j => (typeof j === "string" ? j : j.jobUID)),
                        },
                    });

                    // Remove cache after successful sync
                    await AsyncStorage.removeItem("unsyncedActions");
                } else {
                    // Hydrate from userMDB
                    const initialShortlisted = (userMDB.shortlistedJobs || []).map(j => (typeof j === "string" ? JSON.parse(j) : j)).filter(Boolean);
                    const initialSkipped = (userMDB.skippedJobs || []).map(j => (typeof j === "string" ? j : j.jobUID));

                    console.log("✅ Hydrating from userMDB");

                    setShortlistedJobs(initialShortlisted);
                    setSkippedJobs(initialSkipped);
                    lastSyncSnapshot.current = {
                        shortlistedJobs: initialShortlisted.map(j => j.jobUID),
                        skippedJobs: initialSkipped,
                    };

                    setUserProfile({
                        seekerUID: userMDB.seekerUID,
                        skills: userMDB.skills,
                        profileSummary: userMDB.profileSummary,
                        industries: userMDB.industries,
                        skippedJobs: initialSkipped,
                        shortlistedJobs: initialShortlisted.map(j => j.jobUID),
                        experience: userMDB.experience,
                        currentJobPostings: [],
                        certifications: userMDB.certifications,
                    });
                }

                console.log(userMDB, 'was', skippedJobs)
            } catch (err) {
                console.log("❌ Error hydrating jobs:", err);
            }
        })();
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


    async function syncDB() {
        try {
            const currentShortlisted = shortlistedRef.current.map(job => job.jobUID);
            const currentSkipped = skippedRef.current.map(job => job.jobUID || job);

            const currentShortlistedSorted = [...currentShortlisted].sort();
            const currentSkippedSorted = [...currentSkipped].sort();
            const lastShortlistedSorted = [...lastSyncSnapshot.current.shortlistedJobs].sort();
            const lastSkippedSorted = [...lastSyncSnapshot.current.skippedJobs].sort();

            // Check if anything changed
            const hasChanged =
                JSON.stringify(currentShortlistedSorted) !== JSON.stringify(lastShortlistedSorted) ||
                JSON.stringify(currentSkippedSorted) !== JSON.stringify(lastSkippedSorted);

            if (!hasChanged) {
                console.warn("No changes detected, skipping sync.");
                return;
            }

            // Pick only the necessary fields for each shortlisted job, including feedback
            const shortlistedToDB = shortlistedJobs.map(job => ({
                jobUID: job.jobUID,
                score: job.score,
                boostWeight: job.boostWeight,
                jobTitle: job.jobTitle,
                jobPoster: job.jobPoster,
                location: {
                    city: job.location.city,
                    state: job.location.state,
                },
                salaryRange: {
                    min: job.salaryRange.min,
                    max: job.salaryRange.max,
                    currency: job.salaryRange.currency,
                    frequency: job.salaryRange.frequency,
                },
                employment: job.employment,
                workTypes: job.workTypes,
                profilePic: job.profilePic,
                isExternal: job.isExternal,
                feedback: job.feedback || {
                    match_summary: "",
                    skill_note: "",
                    extra_note: "",
                },
            }));

            // Skipped jobs: just store their IDs
            const skippedToDB = skippedJobs.map(job => job.jobUID || job);

            const payload = {
                skippedJobs: skippedToDB,
                shortlistedJobs: shortlistedToDB,
            };

            await updateProfile(userPath, userMDB?.seekerUID, {
                updates: payload,
            });

            console.log("Profile synced in background", payload);
        } catch (err) {
            console.error("Background profile sync failed:", err);
        }
    }



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

        syncDB();

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

        if (jobPostings.length === 5) {
            const profileCopy: UserProfile = JSON.parse(JSON.stringify(userProfile));

            async function jobReloadAndMarkSynced() {
                // sync profile & DB
                await profileCopyer(profileCopy);

                // reload jobs
                try {
                    const res = await recoSys(profileCopy);
                    if (Array.isArray(res) && res.length > 0) {
                        setJobPostings(prev => [...prev, ...res]);
                    } else {
                        console.log("Unexpected res format:", res);
                    }
                } catch (err) {
                    console.log(err);
                }

                // mark as synced AFTER DB update
                lastSyncSnapshot.current = {
                    shortlistedJobs: shortlistedJobs.map(j => j.jobUID),
                    skippedJobs: skippedJobs.map(j => (typeof j === "string" ? j : j.jobUID)),
                };

                // optionally remove cache here if you still want
                await AsyncStorage.removeItem("unsyncedActions");
            }

            jobReloadAndMarkSynced();
        }
    }, [jobPostings.length]);


    // Detect app state changes
    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextState) => {
            if (nextState === "background") {
                console.log("App is going to background (or being closed).");
                (async () => {
                    try {
                        const currentShortlisted = shortlistedRef.current.map(job => job.jobUID);
                        const currentSkipped = skippedRef.current.map(job => job.jobUID || job);

                        const currentShortlistedSorted = [...currentShortlisted].sort();
                        const currentSkippedSorted = [...currentSkipped].sort();
                        const lastShortlistedSorted = [...lastSyncSnapshot.current.shortlistedJobs].sort();
                        const lastSkippedSorted = [...lastSyncSnapshot.current.skippedJobs].sort();

                        console.log(currentShortlistedSorted, ' a ', lastShortlistedSorted)
                        console.log(currentSkippedSorted, ' a ', lastSkippedSorted)

                        const hasChanged =
                            JSON.stringify(currentShortlistedSorted) !== JSON.stringify(lastShortlistedSorted) ||
                            JSON.stringify(currentSkippedSorted) !== JSON.stringify(lastSkippedSorted);

                        if (!hasChanged) {
                            console.warn("No changes detected, skipping AsyncStorage save.");
                            return;
                        }

                        const unsyncedActions = {
                            shortlistedJobs,
                            skippedJobs,
                        };

                        await AsyncStorage.setItem(
                            "unsyncedActions",
                            JSON.stringify(unsyncedActions)
                        );

                        console.log("Saved unsynced actions to AsyncStorage", unsyncedActions);

                    } catch (err) {
                        console.log(err, "Failed saving to AsyncStorage");
                    }
                })();
            } else if (nextState === "active") {
                console.log("App is active again.");
            }
        });

        return () => subscription.remove();
    }, [shortlistedJobs, skippedJobs]);




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
            setUserSearch,
            syncDB
        }),
        [shortlistedJobs, skippedJobs, userProfile, jobPostings, tempSearch, jobTypesTemp]
    );

    return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};
