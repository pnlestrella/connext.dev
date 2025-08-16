import { useAuth } from 'context/auth/AuthHook';
//import 2 routes
import { EmployerRegisterScreen } from './employers/EmployerRegisterScreen';
import { JSRegisterScreen } from './jobseekers/JSRegisterscreen';

export const RegisterScreen = () => {
  //Conditional Rendering
  const {userType}= useAuth();
  console.log(userType)


  if(userType === 'jobseeker'){
    return <JSRegisterScreen/>
  }else{
    return <EmployerRegisterScreen/>
  }

};
