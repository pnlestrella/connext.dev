import { ReactNode, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { AuthTypes } from "./AuthTypes";
import { userSignOut } from "firebase/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthTypes["user"] | null>(null);
  const [userMDB, setUserMDB] = useState<AuthTypes["userMDB"] | null>(null);
  const [userType, setUserType] = useState<AuthTypes["userType"] | null>(null);
  const [loading, setLoading] = useState<AuthTypes["loading"] | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [firstLaunch, setFirstLaunch] = useState<boolean | null>(null);
  //for signout
  const [resetSignal, setResetSignal] = useState(false);
  //user not logged in
  const [accountType, setAccountType]= useState(null)

  // 🔧 Helper: normalize shortlistedJobs
  const normalizeUser = (rawUser: any) => {
    if (!rawUser) return null;
    if (rawUser.role === "jobseeker") {
      return {
        ...rawUser,
        shortlistedJobs:
          rawUser.shortlistedJobs?.map((job: any) => {
            if (typeof job === "string") {
              try {
                return JSON.parse(job);
              } catch {
                return null;
              }
            }
            return job;
          }).filter(Boolean) || [],
      };
    }
    return rawUser; // employer untouched
  };



  // Persist user session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      const storedProfile = await AsyncStorage.getItem("userProfile");
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        const normalized = normalizeUser(parsed);
        setUserMDB(normalized);
      }

      if (!firebaseUser) {
        setInitializing(false);
        return;
      }

      try {
        let fetchedUserMDB: any = null;

        // Try jobseeker first
        const resJob = await fetch(
          `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/jobseekers/getJobseeker?email=${encodeURIComponent(
            firebaseUser.email!
          )}`
        );

        if (resJob.ok) {
          const { message } = await resJob.json();
          fetchedUserMDB = { ...message, role: "jobseeker" }; // 👈 stamp role
        } else {
          // fallback to employer
          const resEmp = await fetch(
            `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/getEmployer?email=${encodeURIComponent(
              firebaseUser.email!
            )}`
          );

          if (resEmp.ok) {
            const { message } = await resEmp.json();
            // some APIs return an array, so pick first
            fetchedUserMDB = { ...message[0], role: "employer" }; // 👈 stamp role
          }
        }

        if (fetchedUserMDB) {
          const normalized = normalizeUser(fetchedUserMDB);
          setUserMDB(normalized);
          setUserType(normalized.role); // TS narrows to 'jobseeker' | 'employer'

          // persist
          await AsyncStorage.setItem("userProfile", JSON.stringify(normalized));
        }

        setInitializing(false);
      } catch (err: any) {
        console.log("Auth fetch error:", err.message);
      }

    });

    return unsubscribe;
  }, [user]);

  // Check if the app was launched for the first time
  useEffect(() => {
    const checkAppState = async () => {
      const launchFlag = await AsyncStorage.getItem("hasLaunchedBefore");

      if (!launchFlag) {
        await AsyncStorage.setItem("hasLaunchedBefore", "true");
        setFirstLaunch(true);
      } else {
        setFirstLaunch(false);
      }

      setInitializing(false);
      setLoading(false);
    };

    checkAppState();
  }, []);

  async function signOutUser() {
    try {
      await AsyncStorage.multiRemove(["userProfile", "unsyncedActions"]);
      setUserMDB(null);
      setResetSignal(true);
      await userSignOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  }


  const value = useMemo(
    () => ({
      user,
      userMDB,
      userType,
      loading,
      firstLaunch,
      initializing,
      resetSignal,
      accountType,
      setAccountType,
      setUserType,
      setLoading,
      setFirstLaunch,
      signOutUser,
      setUserMDB,
      setResetSignal
    }),
    [user, userMDB, userType, loading, firstLaunch, initializing, resetSignal, accountType]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

};
