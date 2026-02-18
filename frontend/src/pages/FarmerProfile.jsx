import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { authAPI, profilesAPI } from '@/api/client';
import { toast } from 'sonner';
import { 
  User, 
  MapPin, 
  Upload, 
  FileText, 
  Check, 
  Camera,
  Leaf,
  Globe,
  LogOut
} from 'lucide-react';

const FarmerProfile = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    age: '',
    experience: '',
    address: '',
    farmName: '',
    farmLocation: '',
    farmSize: '',
    primaryCrop: '',
    annualProduction: '',
    soilType: '',
    waterSource: '',
    irrigation: '',
    farmingPractices: [],
    gpsLatitude: '',
    gpsLongitude: '',
    cropRotation: '',
    processingCapabilities: [],
    landProofUrl: '',
    aadhaarUrl: '',
    organicCertUrl: '',
    farmPhotosUrls: [],
    certifications: []
  });

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Farm Details', icon: Leaf },
    { id: 3, title: 'Documents Upload', icon: FileText },
    { id: 4, title: 'Certifications', icon: Check }
  ];

  const herbCategories = [
    'Turmeric', 'Ginger', 'Neem', 'Ashwagandha', 'Tulsi', 
    'Brahmi', 'Amla', 'Fenugreek', 'Cardamom', 'Black Pepper'
  ];

  const certificationOptions = [
    'Organic Certification', 'Natural Farming', 'Biodynamic', 
    'Traditional Methods', 'Sustainable Farming', 'Integrated Farming'
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const user = authAPI.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
  };

  const handleLogout = async () => {
    authAPI.logout();
    navigate('/');
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!formData.farmName.trim()) {
      toast.error('Farm name is required');
      return;
    }
    if (!formData.farmLocation.trim()) {
      toast.error('Farm location is required');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Complete address is required');
      return;
    }

    setLoading(true);
    try {
      console.log('Submitting farmer profile...');
      const result = await profilesAPI.createFarmerProfile({
        farmName: formData.farmName.trim(),
        farmLocation: formData.farmLocation.trim(),
        farmSize: formData.farmSize ? parseFloat(formData.farmSize) : undefined,
        soilType: formData.soilType || 'Not Specified',
        waterSource: formData.waterSource || 'Not Specified',
        irrigationMethod: formData.irrigation || 'Not Specified',
        farmingPractices: formData.farmingPractices && formData.farmingPractices.length > 0 ? formData.farmingPractices : ['Traditional'],
        primaryCrop: formData.primaryCrop || 'Not Specified',
        annualProduction: formData.annualProduction ? parseFloat(formData.annualProduction) : undefined,
        cropRotation: formData.cropRotation || 'Not Specified',
        processingCapabilities: formData.processingCapabilities && formData.processingCapabilities.length > 0 ? formData.processingCapabilities : [],
        certifications: formData.certifications && formData.certifications.length > 0 ? formData.certifications : [],
        landProofUrl: formData.landProofUrl?.trim() || undefined,
        aadhaarUrl: formData.aadhaarUrl?.trim() || undefined,
        organicCertUrl: formData.organicCertUrl?.trim() || undefined,
        farmPhotosUrls: formData.farmPhotosUrls && formData.farmPhotosUrls.length > 0 ? formData.farmPhotosUrls : [],
        gpsLatitude: formData.gpsLatitude ? parseFloat(formData.gpsLatitude) : undefined,
        gpsLongitude: formData.gpsLongitude ? parseFloat(formData.gpsLongitude) : undefined,
        farmerAge: formData.age ? parseInt(formData.age) : undefined,
        farmingExperience: formData.experience ? parseInt(formData.experience) : undefined,
        completeAddress: formData.address.trim(),
        phoneNumber: formData.phone?.trim() || '',
        emailAddress: formData.email?.trim() || ''
      });

      console.log('Submit result:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to submit profile');
      }

      toast.success('Profile submitted for approval! Redirecting...');
      setTimeout(() => {
        navigate('/farmer');
      }, 1500);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to submit profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input 
                  id="fullName" 
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="Age"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="experience">Farming Experience (years)</Label>
                <Input 
                  id="experience" 
                  type="number" 
                  placeholder="Years of experience"
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Complete Address *</Label>
              <Textarea 
                id="address" 
                placeholder="Enter your complete address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="farmName">Farm Name *</Label>
                <Input 
                  id="farmName" 
                  placeholder="Enter your farm name"
                  value={formData.farmName}
                  onChange={(e) => setFormData({...formData, farmName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="farmSize">Farm Size (acres) *</Label>
                <Input 
                  id="farmSize" 
                  type="number" 
                  placeholder="Total farm area"
                  value={formData.farmSize}
                  onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="farmLocation">Farm Location *</Label>
              <Textarea 
                id="farmLocation" 
                placeholder="Enter complete farm address with landmarks"
                value={formData.farmLocation}
                onChange={(e) => setFormData({...formData, farmLocation: e.target.value})}
              />
            </div>
            <div className="bg-muted/30 rounded-lg p-6 text-center">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">GPS Location (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Latitude"
                  value={formData.gpsLatitude}
                  onChange={(e) => setFormData({...formData, gpsLatitude: e.target.value})}
                />
                <Input 
                  placeholder="Longitude"
                  value={formData.gpsLongitude}
                  onChange={(e) => setFormData({...formData, gpsLongitude: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="soilType">Soil Type</Label>
                <Select value={formData.soilType} onValueChange={(value) => setFormData({...formData, soilType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clay">Clay</SelectItem>
                    <SelectItem value="loam">Loam</SelectItem>
                    <SelectItem value="sandy">Sandy</SelectItem>
                    <SelectItem value="red-laterite">Red Laterite</SelectItem>
                    <SelectItem value="black-cotton">Black Cotton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="waterSource">Water Source</Label>
                <Select value={formData.waterSource} onValueChange={(value) => setFormData({...formData, waterSource: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Primary water source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borewell">Borewell</SelectItem>
                    <SelectItem value="canal">Canal</SelectItem>
                    <SelectItem value="river">River</SelectItem>
                    <SelectItem value="rainwater">Rainwater</SelectItem>
                    <SelectItem value="pond">Pond</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="irrigation">Irrigation Method</Label>
                <Select value={formData.irrigation} onValueChange={(value) => setFormData({...formData, irrigation: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Irrigation method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drip">Drip Irrigation</SelectItem>
                    <SelectItem value="sprinkler">Sprinkler</SelectItem>
                    <SelectItem value="flood">Flood Irrigation</SelectItem>
                    <SelectItem value="furrow">Furrow Irrigation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="primaryCrop">Primary Crop</Label>
                <Select value={formData.primaryCrop} onValueChange={(value) => setFormData({...formData, primaryCrop: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {herbCategories.map((herb) => (
                      <SelectItem key={herb} value={herb}>{herb}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="annualProduction">Expected Annual Production (kg)</Label>
              <Input 
                id="annualProduction" 
                type="number" 
                placeholder="Annual production"
                value={formData.annualProduction}
                onChange={(e) => setFormData({...formData, annualProduction: e.target.value})}
              />
            </div>
            <div>
              <Label>Farming Practices</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {['Organic', 'Natural', 'Biodynamic', 'Traditional', 'Sustainable', 'Integrated'].map((practice) => (
                  <div key={practice} className="flex items-center space-x-2">
                    <Checkbox 
                      id={practice}
                      checked={formData.farmingPractices.includes(practice)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({...formData, farmingPractices: [...formData.farmingPractices, practice]});
                        } else {
                          setFormData({...formData, farmingPractices: formData.farmingPractices.filter(p => p !== practice)});
                        }
                      }}
                    />
                    <Label htmlFor={practice} className="text-sm">{practice}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="cropRotation">Crop Rotation Pattern</Label>
              <Textarea 
                id="cropRotation" 
                placeholder="Describe your crop rotation practices and seasonal patterns"
                value={formData.cropRotation}
                onChange={(e) => setFormData({...formData, cropRotation: e.target.value})}
              />
            </div>
            <div>
              <Label>On-Farm Processing Capabilities</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {['Washing', 'Drying', 'Grinding', 'Packaging'].map((process) => (
                  <div key={process} className="flex items-center space-x-2">
                    <Checkbox 
                      id={process}
                      checked={formData.processingCapabilities.includes(process)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({...formData, processingCapabilities: [...formData.processingCapabilities, process]});
                        } else {
                          setFormData({...formData, processingCapabilities: formData.processingCapabilities.filter(p => p !== process)});
                        }
                      }}
                    />
                    <Label htmlFor={process} className="text-sm">{process}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Aadhaar Card', field: 'aadhaarUrl', required: true },
                { label: 'Land Ownership Documents', field: 'landProofUrl', required: true },
                { label: 'Organic Certification', field: 'organicCertUrl', required: false },
                { label: 'Farm Photos URLs', field: 'farmPhotosUrls', required: false, isArray: true }
              ].map((doc) => (
                <div key={doc.label} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="font-medium">{doc.label}</Label>
                    {doc.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  </div>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Paste document URL
                    </p>
                    {doc.isArray ? (
                      <Textarea 
                        placeholder="Enter URLs separated by commas"
                        className="mt-4"
                        value={formData.farmPhotosUrls.join(', ')}
                        onChange={(e) => setFormData({...formData, farmPhotosUrls: e.target.value.split(',').map(url => url.trim()).filter(url => url)})}
                      />
                    ) : (
                      <Input 
                        type="url" 
                        placeholder="Paste document URL"
                        className="mt-4"
                        value={formData[doc.field]}
                        onChange={(e) => setFormData({...formData, [doc.field]: e.target.value})}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-accent/50 rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-2 flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                Document Guidelines
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Upload documents to cloud storage (Google Drive, Dropbox, etc.)</li>
                <li>• Make sure URLs are publicly accessible</li>
                <li>• For farm photos, include wide shots and close-ups</li>
                <li>• All documents should be clear and readable</li>
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-semibold">Select Herbs You Cultivate</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose all the Ayurvedic herbs you currently grow or plan to grow
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {herbCategories.map((herb) => (
                  <div key={herb} className="flex items-center space-x-2 p-3 border border-border rounded-lg hover:bg-accent/50 transition-all">
                    <Checkbox 
                      id={herb}
                      checked={formData.certifications.includes(herb)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({...formData, certifications: [...formData.certifications, herb]});
                        } else {
                          setFormData({...formData, certifications: formData.certifications.filter(c => c !== herb)});
                        }
                      }}
                    />
                    <Label htmlFor={herb} className="text-sm cursor-pointer">{herb}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-base font-semibold">Certifications (Optional)</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select any certifications you have or farming methods you follow
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {certificationOptions.map((cert) => (
                  <div key={cert} className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                    <Checkbox 
                      id={cert}
                      checked={formData.certifications.includes(cert)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({...formData, certifications: [...formData.certifications, cert]});
                        } else {
                          setFormData({...formData, certifications: formData.certifications.filter(c => c !== cert)});
                        }
                      }}
                    />
                    <Label htmlFor={cert} className="text-sm cursor-pointer">{cert}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Ready to Submit</h3>
              <p className="text-sm text-muted-foreground">
                Your profile will be reviewed by our admin team. You'll receive approval notification within 2-3 business days.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-green-600 text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            <span className="text-2xl font-bold">AyurChain</span>
          </div>
          <Button variant="outline" onClick={handleLogout} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Complete Your Farmer Profile
          </h1>
          <p className="text-xl text-muted-foreground">
            Join our network of verified Ayurvedic herb farmers
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                    isCompleted 
                      ? 'bg-green-600 border-green-600 text-white' 
                      : isCurrent 
                        ? 'border-green-600 text-green-600 bg-white' 
                        : 'border-gray-400 text-gray-400 bg-white'
                  }`}>
                    {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`hidden sm:block w-16 md:w-24 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-600' : 'bg-border'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div key={step.id} className="text-center max-w-24">
                <p className="text-xs text-muted-foreground hidden sm:block">{step.title}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-6 w-6 text-green-600" })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              Step {currentStep} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep === steps.length ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !formData.fullName || !formData.farmName || !formData.farmLocation}
                  className="px-8 bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </Button>
              ) : (
                <Button onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                  Continue
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FarmerProfile;

