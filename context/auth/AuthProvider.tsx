import { ReactNode, useEffect, useMemo, useState } from "react"
import { AuthContext } from "./AuthContext"
import { AuthTypes } from "./AuthTypes"
import { userSignOut } from "firebase/firebaseAuth"
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthTypes['user'] | null>(null)
    const [userMDB, setUserMDB] = useState<AuthTypes['userMDB'] | null>(null)
    const [userType, setUserType] = useState<AuthTypes['userType'] | null>(null)
    const [loading, setLoading] = useState<AuthTypes['loading'] | null>(null)
    //To check if the app is ran for the firsttime
    const [firstLaunch, setFirstLaunch] = useState<boolean | null>(null);

    console.log(userMDB, '--heeeey')

    //check if user is logged in -- PERSISTENCY
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log(firebaseUser?.email)
            setUser(firebaseUser)

            if (!firebaseUser) {
                return;
            }

            let fetchedUserMDB = null;

            // Try jobseeker first
            try {
                const resJob = await fetch(
                    `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/jobseekers/getJobseeker?email=${encodeURIComponent(firebaseUser.email)}`
                );

                if (resJob.ok) {
                    const resJSON = await resJob.json();
                    fetchedUserMDB = resJSON.message;
                } else {
                    // fallback to employer
                    const resEmp = await fetch(
                        `${Constants.expoConfig?.extra?.BACKEND_BASE_URL}/api/employers/getEmployer?email=${encodeURIComponent(firebaseUser.email)}`
                    );

                    if (resEmp.ok) {
                        const resJSON = await resEmp.json();
                        fetchedUserMDB = resJSON.message[0];
                    }
                }

                if (fetchedUserMDB) {
                    setUserMDB(fetchedUserMDB);
                    setUserType(fetchedUserMDB.role);
                }

            } catch (err: any) {
                console.log(err.message);
            }

        })

        return unsubscribe
    }, [user])



    //check if the APP was launched for the first time
    useEffect(() => {
        const checkAppState = async () => {
            const launchFlag = await AsyncStorage.getItem("hasLaunchedBefore");

            if (launchFlag === null) {
                await AsyncStorage.setItem("hasLaunchedBefore", "true");
                setFirstLaunch(true);
            } else {
                setFirstLaunch(false);
            }

            setLoading(false);
        };

        checkAppState();
    }, []);

    async function signOutUser() {
        await userSignOut();
        setUserMDB(null)
    }




    const value = useMemo(() => ({ user, userMDB, userType, loading, firstLaunch, setUserType, setLoading, setFirstLaunch, signOutUser, setUserMDB }), [user, userType, loading, firstLaunch, userMDB])


    return (
        <AuthContext value={value}>
            {children}
        </AuthContext>
    )
}