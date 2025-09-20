import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface HeaderProps {
  currentPage?: string;
}

const Header = ({ currentPage = "home" }: HeaderProps) => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <header className="bg-gradient-primary text-primary-foreground shadow-elegant">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">AI-Powered Legacy Modernization Assistant</h1>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Button 
              variant={currentPage === "home" ? "secondary" : "ghost"}
              className={currentPage === "home" ? "" : "text-primary-foreground hover:bg-primary-foreground/20"}
            >
              Home
            </Button>
            <Button 
              variant={currentPage === "demo" ? "secondary" : "ghost"}
              className={currentPage === "demo" ? "" : "text-primary-foreground hover:bg-primary-foreground/20"}
            >
              Demo
            </Button>
            <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/20"
                >
                  About
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About Legacy Modernization Assistant</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>
                    Our AI-powered tool helps modernize legacy AS/400, DB2, and mainframe systems 
                    by automatically analyzing your data structures and generating modern APIs.
                  </p>
                  <p>
                    Transform decades-old business logic into cloud-ready microservices with 
                    intelligent schema detection and automated modernization workflows.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;