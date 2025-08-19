import { Link } from 'react-router-dom';
import { MessageSquare, Zap, Brain, BookOpen, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    description: 'Get instant help with your studies through our intelligent AI chat.',
    href: '/chat',
    color: 'text-blue-500',
  },
  {
    icon: Zap,
    title: 'Quick Actions',
    description: 'Summarize content, create study plans, generate flashcards, and more.',
    href: '/quick-actions',
    color: 'text-green-500',
  },
  {
    icon: BookOpen,
    title: 'Study Planning',
    description: 'Create personalized 7-day study plans tailored to your goals.',
    href: '/quick-actions',
    color: 'text-purple-500',
  },
];

const benefits = [
  {
    icon: Brain,
    title: 'AI-Powered Learning',
    description: 'Leverage artificial intelligence to optimize your study experience.',
  },
  {
    icon: Target,
    title: 'Personalized Approach',
    description: 'Get recommendations tailored to your learning style and pace.',
  },
  {
    icon: TrendingUp,
    title: 'Track Progress',
    description: 'Monitor your learning journey with detailed insights and analytics.',
  },
];

export function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Your AI-Powered
            <span className="block text-primary">Study Companion</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Enhance your learning with AI-driven study tools, personalized plans, and intelligent assistance.
            Study smarter, not harder.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg px-8">
            <Link to="/chat">Start AI Chat</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link to="/quick-actions">Quick Actions</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Powerful Study Tools</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to supercharge your learning, all in one place.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="transition-all hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <div className="space-y-2">
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{feature.description}</CardDescription>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={feature.href}>Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it Works */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Simple steps to transform your study experience
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
              1
            </div>
            <h3 className="text-xl font-semibold">Choose Your Tool</h3>
            <p className="text-muted-foreground">
              Select from AI Chat, Quick Actions, or other study utilities based on your needs.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
              2
            </div>
            <h3 className="text-xl font-semibold">Input Your Content</h3>
            <p className="text-muted-foreground">
              Share your study material, questions, or learning goals with our AI.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto">
              3
            </div>
            <h3 className="text-xl font-semibold">Get AI-Powered Results</h3>
            <p className="text-muted-foreground">
              Receive personalized study plans, summaries, flashcards, and expert guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Why Choose AIStudyBuddy?</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="text-center space-y-4">
                <Icon className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground rounded-lg p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to Transform Your Studies?</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Join thousands of students who are already studying smarter with AI assistance.
        </p>
        <Button asChild size="lg" variant="secondary" className="text-lg px-8">
          <Link to="/chat">Start Learning Now</Link>
        </Button>
      </section>
    </div>
  );
}