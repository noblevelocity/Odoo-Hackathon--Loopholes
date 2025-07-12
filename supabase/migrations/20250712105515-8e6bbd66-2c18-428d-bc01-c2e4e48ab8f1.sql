-- Add missing content column to answers table
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS content TEXT;

-- Add proper foreign key constraints
ALTER TABLE public.answers 
ADD CONSTRAINT fk_answers_question_id 
FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;

-- Add vote tracking columns (rename existing upvote/downvote to vote_count)
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS vote_count INTEGER DEFAULT 0;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS answer_count INTEGER DEFAULT 0;

-- Create user votes tracking table
CREATE TABLE IF NOT EXISTS public.user_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(question_id) ON DELETE CASCADE,
  answer_id UUID REFERENCES public.answers(answer_id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_question_vote UNIQUE (user_id, question_id),
  CONSTRAINT unique_answer_vote UNIQUE (user_id, answer_id),
  CONSTRAINT vote_target_check CHECK (
    (question_id IS NOT NULL AND answer_id IS NULL) OR 
    (question_id IS NULL AND answer_id IS NOT NULL)
  )
);

-- Enable RLS on all tables
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for public read access on questions
DROP POLICY IF EXISTS "Anyone can see questions" ON public.questions;
CREATE POLICY "Anyone can view questions" ON public.questions
  FOR SELECT USING (true);

-- Update RLS policies for answers
DROP POLICY IF EXISTS "Anyone can see" ON public.answers;
CREATE POLICY "Anyone can view answers" ON public.answers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert answers" ON public.answers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers" ON public.answers
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for user_votes
CREATE POLICY "Users can view all votes" ON public.user_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own votes" ON public.user_votes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON public.user_votes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.user_votes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update question vote count
  IF NEW.question_id IS NOT NULL THEN
    UPDATE public.questions 
    SET vote_count = (
      SELECT COUNT(*) FILTER (WHERE vote_type = 'up') - COUNT(*) FILTER (WHERE vote_type = 'down')
      FROM public.user_votes 
      WHERE question_id = NEW.question_id
    )
    WHERE question_id = NEW.question_id;
  END IF;
  
  -- Update answer vote count
  IF NEW.answer_id IS NOT NULL THEN
    UPDATE public.answers 
    SET vote_count = (
      SELECT COUNT(*) FILTER (WHERE vote_type = 'up') - COUNT(*) FILTER (WHERE vote_type = 'down')
      FROM public.user_votes 
      WHERE answer_id = NEW.answer_id
    )
    WHERE answer_id = NEW.answer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote count updates
DROP TRIGGER IF EXISTS trigger_update_vote_counts ON public.user_votes;
CREATE TRIGGER trigger_update_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.user_votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Create function to update answer counts
CREATE OR REPLACE FUNCTION update_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.questions 
  SET answer_count = (
    SELECT COUNT(*) 
    FROM public.answers 
    WHERE question_id = COALESCE(NEW.question_id, OLD.question_id)
  )
  WHERE question_id = COALESCE(NEW.question_id, OLD.question_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for answer count updates
DROP TRIGGER IF EXISTS trigger_update_answer_count ON public.answers;
CREATE TRIGGER trigger_update_answer_count
  AFTER INSERT OR DELETE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION update_answer_count();