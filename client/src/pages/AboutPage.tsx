import { Brain, Zap, Shield, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Intelligence',
    description: 'Our advanced AI understands your learning needs and provides personalized assistance.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Get instant responses and generate study materials in seconds, not minutes.',
  },
  {
    icon: Shield,
    title: 'Privacy Focused',
    description: 'Your data is secure and private. We don\'t store personal information unnecessarily.',
  },
  {
    icon: Lightbulb,
    title: 'Smart Learning',
    description: 'Adaptive learning techniques help you study more effectively and retain information better.',
  },
];

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">About AIStudyBuddy</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          AIStudyBuddy is your intelligent learning companion, designed to make studying more efficient, 
          engaging, and effective through the power of artificial intelligence.
        </p>
      </section>

      {/* Mission */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Our Mission</h2>
        <Card>
          <CardContent className="p-8">
            <p className="text-lg text-center leading-relaxed">
              We believe that learning should be accessible, personalized, and enjoyable for everyone. 
              Our mission is to democratize education by providing AI-powered tools that adapt to each 
              learner's unique needs, helping students of all levels achieve their academic goals more effectively.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">What Makes Us Special</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Icon className="h-8 w-8 text-primary" />
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-center">How It Works</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              1
            </div>
            <h3 className="text-xl font-semibold">Input Your Content</h3>
            <p className="text-muted-foreground">
              Share your study materials, questions, or topics you want to learn about.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              2
            </div>
            <h3 className="text-xl font-semibold">AI Processing</h3>
            <p className="text-muted-foreground">
              Our AI analyzes your input and generates personalized learning materials.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
              3
            </div>
            <h3 className="text-xl font-semibold">Learn & Improve</h3>
            <p className="text-muted-foreground">
              Use the generated content to study more effectively and track your progress.
            </p>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Technology Stack</h2>
        <Card>
          <CardContent className="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold mb-3">Frontend</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• React 18 with TypeScript</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Radix UI components</li>
                  <li>• TanStack Query for data management</li>
                  <li>• React Router for navigation</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Backend</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Node.js with Express</li>
                  <li>• TypeScript for type safety</li>
                  <li>• AI provider integration</li>
                  <li>• Robust error handling</li>
                  <li>• Security best practices</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Privacy */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-center">Privacy & Security</h2>
        <Card>
          <CardContent className="p-8 space-y-4">
            <p className="text-lg">
              Your privacy and data security are our top priorities. Here's how we protect you:
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                We don't store personal information unless necessary for the service
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                All communications are encrypted in transit
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Chat conversations are only stored locally in your browser
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                We follow industry best practices for security
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Contact */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-bold">Get in Touch</h2>
        <Card>
          <CardContent className="p-8">
            <p className="text-lg mb-4">
              Have questions, feedback, or suggestions? We'd love to hear from you!
            </p>
            <p className="text-muted-foreground">
              This is a demonstration project showcasing AI-powered study tools. 
              For real implementations, proper contact and support channels would be provided.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}