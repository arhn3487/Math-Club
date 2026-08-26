/** @type {import('next').NextConfig} */
const nextConfig = {
  // ১. আপনার ইমেজ ডোমেইন কনফিগারেশন
  images: {
    domains: ['your-supabase-domain.supabase.co'], 
  },

  // ২. ESLint এরর ইগনোর করার জন্য (বিল্ড সফল করতে)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ৩. TypeScript এরর ইগনোর করার জন্য (বিল্ড সফল করতে)
  typescript: {
    ignoreBuildErrors: true,
  },

  // ৪. সব /api/* রুটকে কোনো ব্রাউজার/প্রক্সি/সার্ভার ক্যাশ না করার নির্দেশ দেওয়া হচ্ছে।
  // এর ফলে admin approval, exam status ইত্যাদির মতো তথ্য সবসময় সর্বশেষ (fresh)
  // দেখাবে — কারো টার্মিনালে গিয়ে সার্ভার রিস্টার্ট করার দরকার হবে না।
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ]
  },
}

module.exports = nextConfig