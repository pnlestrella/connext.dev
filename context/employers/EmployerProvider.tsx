import { ReactNode, useEffect, useMemo, useState } from "react";
import { EmployerContext } from "./EmployerContext";
import { useAuth } from "context/auth/AuthHook";
import { getJobs } from "api/employers/joblistings";
import { getApplicantCounts } from "api/applications";

export const EmployerProvider = ({ children }: { children: ReactNode }) => {
  const { userMDB } = useAuth();

  const [jobOpenings, setJobOpenings] = useState<any[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(false);

  // Fetch jobs + counts
  useEffect(() => {
    (async () => {
      try {
        if (!userMDB?.employerUID) return;

        const jobsRes = await getJobs([userMDB.employerUID]);
        const countsRes = await getApplicantCounts(userMDB.employerUID, 'pending');

        setJobOpenings(jobsRes.message);
        setApplicationCounts(countsRes);
      } catch (err) {
        console.log("❌ Error fetching jobs/applicant counts:", err);
      }
    })();
  }, [userMDB?.employerUID, refresh]);

  const value = useMemo(
    () => ({
      jobOpenings,
      applicationCounts,
      refresh,
      setJobOpenings,
      setRefresh,
    }),
    [jobOpenings, applicationCounts, refresh]
  );

  return (
    <EmployerContext.Provider value={value}>
      {children}
    </EmployerContext.Provider>
  );
};
