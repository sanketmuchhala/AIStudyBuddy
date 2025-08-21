import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Home, MessageSquare, Zap, Info, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Quick Actions', href: '/quick-actions', icon: Zap },
  { name: 'Study Tools', href: '/study-tools', icon: BookOpen },
  { name: 'About', href: '/about', icon: Info },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to content link */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-all"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header 
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
      >
        <div className="container flex h-16 items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
            aria-label="AIStudyBuddy - Go to homepage"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
            </div>
            <span className="font-bold text-xl">AIStudyBuddy</span>
          </Link>

          <nav 
            className="mx-6 flex items-center space-x-4 lg:space-x-6"
            role="navigation"
            aria-label="Main navigation"
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-2 py-1',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main 
        id="main-content"
        className="container mx-auto px-4 py-6 max-w-7xl"
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Footer */}
      <footer 
        className="border-t bg-background"
        role="contentinfo"
      >
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 AIStudyBuddy. Built with React, TypeScript, and AI.</p>
        </div>
      </footer>
    </div>
  );
}