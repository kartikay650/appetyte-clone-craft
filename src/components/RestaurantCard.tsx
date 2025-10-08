import { Star, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RestaurantCardProps {
  image: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  location: string;
  time: string;
  tags?: string[];
}

export const RestaurantCard = ({
  image,
  name,
  cuisine,
  rating,
  reviews,
  location,
  time,
  tags = [],
}: RestaurantCardProps) => {
  return (
    <Card className="group overflow-hidden hover:shadow-medium transition-all duration-300 cursor-pointer">
      <div className="relative overflow-hidden aspect-square">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-background/90 backdrop-blur-sm text-foreground">
            <Star className="h-3 w-3 fill-primary text-primary mr-1" />
            {rating}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{cuisine}</p>
          </div>
          <span className="text-xs text-muted-foreground">
            {reviews} reviews
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {location}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {time}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
