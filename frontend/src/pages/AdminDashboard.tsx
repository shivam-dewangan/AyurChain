import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { authAPI, adminAPI } from "@/api/client";
import { toast } from "sonner";
import { Leaf, LogOut, Users, Package, CheckCircle, XCircle, Clock, Eye, MapPin, Phone, Mail, FileText, Globe } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import BatchQRCode from "@/components/BatchQRCode";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [pendingFarmers, setPendingFarmers] = useState<any[]>([]);
  const [pendingBatches, setPendingBatches] = useState<any[]>([]);
  const [allPurchases, setAllPurchases] = useState<any[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [farmerDetailOpen, setFarmerDetailOpen] = useState(false);

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
      console.log('Admin dashboard result:', result);
      
      if (result.success) {
        console.log('Pending farmers:', result.data?.pendingFarmers);
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
    console.log('handleApproveFarmer called with:', farmerId);
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

  const handleViewFarmerDetails = (farmer: any) => {
    setSelectedFarmer(farmer);
    setFarmerDetailOpen(true);
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
                  <Card key={farmer._id || farmer.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{farmer.userId?.fullName || farmer.fullName || farmer.user?.fullName || farmer.user?.full_name || 'N/A'}</CardTitle>
                          <CardDescription>{farmer.farmName || farmer.farm_name}</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleViewFarmerDetails(farmer)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm">Farmer ID: {farmer._id || farmer.id || 'NO ID!'}</p>
                        <p className="text-sm">Farm Location: {farmer.farmLocation || farmer.farm_location || 'N/A'}</p>
                        <div className="flex gap-2 pt-4">
                          <Button onClick={() => handleApproveFarmer(farmer._id || farmer.id)} className="flex-1" disabled={approving === (farmer._id || farmer.id)}>
                            Approve
                          </Button>
                          <Button variant="destructive" onClick={() => handleRejectFarmer(farmer._id || farmer.id)} className="flex-1" disabled={approving === (farmer._id || farmer.id)}>
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
                  <Card key={batch._id || batch.id}>
                    <CardHeader>
                      <CardTitle>{batch.herbName || batch.herb_name}</CardTitle>
                      <CardDescription>Batch: {batch.batchNumber || batch.batch_number}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm">Quantity: {batch.quantityKg || batch.quantity_kg} kg</p>
                        <Button onClick={() => handleApproveBatch(batch._id || batch.id)} className="w-full">
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

        {/* Farmer Detail Dialog */}
        <Dialog open={farmerDetailOpen} onOpenChange={setFarmerDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Farmer Profile Details
              </DialogTitle>
              <DialogDescription>
                Review the farmer's information before approving or rejecting
              </DialogDescription>
            </DialogHeader>
            
            {selectedFarmer && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{selectedFarmer.userId?.fullName || selectedFarmer.fullName || selectedFarmer.user?.fullName || selectedFarmer.user?.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedFarmer.phoneNumber || selectedFarmer.phone || selectedFarmer.user?.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedFarmer.emailAddress || selectedFarmer.email || selectedFarmer.user?.email || 'N/A'}
                      </p>
                    </div>
                    {(selectedFarmer.farmerAge || selectedFarmer.farmer_age) && (
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p className="font-medium">{selectedFarmer.farmerAge || selectedFarmer.farmer_age} years</p>
                      </div>
                    )}
                    {(selectedFarmer.farmingExperience || selectedFarmer.farming_experience) && (
                      <div>
                        <p className="text-sm text-muted-foreground">Farming Experience</p>
                        <p className="font-medium">{selectedFarmer.farmingExperience || selectedFarmer.farming_experience} years</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Farm Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Farm Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Farm Name</p>
                      <p className="font-medium">{selectedFarmer.farmName || selectedFarmer.farm_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Farm Size</p>
                      <p className="font-medium">{selectedFarmer.farmSize || selectedFarmer.farm_size || 'N/A'} acres</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Farm Location</p>
                      <p className="font-medium flex items-start gap-1">
                        <MapPin className="h-4 w-4 mt-0.5" />
                        {selectedFarmer.farmLocation || selectedFarmer.farm_location || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Primary Crop</p>
                      <p className="font-medium">{selectedFarmer.primaryCrop || selectedFarmer.primary_crop || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Annual Production</p>
                      <p className="font-medium">{selectedFarmer.annualProduction || selectedFarmer.annual_production || 'N/A'} kg</p>
                    </div>
                  </div>
                </div>

                {/* Farm Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Farm Details</h3>
                  <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Soil Type</p>
                      <p className="font-medium">{(selectedFarmer.soilType || selectedFarmer.soil_type || 'N/A').toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Water Source</p>
                      <p className="font-medium">{(selectedFarmer.waterSource || selectedFarmer.water_source || 'N/A').toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Irrigation Method</p>
                      <p className="font-medium">{(selectedFarmer.irrigationMethod || selectedFarmer.irrigation_method || 'N/A').toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                {(selectedFarmer.certifications || []).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Certifications & Herbs</h3>
                    <div className="flex flex-wrap gap-2 bg-muted/30 p-4 rounded-lg">
                      {(selectedFarmer.certifications || []).map((cert: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{cert}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </h3>
                  <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                    {(selectedFarmer.landProofUrl || selectedFarmer.land_proof_url) && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <a 
                          href={selectedFarmer.landProofUrl || selectedFarmer.land_proof_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Land Proof Document
                        </a>
                      </div>
                    )}
                    {(selectedFarmer.aadhaarUrl || selectedFarmer.aadhaar_url) && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <a 
                          href={selectedFarmer.aadhaarUrl || selectedFarmer.aadhaar_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Aadhaar Document
                        </a>
                      </div>
                    )}
                    {(selectedFarmer.organicCertUrl || selectedFarmer.organic_cert_url) && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <a 
                          href={selectedFarmer.organicCertUrl || selectedFarmer.organic_cert_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Organic Certificate
                        </a>
                      </div>
                    )}
                    {(!selectedFarmer.landProofUrl && !selectedFarmer.land_proof_url && !selectedFarmer.aadhaarUrl && !selectedFarmer.aadhaar_url && !selectedFarmer.organicCertUrl && !selectedFarmer.organic_cert_url) && (
                      <p className="text-sm text-muted-foreground">No documents uploaded</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      handleApproveFarmer(selectedFarmer._id || selectedFarmer.id);
                      setFarmerDetailOpen(false);
                    }} 
                    className="flex-1"
                    disabled={approving === (selectedFarmer._id || selectedFarmer.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Farmer
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      handleRejectFarmer(selectedFarmer._id || selectedFarmer.id);
                      setFarmerDetailOpen(false);
                    }} 
                    className="flex-1"
                    disabled={approving === (selectedFarmer._id || selectedFarmer.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Farmer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
