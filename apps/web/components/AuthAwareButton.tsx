'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthAwareButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function AuthAwareButton({ children, className }: AuthAwareButtonProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side to access localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClick = () => {
    if (!isClient) return;
    
    // Check if user is authenticated by looking for JWT token
    const token = localStorage.getItem('jwt');
    
    if (token) {
      // User is authenticated, redirect to home page
      router.push('/home');
    } else {
      // User is not authenticated, redirect to signin page
      router.push('/signin');
    }
  };

  const defaultClassName = "inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg";

  return (
    <button
      onClick={handleClick}
      className={className || defaultClassName}
    >
      {children}
    </button>
  );
}