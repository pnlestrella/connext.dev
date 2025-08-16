import {User} from 'firebase/auth'

export type AuthTypes ={
    user: User| null;
    userType: string;
    loading: boolean
    login: (email:string, password:string) => Promise<void>;
    setUserType: (value: string) => void
    setLoading: (value: boolean) => void
}