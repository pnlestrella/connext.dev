import {User} from 'firebase/auth'

export type AuthTypes ={
    user: User| null;
    userMDB: object| null;
    userType: string;
    loading: boolean
    firstLaunch: boolean
    setUserType: (value: string) => void
    setUserMDB: (value: string) => void
    setLoading: (value: boolean) => void
    setFirstLaunch: () => void
    signOutUser:() => void
}