import { useState } from "react";
import { ArrowUp, ArrowDown, MessageCircle, User, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Question {
  id: string;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  votes: number;
  answers: number;
  tags: string[];
  hasAcceptedAnswer: boolean;
  userVote?: 'up' | 'down' | null;
}

interface QuestionCardProps {
  question: Question;
  onClick?: () => void;
}

const QuestionCard = ({ question, onClick }: QuestionCardProps) => {
  const [votes, setVotes] = useState(question.votes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(question.userVote || null);

  const handleVote = (type: 'up' | 'down') => {
    if (userVote === type) {
      // Remove vote
      setVotes(prev => prev + (type === 'up' ? -1 : 1));
      setUserVote(null);
    } else {
      // Add or change vote
      const voteChange = userVote === null 
        ? (type === 'up' ? 1 : -1)
        : (type === 'up' ? 2 : -2);
      setVotes(prev => prev + voteChange);
      setUserVote(type);
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-300 bg-gradient-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <h3 
              className="text-lg font-semibold leading-tight hover:text-primary cursor-pointer transition-colors"
              onClick={onClick}
            >
              {question.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {question.description}
            </p>
          </div>

          {/* Vote Section */}
          <div className="flex flex-col items-center space-y-1 min-w-[60px]">
            <Button
              variant="vote"
              size="icon-sm"
              onClick={() => handleVote('up')}
              className={userVote === 'up' ? 'text-success border-success' : ''}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className={`text-sm font-medium ${
              votes > 0 ? 'text-success' : votes < 0 ? 'text-destructive' : 'text-muted-foreground'
            }`}>
              {votes}
            </span>
            <Button
              variant="vote"
              size="icon-sm"
              onClick={() => handleVote('down')}
              className={userVote === 'down' ? 'text-destructive border-destructive' : ''}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {question.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{question.answers} answers</span>
              {question.hasAcceptedAnswer && (
                <CheckCircle className="h-4 w-4 text-success ml-1" />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{question.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{question.createdAt}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;