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
  const [resetSignal, setResetSignal] = useState(false); // for signout
  const [accountType, setAccountType] = useState(null); // user not logged in

  // 🔄 Refresh from MongoDB
  const refreshAuth = async () => {
    try {
      if (!userMDB?.email) return; // nothing to refresh

      let fetchedUserMDB: any = null;

      if (userMDB.role === "jobseeker") {
        const resJob = await fetch(
          `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/jobseekers/getJobseeker?email=${encodeURIComponent(
            userMDB.email
          )}`
        );

        if (resJob.ok) {
          const { message } = await resJob.json();
          fetchedUserMDB = { ...message, role: "jobseeker" };
        }
      } else if (userMDB.role === "employer") {
        const resEmp = await fetch(
          `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/getEmployer?email=${encodeURIComponent(
            userMDB.email
          )}`
        );

        if (resEmp.ok) {
          const { message } = await resEmp.json();
          fetchedUserMDB = { ...message[0], role: "employer" };
        }
      }

      if (fetchedUserMDB) {
        setUserMDB(fetchedUserMDB);
        await AsyncStorage.setItem("userProfile", JSON.stringify(fetchedUserMDB));
      }
    } catch (err: any) {
      console.error("refreshAuth error:", err.message);
    }
  };


  // 🔧 No more shortlist/skip normalization
  const normalizeUser = (rawUser: any) => {
    if (!rawUser) return null;
    return rawUser;
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
          fetchedUserMDB = { ...message, role: "jobseeker" };
        } else {
          // fallback to employer
          const resEmp = await fetch(
            `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/getEmployer?email=${encodeURIComponent(
              firebaseUser.email!
            )}`
          );

          if (resEmp.ok) {
            const { message } = await resEmp.json();
            fetchedUserMDB = { ...message[0], role: "employer" };
          }
        }

        if (fetchedUserMDB) {
          const normalized = normalizeUser(fetchedUserMDB);
          setUserMDB(normalized);
          setUserType(normalized.role);

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
      setResetSignal,
      refreshAuth
    }),
    [
      user,
      userMDB,
      userType,
      loading,
      firstLaunch,
      initializing,
      resetSignal,
      accountType,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
