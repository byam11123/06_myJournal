'use client'

import { Button } from '@/components/ui/button'
import { Target, CheckCircle2, BarChart3, History, User as UserIcon } from 'lucide-react'
import { User as UserType } from '@/types'

interface AppLayoutProps {
  currentUser: UserType | null
  isMobile: boolean
  activeTab: string
  onSetActiveTab: (tab: string) => void
  onShowProfile: () => void
  children: React.ReactNode
}

export function AppLayout({
  currentUser,
  isMobile,
  activeTab,
  onSetActiveTab,
  onShowProfile,
  children
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {isMobile ? (
            // Mobile: Compact header
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold">myJournal</h1>
            </div>
          ) : (
            // Desktop: Full header
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">myJournal</h1>
                <p className="text-sm text-muted-foreground">Hello, {currentUser?.name}!</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onShowProfile}
          >
            <UserIcon className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className={`container mx-auto px-4 py-6 ${isMobile ? 'pb-24' : ''}`}>
        <div className="space-y-6">
          {isMobile ? (
            // Mobile: Bottom Navigation Bar
            <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 flex justify-around py-2 md:hidden pb-safe">
              <button
                className={`flex flex-col items-center justify-center w-full py-2 ${activeTab === 'goals' ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => onSetActiveTab('goals')}
              >
                <Target className="w-5 h-5" />
                <span className="text-xs mt-1">Goals</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center w-full py-2 ${activeTab === 'tasks' ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => onSetActiveTab('tasks')}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs mt-1">Tasks</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center w-full py-2 ${activeTab === 'analytics' ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => onSetActiveTab('analytics')}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs mt-1">Stats</span>
              </button>
              <button
                className={`flex flex-col items-center justify-center w-full py-2 ${activeTab === 'timeline' ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => onSetActiveTab('timeline')}
              >
                <History className="w-5 h-5" />
                <span className="text-xs mt-1">Timeline</span>
              </button>
            </div>
          ) : (
            // Desktop: Horizontal Tabs
            <div className="w-full overflow-x-auto">
              <div className="inline-flex w-max min-w-full sm:min-w-0">
                <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground space-x-1">
                  <button
                    className={`inline-flex items-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'goals' ? 'bg-background text-foreground shadow' : 'hover:bg-transparent hover:text-foreground'}`}
                    onClick={() => onSetActiveTab('goals')}
                  >
                    Goals
                  </button>
                  <button
                    className={`inline-flex items-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'tasks' ? 'bg-background text-foreground shadow' : 'hover:bg-transparent hover:text-foreground'}`}
                    onClick={() => onSetActiveTab('tasks')}
                  >
                    Daily Tasks
                  </button>
                  <button
                    className={`inline-flex items-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'revision' ? 'bg-background text-foreground shadow' : 'hover:bg-transparent hover:text-foreground'}`}
                    onClick={() => onSetActiveTab('revision')}
                  >
                    Revision
                  </button>
                  <button
                    className={`inline-flex items-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-background text-foreground shadow' : 'hover:bg-transparent hover:text-foreground'}`}
                    onClick={() => onSetActiveTab('analytics')}
                  >
                    Analytics
                  </button>
                  <button
                    className={`inline-flex items-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'timeline' ? 'bg-background text-foreground shadow' : 'hover:bg-transparent hover:text-foreground'}`}
                    onClick={() => onSetActiveTab('timeline')}
                  >
                    Timeline
                  </button>
                  <button
                    className={`inline-flex items-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'reminders' ? 'bg-background text-foreground shadow' : 'hover:bg-transparent hover:text-foreground'}`}
                    onClick={() => onSetActiveTab('reminders')}
                  >
                    Reminders
                  </button>
                </div>
              </div>
            </div>
          )}

          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t py-4 bg-card">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 myJournal. Built with Next.js and shadcn/ui.</p>
        </div>
      </footer>
    </div>
  )
}

