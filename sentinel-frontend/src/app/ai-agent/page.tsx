'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { aiAgentApi } from '@/lib/api/ai-agent';
import { Bot, Send, Sparkles, TrendingUp, AlertTriangle, FileText, Settings, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/lib/hooks/useToast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAgentPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI fraud detection assistant. I can help you analyze transactions, investigate alerts, and provide insights. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedActions = [
    { icon: TrendingUp, label: 'Analyze recent patterns', prompt: 'Show me the fraud patterns from the last 7 days' },
    { icon: AlertTriangle, label: 'Review high-risk alerts', prompt: 'What are the current high-risk alerts?' },
    { icon: FileText, label: 'Generate report', prompt: 'Generate a fraud detection summary report' },
    { icon: Zap, label: 'Quick insights', prompt: 'Give me quick insights on today\'s transactions' }
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Call real AI agent API
      const response = await aiAgentApi.chat('fraud-analyst', [
        { role: 'user', content: currentInput }
      ]);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      toast({
        title: 'AI Agent Error',
        description: error.message || 'Failed to get AI response. Please ensure backend is running.',
        variant: 'destructive',
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'm unable to connect to the AI service right now. Error: ${error.message}. Please check that the backend is running on port 8081.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#003366] to-[#0B3058] bg-clip-text text-transparent">
            AI Fraud Detection Agent
          </h1>
          <p className="text-gray-600 mt-2">
            Powered by advanced machine learning models for intelligent fraud analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-250px)] flex flex-col">
              <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-[#003366] to-[#0B3058] text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#8CC63F]/20 rounded-lg">
                    <Bot className="w-6 h-6 text-[#8CC63F]" />
                  </div>
                  <div>
                    <CardTitle className="text-white">SentinelAI Assistant</CardTitle>
                    <CardDescription className="text-gray-300">Always learning, always protecting</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-2xl p-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-[#8CC63F] to-[#A2D45E] text-[#003366]'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-2xl p-4">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-[#8CC63F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[#8CC63F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[#8CC63F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything about fraud detection..."
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="px-6 bg-gradient-to-r from-[#8CC63F] to-[#A2D45E] hover:from-[#7AB52F] hover:to-[#91C34E] text-[#003366]"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggested Actions */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#003366] to-[#0B3058] text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Sparkles className="w-5 h-5 text-[#8CC63F]" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {suggestedActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestedAction(action.prompt)}
                      className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-[#8CC63F]/10 rounded-xl transition-all text-left border border-transparent hover:border-[#8CC63F]/30"
                    >
                      <div className="p-2 bg-[#8CC63F]/10 rounded-lg">
                        <Icon className="w-4 h-4 text-[#003366]" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{action.label}</span>
                    </motion.button>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI Stats */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#003366] to-[#0B3058] text-white rounded-t-lg">
                <CardTitle className="text-white">AI Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Detection Accuracy</span>
                    <span className="text-sm font-semibold text-[#003366]">98.7%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '98.7%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-[#8CC63F] to-[#A2D45E]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">False Positive Rate</span>
                    <span className="text-sm font-semibold text-[#003366]">2.1%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '2.1%' }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className="h-full bg-gradient-to-r from-[#003366] to-[#0B3058]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Cases Analyzed Today</span>
                    <span className="font-bold text-[#003366]">247</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Fraud Prevented</span>
                    <span className="font-bold text-[#8CC63F]">$1.2M</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-[#003366] to-[#0B3058] text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Settings className="w-5 h-5 text-[#8CC63F]" />
                  <span>AI Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Auto-analyze transactions</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8CC63F]"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Real-time alerts</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8CC63F]"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-700">Advanced patterns</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8CC63F]"></div>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

