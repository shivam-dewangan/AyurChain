import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Shield, TrendingUp, Users, QrCode, Database } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import heroImage from "@/assets/hero-herbs.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-background/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
              <Leaf className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Blockchain-Powered Transparency</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              AyurChain
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Complete Traceability for Ayurvedic Herbs from Farm to Consumer
            </p>
            <p className="text-lg mb-12 text-primary-foreground/80 max-w-2xl mx-auto">
              Building trust through transparency. Track every step of your Ayurvedic herbs journey with immutable blockchain records.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto shadow-lg">
                  Get Started
                </Button>
              </Link>
              <Link to="/verify">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-background/10 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
                  Verify Product
                </Button>
              </Link>
              <Link to="/search">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-background/10 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-background/20">
                  Search Batch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Supply Chain Transparency</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From seed to shelf, every step is verified and recorded on the blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-card shadow-lg border-border/50 hover:shadow-glow transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Farm Registration</h3>
                <p className="text-muted-foreground">
                  Verified farmers with complete KYC and land proof documentation
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-lg border-border/50 hover:shadow-glow transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Verification</h3>
                <p className="text-muted-foreground">
                  Admin-approved batches with purity reports and quality checks
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-lg border-border/50 hover:shadow-glow transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Blockchain Records</h3>
                <p className="text-muted-foreground">
                  Immutable records of every transaction and movement
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-lg border-border/50 hover:shadow-glow transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">QR Tracking</h3>
                <p className="text-muted-foreground">
                  Scan any product to see its complete journey and authenticity
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-lg border-border/50 hover:shadow-glow transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Fair Payments</h3>
                <p className="text-muted-foreground">
                  Automated payment distribution: 80% farmer, 20% platform
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-lg border-border/50 hover:shadow-glow transition-shadow">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multi-Stakeholder</h3>
                <p className="text-muted-foreground">
                  Connecting farmers, companies, admins, and consumers seamlessly
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How AyurChain Works</h2>
            <p className="text-lg text-muted-foreground">
              A simple, transparent process for everyone
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Farmer Registration</h3>
                <p className="text-muted-foreground">
                  Farmers sign up with complete KYC, land proof, and certifications. Admin verifies and approves their registration.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Batch Creation</h3>
                <p className="text-muted-foreground">
                  Approved farmers create herb batches with harvest details, farming conditions, purity reports, and images. All data is recorded on blockchain.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Quality Verification</h3>
                <p className="text-muted-foreground">
                  Admins review each batch, verify quality standards, and approve for marketplace listing with generated QR codes.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Company Purchase</h3>
                <p className="text-muted-foreground">
                  Ayurvedic companies browse approved batches and make purchases. Payments are automatically split: 80% to farmer, 20% to platform.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 h-12 w-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                5
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Consumer Verification</h3>
                <p className="text-muted-foreground">
                  End consumers scan QR codes to view complete traceability: farmer details, harvest date, processing steps, and authenticity verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Ayurvedic Supply Chain?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Join AyurChain today and be part of the transparent, trusted future of Ayurvedic herbs.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="shadow-lg">
              Join AyurChain
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-90">
            © 2025 AyurChain. Building transparency in Ayurvedic supply chain with blockchain technology.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;