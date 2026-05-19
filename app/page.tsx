'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    setIsAuthenticated(!!token)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center text-white max-w-md">
            <h1 className="text-5xl font-bold mb-4">Math Club</h1>
            <p className="text-xl text-blue-100 mb-8">
              Competitive Programming Excellence
            </p>
            <p className="text-blue-100 mb-8">
              Welcome back! You are logged in.
            </p>
            <Link href="/dashboard">
              <button className="w-full bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition duration-200 mb-4">
                Go to Dashboard
              </button>
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token')
                localStorage.removeItem('user_type')
                localStorage.removeItem('user_id')
                router.push('/')
              }}
              className="w-full bg-blue-400 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-300 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <img 
                src="https://zxkeolkojkoenkszekiy.supabase.co/storage/v1/object/public/math-club-images/Math%20Club%20Logo/math%20club%20logo%202.png" 
                alt="Math Club Logo" 
                className="h-10 w-auto object-contain cursor-pointer"
              />
            </Link>
            <span className="text-2xl font-bold text-indigo-600">Math Club</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <button className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium">
                Login
              </button>
            </Link>
            <Link href="/signup">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Welcome to Math Club</h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Master competitive programming, solve challenging problems, and excel in mathematical competitions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <button className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition">
                Get Started
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-400 transition border-2 border-white">
                Already a Member?
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Why Join Math Club?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Learn & Practice</h3>
              <p className="text-gray-600">
                Access comprehensive study materials, video tutorials, and practice problems curated by experts
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Take Exams</h3>
              <p className="text-gray-600">
                Participate in regular MCQ exams with instant results and detailed performance analytics
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Connect</h3>
              <p className="text-gray-600">
                Network with peers in your batch, share knowledge, and grow together as a community
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold mb-4 text-gray-900">Class Recordings</h3>
              <p className="text-gray-600 mb-4">
                Access recorded class sessions and video tutorials anytime, anywhere. Learn at your own pace.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>✓ High-quality recordings</li>
                <li>✓ Organized by batch and topic</li>
                <li>✓ Downloadable resources</li>
              </ul>
            </div>
            <div className="bg-indigo-100 h-64 rounded-lg flex items-center justify-center">
              <div className="text-6xl">🎥</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-indigo-100 h-64 rounded-lg flex items-center justify-center order-2 md:order-1">
              <div className="text-6xl">📊</div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl font-bold mb-4 text-gray-900">Advanced Exam System</h3>
              <p className="text-gray-600 mb-4">
                Take randomized MCQ exams with real-time scoring and comprehensive result analysis.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Randomized question order</li>
                <li>✓ Instant results and feedback</li>
                <li>✓ Performance tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-indigo-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-indigo-100">Active Members</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <p className="text-indigo-100">Practice Problems</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <p className="text-indigo-100">Video Tutorials</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">20+</div>
              <p className="text-indigo-100">Expert Mentors</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of students already learning, practicing, and excelling with Math Club
          </p>
          <Link href="/signup">
            <button className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">
              Sign Up Now
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white font-bold mb-4">Math Club</div>
              <p className="text-sm">Competitive Programming Excellence</p>
            </div>
            <div>
              <div className="font-bold mb-4 text-white">Quick Links</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/signup" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-4 text-white">Features</div>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Exams</a></li>
                <li><a href="#" className="hover:text-white">Classes</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            <div>
              <div className="font-bold mb-4 text-white">Support</div>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 Math Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

