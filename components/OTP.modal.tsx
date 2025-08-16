// components/OTPModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, AppState } from 'react-native';
import { Loading } from '../components/Loading'
import Constants from 'expo-constants';

type OTPModalProps = {
  onClose: () => void;
  onSubmit: () => void;
  onVerify: () => void;
  setLoading: (value: boolean) => void;
  visible: boolean;
  loading: boolean;
  email: string;
  userType: string
};

export const OTPModal: React.FC<OTPModalProps> = ({ visible,email, userType, loading , onClose, onSubmit, setLoading, onVerify, }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(300);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const appState = useRef(AppState.currentState);

  const [accExist, setAccExist] = useState(false)
  const [tries, setTries] = useState(5)



  // Initialize timer when moving to OTP step
  useEffect(() => {
    if (step === 2 && !expiryTime) {
      const now = new Date();
      setExpiryTime(new Date(now.getTime() + 305000)); // 5 minutes from now
      setTimeLeft(305);
    }
  }, [step]);

  // Handle timer and app state changes
  useEffect(() => {
    if (step !== 2 || !expiryTime) return;

    const handleAppStateChange = (nextAppState: any) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came back to foreground, recalculate time left
        const now = new Date();
        const remaining = Math.floor((expiryTime.getTime() - now.getTime()) / 1000);
        setTimeLeft(Math.max(0, remaining));
      }
      appState.current = nextAppState;
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Countdown timer
    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.floor((expiryTime.getTime() - now.getTime()) / 1000);

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [step, expiryTime]);

  const handleResend = () => {

    //Handle requesting the Resend to the server
    handleConfirm()
    setTries(5)
    setTimeLeft(300);
    setOtp('');
    setError('');
  };

  const formatTime = (seconds: any) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // console.log(Constants?.expoConfig?.extra?.BACKEND_BASE_URL)

  const handleConfirm = async () => {
    setLoading(true)
    //send OTP to the email here
    try {
      const res = await fetch(`${Constants?.expoConfig?.extra?.BACKEND_BASE_URL}/api/otp/sendOTP`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          userType: userType
        })
      })

      if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(JSON.stringify(errorData.error))
        console.log(error)
        setLoading(false)
        throw error
      }

      const now = new Date();
      setExpiryTime(new Date(now.getTime() + 300000)); // 5 minutes from now
      setTimeLeft(300);

      const data = await res.json();
      setLoading(false)
    } catch (err: any) {
      try {
        const errConvert = err.message.replace('Error: ', '')
        const errObj = JSON.parse(errConvert)
        console.log(errObj)
        console.log(errObj.code)
        //if Email is already used
        if (errObj.code === 'EMAIL_ALREADY_IN_USE') {
          console.log(errObj.code)
          setError(errObj.message)
          setAccExist(true)
          return;
        } else if (errObj.code === 'OTP_REQUEST_LIMIT') {
          console.log(errObj.code)
          setError(errObj.message)
        }
      } catch {
        setLoading(false)
        console.log('Raw error:', err.message);
        setError(err.message);
      }
    }

    setStep(2);
  };



  //Handle the verification
   async function handleOnVerify() {
    setError('')
    Keyboard.dismiss();
    console.log(tries)

    //Check if the inputs were empty
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    //Validations - check if time is 0 then request another otp 
    if (timeLeft === 0) {
      alert("Please Resend another OTP")
      setError("Please Resend another OTP")
      return;
    }
    //if the length of the Input was not 6 then its invalid

    if (otp.length !== 6) {
      setError("OTP must be 6 digits")
      setTries(prev => prev - 1)
      return;
    }
      
     try{
      const response = await fetch(`${Constants?.expoConfig?.extra?.BACKEND_BASE_URL}/api/otp/verifyOTP`, {
        method : 'POST',
        headers: {
          "Content-Type" : "application/json"
        },
        body: JSON.stringify({
          email,
          otp
        })
      })

      const data = await response.json()

      //ERROR handler for the server's response
      console.log(response.ok, '--')
      if(!response.ok){
        const error = new Error(JSON.stringify(data))
        throw error
      }
        
      onSubmit();
      setOtp('');
      setError('');
      onClose();
      onVerify();

     }catch(err:any){
        const errObj = JSON.parse(err.message)
        console.log(errObj.error.code)
        if(errObj.error.code === 'INVALID_OTP'){
          setError(errObj.error.message)
        }
     }
      
   



    


  }

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {loading ?
          (<View style={styles.loadingContainer}>
            <Loading />
          </View>
          ) : (
            step === 1 ? (
              <>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 10 }}>
                </View>
                <Text style={styles.title}>Verify your email</Text>
                <Text style={styles.description}>
                  This helps prevent duplicate accounts and ensures security.
                </Text>

                {/* Checking if the account already exist/ design rendering validation */}
                {!accExist ? (
                  <>
                    <View style={styles.emailContainer}>
                      <Text style={styles.emailText}>{email}</Text>
                    </View>

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                        <Text style={styles.confirmText}>Yes, that&apos;s me</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.emailContainer}>
                      <Text style={styles.emailText} className='color-red-600'>{email}</Text>
                    </View>

                    <Text style={styles.error}>Email already in use. Please use a different email address.</Text>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity style={styles.cancelButton} onPress={() => {
                        onClose();
                        setError('')
                        setAccExist(accExist === true ? false : true)
                      }}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )
                }



              </>
            ) : (
              <>
                <Text style={styles.title}>Enter OTP Code</Text>
                <Text style={styles.description}>
                  We&apos;ve sent a 6-digit code to: {'\n'}
                  <Text className='font-extrabold'>{email}</Text>
                </Text>
                {tries < 5 ? <Text className='pb-3'>You have <Text className='font-extrabold'>{tries}</Text> attempts remaining</Text> : null}

                <TextInput
                  style={styles.otpInput}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="Enter 6-digit OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleOnVerify}
                  >
                    <Text style={styles.submitText}>Verify</Text>
                  </TouchableOpacity>
                </View>

                {/* Added Resend OTP Button */}
                <TouchableOpacity
                  onPress={handleResend}
                  disabled={timeLeft > 0}
                  style={[styles.resendButton, timeLeft > 0 && styles.disabledButton]}
                >
                  <Text style={styles.resendText}>
                    {timeLeft > 0 ? `Resend OTP in ${formatTime(timeLeft)}` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </>
            )
          )}


      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emailContainer: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  emailText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
  },
  timerText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    display: 'flex',
    backgroundColor: '#f55656',
    padding: 12,
    borderRadius: 5,
    margin: 2,
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#6C63FF',
    padding: 12,
    borderRadius: 5,
    margin: 2,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#359650',
    padding: 12,
    borderRadius: 5,
    flex: 1,
    opacity: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  confirmText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  submitText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Added styles for resend button
  resendButton: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
  resendText: {
    color: '#6C63FF',
    fontWeight: '500',
  },
  loadingContainer: {
    minHeight: 200, // Match your modal content height
    justifyContent: 'center',
    alignItems: 'center',
  },
});