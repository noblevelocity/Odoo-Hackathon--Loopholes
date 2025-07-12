import { useState } from "react";
import { X, Plus, HelpCircle, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import RichTextEditor from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";

const AskQuestion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Redirect if not authenticated
  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-6">You must be logged in to ask a question.</p>
          <Link to="/auth">
            <Button>Login</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const popularTags = [
    "React", "JavaScript", "TypeScript", "Node.js", "CSS", "HTML", 
    "Python", "Java", "API", "Database", "Frontend", "Backend"
  ];

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // Submit question to Supabase
  const submitQuestion = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          title,
          description,
          question_tag: tags,
          user_id: user.id,
        });

      if (error) throw error;
      
      toast({
        title: "Question Posted!",
        description: "Your question has been successfully posted to the community.",
      });

      // Reset form and navigate
      setTitle("");
      setDescription("");
      setTags([]);
      setTagInput("");
      navigate('/questions');
    } catch (error) {
      console.error('Error posting question:', error);
      toast({
        title: "Error",
        description: "Failed to post question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = title.length >= 10 && description.length >= 30 && tags.length > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Link to="/questions" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Ask a Question</h1>
        <p className="text-muted-foreground">
          Get help from our community by asking a clear, detailed question.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Title</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="title">
                  Be specific and imagine you're asking a question to another person
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., How can I merge two arrays in JavaScript?"
                  className="text-base"
                />
                <div className="text-sm text-muted-foreground">
                  {title.length}/150 characters {title.length < 10 && "(minimum 10)"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>
                  Include all the information someone would need to answer your question
                </Label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe your problem in detail. Include any error messages, code snippets, and what you've already tried..."
                  minHeight="300px"
                />
                <div className="text-sm text-muted-foreground">
                  {description.length} characters {description.length < 30 && "(minimum 30)"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>
                  Add up to 5 tags to describe what your question is about
                </Label>
                
                {/* Selected Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-sm">
                        {tag}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="ml-1 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., react, javascript, css"
                    disabled={tags.length >= 5}
                  />
                  <Button
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Popular Tags */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Popular tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => addTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              onClick={submitQuestion}
              disabled={!isValid || isSubmitting}
              variant="hero"
              size="lg"
              className="min-w-32"
            >
              {isSubmitting ? "Posting..." : "Post Question"}
            </Button>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <Card className="bg-gradient-secondary">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Writing Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium mb-1">Title</h4>
                <p className="text-sm text-muted-foreground">
                  Summarize your problem in a one-line question
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Details</h4>
                <p className="text-sm text-muted-foreground">
                  Describe what you're trying to do, what you expected, and what actually happened
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Tags</h4>
                <p className="text-sm text-muted-foreground">
                  Add relevant tags to help others find your question
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Validation Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${title.length >= 10 ? 'bg-success' : 'bg-muted'}`} />
                <span className={`text-sm ${title.length >= 10 ? 'text-success' : 'text-muted-foreground'}`}>
                  Title (minimum 10 characters)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${description.length >= 30 ? 'bg-success' : 'bg-muted'}`} />
                <span className={`text-sm ${description.length >= 30 ? 'text-success' : 'text-muted-foreground'}`}>
                  Description (minimum 30 characters)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${tags.length > 0 ? 'bg-success' : 'bg-muted'}`} />
                <span className={`text-sm ${tags.length > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                  At least one tag
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertDescription>
              Remember to search for existing questions before posting. Your question should be clear, 
              specific, and include enough detail for others to help you effectively.
            </AlertDescription>
          </Alert>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default AskQuestion;