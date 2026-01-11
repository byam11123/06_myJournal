'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TabsContent } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { Reminder } from '@/types'
import { Plus, Bell, Calendar, Clock, Trash2 } from 'lucide-react'

interface RemindersTabProps {
  reminders: Reminder[]
  currentUser: { id: string } | null
  onRemindersChange: (reminders: Reminder[]) => void
  onAddTimelineEvent: (type: string, title: string, description: string) => void
}

export function RemindersTab({
  reminders,
  currentUser,
  onRemindersChange,
  onAddTimelineEvent
}: RemindersTabProps) {
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderMessage, setReminderMessage] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [reminderType, setReminderType] = useState('browser')

  const handleSaveReminder = async () => {
    if (!reminderTitle || !reminderDate || !reminderTime || !currentUser) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive'
      })
      return
    }

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: reminderTitle,
          message: reminderMessage,
          date: reminderDate,
          time: reminderTime,
          type: reminderType
        })
      })

      if (res.ok) {
        const data = await res.json()
        onRemindersChange([...reminders, data.reminder])
        onAddTimelineEvent('reminder_created', 'Reminder Set', `You set a reminder for "${reminderTitle}"`)
        toast({ title: 'Reminder set!' })
      }

      setReminderTitle('')
      setReminderMessage('')
      setReminderDate('')
      setReminderTime('')
      setShowReminderDialog(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set reminder',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      const res = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        onRemindersChange(reminders.filter(r => r.id !== reminderId))
        toast({ title: 'Reminder deleted!' })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete reminder',
        variant: 'destructive'
      })
    }
  }

  return (
    <TabsContent value="reminders" className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reminders</h2>
          <p className="text-muted-foreground">Never miss important tasks</p>
        </div>
        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reminder</DialogTitle>
              <DialogDescription>Set up notifications for your tasks</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reminder-title">Title *</Label>
                <Input
                  id="reminder-title"
                  placeholder="e.g., Morning workout"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder-message">Message</Label>
                <Textarea
                  id="reminder-message"
                  placeholder="Additional message..."
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminder-date">Date *</Label>
                  <Input
                    id="reminder-date"
                    type="date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminder-time">Time *</Label>
                  <Input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder-type">Notification Type</Label>
                <Select value={reminderType} onValueChange={setReminderType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="browser">Browser Notification</SelectItem>
                    <SelectItem value="sound">Sound Alert</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveReminder} className="w-full">Create Reminder</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {reminders.map((reminder) => (
          <Card key={reminder.id} className={reminder.triggered ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{reminder.title}</CardTitle>
                <Badge variant={reminder.triggered ? 'secondary' : 'default'}>
                  {reminder.triggered ? 'Triggered' : 'Active'}
                </Badge>
              </div>
              {reminder.message && (
                <CardDescription>{reminder.message}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {reminder.date}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {reminder.time}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bell className="w-4 h-4" />
                {reminder.type}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => handleDeleteReminder(reminder.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {reminders.length === 0 && (
        <Card className="p-8 text-center">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No reminders yet</h3>
          <p className="text-muted-foreground mb-4">Create reminders for your important tasks</p>
          <Button onClick={() => setShowReminderDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Reminder
          </Button>
        </Card>
      )}
    </TabsContent>
  )
}

