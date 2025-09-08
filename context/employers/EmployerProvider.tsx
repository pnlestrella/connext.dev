import { ReactNode, useContext, useMemo, useState } from "react";
import { EmployerContext } from "./EmployerContext";

export const EmployerProvider = ({ children }: { children: ReactNode }) => {
    const [jobOpenings, setJobOpenings] = useState({})


    const value = useMemo(() => ({
        jobOpenings
    }), [jobOpenings])
    return (
        <EmployerContext.Provider value={value}>
            {children}
        </EmployerContext.Provider>
    )
}