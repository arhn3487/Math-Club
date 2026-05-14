'use client'

import Link from 'next/link'
import { Button, Card } from '@/components/ui/BaseComponents'
import { StatCard } from '@/components/cards/FeatureCards'
import { useEffect, useState } from 'react'

export default function Home() {
  const [stats, setStats] = useState([
    { title: 'Active Members', value: 150, suffix: '+' },
    { title: 'Contests Hosted', value: 45, suffix: '' },
    { title: 'Batches', value: 8, suffix: '' },
    { title: 'Achievements', value: 127, suffix: '+' },
  ])

  const features = [
    {
      title: 'Structured Learning',
      description: 'Learn competitive programming through organized batches and courses',
      icon: '📚',
    },
    {
      title: 'Regular Contests',
      description: 'Participate in weekly and monthly contests to test your skills',
      icon: '🏆',
    },
    {
      title: 'Expert Mentors',
      description: 'Get guidance from experienced competitive programmers',
      icon: '👨‍🏫',
    },
    {
      title: 'Community',
      description: 'Join a vibrant community of coding enthusiasts',
      icon: '👥',
    },
  ]

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="page-header text-center py-20">
        <div className="container">
          <h1 className="page-title text-5xl mb-4">Welcome to Math Club</h1>
          <p className="page-subtitle text-2xl mb-8">
            Excel in Competitive Programming & Problem Solving
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/batches">
              <Button className="px-8 py-3 text-lg">Join a Batch</Button>
            </Link>
            <Link href="/contests">
              <Button variant="secondary" className="px-8 py-3 text-lg">
                View Contests
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="card-grid">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join Us?</h2>
          <div className="card-grid">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <p className="text-5xl mb-4">{feature.icon}</p>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Coding?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students pursuing excellence in competitive programming
          </p>
          <Link href="/batches">
            <Button className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-100">
              Explore Batches
            </Button>
          </Link>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="space-y-8 max-w-2xl mx-auto">
            {[
              { year: '2020', title: 'Club Founded', desc: 'Started with 10 passionate members' },
              { year: '2021', title: 'First Contest', desc: 'Hosted our inaugural programming contest' },
              { year: '2022', title: 'Expansion', desc: 'Grew to 100+ members and 5 batches' },
              { year: '2024', title: 'Excellence', desc: 'Achieved 150+ members and international recognition' },
            ].map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="text-center flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>
                <Card className="flex-grow">
                  <p className="text-blue-600 font-bold">{event.year}</p>
                  <h3 className="text-lg font-bold">{event.title}</h3>
                  <p className="text-gray-600">{event.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
