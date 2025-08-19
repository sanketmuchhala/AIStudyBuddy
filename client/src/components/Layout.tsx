import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Home, MessageSquare, Zap, Info, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'AI Chat', href: '/chat', icon: MessageSquare },
  { name: 'Quick Actions', href: '/quick-actions', icon: Zap },
  { name: 'About', href: '/about', icon: Info },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">AIStudyBuddy</span>
          </Link>

          <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === item.href
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setTheme(theme === 'light' ? 'dark' : 'light')
              }
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 AIStudyBuddy. Built with React, TypeScript, and AI.</p>
        </div>
      </footer>
    </div>
  );
}