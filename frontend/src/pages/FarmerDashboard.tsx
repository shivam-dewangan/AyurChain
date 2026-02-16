import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authAPI, batchesAPI, purchasesAPI, profilesAPI } from "@/api/client";
import { toast } from "sonner";
import { Leaf, Plus, LogOut, Package, CheckCircle, Clock, AlertCircle, Edit, MoreVertical, Eye, Trash2, Copy, History, Brain, Scissors, Sparkles, Sun } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import PurchasesList from "@/components/PurchasesList";
import AIQualityAnalysis from "@/components/AIQualityAnalysis";
import { ThemeToggle } from "@/components/ThemeToggle";
import ProfileDropdown from "@/components/ProfileDropdown";
import SearchFilters, { FilterState } from "@/components/SearchFilters";
import BatchQRCode from "@/components/BatchQRCode";

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [farmerDetails, setFarmerDetails] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [batchTimeline, setBatchTimeline] = useState<any[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({});

  const normalizeBatch = (batch: any) => ({
    id: batch._id || batch.id,
    batch_number: batch.batchNumber || batch.batch_number,
    herb_name: batch.herbName || batch.herb_name,
    quantity_kg: batch.quantityKg || batch.quantity_kg,
    available_quantity_kg: batch.availableQuantityKg ?? batch.available_quantity_kg ?? batch.quantityKg ?? batch.quantity_kg,
    sold_quantity_kg: batch.soldQuantityKg ?? batch.sold_quantity_kg ?? 0,
    harvest_date: batch.harvestDate || batch.harvest_date,
    price_per_kg: batch.pricePerKg || batch.price_per_kg,
    status: batch.status,
    images: batch.images || [],
  });

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
      setUser(currentUser);

      // Fetch farmer details
      const farmerResult = await profilesAPI.getFarmerProfile();
      if (farmerResult.success && farmerResult.data) {
        setFarmerDetails(farmerResult.data);
      }

      // Fetch batches
      const batchesResult = await batchesAPI.getAll();
      if (batchesResult.success) {
        const normalizedBatches = (batchesResult.data || []).map(normalizeBatch);
        setBatches(normalizedBatches);
        setFilteredBatches(normalizedBatches);
      }
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (query: string, filterState: FilterState) => {
    let filtered = [...batches];

    if (query) {
      filtered = filtered.filter(batch => 
        batch.herb_name?.toLowerCase().includes(query.toLowerCase()) ||
        batch.batch_number?.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filterState.status) {
      filtered = filtered.filter(batch => batch.status === filterState.status);
    }

    if (filterState.minQuantity) {
      filtered = filtered.filter(batch => batch.quantity_kg >= filterState.minQuantity!);
    }
    if (filterState.maxQuantity) {
      filtered = filtered.filter(batch => batch.quantity_kg <= filterState.maxQuantity!);
    }

    setFilteredBatches(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, filters);
  };

  const handleFilter = (filterState: FilterState) => {
    setFilters(filterState);
    applyFilters(searchQuery, filterState);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({});
    setFilteredBatches(batches);
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigate("/");
  };

  const getAllStatuses = () => {
    return [
      'pending_approval',
      'approved_by_admin', 
      'approved',
      'harvested',
      'processing',
      'cleaning',
      'drying',
      'ready_for_sale',
      'sold',
      'packaging',
      'shipped',
      'delivered'
    ];
  };

  const getNextStatus = (currentStatus: string) => {
    const statuses = getAllStatuses();
    const currentIndex = statuses.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statuses.length - 1) {
      return null; // No next status available
    }
    return statuses[currentIndex + 1];
  };

  const getStatusLabel = (status: string | undefined | null) => {
    if (!status) return 'Unknown Status';
    const labels: Record<string, string> = {
      pending_approval: 'Batch Created',
      approved_by_admin: 'Approved by Admin',
      approved: 'Approved',
      harvested: 'Harvested',
      processing: 'Processing',
      cleaning: 'Cleaning',
      drying: 'Drying',
      ready_for_sale: 'Ready to Sell',
      sold: 'Sold',
      packaging: 'Packaging',
      shipped: 'Shipped',
      delivered: 'Delivered'
    };
    return labels[status] || status.replace(/_/g, ' ');
  };

  const handleStatusUpdate = async () => {
    if (!selectedBatch || !newStatus) {
      toast.error('Invalid batch selected');
      return;
    }
    
    // Validate batch ID
    const batchId = selectedBatch.id || selectedBatch._id;
    if (!batchId) {
      toast.error('Invalid batch ID');
      return;
    }

    try {
      const result = await batchesAPI.updateStatus(batchId, newStatus);
      if (result.success) {
        toast.success('Status updated successfully!');
        setStatusDialogOpen(false);
        fetchData();
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!batchId || batchId === 'undefined' || batchId === 'null') {
      toast.error('Invalid batch ID');
      return;
    }
    if (!confirm('Are you sure you want to delete this batch?')) return;

    try {
      const result = await batchesAPI.delete(batchId);
      if (result.success) {
        toast.success('Batch deleted successfully!');
        fetchData();
      } else {
        toast.error(result.message || 'Failed to delete batch');
      }
    } catch (error: any) {
      toast.error('Failed to delete batch');
    }
  };

  const copyBatchNumber = (batchNumber: string) => {
    navigator.clipboard.writeText(batchNumber);
    toast.success('Batch number copied!');
  };

  const fetchBatchTimeline = async (batchId: string) => {
    if (!batchId || batchId === 'undefined' || batchId === 'null') {
      toast.error('Invalid batch ID');
      return;
    }
    try {
      const result = await batchesAPI.getTimeline(batchId);
      if (result.success) {
        setBatchTimeline(result.data);
      } else {
        toast.error(result.message || 'Failed to load timeline');
      }
    } catch (error: any) {
      toast.error('Failed to load timeline');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      pending_approval: { label: "Batch Created", variant: "outline", icon: Clock },
      approved_by_admin: { label: "Approved by Admin", variant: "outline", icon: CheckCircle },
      approved: { label: "Approved", variant: "outline", icon: CheckCircle },
      harvested: { label: "Harvested", variant: "secondary", icon: Package },
      processing: { label: "Processing", variant: "secondary", icon: Scissors },
      cleaning: { label: "Cleaning", variant: "secondary", icon: Sparkles },
      drying: { label: "Drying", variant: "secondary", icon: Sun },
      ready_for_sale: { label: "Ready to Sell", variant: "default", icon: Package },
      sold: { label: "Sold", variant: "secondary", icon: CheckCircle },
      packaging: { label: "Packaging", variant: "secondary", icon: Package },
      shipped: { label: "Shipped", variant: "secondary", icon: Package },
      delivered: { label: "Delivered", variant: "default", icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig.pending_approval;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
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
            <span className="text-2xl font-bold">AyurChain</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ProfileDropdown userRole="farmer" />
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
          <h1 className="text-3xl font-bold mb-2">Farmer Dashboard</h1>
          <p className="text-muted-foreground">Manage your herb batches and track your earnings</p>
        </div>

        {!farmerDetails ? (
          <Card className="mb-8 border-warning bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Complete Your Profile
              </CardTitle>
              <CardDescription>
                You need to complete your farmer profile and get approved before creating batches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/farmer/profile")}>
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        ) : farmerDetails.approvalStatus === "pending" ? (
          <Card className="mb-8 border-warning bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Approval Pending
              </CardTitle>
              <CardDescription>
                Your farmer registration is under review. You'll be able to create batches once approved.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : farmerDetails.approvalStatus === "rejected" ? (
          <Card className="mb-8 border-destructive bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Registration Rejected
              </CardTitle>
              <CardDescription>
                Your farmer registration was not approved. Please update your details and resubmit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => navigate("/farmer/profile")}>
                Update Profile
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-success bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Approved Farmer
              </CardTitle>
              <CardDescription>
                You're approved to create and manage herb batches
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{batches.length}</div>
              <p className="text-sm text-muted-foreground">Total Batches</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {batches.filter(b => b.status === "pending_approval").length}
              </div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {batches.filter(b => b.status === "ready_for_sale").length}
              </div>
              <p className="text-sm text-muted-foreground">Ready for Sale</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {batches.filter(b => b.status === "sold").length}
              </div>
              <p className="text-sm text-muted-foreground">Sold</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="batches" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="batches">My Batches</TabsTrigger>
            <TabsTrigger value="purchases">Sales History</TabsTrigger>
            <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="batches" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Batches</h2>
              {farmerDetails?.approvalStatus === "approved" && (
                <Button onClick={() => navigate("/farmer/create-batch")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Batch
                </Button>
              )}
            </div>

            <SearchFilters 
              onSearch={handleSearch}
              onFilter={handleFilter}
              onClear={handleClearFilters}
            />

            {filteredBatches.length === 0 && batches.length > 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No batches match your filters</p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : batches.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No batches yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.map((batch) => (
                  <Card key={batch.id || batch._id || batch.batchNumber || batch.batch_number} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg">{batch.herbName || batch.herb_name}</CardTitle>
                        {getStatusBadge(batch.status)}
                      </div>
                      <CardDescription>Batch: {batch.batchNumber || batch.batch_number}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Quantity:</span>
                          <span className="font-medium">{batch.quantityKg || batch.quantity_kg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="font-medium text-green-600">
                            {batch.availableQuantityKg ?? batch.available_quantity_kg ?? batch.quantityKg ?? batch.quantity_kg} kg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sold:</span>
                          <span className="font-medium text-blue-600">
                            {batch.soldQuantityKg ?? batch.sold_quantity_kg ?? 0} kg
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Harvest Date:</span>
                          <span className="font-medium">
                            {batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString() : batch.harvest_date ? new Date(batch.harvest_date).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        {(batch.pricePerKg || batch.price_per_kg) && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Price/kg:</span>
                            <span className="font-medium">₹{batch.pricePerKg || batch.price_per_kg}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/farmer/batch/${batch.id || batch._id}`)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        
                        <BatchQRCode 
                          batchNumber={batch.batchNumber || batch.batch_number}
                          herbName={batch.herbName || batch.herb_name}
                        />
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => {
                              setSelectedBatch(batch);
                              setNewStatus(batch.status);
                              setStatusDialogOpen(true);
                            }}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyBatchNumber(batch.batchNumber || batch.batch_number)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Batch ID
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedBatch(batch);
                              fetchBatchTimeline(batch.id || batch._id);
                              setTimelineDialogOpen(true);
                            }}>
                              <History className="h-4 w-4 mr-2" />
                              View Timeline
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteBatch(batch.id || batch._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="purchases" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Sales History</h2>
            </div>
            <PurchasesList />
          </TabsContent>
          
          <TabsContent value="ai-analysis" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Brain className="h-6 w-6" />
                AI Quality Analysis
              </h2>
            </div>
            {batches.length > 0 ? (
              <AIQualityAnalysis 
                batchId={batches[0].id}
                herbName="General"
                showHeader={true}
                onAnalysisComplete={(analysis) => {
                  toast.success(`AI analysis completed - insights can be applied to all batches`);
                }}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">No batches available for analysis</p>
                  <Button onClick={() => navigate("/farmer/create-batch")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Batch
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Batch Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Batch: {selectedBatch?.batch_number}
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Status:</span>
                  <Badge variant="outline">{getStatusLabel(selectedBatch?.status)}</Badge>
                </div>
              </div>
              
              {/* Status Selection Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select New Status:</label>
                <Select 
                  value={newStatus} 
                  onValueChange={(value) => setNewStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved_by_admin">Approved by Admin</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="harvested">Harvested</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="drying">Drying</SelectItem>
                    <SelectItem value="ready_for_sale">Ready to Sell</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStatusDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleStatusUpdate} 
                  className="flex-1"
                  disabled={!newStatus}
                >
                  Update Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={timelineDialogOpen} onOpenChange={setTimelineDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Batch Status Timeline</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Batch: {selectedBatch?.batch_number}
                </p>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {batchTimeline.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No status changes recorded yet
                  </p>
                ) : (
                  batchTimeline.map((change, index) => {
                    const isLast = index === batchTimeline.length - 1;
                    return (
                      <div key={change._id || change.id || `timeline-${index}`} className="relative flex items-start gap-4">
                        {!isLast && (
                          <div className="absolute left-4 top-8 w-0.5 h-12 bg-border" />
                        )}
                        
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                          <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium">
                              {change.new_value?.replace(/_/g, ' ').toUpperCase()}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {change.old_value ? 'Updated' : 'Initial'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(change.changed_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setTimelineDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FarmerDashboard;
