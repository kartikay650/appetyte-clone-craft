import { Pizza, Coffee, Utensils, IceCream, Wine, Soup } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { icon: Pizza, label: "Italian", color: "hover:text-primary" },
  { icon: Coffee, label: "Cafe", color: "hover:text-primary" },
  { icon: Utensils, label: "Fine Dining", color: "hover:text-primary" },
  { icon: IceCream, label: "Desserts", color: "hover:text-primary" },
  { icon: Wine, label: "Bar", color: "hover:text-primary" },
  { icon: Soup, label: "Asian", color: "hover:text-primary" },
];

export const CategoryFilter = () => {
  return (
    <section className="py-12 border-b">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <Button
              key={category.label}
              variant="outline"
              className="flex items-center gap-2 transition-all hover:border-primary hover:shadow-soft"
            >
              <category.icon className={`h-5 w-5 ${category.color}`} />
              {category.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};
