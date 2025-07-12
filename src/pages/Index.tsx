import { useState } from "react";
import Layout from "@/components/Layout";
import Hero from "./Hero";
import Questions from "./Questions";
import AskQuestion from "./AskQuestion";

type Page = "hero" | "questions" | "ask";

const Index = () => {
  const [currentPage, setCurrentPage] = useState<Page>("hero");

  const handleNavigate = (page: string) => {
    if (page === "hero" || page === "questions" || page === "ask") {
      setCurrentPage(page as Page);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "questions":
        return <Questions />;
      case "ask":
        return <AskQuestion />;
      default:
        return <Hero onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>
  );
};

export default Index;
