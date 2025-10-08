import { RestaurantCard } from "./RestaurantCard";
import restaurant1 from "@/assets/restaurant-1.jpg";
import restaurant2 from "@/assets/restaurant-2.jpg";
import restaurant3 from "@/assets/restaurant-3.jpg";
import restaurant4 from "@/assets/restaurant-4.jpg";
import restaurant5 from "@/assets/restaurant-5.jpg";
import restaurant6 from "@/assets/restaurant-6.jpg";

const restaurants = [
  {
    image: restaurant1,
    name: "Bella Italia",
    cuisine: "Italian • Pizza",
    rating: 4.8,
    reviews: 342,
    location: "Downtown",
    time: "30-40 min",
    tags: ["Family Friendly", "Outdoor Seating"],
  },
  {
    image: restaurant2,
    name: "Sakura Sushi",
    cuisine: "Japanese • Sushi",
    rating: 4.9,
    reviews: 521,
    location: "East Side",
    time: "25-35 min",
    tags: ["Fresh Fish", "Modern"],
  },
  {
    image: restaurant3,
    name: "Artisan Coffee Co.",
    cuisine: "Cafe • Bakery",
    rating: 4.7,
    reviews: 289,
    location: "City Center",
    time: "15-25 min",
    tags: ["Cozy", "WiFi"],
  },
  {
    image: restaurant4,
    name: "The Prime Cut",
    cuisine: "Steakhouse • Fine Dining",
    rating: 4.9,
    reviews: 478,
    location: "Uptown",
    time: "45-60 min",
    tags: ["Romantic", "Premium"],
  },
  {
    image: restaurant5,
    name: "Taco Fiesta",
    cuisine: "Mexican • Street Food",
    rating: 4.6,
    reviews: 654,
    location: "West End",
    time: "20-30 min",
    tags: ["Casual", "Spicy"],
  },
  {
    image: restaurant6,
    name: "Le Petit Bistro",
    cuisine: "French • Cafe",
    rating: 4.8,
    reviews: 412,
    location: "Old Town",
    time: "35-45 min",
    tags: ["Authentic", "Charming"],
  },
];

export const RestaurantGrid = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Popular Near You</h2>
          <button className="text-primary hover:underline font-medium">
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.name} {...restaurant} />
          ))}
        </div>
      </div>
    </section>
  );
};
