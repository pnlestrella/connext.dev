import { useContext } from "react";
import { JobContext } from "./JobContext";


export const useJobs= () =>{
    const context = useContext(JobContext)

    
    if(!context){
        throw new Error("useJobs must be used appropriately");
    }

    return context
}