import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authAPI, batchesAPI } from '@/api/client';
import { toast } from 'sonner';
import { Leaf, LogOut, ArrowLeft } from 'lucide-react';

const CreateBatch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    herbName: '',
    harvestDate: '',
    quantityKg: '',
    farmingConditions: '',
    moistureLevel: '',
    pricePerKg: '',
    purityReportUrl: '',
    images: [] as string[]
  });

  const herbOptions = [
    'Turmeric', 'Ginger', 'Neem', 'Ashwagandha', 'Tulsi', 
    'Brahmi', 'Amla', 'Fenugreek', 'Cardamom', 'Black Pepper'
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const currentUser = authAPI.getUser();
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    setUser(currentUser);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const result = await batchesAPI.create({
        herbName: formData.herbName,
        harvestDate: formData.harvestDate,
        quantityKg: parseFloat(formData.quantityKg),
        farmingConditions: formData.farmingConditions || undefined,
        moistureLevel: formData.moistureLevel ? parseFloat(formData.moistureLevel) : undefined,
        pricePerKg: formData.pricePerKg ? parseFloat(formData.pricePerKg) : undefined,
        purityReportUrl: formData.purityReportUrl || undefined,
        images: formData.images.length > 0 ? formData.images : undefined
      });

      if (result.success) {
        toast.success('Batch created successfully!');
        navigate('/farmer');
      } else {
        throw new Error(result.message || 'Failed to create batch');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
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
              <h1 className="text-3xl font-bold">Create New Batch</h1>
              <p className="text-muted-foreground">Add your herb batch for approval</p>
            </div>
          </div>

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
                      placeholder="Enter quantity in kg"
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
                      placeholder="Enter price per kg"
                      value={formData.pricePerKg}
                      onChange={(e) => setFormData({...formData, pricePerKg: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="farmingConditions">Farming Conditions</Label>
                  <Textarea 
                    id="farmingConditions" 
                    placeholder="Describe farming methods, soil conditions, weather, etc."
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
                      placeholder="Enter moisture percentage"
                      value={formData.moistureLevel}
                      onChange={(e) => setFormData({...formData, moistureLevel: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="purityReportUrl">Purity Report URL</Label>
                    <Input 
                      id="purityReportUrl" 
                      type="url"
                      placeholder="Link to purity test report"
                      value={formData.purityReportUrl}
                      onChange={(e) => setFormData({...formData, purityReportUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="images">Product Images (URLs)</Label>
                  <Textarea 
                    id="images" 
                    placeholder="Enter image URLs separated by commas"
                    value={formData.images.join(', ')}
                    onChange={(e) => setFormData({...formData, images: e.target.value.split(',').map(url => url.trim()).filter(url => url)})}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload images to cloud storage and paste URLs here
                  </p>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="button" variant="outline" onClick={() => navigate('/farmer')} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !formData.herbName || !formData.harvestDate || !formData.quantityKg}
                    className="flex-1"
                  >
                    {loading ? 'Creating...' : 'Create Batch'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateBatch;
