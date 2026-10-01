import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import StudyPlanner from './pages/StudyPlanner';
import StudyPlan from './pages/StudyPlan';
import AINotes from './pages/AINotes';
import Quiz from './pages/Quiz';
import QuizResults from './pages/QuizResults';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 page-enter">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/planner" element={<StudyPlanner />} />
            <Route path="/plan" element={<StudyPlan />} />
            <Route path="/notes" element={<AINotes />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<QuizResults />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
