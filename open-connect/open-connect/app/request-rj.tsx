import React from 'react';
import { useRouter } from 'expo-router';
import { RequestRJScreen } from '../src/screens/RequestRJScreen';

export default function RequestRJRoute() {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return <RequestRJScreen onBack={handleBack} />;
}
