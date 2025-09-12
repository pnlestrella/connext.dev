import { ReactNode } from "react";
import { useAuth } from "context/auth/AuthHook";
import { JobProvider } from "context/jobs/JobProvider";
import { EmployerProvider } from "context/employers/EmployerProvider";
type Props = { children: ReactNode };

export function AuthGate({ children }: Props) {
  const { userType,userMDB } = useAuth();

  if (userType === "jobseeker") {
    console.log("Using Job Provider")
    return <JobProvider>{children}</JobProvider>;
  }

  if(userType === 'employer'){
    console.log("Using Employer Provider")
    return <EmployerProvider>{children}</EmployerProvider>
  }

  return <>{children}</>

}
