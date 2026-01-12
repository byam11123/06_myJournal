'use client'

import { Button } from '@/components/ui/button'
import { Target, CheckCircle2, BarChart3, History, Bell, User as UserIcon } from 'lucide-react'
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
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
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
      <main className={`flex-1 container mx-auto px-4 py-6 ${isMobile ? 'pb-20' : ''}`}>
        <div className="space-y-6">
          {!isMobile && (
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

      {/* Footer - Hidden on mobile */}
      {!isMobile && (
        <footer className="mt-auto border-t py-4 bg-card">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2025 myJournal. Built with Next.js and shadcn/ui.</p>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Navigation - Outside main content flow */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t z-[100] safe-area-bottom">
          <div className="flex justify-around items-center py-2 px-2">
            <button
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors ${activeTab === 'goals' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              onClick={() => onSetActiveTab('goals')}
            >
              <Target className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Goals</span>
            </button>
            <button
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors ${activeTab === 'tasks' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              onClick={() => onSetActiveTab('tasks')}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Tasks</span>
            </button>
            <button
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors ${activeTab === 'analytics' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              onClick={() => onSetActiveTab('analytics')}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Stats</span>
            </button>
            <button
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors ${activeTab === 'timeline' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              onClick={() => onSetActiveTab('timeline')}
            >
              <History className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Timeline</span>
            </button>
            <button
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors ${activeTab === 'reminders' ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              onClick={() => onSetActiveTab('reminders')}
            >
              <Bell className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Remind</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}

