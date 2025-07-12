import { useState, useEffect } from "react";
import { Plus, Filter, TrendingUp, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import QuestionCard from "@/components/QuestionCard";
import Layout from "@/components/Layout";

interface Question {
  question_id: string;
  title: string;
  description: string;
  question_tag: any;
  created_at: string;
  user_id: string;
  vote_count: number;
  answer_count: number;
}

const popularTags = [
  "React", "JavaScript", "TypeScript", "Node.js", "CSS", "HTML", 
  "Python", "Java", "API", "Database", "Frontend", "Backend"
];

const Questions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [filterTag, setFilterTag] = useState<string>("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(question => {
    if (!filterTag) return true;
    const tags = Array.isArray(question.question_tag) ? question.question_tag : [];
    return tags.some((tag: string) => tag.toLowerCase().includes(filterTag.toLowerCase()));
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    switch (sortBy) {
      case "votes":
        return (b.vote_count || 0) - (a.vote_count || 0);
      case "answers":
        return (b.answer_count || 0) - (a.answer_count || 0);
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
                key={question.question_id} 
                question={{
                  id: question.question_id,
                  title: question.title,
                  description: question.description,
                  author: question.user_id.slice(0, 8),
                  createdAt: new Date(question.created_at).toLocaleDateString(),
                  votes: question.vote_count || 0,
                  answers: question.answer_count || 0,
                  tags: Array.isArray(question.question_tag) ? question.question_tag : [],
                  hasAcceptedAnswer: false,
                  userVote: null
                }}
                onClick={() => window.location.href = `/questions/${question.question_id}`}
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
    </Layout>
  );
};

export default Questions;