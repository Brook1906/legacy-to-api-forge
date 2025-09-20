import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gradient-primary text-primary-foreground shadow-elegant">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold hover:opacity-90 transition-opacity">
            AI Legacy Modernization
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button 
                variant="ghost"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                Home
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                variant="secondary"
                className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;