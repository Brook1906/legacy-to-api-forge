import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Package, Users, ShoppingCart, Truck, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MicroserviceCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  downloadName: string;
}

const MicroservicesSection = () => {
  const { toast } = useToast();

  const microservices: MicroserviceCard[] = [
    {
      title: "Customer Service",
      description: "Handle customer data, profiles, and authentication",
      icon: <Users className="h-6 w-6" />,
      downloadName: "customer-service.zip"
    },
    {
      title: "Order Service",
      description: "Process orders, payments, and order history",
      icon: <ShoppingCart className="h-6 w-6" />,
      downloadName: "order-service.zip"
    },
    {
      title: "Inventory Service",
      description: "Manage product catalog and stock levels",
      icon: <Package className="h-6 w-6" />,
      downloadName: "inventory-service.zip"
    },
    {
      title: "Shipping Service",
      description: "Handle logistics, tracking, and delivery",
      icon: <Truck className="h-6 w-6" />,
      downloadName: "shipping-service.zip"
    }
  ];

  const handleDownload = (serviceName: string) => {
    toast({
      title: "Download started",
      description: `${serviceName} microservice template is being prepared for download.`,
    });

    // Simulate download preparation
    setTimeout(() => {
      toast({
        title: "Download ready",
        description: `${serviceName} template is ready. Check your downloads folder.`,
      });
    }, 2000);
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-primary" />
          Microservices Suggestions
        </CardTitle>
        <CardDescription>
          Preview how your monolithic AS/400 workflows can be split into microservices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {microservices.map((service, index) => (
            <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {service.icon}
                  </div>
                  {service.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(service.title)}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MicroservicesSection;