import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-food.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
          Discover Your Next
          <br />
          Favorite Meal
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Find the best restaurants, cafes, and hidden gems in your area. 
          Share your food journey with friends.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 bg-card p-2 rounded-lg shadow-medium">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search for restaurants, cuisines, or locations..."
                className="pl-10 border-0 focus-visible:ring-0"
              />
            </div>
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
