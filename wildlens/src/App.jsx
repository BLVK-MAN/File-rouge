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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/animal/:id" element={<AnimalDetails />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} /> {/* ADMIN ROUTE */}
            <Route path="/admin/add" element={<AddAnimal />} /> {/* ADD ANIMAL ROUTE */}
            <Route path="*" element={<NotFound />} /> {/* CATCH ALL ROUTE */}
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
