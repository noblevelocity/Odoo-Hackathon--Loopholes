import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronUp, ChevronDown, MessageSquare, Clock, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import RichTextEditor from "@/components/RichTextEditor";
import Layout from "@/components/Layout";

interface Question {
  question_id: string;
  title: string;
  description: string;
  question_tag: any; // JSON type from Supabase
  created_at: string;
  user_id: string;
  vote_count: number;
  answer_count: number;
}

interface Answer {
  answer_id: string;
  content: string;
  created_at: string;
  user_id: string;
  vote_count: number;
}

interface UserVote {
  vote_type: 'up' | 'down';
}

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState<Record<string, UserVote>>({});

  useEffect(() => {
    if (id) {
      fetchQuestionData();
      if (user) {
        fetchUserVotes();
      }
    }
  }, [id, user]);

  const fetchQuestionData = async () => {
    try {
      // Fetch question
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('question_id', id)
        .single();

      if (questionError) throw questionError;
      setQuestion(questionData);

      // Fetch answers
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', id)
        .order('vote_count', { ascending: false });

      if (answersError) throw answersError;
      setAnswers(answersData || []);
    } catch (error) {
      console.error('Error fetching question data:', error);
      toast({
        title: "Error",
        description: "Failed to load question data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('user_votes')
        .select('question_id, answer_id, vote_type')
        .eq('user_id', user?.id);

      if (error) throw error;

      const votes: Record<string, UserVote> = {};
      data?.forEach(vote => {
        const key = vote.question_id || vote.answer_id;
        if (key) {
          votes[key] = { vote_type: vote.vote_type as 'up' | 'down' };
        }
      });
      setUserVotes(votes);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVote = async (targetId: string, voteType: 'up' | 'down', isQuestion: boolean) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentVote = userVotes[targetId];
      
      if (currentVote && currentVote.vote_type === voteType) {
        // Remove vote if clicking same vote type
        await supabase
          .from('user_votes')
          .delete()
          .eq('user_id', user.id)
          .eq(isQuestion ? 'question_id' : 'answer_id', targetId);
        
        const newVotes = { ...userVotes };
        delete newVotes[targetId];
        setUserVotes(newVotes);
      } else {
        // Insert or update vote
        const voteData = {
          user_id: user.id,
          vote_type: voteType,
          ...(isQuestion ? { question_id: targetId } : { answer_id: targetId })
        };

        await supabase
          .from('user_votes')
          .upsert(voteData);
        
        setUserVotes({
          ...userVotes,
          [targetId]: { vote_type: voteType }
        });
      }

      // Refresh data to update vote counts
      fetchQuestionData();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    }
  };

  const handleSubmitAnswer = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to submit an answer",
        variant: "destructive",
      });
      return;
    }

    if (!answerContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter your answer",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('answers')
        .insert({
          question_id: id,
          content: answerContent,
          user_id: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your answer has been submitted!",
      });

      setAnswerContent("");
      fetchQuestionData(); // Refresh to show new answer
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!question) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Question Not Found</h1>
          <Link to="/questions">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Back Navigation */}
        <Link to="/questions" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Questions
        </Link>

        {/* Question */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Vote Controls */}
              <div className="flex flex-col items-center space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(question.question_id, 'up', true)}
                  className={`p-2 ${userVotes[question.question_id]?.vote_type === 'up' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
                >
                  <ChevronUp className="h-6 w-6" />
                </Button>
                <span className="font-medium text-lg">{question.vote_count}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(question.question_id, 'down', true)}
                  className={`p-2 ${userVotes[question.question_id]?.vote_type === 'down' ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive'}`}
                >
                  <ChevronDown className="h-6 w-6" />
                </Button>
              </div>

              {/* Question Content */}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-4">{question.title}</h1>
                
                <div className="prose prose-sm max-w-none mb-4 text-muted-foreground">
                  {question.description}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.question_tag?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Question Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(question.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {question.answer_count} answers
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    by {question.user_id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>

          <div className="space-y-6">
            {answers.map((answer) => (
              <Card key={answer.answer_id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Vote Controls */}
                    <div className="flex flex-col items-center space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(answer.answer_id, 'up', false)}
                        className={`p-2 ${userVotes[answer.answer_id]?.vote_type === 'up' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
                      >
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <span className="font-medium">{answer.vote_count}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(answer.answer_id, 'down', false)}
                        className={`p-2 ${userVotes[answer.answer_id]?.vote_type === 'down' ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive'}`}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1">
                      <div className="prose prose-sm max-w-none mb-4 text-foreground">
                        {answer.content}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(answer.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          by {answer.user_id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Add Answer Section */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Answer</h3>
            
            {user ? (
              <div className="space-y-4">
                <RichTextEditor
                  value={answerContent}
                  onChange={setAnswerContent}
                  placeholder="Write your answer here..."
                />
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answerContent.trim()}
                    className="min-w-32"
                  >
                    {submitting ? "Submitting..." : "Submit Answer"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You must be logged in to submit an answer.
                </p>
                <Button variant="outline">Log In</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default QuestionDetail;