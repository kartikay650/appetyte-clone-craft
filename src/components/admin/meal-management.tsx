import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, IndianRupee, Clock, Pencil, Trash2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { formatTime, formatDate, isMealEditable } from "@/lib/utils/time"

interface Meal {
  id: string
  provider_id: string
  date: string
  meal_type: string
  option_1: string
  option_2?: string | null
  price: number
  cut_off_time: string
  created_at: string
}

interface MealManagementProps {
  meals: Meal[]
  onMealUpdate: () => void
}

export function MealManagement({ meals, onMealUpdate }: MealManagementProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [deleteConfirmMealId, setDeleteConfirmMealId] = useState<string | null>(null)
  const [newMeal, setNewMeal] = useState({
    date: new Date().toISOString().split("T")[0],
    meal_type: "breakfast" as const,
    option_1: "",
    option_2: "",
    price: "",
    cut_off_time: "08:30",
  })

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMeal.option_1 || !newMeal.price) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add meals",
        variant: "destructive",
      })
      return
    }

    if (editingMeal) {
      // Update existing meal
      const { error } = await supabase
        .from('meals')
        .update({
          date: newMeal.date,
          meal_type: newMeal.meal_type,
          option_1: newMeal.option_1,
          option_2: newMeal.option_2 || null,
          price: Number.parseFloat(newMeal.price),
          cut_off_time: newMeal.cut_off_time,
        })
        .eq('id', editingMeal.id)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update meal",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Meal updated successfully",
        description: `${newMeal.meal_type} for ${formatDate(newMeal.date)} has been updated`,
      })
    } else {
      // Insert new meal
      const { error } = await supabase
        .from('meals')
        .insert({
          provider_id: user.id,
          date: newMeal.date,
          meal_type: newMeal.meal_type,
          option_1: newMeal.option_1,
          option_2: newMeal.option_2 || null,
          price: Number.parseFloat(newMeal.price),
          cut_off_time: newMeal.cut_off_time,
        })

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add meal",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Meal added successfully",
        description: `${newMeal.meal_type} for ${formatDate(newMeal.date)} has been added`,
      })
    }

    setNewMeal({
      date: new Date().toISOString().split("T")[0],
      meal_type: "breakfast",
      option_1: "",
      option_2: "",
      price: "",
      cut_off_time: "08:30",
    })
    setShowAddForm(false)
    setEditingMeal(null)
    onMealUpdate()
  }

  const startEditMeal = (meal: Meal) => {
    setEditingMeal(meal)
    setNewMeal({
      date: meal.date,
      meal_type: meal.meal_type as any,
      option_1: meal.option_1,
      option_2: meal.option_2 || "",
      price: meal.price.toString(),
      cut_off_time: meal.cut_off_time,
    })
    setShowAddForm(true)
  }

  const handleDeleteMeal = async (mealId: string) => {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete meal",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Meal deleted successfully",
      description: "The meal has been removed",
    })

    setDeleteConfirmMealId(null)
    onMealUpdate()
  }

  const cancelEdit = () => {
    setEditingMeal(null)
    setShowAddForm(false)
    setNewMeal({
      date: new Date().toISOString().split("T")[0],
      meal_type: "breakfast",
      option_1: "",
      option_2: "",
      price: "",
      cut_off_time: "08:30",
    })
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

  // Separate active and history meals
  const activeMeals = sortedMeals.filter(meal => isMealEditable(meal.date, meal.cut_off_time))
  const historyMeals = sortedMeals.filter(meal => !isMealEditable(meal.date, meal.cut_off_time))

  const renderMealCard = (meal: Meal, showActions: boolean) => (
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
          {showActions && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => startEditMeal(meal)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteConfirmMealId(meal.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
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
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Meal Management</h3>
        <Button onClick={() => { setShowAddForm(!showAddForm); if (showAddForm) cancelEdit(); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Meal
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingMeal ? "Edit Meal" : "Add New Meal"}</CardTitle>
            <CardDescription>
              {editingMeal ? "Update meal details" : "Create a new meal option for your customers"}
            </CardDescription>
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
                <Button type="submit">{editingMeal ? "Update Meal" : "Add Meal"}</Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Meals</TabsTrigger>
          <TabsTrigger value="history">Meal History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {activeMeals.map((meal) => renderMealCard(meal, true))}
            
            {activeMeals.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No active meals</p>
                  <p className="text-sm text-muted-foreground mt-1">Add a new meal to get started</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <div className="grid gap-4">
            {historyMeals.map((meal) => renderMealCard(meal, false))}
            
            {historyMeals.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No meal history yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Past meals will appear here</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteConfirmMealId !== null} onOpenChange={(open) => !open && setDeleteConfirmMealId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meal? This action cannot be undone and will remove it from all customer portals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirmMealId && handleDeleteMeal(deleteConfirmMealId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
