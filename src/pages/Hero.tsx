import { useState } from "react";
import { ArrowRight, Users, MessageCircle, TrendingUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HeroProps {
  onNavigate?: (page: string) => void;
}

const Hero = ({ onNavigate }: HeroProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { icon: Users, label: "Active Users", value: "2.5K+" },
    { icon: MessageCircle, label: "Questions", value: "10K+" },
    { icon: TrendingUp, label: "Answers", value: "25K+" },
  ];

  const featuredTopics = [
    "React", "JavaScript", "TypeScript", "Node.js", "Python", "CSS", "HTML", "API"
  ];

  const recentQuestions = [
    {
      title: "How to optimize React performance?",
      tags: ["React", "Performance"],
      answers: 5,
      votes: 12
    },
    {
      title: "Best practices for TypeScript interfaces",
      tags: ["TypeScript", "Best Practices"],
      answers: 3,
      votes: 8
    },
    {
      title: "Understanding CSS Grid layout",
      tags: ["CSS", "Grid"],
      answers: 7,
      votes: 15
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Learn Together, 
              <br />
              Grow Faster
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join our collaborative learning community where knowledge is shared, 
              questions are answered, and everyone grows together.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for questions, topics, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 text-lg bg-background/80 backdrop-blur border-primary/20 focus:border-primary shadow-lg"
              />
              <Button 
                variant="hero" 
                size="lg" 
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero" 
              size="xl" 
              className="group"
              onClick={() => onNavigate?.("ask")}
            >
              Ask Your First Question
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => onNavigate?.("questions")}
            >
              Browse Questions
            </Button>
          </div>

          {/* Featured Topics */}
          <div className="space-y-4">
            <p className="text-muted-foreground">Popular Topics:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {featuredTopics.map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <stat.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Questions Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Recent Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            See what the community is discussing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {recentQuestions.map((question, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-gradient-card border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {question.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{question.answers} answers</span>
                  <span>{question.votes} votes</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => onNavigate?.("questions")}
          >
            View All Questions
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose StackIt?
          </h2>
          <p className="text-muted-foreground text-lg">
            A platform designed for collaborative learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Rich Text Editor</h3>
            <p className="text-muted-foreground">
              Format your questions and answers with our powerful editor supporting code, links, images, and more.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Community Driven</h3>
            <p className="text-muted-foreground">
              Vote on answers, mark solutions as accepted, and help build a knowledge base together.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Real-time Notifications</h3>
            <p className="text-muted-foreground">
              Stay updated with answers to your questions, mentions, and community activity.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;