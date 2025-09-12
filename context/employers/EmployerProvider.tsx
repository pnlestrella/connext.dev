import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { EmployerContext } from "./EmployerContext";
import { useAuth } from "context/auth/AuthHook";
import { getJobs } from "api/employers/joblistings";
import { getApplicantCounts } from "api/applications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { updateProfile } from "api/profile";

// simple deep compare helper
const arraysEqual = (a: any[], b: any[]) =>
  JSON.stringify(a) === JSON.stringify(b);

export const EmployerProvider = ({ children }: { children: ReactNode }) => {
  const { resetSignal, setResetSignal, userMDB, setUserMDB } = useAuth();

  const [jobOpenings, setJobOpenings] = useState<any[]>([]);
  const [skippedApplicants, setSkippedApplicants] = useState<any[]>([]);
  const [shortlistedApplicants, setShortlistedApplicants] = useState<any[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(false);

  // trigger counter for syncing
  const [syncTrigger, setSyncTrigger] = useState(0);

  // keep track of last saved state
  const lastSavedRef = useRef<{
    skippedApplicants: any[];
    shortlistedApplicants: any[];
  } | null>(null);

  // Cleanup on reset
  useEffect(() => {
    if (resetSignal) {
      setJobOpenings([]);
      setApplicationCounts([]);
      setResetSignal(false);
    }
  }, [resetSignal]);

  // keep auth context in sync
  useEffect(() => {
    setUserMDB((prev) => ({
      ...prev,
      rejectedApplicants: skippedApplicants,
      shortlistedApplicants,
    }));
  }, [skippedApplicants, shortlistedApplicants]);

  // Sync to DB when explicitly triggered
  useEffect(() => {
    if (syncTrigger === 0) return; // skip first render

    const toDB = async () => {
      try {
        const updated = {
          shortlistedApplicants,
          rejectedApplicants: skippedApplicants,
        };

        const res = await updateProfile("employers", userMDB.employerUID, {
          updates: updated,
        });

        console.log("✅ Synced to DB:", res);
        lastSavedRef.current = updated;
      } catch (err) {
        console.log("❌ Failed to sync DB:", err);
      }
    };

    toDB();
  }, [syncTrigger]);

  // Save to local storage on app background/inactive
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        (async () => {
          const newData = { skippedApplicants, shortlistedApplicants };

          if (
            lastSavedRef.current &&
            arraysEqual(lastSavedRef.current.skippedApplicants, newData.skippedApplicants) &&
            arraysEqual(lastSavedRef.current.shortlistedApplicants, newData.shortlistedApplicants)
          ) {
            console.log("✅ No changes since last save");
            return;
          }

          try {
            await AsyncStorage.setItem("unsyncedData", JSON.stringify(newData));
            lastSavedRef.current = newData;
            console.log("💾 Saved Unsynced Data:", newData);
          } catch (err) {
            console.log("❌ Failed to save async storage:", err);
          }
        })();
      }
    });

    return () => subscription.remove();
  }, [skippedApplicants, shortlistedApplicants]);

  // Fetch jobs + counts
  useEffect(() => {
    (async () => {
      try {
        if (!userMDB?.employerUID) return;

        const resJSON = await getJobs([userMDB.employerUID]);
        const applicationCountsRes = await getApplicantCounts(userMDB.employerUID);

        lastSavedRef.current = {
          shortlistedApplicants: userMDB.shortlistedApplicants ?? [],
          skippedApplicants: userMDB.rejectedApplicants ?? [],
        };

        setApplicationCounts(applicationCountsRes);
        setJobOpenings(resJSON.message);
      } catch (err) {
        console.log("❌ Error fetching jobs:", err);
      }
    })();
  }, [userMDB?.employerUID, refresh]);

  // Hydrate from async storage or userMDB
  useEffect(() => {
    (async () => {
      try {
        const res = await AsyncStorage.getItem("unsyncedData");
        if (res) {
          const resJSON = JSON.parse(res);
          console.log("📂 Found unsynced data:", resJSON);

          setShortlistedApplicants(resJSON.shortlistedApplicants || []);
          setSkippedApplicants(resJSON.skippedApplicants || []);

          // trigger a DB sync only if data differs
          if (
            !arraysEqual(resJSON.shortlistedApplicants, userMDB.shortlistedApplicants ?? []) ||
            !arraysEqual(resJSON.skippedApplicants, userMDB.rejectedApplicants ?? [])
          ) {
            setSyncTrigger((prev) => prev + 1);
          }

          await AsyncStorage.removeItem("unsyncedData");
        } else {
          console.log("ℹ️ Async storage empty. Hydrating from server state");

          setShortlistedApplicants(userMDB.shortlistedApplicants ?? []);
          setSkippedApplicants(userMDB.rejectedApplicants ?? []);
        }
      } catch (err) {
        console.log("❌ Unable to hydrate async storage:", err);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      jobOpenings,
      refresh,
      applicationCounts,
      skippedApplicants,
      shortlistedApplicants,
      setJobOpenings,
      setRefresh,
      setSkippedApplicants,
      setShortlistedApplicants,
      setSyncTrigger,
    }),
    [jobOpenings, shortlistedApplicants, skippedApplicants, applicationCounts, refresh]
  );

  return <EmployerContext.Provider value={value}>{children}</EmployerContext.Provider>;
};
