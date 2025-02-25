// components/Navigation.tsx
import { useState } from "react";
import Link from "next/link";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo or title */}
          <div className="flex-shrink-0 text-white font-bold">
            Chess Tutor
          </div>
          {/* Toggle button for mobile */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-gray-400 hover:text-white focus:outline-none focus:text-white"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
          {/* Desktop menu */}
          <div className="hidden lg:block">
            <ul className="flex space-x-4">
              <li>
                <Link href="/">
                  <a className="text-gray-300 hover:text-white">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-gray-300 hover:text-white">About</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="text-gray-300 hover:text-white">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Mobile menu, collapsible */}
      {isOpen && (
        <div className="lg:hidden" id="mobile-menu">
          <ul className="px-2 pt-2 pb-3 space-y-1">
            <li>
              <Link href="/">
                <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                  Home
                </a>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                  About
                </a>
              </Link>
            </li>
            <li>
              <Link href="/contact">
                <a className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                  Contact
                </a>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
