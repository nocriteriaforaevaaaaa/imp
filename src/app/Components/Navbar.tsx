"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Ambulance, Menu, X } from 'lucide-react';
import { GiHighKick } from "react-icons/gi";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/defense', label: 'Defense' },
    { href: '/therapist', label: 'Therapist' },
    { href: '/about', label: 'About' }
  ];

  return (
    <nav className="bg-red-500
    ">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          {/* Logo */}
          <div className="flex space-x-7">
            <Link 
              href="/" 
              className="flex items-center py-4 px-2"
            >
              <span className="font-semibold text-gray-500 text-lg">
               <div> <GiHighKick  className='text-white text-3xl'></GiHighKick></div>
              </span>
              <span> </span>

              <span className="font-semibold text-white text-lg"> Rakshya-Kawach </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-4 px-2 text-white font-semibold hover:text-red-700 transition duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMenu} 
              className="outline-none mobile-menu-button"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <ul className="space-y-4 px-4 pt-4 pb-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={toggleMenu}
                    className="block text-white hover:bg-red-900 py-2 px-3 rounded-md"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;