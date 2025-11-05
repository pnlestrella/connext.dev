import { ReactNode, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SocketContext } from "./SocketContext";
import { useAuth } from "context/auth/AuthHook";
import Constants from "expo-constants";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userMDB, user } = useAuth();

  useEffect(() => {
    if (!userMDB) {
      socket?.disconnect();
      setSocket(null);
      return;
    }

    const url = Constants.expoConfig?.extra?.BACKEND_BASE_URL;
    const s = io(url, {
      transports: ["websocket"],
    });

    // only register after connection
    s.on("connect", () => {
      console.log("🔌 Socket Connected:", s.id);

      // Use userMDB's correct user UID (employer or seeker)
      let userId = null;

      if (userMDB?.employerUID) userId = userMDB.employerUID;
      else if (userMDB?.seekerUID) userId = userMDB.seekerUID;

      if (userId) {
        console.log('Registering user for socket:', userId);
        s.emit("registerUser", userId);
      } else {
        console.warn('No valid user id found for socket registration!');
      }
    });


    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [userMDB]);

  const value = useMemo(() => ({ socket }), [socket]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
