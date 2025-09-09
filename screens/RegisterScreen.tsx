import { useAuth } from 'context/auth/AuthHook';
//import 2 routes
import { EmployerRegisterScreen } from './employers/EmployerRegisterScreen';
import { JSRegisterScreen } from './jobseekers/JSRegisterscreen';

export const RegisterScreen = () => {
  //Conditional Rendering
  const {accountType}= useAuth();
  console.log(accountType, 'HEY')


  if(accountType === 'jobseeker'){
    return <JSRegisterScreen/>
  }else{
    return <EmployerRegisterScreen/>
  }

};
