import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ChainHive
            </h1>
            <Button variant="outline">Connect Wallet</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Enterprise Multi-Chain
            <br />
            Portfolio Intelligence
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Advanced portfolio analytics across Ethereum, Aptos, and XRPL with AI-powered insights,
            real-time monitoring, and institutional-grade security.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              Start Analysis
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Multi-Chain Analysis</CardTitle>
                <CardDescription>
                  Comprehensive portfolio tracking across Ethereum, Aptos, and XRPL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Real-time data aggregation with advanced analytics and risk assessment.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Intelligent portfolio optimization and market analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Machine learning algorithms provide personalized investment recommendations.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-grade security with advanced encryption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  SOC 2 compliant infrastructure with multi-factor authentication.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Portfolio Analysis</h2>
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Analyze Your Wallet</CardTitle>
              <CardDescription>
                Enter your wallet address to get comprehensive portfolio insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter wallet address..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                  Analyze Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ChainHive
          </h3>
          <p className="text-slate-400">
            Enterprise Multi-Chain Portfolio Intelligence Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;