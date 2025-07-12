import { useState } from "react";
import { Plus, Filter, TrendingUp, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import QuestionCard from "@/components/QuestionCard";

// Mock data
const mockQuestions = [
  {
    id: "1",
    title: "How to use React hooks effectively in a large application?",
    description: "I'm working on a large React application and I'm struggling with state management using hooks. What are the best practices for organizing hooks in a complex component hierarchy?",
    author: "john_dev",
    createdAt: "2 hours ago",
    votes: 15,
    answers: 3,
    tags: ["React", "Hooks", "JavaScript"],
    hasAcceptedAnswer: true,
    userVote: null
  },
  {
    id: "2",
    title: "Best practices for TypeScript with React components",
    description: "I'm new to TypeScript and want to know the best way to type React components, props, and state. What are the common patterns?",
    author: "sarah_codes",
    createdAt: "4 hours ago",
    votes: 8,
    answers: 2,
    tags: ["TypeScript", "React", "Frontend"],
    hasAcceptedAnswer: false,
    userVote: null
  },
  {
    id: "3",
    title: "How to optimize performance in Next.js applications?",
    description: "My Next.js app is getting slower as it grows. What are the key optimization techniques I should implement?",
    author: "mike_web",
    createdAt: "1 day ago",
    votes: 23,
    answers: 7,
    tags: ["Next.js", "Performance", "Optimization"],
    hasAcceptedAnswer: true,
    userVote: "up" as const
  },
  {
    id: "4",
    title: "Understanding CSS Grid vs Flexbox - when to use which?",
    description: "I'm often confused about when to use CSS Grid and when to use Flexbox. Can someone explain the key differences and use cases?",
    author: "anna_designer",
    createdAt: "2 days ago",
    votes: 12,
    answers: 5,
    tags: ["CSS", "Grid", "Flexbox", "Layout"],
    hasAcceptedAnswer: false,
    userVote: null
  },
  {
    id: "5",
    title: "JWT authentication in Node.js - security best practices",
    description: "I'm implementing JWT authentication in my Node.js API. What are the security considerations and best practices I should follow?",
    author: "dev_security",
    createdAt: "3 days ago",
    votes: 19,
    answers: 4,
    tags: ["Node.js", "JWT", "Security", "Authentication"],
    hasAcceptedAnswer: true,
    userVote: null
  }
];

const popularTags = [
  "React", "JavaScript", "TypeScript", "Node.js", "CSS", "HTML", 
  "Python", "Java", "API", "Database", "Frontend", "Backend"
];

const Questions = () => {
  const [sortBy, setSortBy] = useState("newest");
  const [filterTag, setFilterTag] = useState<string>("");

  const filteredQuestions = mockQuestions.filter(question => 
    !filterTag || question.tags.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase()))
  );

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case "votes":
        return b.votes - a.votes;
      case "answers":
        return b.answers - a.answers;
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Questions</h1>
          <p className="text-muted-foreground mt-2">
            {filteredQuestions.length} questions found
          </p>
        </div>
        <Button variant="hero" size="lg" className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Ask Question
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={sortBy === "newest" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("newest")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Newest
              </Button>
              <Button
                variant={sortBy === "votes" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("votes")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Most Voted
              </Button>
              <Button
                variant={sortBy === "answers" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortBy("answers")}
              >
                <Users className="h-4 w-4 mr-2" />
                Most Answers
              </Button>
            </div>

            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Tags</SelectItem>
                {popularTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {sortedQuestions.map((question) => (
              <QuestionCard 
                key={question.id} 
                question={question}
                onClick={() => console.log(`Navigate to question ${question.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Tags */}
          <div className="bg-gradient-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setFilterTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-4">Community Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Answers</span>
                <span className="font-medium">3,456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Users</span>
                <span className="font-medium">567</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tags</span>
                <span className="font-medium">89</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-gradient-secondary rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">How to ask a good question?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Be specific and clear</li>
              <li>• Include relevant code</li>
              <li>• Use appropriate tags</li>
              <li>• Show what you've tried</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questions;