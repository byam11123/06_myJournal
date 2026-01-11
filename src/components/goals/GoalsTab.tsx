'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabsContent } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { Goal, Task } from '@/types'
import { Target, Plus, Edit, Trash2, CheckCircle2, Calendar } from 'lucide-react'

interface GoalsTabProps {
  goals: Goal[]
  tasks: Task[]
  currentUser: { id: string } | null
  isMobile: boolean
  onGoalsChange: (goals: Goal[]) => void
  onAddTimelineEvent: (type: string, title: string, description: string) => void
  onSetSelectedGoalFilter: (goalId: string) => void
  onSetActiveTab: (tab: string) => void
}

export function GoalsTab({
  goals,
  tasks,
  currentUser,
  isMobile,
  onGoalsChange,
  onAddTimelineEvent,
  onSetSelectedGoalFilter,
  onSetActiveTab
}: GoalsTabProps) {
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [goalCategory, setGoalCategory] = useState('')
  const [goalStatus, setGoalStatus] = useState('Active')
  const [goalTargetDate, setGoalTargetDate] = useState('')

  // Calculate goal progress
  const getGoalProgress = (goalId: string) => {
    const goalTasks = tasks.filter(t => t.goalId === goalId)
    if (goalTasks.length === 0) return 0
    const completedTasks = goalTasks.filter(t => t.completed)
    return Math.round((completedTasks.length / goalTasks.length) * 100)
  }

  const handleSaveGoal = async () => {
    if (!goalTitle || !goalCategory) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      })
      return
    }

    if (!currentUser) return

    try {
      if (editingGoal) {
        const res = await fetch(`/api/goals/${editingGoal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: goalTitle,
            description: goalDescription,
            category: goalCategory,
            status: goalStatus,
            targetDate: goalTargetDate
          })
        })

        if (res.ok) {
          const data = await res.json()
          onGoalsChange(goals.map(g => g.id === editingGoal.id ? data.goal : g))
          onAddTimelineEvent('goal_updated', 'Goal Updated', `You updated "${goalTitle}"`)
          toast({ title: 'Goal updated!' })
        }
      } else {
        const res = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            title: goalTitle,
            description: goalDescription,
            category: goalCategory,
            status: goalStatus,
            targetDate: goalTargetDate
          })
        })

        if (res.ok) {
          const data = await res.json()
          onGoalsChange([...goals, data.goal])
          onAddTimelineEvent('goal_created', 'New Goal Created', `You set a goal to "${goalTitle}"`)
          toast({ title: 'Goal created!' })
        }
      }
      resetGoalForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save goal',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        onGoalsChange(goals.filter(g => g.id !== goalId))
        toast({ title: 'Goal deleted!' })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete goal',
        variant: 'destructive'
      })
    }
  }

  const resetGoalForm = () => {
    setEditingGoal(null)
    setGoalTitle('')
    setGoalDescription('')
    setGoalCategory('')
    setGoalStatus('Active')
    setGoalTargetDate('')
    setShowGoalDialog(false)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setGoalTitle(goal.title)
    setGoalDescription(goal.description || '')
    setGoalCategory(goal.category)
    setGoalStatus(goal.status)
    setGoalTargetDate(goal.targetDate || '')
    setShowGoalDialog(true)
  }

  return (
    <TabsContent value="goals" className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Your Goals</h2>
          <p className="text-muted-foreground">Track your long-term objectives</p>
        </div>
        {!isMobile && (
          <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingGoal(null); resetGoalForm(); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                <DialogDescription>Set your target and track your progress</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-title">Title *</Label>
                  <Input
                    id="goal-title"
                    placeholder="e.g., Learn JavaScript"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea
                    id="goal-description"
                    placeholder="Describe your goal..."
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-category">Category *</Label>
                    <Select value={goalCategory} onValueChange={setGoalCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Learning">Learning</SelectItem>
                        <SelectItem value="Career">Career</SelectItem>
                        <SelectItem value="Personal">Personal</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-status">Status</Label>
                    <Select value={goalStatus} onValueChange={setGoalStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-target-date">Target Date</Label>
                  <Input
                    id="goal-target-date"
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetGoalForm}>Cancel</Button>
                  <Button onClick={handleSaveGoal}>{editingGoal ? 'Update' : 'Create'} Goal</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = getGoalProgress(goal.id)
          const goalTasks = tasks.filter(t => t.goalId === goal.id)

          return (
            <Card key={goal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <CardDescription className="mt-1">{goal.description}</CardDescription>
                  </div>
                  <Badge variant={goal.status === 'Active' ? 'default' : goal.status === 'Completed' ? 'secondary' : 'outline'}>
                    {goal.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{goal.category}</Badge>
                  {goal.targetDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  {goalTasks.length} task{goalTasks.length !== 1 ? 's' : ''}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditGoal(goal)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      onSetSelectedGoalFilter(goal.id)
                      onSetActiveTab('tasks')
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    View Tasks ({goalTasks.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {goals.length === 0 && (
        <Card className="p-8 text-center">
          <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No goals yet</h3>
          <p className="text-muted-foreground mb-4">Start by creating your first goal</p>
          <Button onClick={() => setShowGoalDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Goal
          </Button>
        </Card>
      )}
    </TabsContent>
  )
}

