import { ReactNode, useEffect, useMemo, useState } from "react";
import { EmployerContext } from "./EmployerContext";
import { useAuth } from "context/auth/AuthHook";
import { getJobs } from "api/employers/joblistings";


export const EmployerProvider = ({ children }: { children: ReactNode }) => {
    const { resetSignal, setResetSignal, userMDB, setUserMDB } = useAuth()
    const [jobOpenings, setJobOpenings] = useState([])
    
    //for re-fetching : doesnt matter if true or false when changed it will re-fetch job Openings instead of manual caching
    const [refresh, setRefresh] = useState(false)

    console.log(userMDB, "Testmdb")

    // for local updates
    useEffect(() => {
        console.log("WORKEEEEEEEEEEEEEEEEEEEEEEEEEEED")
    }, [userMDB])

    //for state cleanups 
    useEffect(() => {
        if (resetSignal) {
            setJobOpenings([])
            setResetSignal(false)
        }
    }, [resetSignal]);


    // fetch job openings
    useEffect(() => {
        (async () => {
            try {
                const resJSON = await getJobs([userMDB.employerUID]);
                setJobOpenings(resJSON.message);

                console.log("HEYY", resJSON);
            } catch (err) {
                console.log("❌ Error in useEffect:", err);
            }
        })();
    }, [userMDB, refresh]); 



    const value = useMemo(() => ({
        jobOpenings,
        setJobOpenings,
        setRefresh
    }), [jobOpenings])
    return (
        <EmployerContext.Provider value={value}>
            {children}
        </EmployerContext.Provider>
    )
}