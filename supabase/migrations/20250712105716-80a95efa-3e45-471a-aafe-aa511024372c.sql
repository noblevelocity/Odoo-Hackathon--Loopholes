-- Create function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update question vote count
  IF NEW.question_id IS NOT NULL THEN
    UPDATE public.questions 
    SET vote_count = (
      SELECT COALESCE(COUNT(*) FILTER (WHERE vote_type = 'up'), 0) - COALESCE(COUNT(*) FILTER (WHERE vote_type = 'down'), 0)
      FROM public.user_votes 
      WHERE question_id = NEW.question_id
    )
    WHERE question_id = NEW.question_id;
  END IF;
  
  -- Update answer vote count
  IF NEW.answer_id IS NOT NULL THEN
    UPDATE public.answers 
    SET vote_count = (
      SELECT COALESCE(COUNT(*) FILTER (WHERE vote_type = 'up'), 0) - COALESCE(COUNT(*) FILTER (WHERE vote_type = 'down'), 0)
      FROM public.user_votes 
      WHERE answer_id = NEW.answer_id
    )
    WHERE answer_id = NEW.answer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote count updates
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
CREATE TRIGGER trigger_update_answer_count
  AFTER INSERT OR DELETE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION update_answer_count();