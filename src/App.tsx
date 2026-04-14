import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './components/Home';
import { Registration } from './components/Registration';
import { Calendar } from './components/Calendar';
import { MatchView } from './components/MatchView';
import { Results } from './components/Results';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col pb-24">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inscripcion" element={<Registration />} />
            <Route path="/calendario" element={<Calendar />} />
            <Route path="/partidos" element={<MatchView />} />
            <Route path="/partidos/:id" element={<MatchView />} />
            <Route path="/resultados" element={<Results />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
