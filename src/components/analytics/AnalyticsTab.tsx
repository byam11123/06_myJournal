'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TabsContent } from '@/components/ui/tabs'
import { Goal } from '@/types'

interface AnalyticsData {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  totalTasks: number
  todayTasks: number
  todayCompletedTasks: number
  yesterdayCompletedTasks: number
  yesterdayIncompleteTasks: number
  totalPhotos: number
  categoryBreakdown: Record<string, number>
}

interface AnalyticsTabProps {
  analytics: AnalyticsData
  goals: Goal[]
  getGoalProgress: (goalId: string) => number
}

export function AnalyticsTab({ analytics, goals, getGoalProgress }: AnalyticsTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Track your progress and achievements</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Goals</CardDescription>
            <CardTitle className="text-3xl">{analytics.totalGoals}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Goals</CardDescription>
            <CardTitle className="text-3xl">{analytics.activeGoals}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tasks</CardDescription>
            <CardTitle className="text-3xl">{analytics.totalTasks}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Photos</CardDescription>
            <CardTitle className="text-3xl">{analytics.totalPhotos}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal.id)
            return (
              <div key={goal.id}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{goal.title}</span>
                  <span className="text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Goal Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
              <div key={category} className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground">{category}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{analytics.todayTasks}</div>
              <div className="text-sm text-muted-foreground">Today's Tasks</div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">{analytics.todayCompletedTasks}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
          {analytics.todayTasks > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Today's Progress</span>
                <span className="font-medium">{Math.round((analytics.todayCompletedTasks / analytics.todayTasks) * 100)}%</span>
              </div>
              <Progress value={(analytics.todayCompletedTasks / analytics.todayTasks) * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

