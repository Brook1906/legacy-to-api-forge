import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Database, Settings, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  currentPage?: string;
}

const Header = ({ currentPage = "home" }: HeaderProps) => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-gradient-primary text-primary-foreground shadow-elegant">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Database className="h-8 w-8 text-primary-foreground" />
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
            
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-foreground/10 rounded-lg">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 border-primary-foreground/20 gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                variant="secondary"
                asChild
                className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 gap-2"
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;