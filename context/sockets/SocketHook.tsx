import { useContext } from "react";
import { SocketContext } from "./SocketContext";


export const useSockets = () => {
    const context = useContext(SocketContext);

    if (!context) {
        throw new Error("useContext must be used appropriately");
    }
    return context

}


