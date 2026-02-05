import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { authAPI, batchesAPI, purchasesAPI } from "@/api/client";
import { toast } from "sonner";
import { Leaf, LogOut, ShoppingCart, Package, Receipt, History, Eye } from "lucide-react";
import BatchTimeline from "@/components/BatchTimeline";
import BatchDetailsModal from "@/components/BatchDetailsModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import ProfileDropdown from "@/components/ProfileDropdown";
import SearchFilters, { FilterState } from "@/components/SearchFilters";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState("");
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  const [timelineBatch, setTimelineBatch] = useState<any>(null);
  const [timelineKey, setTimelineKey] = useState(0);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsBatch, setDetailsBatch] = useState<any>(null);
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [filteredBatches, setFilteredBatches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({});

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscription for batch and purchase changes
    const subscription = supabase
      .channel('company_dashboard_updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'batches' },
        (payload) => {
          console.log('Batch update received:', payload);
          fetchData(); // Refresh data when batch updates
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'purchases' },
        (payload) => {
          console.log('New purchase made:', payload);
          fetchData(); // Refresh data when new purchase is made
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch available batches (show all for viewing, but only ready_for_sale can be purchased)
      const { data: batchesData, error: batchError } = await supabase
        .from("batches")
        .select(`
          *,
          farmer:profiles!batches_farmer_id_fkey(full_name, phone)
        `)
        .in("status", ["pending_approval", "approved", "in_process", "quality_check", "packaging", "ready_for_sale", "shipped", "unavailable"])
        .order("created_at", { ascending: false });

      if (batchError) {
        console.error('Error fetching batches:', batchError);
      }
      console.log('Available batches:', batchesData);

      setAvailableBatches(batchesData || []);
      setFilteredBatches(batchesData || []);

      // Fetch company details
      const { data: companyData } = await supabase
        .from("company_details")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setCompanyDetails(companyData);

      // Fetch my purchases
      const { data: purchasesData } = await supabase
        .from("purchases")
        .select(`
          *,
          batch:batches(herb_name, batch_number, harvest_date),
          farmer:profiles!purchases_farmer_id_fkey(full_name)
        `)
        .eq("company_id", user.id)
        .order("created_at", { ascending: false });

      setMyPurchases(purchasesData || []);
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (query: string, filterState: FilterState) => {
    let filtered = [...availableBatches];

    // Apply search query
    if (query) {
      filtered = filtered.filter(batch => 
        batch.herb_name.toLowerCase().includes(query.toLowerCase()) ||
        batch.batch_number.toLowerCase().includes(query.toLowerCase()) ||
        batch.farmer?.full_name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply status filter
    if (filterState.status) {
      filtered = filtered.filter(batch => batch.status === filterState.status);
    }

    // Apply quantity filters
    if (filterState.minQuantity) {
      filtered = filtered.filter(batch => batch.quantity_kg >= filterState.minQuantity!);
    }
    if (filterState.maxQuantity) {
      filtered = filtered.filter(batch => batch.quantity_kg <= filterState.maxQuantity!);
    }

    // Apply date range filter
    if (filterState.dateRange) {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterState.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(batch => 
        new Date(batch.created_at) >= filterDate
      );
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
    setFilteredBatches(availableBatches);
  };

  const handlePurchase = async () => {
    if (!selectedBatch || !purchaseQuantity) {
      toast.error("Please enter purchase quantity");
      return;
    }

    const quantity = parseFloat(purchaseQuantity);
    // Get actual available quantity, defaulting to total quantity if null/undefined
    const availableQty = (selectedBatch.available_quantity_kg !== null && selectedBatch.available_quantity_kg !== undefined) 
      ? selectedBatch.available_quantity_kg 
      : selectedBatch.quantity_kg;
    
    console.log('Purchase validation:', {
      requested: quantity,
      available: availableQty,
      batch_available_qty: selectedBatch.available_quantity_kg,
      batch_total_qty: selectedBatch.quantity_kg
    });
    
    if (quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    
    if (quantity > availableQty) {
      toast.error(`Only ${availableQty} kg available for purchase. You tried to buy ${quantity} kg.`);
      return;
    }
    
    if (availableQty <= 0) {
      toast.error('This batch is sold out');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const totalAmount = quantity * (selectedBatch.price_per_kg || 0);
      const farmerAmount = totalAmount * 0.8;
      const platformAmount = totalAmount * 0.2;

      console.log('Making purchase:', {
        batch_id: selectedBatch.id,
        quantity_kg: quantity,
        current_available: availableQty
      });
      
      const { error } = await supabase.from("purchases").insert({
        batch_id: selectedBatch.id,
        company_id: user.id,
        farmer_id: selectedBatch.farmer_id,
        quantity_kg: quantity,
        total_amount: totalAmount,
        farmer_amount: farmerAmount,
        platform_amount: platformAmount,
        payment_status: "completed",
      });
      
      console.log('Purchase insert result:', { error });

      if (error) throw error;

      // Manually update inventory (in case trigger doesn't work)
      const newAvailableQty = availableQty - quantity;
      const currentSoldQty = selectedBatch.sold_quantity_kg !== null ? selectedBatch.sold_quantity_kg : 0;
      const newSoldQty = currentSoldQty + quantity;
      const newStatus = newAvailableQty <= 0 ? "unavailable" : "ready_for_sale";
      
      console.log('Updating inventory manually:', {
        batch_id: selectedBatch.id,
        old_available: availableQty,
        new_available: newAvailableQty,
        new_status: newStatus
      });
      
      // Simple update - just change status for now
      const { error: updateError } = await supabase
        .from("batches")
        .update({ 
          status: newStatus
        })
        .eq("id", selectedBatch.id);
        
      console.log('Status update result:', { error: updateError });
        
      if (updateError) {
        console.error('Status update failed:', updateError);
      } else {
        console.log('Status update successful');
      }

      toast.success("Purchase successful!");
      setPurchaseDialogOpen(false);
      setPurchaseQuantity("");
      setSelectedBatch(null);
      
      // Wait a moment for database to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Force refresh data to show updated quantities
      await fetchData();
      
      // Also refresh the specific batch data
      const { data: updatedBatch } = await supabase
        .from('batches')
        .select('*')
        .eq('id', selectedBatch.id)
        .single();
      
      if (updatedBatch) {
        console.log('Updated batch after purchase:', updatedBatch);
        console.log('Available quantity after purchase:', updatedBatch.available_quantity_kg);
        console.log('Sold quantity after purchase:', updatedBatch.sold_quantity_kg);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete purchase");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            <span className="text-2xl font-bold">AyurChain Marketplace</span>
          </div>
          <div className="flex items-center gap-2">
            <ProfileDropdown userRole="company" />
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
          <h1 className="text-3xl font-bold mb-2">Company Dashboard</h1>
          <p className="text-muted-foreground">
            {companyDetails?.company_name ? `Welcome, ${companyDetails.company_name}` : 'Browse and purchase verified Ayurvedic herbs'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{availableBatches.length}</div>
                  <p className="text-sm text-muted-foreground">Available Batches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{myPurchases.length}</div>
                  <p className="text-sm text-muted-foreground">My Purchases</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Batches */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Available Herbs</h2>
          
          <SearchFilters 
            onSearch={handleSearch}
            onFilter={handleFilter}
            onClear={handleClearFilters}
          />
          
          {filteredBatches.length === 0 && availableBatches.length > 0 ? (
            <Card className="mt-6">
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No batches match your filters</p>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : availableBatches.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No batches available</p>
                <p className="text-muted-foreground">Check back later for new herb batches</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {filteredBatches.map((batch) => (
                <Card key={batch.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-lg">{batch.herb_name}</CardTitle>
                      <Badge variant={
                        batch.status === 'ready_for_sale' ? 'default' : 
                        batch.status === 'unavailable' ? 'destructive' :
                        batch.status === 'sold' ? 'secondary' : 'outline'
                      }>
                        {batch.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </div>
                    <CardDescription>From {batch.farmer?.full_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Batch:</span>
                          <span className="font-medium">{batch.batch_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">{batch.quantity_kg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Available:</span>
                          <span className="font-medium text-green-600">
                            {batch.available_quantity} kg
                          </span>
                        </div>
                        {batch.sold_quantity > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sold:</span>
                            <span className="font-medium text-blue-600">
                              {batch.sold_quantity} kg
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Price/kg:</span>
                          <span className="font-medium text-primary">₹{batch.price_per_kg || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Harvest:</span>
                          <span className="font-medium">
                            {new Date(batch.harvest_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="outline" className="text-xs">
                            {batch.status.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            setDetailsBatch(batch);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        
                        <Dialog open={timelineDialogOpen && timelineBatch?.id === batch.id} onOpenChange={(open) => {
                          setTimelineDialogOpen(open);
                          if (!open) setTimelineBatch(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => setTimelineBatch(batch)}
                            >
                              <History className="h-4 w-4 mr-2" />
                              Timeline
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <div className="flex justify-between items-center">
                                <DialogTitle>Batch Timeline - {batch.herb_name}</DialogTitle>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setTimelineKey(prev => prev + 1)}
                                >
                                  Refresh
                                </Button>
                              </div>
                            </DialogHeader>
                            <div className="mt-4">
                              <BatchTimeline key={`${batch.id}-${timelineKey}`} batchId={batch.id} />
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={purchaseDialogOpen && selectedBatch?.id === batch.id} onOpenChange={(open) => {
                          setPurchaseDialogOpen(open);
                          if (!open) setSelectedBatch(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              className="flex-1" 
                              onClick={() => setSelectedBatch(batch)}
                              disabled={batch.status !== 'ready_for_sale' || (batch.available_quantity_kg !== null ? batch.available_quantity_kg : batch.quantity_kg) <= 0}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              {batch.status === 'sold' ? 'Sold Out' :
                               batch.status !== 'ready_for_sale' ? 'Not Available' :
                               (batch.available_quantity_kg !== null ? batch.available_quantity_kg : batch.quantity_kg) <= 0 ? 'Sold Out' : 'Purchase'}
                            </Button>
                          </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Purchase {batch.herb_name}</DialogTitle>
                            <DialogDescription>
                              Enter the quantity you want to purchase (max {(batch.available_quantity_kg !== null && batch.available_quantity_kg !== undefined) ? batch.available_quantity_kg : batch.quantity_kg} kg available)
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Quantity (kg)</Label>
                              <Input
                                id="quantity"
                                type="number"
                                placeholder="Enter quantity"
                                value={purchaseQuantity}
                                onChange={(e) => setPurchaseQuantity(e.target.value)}
                                max={(batch.available_quantity_kg !== null && batch.available_quantity_kg !== undefined) ? batch.available_quantity_kg : batch.quantity_kg}
                                min="0.1"
                                step="0.1"
                              />
                            </div>
                            {purchaseQuantity && batch.price_per_kg && (
                              <div className="bg-muted p-4 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Total Amount:</span>
                                  <span className="font-bold">₹{(parseFloat(purchaseQuantity) * batch.price_per_kg).toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                            <Button onClick={handlePurchase} className="w-full">
                              Confirm Purchase
                            </Button>
                          </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Batch Details Modal */}
        <BatchDetailsModal 
          batch={detailsBatch}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          hideContactInfo={true}
        />

        {/* My Purchases */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Purchases</h2>
          
          {myPurchases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No purchases yet</p>
                <p className="text-muted-foreground">Your purchase history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {myPurchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Herb</p>
                        <p className="font-medium">{purchase.batch?.herb_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Batch</p>
                        <p className="font-medium">{purchase.batch?.batch_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quantity</p>
                        <p className="font-medium">{purchase.quantity_kg} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-medium">₹{purchase.total_amount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">{new Date(purchase.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;