import { useEffect, useState } from "react";
import { authAPI } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DebugPurchases = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check purchases table
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .limit(5);

      // Check notifications table  
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .limit(5);

      // Check if farmer has purchases
      const { data: farmerPurchases, error: farmerError } = await supabase
        .from('purchases')
        .select('*')
        .eq('farmer_id', user?.id || '');

      setDebugInfo({
        currentUser: user?.id,
        totalPurchases: purchases?.length || 0,
        totalNotifications: notifications?.length || 0,
        farmerPurchases: farmerPurchases?.length || 0,
        purchasesError,
        notificationsError,
        farmerError,
        samplePurchases: purchases,
        sampleNotifications: notifications
      });
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo({ error: error.message });
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted p-4 rounded overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};

export default DebugPurchases;