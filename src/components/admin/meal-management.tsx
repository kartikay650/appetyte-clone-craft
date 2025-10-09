import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, IndianRupee, Clock } from "lucide-react"
import { dataStore } from "@/lib/data-store"
import { useToast } from "@/hooks/use-toast"
import { formatTime, formatDate } from "@/lib/utils/time"
import type { Meal } from "@/lib/types"

interface MealManagementProps {
  meals: Meal[]
  onMealUpdate: () => void
}

export function MealManagement({ meals, onMealUpdate }: MealManagementProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMeal, setNewMeal] = useState({
    date: new Date().toISOString().split("T")[0],
    meal_type: "breakfast" as const,
    option_1: "",
    option_2: "",
    price: "",
    cut_off_time: "08:30",
  })

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMeal.option_1 || !newMeal.price) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    dataStore.addMeal({
      date: newMeal.date,
      meal_type: newMeal.meal_type,
      option_1: newMeal.option_1,
      option_2: newMeal.option_2 || undefined,
      price: Number.parseFloat(newMeal.price),
      cut_off_time: newMeal.cut_off_time,
    })

    toast({
      title: "Meal added successfully",
      description: `${newMeal.meal_type} for ${formatDate(newMeal.date)} has been added`,
    })

    setNewMeal({
      date: new Date().toISOString().split("T")[0],
      meal_type: "breakfast",
      option_1: "",
      option_2: "",
      price: "",
      cut_off_time: "08:30",
    })
    setShowAddForm(false)
    onMealUpdate()
  }

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "lunch":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "dinner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const sortedMeals = [...meals].sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime()
    if (dateCompare !== 0) return dateCompare

    const mealOrder = { breakfast: 1, lunch: 2, dinner: 3 }
    return mealOrder[a.meal_type] - mealOrder[b.meal_type]
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Meal Management</h3>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Meal
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Meal</CardTitle>
            <CardDescription>Create a new meal option for your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newMeal.date}
                    onChange={(e) => setNewMeal({ ...newMeal, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meal_type">Meal Type</Label>
                  <Select
                    value={newMeal.meal_type}
                    onValueChange={(value: any) => setNewMeal({ ...newMeal, meal_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">Breakfast</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="option_1">Option 1 (Required)</Label>
                  <Input
                    id="option_1"
                    value={newMeal.option_1}
                    onChange={(e) => setNewMeal({ ...newMeal, option_1: e.target.value })}
                    placeholder="e.g., Idli Sambar"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="option_2">Option 2 (Optional)</Label>
                  <Input
                    id="option_2"
                    value={newMeal.option_2}
                    onChange={(e) => setNewMeal({ ...newMeal, option_2: e.target.value })}
                    placeholder="e.g., Poha"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newMeal.price}
                    onChange={(e) => setNewMeal({ ...newMeal, price: e.target.value })}
                    placeholder="40"
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cut_off_time">Cut-off Time</Label>
                  <Input
                    id="cut_off_time"
                    type="time"
                    value={newMeal.cut_off_time}
                    onChange={(e) => setNewMeal({ ...newMeal, cut_off_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Add Meal</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {sortedMeals.map((meal) => (
          <Card key={meal.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="capitalize flex items-center gap-2">
                    {meal.meal_type}
                    <Badge className={getMealTypeColor(meal.meal_type)}>{meal.meal_type}</Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span>{formatDate(meal.date)}</span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {meal.price}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Order by {formatTime(meal.cut_off_time)}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Option 1:</strong> {meal.option_1}
                </p>
                {meal.option_2 && (
                  <p className="text-sm">
                    <strong>Option 2:</strong> {meal.option_2}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Meal ID: {meal.id}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedMeals.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No meals created yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first meal to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
