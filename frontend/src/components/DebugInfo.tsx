import { useEffect, useState } from 'react';
import { authAPI } from '@/api/client';

const DebugInfo = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('checking...');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      url: import.meta.env.VITE_SUPABASE_URL,
      hasKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      keyLength: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.length || 0,
    });

    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          setConnectionStatus(`Error: ${error.message}`);
        } else {
          setConnectionStatus('Connected successfully');
        }
      } catch (err: any) {
        setConnectionStatus(`Connection failed: ${err.message}`);
      }
    };

    testConnection();
  }, []);

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div className="space-y-1">
        <div>Status: {connectionStatus}</div>
        <div>URL: {envVars.url}</div>
        <div>Has Key: {envVars.hasKey ? 'Yes' : 'No'}</div>
        <div>Key Length: {envVars.keyLength}</div>
      </div>
    </div>
  );
};

export default DebugInfo;