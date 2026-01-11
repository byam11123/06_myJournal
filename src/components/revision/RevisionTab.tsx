'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TabsContent } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { Goal, Task } from '@/types'
import { Calendar, CheckCircle2, Lightbulb, AlertTriangle, ArrowRight } from 'lucide-react'

interface AnalyticsData {
  yesterdayCompletedTasks: number
  yesterdayIncompleteTasks: number
}

interface RevisionTabProps {
  analytics: AnalyticsData
  tasks: Task[]
  goals: Goal[]
  currentUser: { id: string } | null
  onLoadUserData: (userId: string) => Promise<void>
}

export function RevisionTab({
  analytics,
  tasks,
  goals,
  currentUser,
  onLoadUserData
}: RevisionTabProps) {
  const handleMoveToToday = async (task: Task) => {
    if (!currentUser) return

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: task.title,
          description: task.description,
          date: new Date().toISOString().split('T')[0],
          time: task.time,
          goalId: task.goalId
        })
      })
      await onLoadUserData(currentUser.id)
      toast({ title: 'Task moved to today!' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to move task',
        variant: 'destructive'
      })
    }
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  return (
    <TabsContent value="revision" className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Daily Revision</h2>
        <p className="text-muted-foreground">Review what you accomplished yesterday</p>
      </div>

      {analytics.yesterdayCompletedTasks === 0 && analytics.yesterdayIncompleteTasks === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No activity yesterday</h3>
          <p className="text-muted-foreground">Complete some tasks to see them here</p>
        </Card>
      ) : (
        <>
          {analytics.yesterdayCompletedTasks > 0 && (
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  Completed Tasks ({analytics.yesterdayCompletedTasks})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.filter(t => t.date === yesterday && t.completed).map(task => {
                  const goal = goals.find(g => g.id === task.goalId)
                  return (
                    <div key={task.id} className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          {task.time && (
                            <p className="text-sm text-muted-foreground">{task.time}</p>
                          )}
                          {goal && (
                            <Badge variant="outline" className="text-xs mt-1">{goal.title}</Badge>
                          )}
                        </div>
                        {task.photos && task.photos.length > 0 && (
                          <div className="flex gap-1">
                            {task.photos.map((photo) => (
                              <div
                                key={photo.id}
                                className="w-8 h-8 rounded"
                                style={{ backgroundColor: photo.url }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Lightbulb className="w-5 h-5" />
                Key Learnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.filter(t => t.date === yesterday && t.learnings && t.learnings.length > 0).map(task => (
                <div key={task.id} className="space-y-2 mb-4">
                  <h4 className="font-medium">{task.title}</h4>
                  <ul className="space-y-1">
                    {task.learnings?.map((learning) => (
                      <li key={learning.id} className="text-sm text-muted-foreground flex items-start gap-2">
                        <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
                        {learning.content}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>

          {analytics.yesterdayIncompleteTasks > 0 && (
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  Incomplete Tasks ({analytics.yesterdayIncompleteTasks})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.filter(t => t.date === yesterday && !t.completed).map(task => {
                  const goal = goals.find(g => g.id === task.goalId)
                  return (
                    <div key={task.id} className="p-3 bg-background rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          {goal && (
                            <Badge variant="outline" className="text-xs mt-1">{goal.title}</Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveToToday(task)}
                        >
                          Move to Today
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </TabsContent>
  )
}

