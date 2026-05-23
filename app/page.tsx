'use client';

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-12">
          <div className="inline-block text-sm font-semibold text-indigo-600 bg-indigo-100 px-4 py-1 rounded-full mb-6">
            ◊ Smart Lead Distribution
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Connect with Qualified Providers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Submit your service request once, and we'll automatically match you with the right professionals from our network.
            Fair allocation ensures every provider gets equal opportunities.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/request-service"
              className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Submit a Request →
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Provider Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Why Choose Us?</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-4 text-2xl">
              ⚡
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
            <p className="text-gray-600">
              Get multiple qualified responses within 24 hours. Our smart algorithm matches you instantly.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4 text-2xl">
              ⚖️
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Fair Distribution</h3>
            <p className="text-gray-600">
              Round-robin allocation ensures every provider in our network gets equal opportunities to serve you.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mb-4 text-2xl">
              🔒
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
            <p className="text-gray-600">
              Your information is encrypted and handled securely. We never share your data with unauthorized parties.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4 text-2xl">
              🎯
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Matching</h3>
            <p className="text-gray-600">
              Our algorithm considers mandatory requirements and provider expertise to deliver the best matches.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-4 text-2xl">
              📊
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Tracking</h3>
            <p className="text-gray-600">
              Monitor your requests and provider responses in real-time through our comprehensive dashboard.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center mb-4 text-2xl">
              ✨
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Always Available</h3>
            <p className="text-gray-600">
              Submit requests 24/7. Our system works around the clock to get you connected with the right providers.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-12 shadow-md border border-gray-200">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2 text-gray-900">8+</div>
              <p className="text-gray-600">Trusted Providers</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-gray-900">3</div>
              <p className="text-gray-600">Service Categories</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-gray-900">100%</div>
              <p className="text-gray-600">Fair Allocation</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-gray-900">&lt;24h</div>
              <p className="text-gray-600">Average Response</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">How It Works</h2>
        <div className="flex justify-between items-start gap-8">
          <div className="flex-1 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Your Request</h3>
            <p className="text-gray-600">
              Fill out our simple form with your service needs and preferences.
            </p>
          </div>

          <div className="flex-1 text-center">
            <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
            <p className="text-gray-600">
              Our algorithm instantly matches your request with qualified providers.
            </p>
          </div>

          <div className="flex-1 text-center">
            <div className="w-16 h-16 rounded-full bg-pink-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Responses</h3>
            <p className="text-gray-600">
              Multiple qualified providers respond with their proposals and quotes.
            </p>
          </div>

          <div className="flex-1 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              4
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Choose & Connect</h3>
            <p className="text-gray-600">
              Compare options and choose the provider that best fits your needs.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl p-16 shadow-lg border-2 border-indigo-100">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Submit your service request now and get matched with qualified providers in minutes.
          </p>
          <Link
            href="/request-service"
            className="inline-block px-10 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl text-lg"
          >
            Submit Your Request Today →
          </Link>
        </div>
      </div>
    </div>
  );
}
