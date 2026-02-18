import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { authAPI } from '@/api/client';
import { toast } from 'sonner';
import { Leaf, LogOut, ArrowLeft, Save, History } from 'lucide-react';
import BatchTimeline from '@/components/BatchTimeline';

const BatchUpdate = () => {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const [loading, setLoading] = useState(false);
  const [batch, setBatch] = useState(null);
  const [formData, setFormData] = useState({
    herbName: '',
    harvestDate: '',
    quantityKg: '',
    farmingConditions: '',
    moistureLevel: '',
    pricePerKg: '',
    purityReportUrl: '',
    images: [],
    status: ''
  });

  const herbOptions = [
    'Turmeric', 'Ginger', 'Neem', 'Ashwagandha', 'Tulsi', 
    'Brahmi', 'Amla', 'Fenugreek', 'Cardamom', 'Black Pepper'
  ];

  const statusOptions = [
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'ready_for_sale', label: 'Ready for Sale' },
    { value: 'sold', label: 'Sold' }
  ];

  useEffect(() => {
    if (batchId) {
      fetchBatch();
    }
  }, [batchId]);

  const fetchBatch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('id', batchId)
        .eq('farmer_id', user.id)
        .single();

      if (error) throw error;

      setBatch(data);
      setFormData({
        herbName: data.herb_name,
        harvestDate: data.harvest_date,
        quantityKg: data.quantity_kg.toString(),
        farmingConditions: data.farming_conditions || '',
        moistureLevel: data.moisture_level?.toString() || '',
        pricePerKg: data.price_per_kg?.toString() || '',
        purityReportUrl: data.purity_report_url || '',
        images: data.images || [],
        status: data.status
      });
    } catch (error) {
      toast.error('Failed to load batch');
      navigate('/farmer');
    }
  };

  const logChange = async (field, oldValue, newValue) => {
    try {
      await supabase
        .from('batch_changes')
        .insert({
          batch_id: batchId,
          field_name: field,
          old_value: oldValue?.toString() || null,
          new_value: newValue?.toString() || null,
          changed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log change:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batch) return;

    setLoading(true);
    try {
      const updates = {};
      const changes = [];

      // Check for changes and log them
      if (formData.herbName !== batch.herb_name) {
        updates.herb_name = formData.herbName;
        changes.push({ field: 'herb_name', old: batch.herb_name, new: formData.herbName });
      }
      if (formData.harvestDate !== batch.harvest_date) {
        updates.harvest_date = formData.harvestDate;
        changes.push({ field: 'harvest_date', old: batch.harvest_date, new: formData.harvestDate });
      }
      if (parseFloat(formData.quantityKg) !== batch.quantity_kg) {
        updates.quantity_kg = parseFloat(formData.quantityKg);
        changes.push({ field: 'quantity_kg', old: batch.quantity_kg, new: formData.quantityKg });
      }
      if (formData.farmingConditions !== (batch.farming_conditions || '')) {
        updates.farming_conditions = formData.farmingConditions || null;
        changes.push({ field: 'farming_conditions', old: batch.farming_conditions, new: formData.farmingConditions });
      }
      if (formData.moistureLevel !== (batch.moisture_level?.toString() || '')) {
        updates.moisture_level = formData.moistureLevel ? parseFloat(formData.moistureLevel) : null;
        changes.push({ field: 'moisture_level', old: batch.moisture_level, new: formData.moistureLevel });
      }
      if (formData.pricePerKg !== (batch.price_per_kg?.toString() || '')) {
        updates.price_per_kg = formData.pricePerKg ? parseFloat(formData.pricePerKg) : null;
        changes.push({ field: 'price_per_kg', old: batch.price_per_kg, new: formData.pricePerKg });
      }
      if (formData.purityReportUrl !== (batch.purity_report_url || '')) {
        updates.purity_report_url = formData.purityReportUrl || null;
        changes.push({ field: 'purity_report_url', old: batch.purity_report_url, new: formData.purityReportUrl });
      }
      if (JSON.stringify(formData.images) !== JSON.stringify(batch.images || [])) {
        updates.images = formData.images.length > 0 ? formData.images : null;
        changes.push({ field: 'images', old: batch.images, new: formData.images });
      }

      if (Object.keys(updates).length === 0) {
        toast.info('No changes to save');
        return;
      }

      updates.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('batches')
        .update(updates)
        .eq('id', batchId);

      if (error) throw error;

      // Log all changes
      for (const change of changes) {
        await logChange(change.field, change.old, change.new);
      }

      toast.success('Batch updated successfully!');
      navigate('/farmer');
    } catch (error) {
      toast.error(error.message || 'Failed to update batch');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!batch) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            <span className="text-2xl font-bold">AyurChain</span>
          </div>
          <Button variant="outline" onClick={handleLogout} className="bg-background/10 border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" onClick={() => navigate('/farmer')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Update Batch</h1>
              <p className="text-muted-foreground">Batch: {batch.batch_number}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Batch Status</CardTitle>
                    <Badge variant={batch.status === 'ready_for_sale' ? 'default' : 'outline'}>
                      {batch.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p>{new Date(batch.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Updated</p>
                      <p>{new Date(batch.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Batch Information</CardTitle>
                </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="herbName">Herb Name *</Label>
                      <Select value={formData.herbName} onValueChange={(value) => setFormData({...formData, herbName: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select herb" />
                        </SelectTrigger>
                        <SelectContent>
                          {herbOptions.map((herb) => (
                            <SelectItem key={herb} value={herb}>{herb}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="harvestDate">Harvest Date *</Label>
                      <Input 
                        id="harvestDate" 
                        type="date"
                        value={formData.harvestDate}
                        onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantityKg">Quantity (kg) *</Label>
                      <Input 
                        id="quantityKg" 
                        type="number" 
                        step="0.01"
                        value={formData.quantityKg}
                        onChange={(e) => setFormData({...formData, quantityKg: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pricePerKg">Price per kg (₹)</Label>
                      <Input 
                        id="pricePerKg" 
                        type="number" 
                        step="0.01"
                        value={formData.pricePerKg}
                        onChange={(e) => setFormData({...formData, pricePerKg: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="farmingConditions">Farming Conditions</Label>
                    <Textarea 
                      id="farmingConditions" 
                      value={formData.farmingConditions}
                      onChange={(e) => setFormData({...formData, farmingConditions: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="moistureLevel">Moisture Level (%)</Label>
                      <Input 
                        id="moistureLevel" 
                        type="number" 
                        step="0.1"
                        value={formData.moistureLevel}
                        onChange={(e) => setFormData({...formData, moistureLevel: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="purityReportUrl">Purity Report URL</Label>
                      <Input 
                        id="purityReportUrl" 
                        type="url"
                        value={formData.purityReportUrl}
                        onChange={(e) => setFormData({...formData, purityReportUrl: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="images">Product Images (URLs)</Label>
                    <Textarea 
                      id="images" 
                      value={formData.images.join(', ')}
                      onChange={(e) => setFormData({...formData, images: e.target.value.split(',').map(url => url.trim()).filter(url => url)})}
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button type="button" variant="outline" onClick={() => navigate('/farmer')} className="flex-1">
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
                </CardContent>
              </Card>
            </div>
            
            {/* Timeline Sidebar */}
            <div className="lg:col-span-1">
              <BatchTimeline batchId={batchId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchUpdate;

