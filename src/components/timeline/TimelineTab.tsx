'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { TimelineEvent } from '@/types'
import { Target, CheckCircle2, Bell, Upload, Edit, History } from 'lucide-react'

interface TimelineTabProps {
  timelineEvents: TimelineEvent[]
}

export function TimelineTab({ timelineEvents }: TimelineTabProps) {
  return (
    <TabsContent value="timeline" className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Timeline</h2>
        <p className="text-muted-foreground">Your complete journey at a glance</p>
      </div>

      <div className="space-y-4">
        {timelineEvents.length === 0 ? (
          <Card className="p-8 text-center">
            <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No events yet</h3>
            <p className="text-muted-foreground">Start creating goals and tasks to build your timeline</p>
          </Card>
        ) : (
          timelineEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {event.type === 'goal_created' && <Target className="w-5 h-5 text-primary" />}
                    {event.type === 'task_created' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    {event.type === 'task_completed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {event.type === 'reminder_created' && <Bell className="w-5 h-5 text-primary" />}
                    {event.type === 'bulk_import' && <Upload className="w-5 h-5 text-primary" />}
                    {event.type.includes('updated') && <Edit className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </TabsContent>
  )
}

