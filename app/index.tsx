// app/index.tsx

import React, { useEffect } from 'react';
import LoginScreen from '../src/screens/agent/LoginScreen';
import { auth } from '../src/services/firebase'; // Make sure this path is correct

export default function Index() {
  useEffect(() => {
    console.log('✅ Firebase Auth object:', auth);
  }, []);

  return <LoginScreen />;
}