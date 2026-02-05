import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authAPI, adminAPI } from "@/api/client";
import { toast } from "sonner";
import { Leaf, LogOut, Users, Package, CheckCircle, XCircle, Clock } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import BatchQRCode from "@/components/BatchQRCode";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [pendingFarmers, setPendingFarmers] = useState<any[]>([]);
  const [pendingBatches, setPendingBatches] = useState<any[]>([]);
  const [allPurchases, setAllPurchases] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = authAPI.getUser();
      if (!currentUser) {
        navigate("/auth");
        return;
      }

      const result = await adminAPI.getDashboard();
      if (result.success) {
        setPendingFarmers(result.data?.pendingFarmers || []);
        setPendingBatches(result.data?.pendingBatches || []);
        setAllPurchases(result.data?.purchases || []);
      }
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveFarmer = async (farmerId: string) => {
    setApproving(farmerId);
    try {
      const result = await adminAPI.approveFarmer(farmerId);
      if (result.success) {
        toast.success("Farmer approved successfully!");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to approve farmer");
    } finally {
      setApproving(null);
    }
  };

  const handleRejectFarmer = async (farmerId: string) => {
    setApproving(farmerId);
    try {
      const result = await adminAPI.rejectFarmer(farmerId);
      if (result.success) {
        toast.success("Farmer rejected");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to reject farmer");
    } finally {
      setApproving(null);
    }
  };

  const handleApproveBatch = async (batchId: string) => {
    try {
      const result = await adminAPI.approveBatch(batchId);
      if (result.success) {
        toast.success("Batch approved for sale!");
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to approve batch");
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            <span className="text-2xl font-bold">AyurChain Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout} className="bg-background/10 border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage farmer registrations, batch approvals, and purchases</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{pendingFarmers.length}</div>
                  <p className="text-sm text-muted-foreground">Pending Farmers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{pendingBatches.length}</div>
                  <p className="text-sm text-muted-foreground">Pending Batches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{allPurchases.length}</div>
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="farmers" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="farmers">Farmers</TabsTrigger>
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
          </TabsList>

          <TabsContent value="farmers" className="space-y-4">
            <h2 className="text-2xl font-bold">Pending Farmer Approvals</h2>
            
            {pendingFarmers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No pending approvals</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingFarmers.map((farmer) => (
                  <Card key={farmer.id}>
                    <CardHeader>
                      <CardTitle>{farmer.fullName || farmer.user?.full_name}</CardTitle>
                      <CardDescription>{farmer.farmName || farmer.farm_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm">Farm Location: {farmer.farmLocation || farmer.farm_location}</p>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={() => handleApproveFarmer(farmer.id)} className="flex-1" disabled={approving === farmer.id}>
                            Approve
                          </Button>
                          <Button variant="destructive" onClick={() => handleRejectFarmer(farmer.id)} className="flex-1" disabled={approving === farmer.id}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="batches" className="space-y-4">
            <h2 className="text-2xl font-bold">Pending Batch Approvals</h2>
            
            {pendingBatches.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No pending batches</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pendingBatches.map((batch) => (
                  <Card key={batch.id}>
                    <CardHeader>
                      <CardTitle>{batch.herbName || batch.herb_name}</CardTitle>
                      <CardDescription>Batch: {batch.batchNumber || batch.batch_number}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm">Quantity: {batch.quantityKg || batch.quantity_kg} kg</p>
                        <Button onClick={() => handleApproveBatch(batch.id)} className="w-full">
                          Approve for Sale
                        </Button>
                        <BatchQRCode batchNumber={batch.batchNumber || batch.batch_number} herbName={batch.herbName || batch.herb_name} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchases" className="space-y-4">
            <h2 className="text-2xl font-bold">All Purchases</h2>
            
            {allPurchases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No purchases yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allPurchases.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="pt-6">
                      <p className="font-medium">{purchase.batch?.herb_name || purchase.batch?.herbName}</p>
                      <p className="text-sm text-muted-foreground">Amount: ₹{purchase.totalAmount || purchase.total_amount}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
