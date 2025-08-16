import { ReactNode, useEffect, useMemo, useState } from "react"
import { AuthContext } from "./AuthContext"
import { AuthTypes } from "./AuthTypes"
import { userLogin, jobseekerRegister } from "firebase/firebaseAuth"
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/config';

export const AuthProvider = ({children}:{children:ReactNode}) => {
    const [user,setUser] = useState<AuthTypes['user']|null>(null)
    const [userType, setUserType] = useState<AuthTypes['userType']| null>(null)
    const [loading, setLoading] = useState<AuthTypes['loading']| null>(null)


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        })
        return unsubscribe
    },[user])


    async function login(email:string, password:string){
        try{
            const login = await userLogin(email,password)
            console.log(login)
        }catch(err){
            alert(err)
            console.log(err)
            return
        }
    }



    const value = useMemo(() => ({user,userType,loading,login, setUserType ,setLoading}),[user,userType, loading])
    return(
        <AuthContext value={value}> 
            {children}
        </AuthContext>
    )
}