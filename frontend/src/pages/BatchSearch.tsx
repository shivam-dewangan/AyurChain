import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { authAPI, batchesAPI, profilesAPI } from '@/api/client';
import { toast } from 'sonner';
import { Search, User, MapPin, FileText, Package, Calendar, Phone, Mail } from 'lucide-react';
import BatchTimeline from '@/components/BatchTimeline';

const BatchSearch = () => {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [batchData, setBatchData] = useState<any>(null);
  const [farmerData, setFarmerData] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error('Please enter a batch ID');
      return;
    }

    setLoading(true);
    try {
      // Search for batch using MongoDB API (by batch number)
      const result = await batchesAPI.getByBatchNumber(searchId.trim());
      
      if (!result.success || !result.data) {
        toast.error('Batch not found');
        setBatchData(null);
        setFarmerData(null);
        return;
      }

      const batch = result.data;
      setBatchData(batch);

      // Get farmer profile
      if (batch.farmerId) {
        const farmerResult = await profilesAPI.getFarmerProfile(batch.farmerId);
        if (farmerResult.success && farmerResult.data) {
          setFarmerData(farmerResult.data);
        } else {
          setFarmerData(null);
        }
      } else {
        setFarmerData(null);
      }

      toast.success('Batch found successfully!');
    } catch (error: any) {
      toast.error('Search failed');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Batch Information Search</h1>
          <p className="text-lg text-muted-foreground">
            Search for complete batch and farmer information using batch ID
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Batch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter batch ID (e.g., BATCH-20241201-001)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {batchData && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Batch Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Batch Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Batch Number</p>
                      <p className="font-medium">{batchData.batchNumber || batchData.batch_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Herb Name</p>
                      <p className="font-medium">{batchData.herbName || batchData.herb_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline">
                        {(batchData.status || '').replace(/_/g, ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quantity</p>
                      <p className="font-medium">{batchData.quantityKg || batchData.quantity_kg} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Harvest Date</p>
                      <p className="font-medium">{new Date(batchData.harvestDate || batchData.harvest_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price per kg</p>
                      <p className="font-medium">₹{batchData.pricePerKg || batchData.price_per_kg || 'N/A'}</p>
                    </div>
                    {(batchData.moistureLevel || batchData.moisture_level) && (
                      <div>
                        <p className="text-sm text-muted-foreground">Moisture Level</p>
                        <p className="font-medium">{batchData.moistureLevel || batchData.moisture_level}%</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">{new Date(batchData.createdAt || batchData.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {(batchData.farmingConditions || batchData.farming_conditions) && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Farming Conditions</p>
                      <p className="text-sm bg-muted p-3 rounded">{batchData.farmingConditions || batchData.farming_conditions}</p>
                    </div>
                  )}

                  {(batchData.purityReportUrl || batchData.purity_report_url) && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Purity Report</p>
                      <a 
                        href={batchData.purityReportUrl || batchData.purity_report_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View Purity Report
                      </a>
                    </div>
                  )}

                  {(batchData.images || []).length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Product Images</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {(batchData.images || []).map((img: string, idx: number) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Batch ${idx + 1}`}
                            className="rounded border object-cover aspect-square w-full h-24"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Farmer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Farmer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!farmerData ? (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Farmer Account Not Found</p>
                      <p className="text-muted-foreground text-sm mb-4">
                        The farmer who created this batch is no longer in the system.
                      </p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                        <p className="text-sm text-red-800">
                          <strong>Farmer ID:</strong> {batchData.farmerId || batchData.farmer_id}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          This could mean the farmer account was deleted or there was a data issue.
                        </p>
                      </div>
                    </div>
                  ) : !farmerData.farmName ? (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Incomplete Profile</p>
                        <p className="text-sm text-yellow-700">
                          This farmer has only basic account information. Detailed farm profile is not available.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium">{farmerData.userId?.fullName || farmerData.full_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{farmerData.phoneNumber || farmerData.phone || farmerData.phone_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Role</p>
                          <p className="font-medium">FARMER</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Registered</p>
                          <p className="font-medium">{farmerData.createdAt ? new Date(farmerData.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          💡 <strong>Note:</strong> This farmer needs to complete their profile to show farm details, documents, and other information.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{farmerData.userId?.fullName || farmerData.full_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {farmerData.phoneNumber || farmerData.phone || farmerData.phone_number || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {farmerData.emailAddress || farmerData.email_address || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Farm Name</p>
                        <p className="font-medium">{farmerData.farmName || farmerData.farm_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Farm Size</p>
                        <p className="font-medium">{farmerData.farmSize || farmerData.farm_size || 'N/A'} acres</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Approval Status</p>
                        <Badge variant={(farmerData.approvalStatus || farmerData.approval_status) === 'approved' ? 'default' : 'outline'}>
                          {(farmerData.approvalStatus || farmerData.approval_status)?.toUpperCase()}
                        </Badge>
                      </div>
                      {(farmerData.farmerAge || farmerData.farmer_age) && (
                        <div>
                          <p className="text-sm text-muted-foreground">Age</p>
                          <p className="font-medium">{farmerData.farmerAge || farmerData.farmer_age} years</p>
                        </div>
                      )}
                      {(farmerData.farmingExperience || farmerData.farming_experience) && (
                        <div>
                          <p className="text-sm text-muted-foreground">Farming Experience</p>
                          <p className="font-medium">{farmerData.farmingExperience || farmerData.farming_experience} years</p>
                        </div>
                      )}
                      {(farmerData.soilType || farmerData.soil_type) && (
                        <div>
                          <p className="text-sm text-muted-foreground">Soil Type</p>
                          <p className="font-medium">{(farmerData.soilType || farmerData.soil_type).replace('_', ' ').toUpperCase()}</p>
                        </div>
                      )}
                      {(farmerData.waterSource || farmerData.water_source) && (
                        <div>
                          <p className="text-sm text-muted-foreground">Water Source</p>
                          <p className="font-medium">{(farmerData.waterSource || farmerData.water_source).replace('_', ' ').toUpperCase()}</p>
                        </div>
                      )}
                      {(farmerData.irrigationMethod || farmerData.irrigation_method) && (
                        <div>
                          <p className="text-sm text-muted-foreground">Irrigation Method</p>
                          <p className="font-medium">{(farmerData.irrigationMethod || farmerData.irrigation_method).replace('_', ' ').toUpperCase()}</p>
                        </div>
                      )}
                      {(farmerData.primaryCrop || farmerData.primary_crop) && (
                        <div>
                          <p className="text-sm text-muted-foreground">Primary Crop</p>
                          <p className="font-medium">{farmerData.primaryCrop || farmerData.primary_crop}</p>
                        </div>
                      )}
                      {(farmerData.annualProduction || farmerData.annual_production) && (
                        <div>
                          <p className="text-sm text-muted-foreground">Annual Production</p>
                          <p className="font-medium">{farmerData.annualProduction || farmerData.annual_production} kg</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Registered</p>
                        <p className="font-medium">{farmerData.createdAt ? new Date(farmerData.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Farm Location</p>
                      <p className="text-sm bg-muted p-3 rounded flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {farmerData.farmLocation || farmerData.farm_location}
                      </p>
                      {(farmerData.gpsLatitude || farmerData.gps_latitude) && (farmerData.gpsLongitude || farmerData.gps_longitude) && (
                        <p className="text-xs text-muted-foreground mt-2">
                          GPS: {farmerData.gpsLatitude || farmerData.gps_latitude}°N, {farmerData.gpsLongitude || farmerData.gps_longitude}°E
                        </p>
                      )}
                    </div>

                    {(farmerData.completeAddress || farmerData.complete_address) && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Complete Address</p>
                        <p className="text-sm bg-muted p-3 rounded">
                          {farmerData.completeAddress || farmerData.complete_address}
                        </p>
                      </div>
                    )}

                    {(farmerData.cropRotation || farmerData.crop_rotation) && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Crop Rotation Pattern</p>
                        <p className="text-sm bg-muted p-3 rounded">
                          {farmerData.cropRotation || farmerData.crop_rotation}
                        </p>
                      </div>
                    )}

                    {(farmerData.certifications || []).length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Certifications</p>
                        <div className="flex flex-wrap gap-2">
                          {(farmerData.certifications || []).map((cert: string, idx: number) => (
                            <Badge key={idx} variant="secondary">{cert}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(farmerData.farmingPractices || farmerData.farming_practices || []).length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Farming Practices</p>
                        <div className="flex flex-wrap gap-2">
                          {(farmerData.farmingPractices || farmerData.farming_practices || []).map((practice: string, idx: number) => (
                            <Badge key={idx} variant="outline">{practice}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(farmerData.processingCapabilities || farmerData.processing_capabilities || []).length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Processing Capabilities</p>
                        <div className="flex flex-wrap gap-2">
                          {(farmerData.processingCapabilities || farmerData.processing_capabilities || []).map((capability: string, idx: number) => (
                            <Badge key={idx} variant="secondary">{capability}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">Documents</p>
                      <div className="space-y-2">
                        {(farmerData.landProofUrl || farmerData.land_proof_url) && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <a 
                              href={farmerData.landProofUrl || farmerData.land_proof_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              Land Proof Document
                            </a>
                          </div>
                        )}
                        {(farmerData.aadhaarUrl || farmerData.aadhaar_url) && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <a 
                              href={farmerData.aadhaarUrl || farmerData.aadhaar_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              Aadhaar Document
                            </a>
                          </div>
                        )}
                        {(farmerData.organicCertUrl || farmerData.organic_cert_url) && (
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <a 
                              href={farmerData.organicCertUrl || farmerData.organic_cert_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-sm"
                            >
                              Organic Certificate
                            </a>
                          </div>
                        )}
                        {!farmerData.landProofUrl && !farmerData.land_proof_url && !farmerData.aadhaarUrl && !farmerData.aadhaar_url && !farmerData.organicCertUrl && !farmerData.organic_cert_url && (
                          <p className="text-sm text-muted-foreground">No documents uploaded</p>
                        )}
                      </div>
                      
                      {(farmerData.farmPhotosUrls || farmerData.farm_photos_urls || []).length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Farm Photos</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {(farmerData.farmPhotosUrls || farmerData.farm_photos_urls || []).map((photo: string, idx: number) => (
                              <img
                                key={idx}
                                src={photo}
                                alt={`Farm ${idx + 1}`}
                                className="rounded border object-cover aspect-square w-full h-20"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Timeline Sidebar */}
            <div className="lg:col-span-1">
              <BatchTimeline batchId={batchData._id || batchData.id} />
            </div>
          </div>
        )}

        {/* No Results */}
        {!batchData && !loading && searchId && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">No batch found</p>
              <p className="text-muted-foreground">
                Please check the batch ID and try again
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BatchSearch;