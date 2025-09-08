import { ReactNode } from "react";
import { useAuth } from "context/auth/AuthHook";
import { JobProvider } from "context/jobs/JobProvider";

type Props = { children: ReactNode };

export function AuthGate({ children }: Props) {
  const { userType } = useAuth();

  console.log(userType,'usersasss')

  if (userType === "jobseeker") {
    return <JobProvider>{children}</JobProvider>;
  }

  return <>{children}</>;
}
