import Header from "@/components/Header";
import UploadSection from "@/components/UploadSection";
import SchemaSection from "@/components/SchemaSection";
import ApiSection from "@/components/ApiSection";
import DataViewer from "@/components/DataViewer";
import MicroservicesSection from "@/components/MicroservicesSection";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-primary">
        <div className="absolute inset-0 opacity-10">
          <img 
            src={heroImage} 
            alt="AI-powered legacy modernization" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Transform Legacy Systems with AI
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto">
            Modernize your AS/400, DB2, and mainframe applications with intelligent 
            schema analysis, automated API generation, and microservices architecture guidance.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="space-y-12">
          <UploadSection />
          <SchemaSection />
          <ApiSection />
          <DataViewer />
          <MicroservicesSection />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-8 mt-16">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">
            © 2024 AI-Powered Legacy Modernization Assistant. 
            Transforming enterprise systems for the modern era.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;