import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // IMPORT TOASTER
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Scanner from './pages/Scanner';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AnimalDetails from './pages/AnimalDetails';
import Admin from './pages/Admin'; // IMPORT ADMIN
import AddAnimal from './pages/AddAnimal'; // IMPORT ADD ANIMAL
import NotFound from './pages/NotFound'; // IMPORT 404

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-center" reverseOrder={false} /> {/* TOASTER COMPONENT */}

        <Navbar />

        {/* Main Content */}
        <main className="flex-grow relative flex flex-col min-h-[calc(100vh-64px)] w-full">
          {/* We use an arbitrary layout approach here to ensure AnimatePresence works beautifully with React Router */}
          <Routes>
            <Route path="/*" element={
              <AnimatedRoutes />
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

// Sub-component to handle AnimatePresence with location
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageWrapper from './components/ui/PageWrapper';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/catalog" element={<PageWrapper><Catalog /></PageWrapper>} />
        <Route path="/animal/:id" element={<PageWrapper><AnimalDetails /></PageWrapper>} />
        <Route path="/scanner" element={<PageWrapper><Scanner /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} /> {/* ADMIN ROUTE */}
        <Route path="/admin/add" element={<PageWrapper><AddAnimal /></PageWrapper>} /> {/* ADD ANIMAL ROUTE */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} /> {/* CATCH ALL ROUTE */}
      </Routes>
    </AnimatePresence>
  );
}

export default App;
