import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-lg w-full mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Search className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Sorry, we couldn't find the page you're looking for. It might have been moved, 
            deleted, or you might have entered the wrong URL.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button asChild className="flex-1">
              <Link to="/" className="flex items-center justify-center">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Popular pages:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="link" size="sm" asChild>
                <Link to="/chat">AI Chat</Link>
              </Button>
              <Button variant="link" size="sm" asChild>
                <Link to="/quick-actions">Quick Actions</Link>
              </Button>
              <Button variant="link" size="sm" asChild>
                <Link to="/study-tools">Study Tools</Link>
              </Button>
              <Button variant="link" size="sm" asChild>
                <Link to="/about">About</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}