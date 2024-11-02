import React, { useState } from 'react';
import Chat from './components/Chat/Chat';
import OtpModal from './components/OtpModal/OtpModal';
import styles from './App.module.css';

function App() {
  const [isVerified, setIsVerified] = useState(false);
  const [loginData,setLoginData]=useState();
  return (
    <div className={styles.App}>
      {!isVerified ? (
        <OtpModal setIsVerified={setIsVerified} setLoginData={setLoginData}/>
      ) : (
        <Chat loginData={loginData}/>
      )}
    </div>
  );
}

export default App;
