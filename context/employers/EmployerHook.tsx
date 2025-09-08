import { useContext } from "react";
import { EmployerContext } from "./EmployerContext";

export const useEmployers = () => {
    const context = useContext(EmployerContext);

    if (!context) {
        throw new Error("useEmployers must be used within the Employers controls only");
    }

    return context
}