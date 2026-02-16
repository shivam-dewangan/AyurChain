import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Phone, Calendar, Package, Leaf, User, FileText, Shield, QrCode, Download, Printer, Copy, ExternalLink } from "lucide-react";
import { profilesAPI } from "@/api/client";
import { toast } from "sonner";
import { qrService } from "@/services/qrService";
import FarmLocationMap from "@/components/FarmLocationMap";
import BatchQRCode from "@/components/BatchQRCode";

interface BatchDetailsModalProps {
  batch: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hideContactInfo?: boolean;
}

const BatchDetailsModal = ({ batch, open, onOpenChange, hideContactInfo = false }: BatchDetailsModalProps) => {
  const [farmerDetails, setFarmerDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (batch && open) {
      fetchFarmerDetails();
    }
  }, [batch, open]);

  const fetchFarmerDetails = async () => {
    if (!batch?.farmer_id) return;
    
    setLoading(true);
    try {
      const result = await profilesAPI.getFarmerProfile(batch.farmer_id);
      if (result.success && result.data) {
        setFarmerDetails({
          full_name: result.data.userId?.fullName || "Unknown Farmer",
          phone: result.data.userId?.phone || "",
          farm_name: result.data.farmName,
          farm_location: result.data.farmLocation,
          farm_size: result.data.farmSize,
          certifications: result.data.certifications || [],
          primary_crop: result.data.primaryCrop,
          approval_status: "approved",
        });
      } else {
        setFarmerDetails(null);
      }
    } catch (error) {
      console.error('Error fetching farmer details:', error);
      setFarmerDetails(null);
    } finally {
      setLoading(false);
    }
  };

  if (!batch) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready_for_sale': return 'default';
      case 'sold': return 'destructive';
      case 'approved': return 'secondary';
      case 'harvested':
      case 'processing':
      case 'cleaning':
      case 'drying': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Batch Details - {batch.herb_name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Batch Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Batch Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Batch Number</p>
                  <p className="font-medium">{batch.batch_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusColor(batch.status)}>
                    {batch.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Herb Name</p>
                  <p className="font-medium">{batch.herb_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scientific Name</p>
                  <p className="font-medium">{batch.scientific_name || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Quantity</p>
                  <p className="font-medium">{batch.quantity_kg} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price per kg</p>
                  <p className="font-medium text-primary">₹{batch.price_per_kg || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="font-medium text-green-600">
                    {batch.available_quantity_kg !== null ? batch.available_quantity_kg : batch.quantity_kg} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sold</p>
                  <p className="font-medium text-blue-600">
                    {batch.sold_quantity_kg || 0} kg
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground">Harvest Date</p>
                <p className="font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(batch.harvest_date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Farm Location</p>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {batch.farm_location || 'N/A'}
                </p>
              </div>

              {batch.farming_method && (
                <div>
                  <p className="text-sm text-muted-foreground">Farming Method</p>
                  <Badge variant="outline">{batch.farming_method}</Badge>
                </div>
              )}

              {batch.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{batch.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Farmer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Farmer Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading farmer details...</div>
              ) : farmerDetails ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {farmerDetails.full_name?.charAt(0) || 'F'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{farmerDetails.full_name}</p>
                      <p className="text-sm text-muted-foreground">Verified Farmer</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    {!hideContactInfo && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <p className="font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {farmerDetails.phone || farmerDetails.phone_number || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{farmerDetails.email_address || 'N/A'}</p>
                        </div>
                      </>
                    )}

                    <div>
                      <p className="text-sm text-muted-foreground">Farm Name</p>
                      <p className="font-medium">{farmerDetails.farm_name || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Farm Location</p>
                      <p className="text-sm">{farmerDetails.farm_location || 'N/A'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Farm Size</p>
                        <p className="font-medium">{farmerDetails.farm_size || 'N/A'} acres</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Experience</p>
                        <p className="font-medium">{farmerDetails.farming_experience || 'N/A'} years</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Approval Status</p>
                      <Badge variant={farmerDetails.approval_status === 'approved' ? 'default' : 'outline'}>
                        {farmerDetails.approval_status?.toUpperCase() || 'PENDING'}
                      </Badge>
                    </div>

                    {farmerDetails.certifications && Array.isArray(farmerDetails.certifications) && (
                      <div>
                        <p className="text-sm text-muted-foreground">Certifications</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {farmerDetails.certifications.map((cert: string, index: number) => (
                            <Badge key={`cert-${index}`} variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {farmerDetails.farming_practices && Array.isArray(farmerDetails.farming_practices) && (
                      <div>
                        <p className="text-sm text-muted-foreground">Farming Practices</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {farmerDetails.farming_practices.map((practice: string, index: number) => (
                            <Badge key={`practice-${index}`} variant="outline" className="text-xs">
                              {practice}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {farmerDetails.primary_crop && (
                      <div>
                        <p className="text-sm text-muted-foreground">Primary Crop</p>
                        <p className="font-medium">{farmerDetails.primary_crop}</p>
                      </div>
                    )}

                    {farmerDetails.annual_production && (
                      <div>
                        <p className="text-sm text-muted-foreground">Annual Production</p>
                        <p className="font-medium">{farmerDetails.annual_production} kg</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Farmer details not available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Farm Location Map */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Farm Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FarmLocationMap 
              address={farmerDetails?.farm_location || batch.farm_location || farmerDetails?.complete_address || 'Farm Location'}
              farmName={farmerDetails?.farm_name || 'Farm'}
            />
          </CardContent>
        </Card>

        {/* QR Code Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Batch QR Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code to verify batch authenticity and view complete traceability information
              </p>
              <BatchQRCode 
                batchNumber={batch.batch_number}
                herbName={batch.herb_name}
                showInline={true}
              />
              <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      const qrCode = await qrService.generateQRCode(batch.batch_number);
                      qrService.downloadQRCode(batch.batch_number, qrCode);
                      toast.success('QR code downloaded!');
                    } catch (error) {
                      toast.error('Failed to download QR code');
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      const qrCode = await qrService.generateQRCode(batch.batch_number);
                      qrService.printQRCode(batch.batch_number, qrCode);
                    } catch (error) {
                      toast.error('Failed to print QR code');
                    }
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const url = qrService.generateBatchVerificationURL(batch.batch_number);
                    navigator.clipboard.writeText(url);
                    toast.success('Verification URL copied to clipboard!');
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const url = qrService.generateBatchVerificationURL(batch.batch_number);
                    window.open(url, '_blank');
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality & Verification */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quality & Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Quality Grade</p>
                <p className="font-medium">{batch.quality_grade || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Moisture Content</p>
                <p className="font-medium">{batch.moisture_content ? `${batch.moisture_content}%` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purity Level</p>
                <p className="font-medium">{batch.purity_level ? `${batch.purity_level}%` : 'N/A'}</p>
              </div>
            </div>

            {batch.storage_conditions && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Storage Conditions</p>
                <p className="text-sm">{batch.storage_conditions}</p>
              </div>
            )}

            {batch.blockchain_hash && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Blockchain Hash</p>
                <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                  {batch.blockchain_hash}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default BatchDetailsModal;
