import { ReactNode } from "react";
import { useAuth } from "context/auth/AuthHook";
import { JobProvider } from "context/jobs/JobProvider";

type Props = { children: ReactNode };

export function AuthGate({ children }: Props) {
  const { userMDB } = useAuth();

  console.log(userMDB.role,'usersasss')

  if (userMDB?.role === "employer") {
    console.log("meownigga")
  }

  return <>{children}</>;
}
