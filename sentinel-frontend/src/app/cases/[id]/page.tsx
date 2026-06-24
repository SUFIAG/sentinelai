'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { casesApi, Case, CaseComment, CaseHistory } from '@/lib/api/cases';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Send,
  Clock,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  History,
  Edit,
} from 'lucide-react';
import { useToast } from '@/lib/hooks/useToast';

export default function CaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params.id as string;

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [comments, setComments] = useState<CaseComment[]>([]);
  const [history, setHistory] = useState<CaseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');

  useEffect(() => {
    if (id) {
      loadCase();
      loadComments();
      loadHistory();
    }
  }, [id]);

  const loadCase = async () => {
    setLoading(true);
    try {
      const data = await casesApi.getById(id);
      setCaseData(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load case',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await casesApi.getComments(id);
      setComments(data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await casesApi.getHistory(id);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    setSendingComment(true);
    try {
      await casesApi.addComment(id, newComment);
      setNewComment('');
      loadComments();
      toast({
        title: 'Success',
        description: 'Comment added',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setSendingComment(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!caseData) return;
    try {
      await casesApi.updateStatus(id, newStatus);
      toast({
        title: 'Success',
        description: `Case status updated to ${newStatus}`,
      });
      loadCase();
      loadHistory();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'LOW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-500/10 text-green-400';
      case 'CLOSED':
        return 'bg-gray-500/10 text-gray-400';
      case 'INVESTIGATING':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'OPEN':
        return 'bg-blue-500/10 text-blue-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-1/3" />
          <div className="h-64 bg-surface rounded" />
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Case Not Found</h2>
        <Button onClick={() => router.push('/cases')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cases
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/cases')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Case #{caseData.caseNumber}
            </h1>
            <Badge className={`${getStatusColor(caseData.status)} text-sm px-3 py-1`}>
              {caseData.status}
            </Badge>
            <Badge className={`${getPriorityColor(caseData.priority)} text-sm px-3 py-1`}>
              {caseData.priority}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">{caseData.title}</p>
        </div>

        <div className="flex gap-2">
          {caseData.status === 'OPEN' && (
            <Button onClick={() => handleUpdateStatus('INVESTIGATING')}>
              Start Investigation
            </Button>
          )}
          {caseData.status === 'INVESTIGATING' && (
            <Button onClick={() => handleUpdateStatus('RESOLVED')}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Case Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <p className="text-sm mt-1">{caseData.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Fraud Type</label>
                  <p className="text-sm mt-1">{caseData.fraudType}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Created By</label>
                  <p className="text-sm mt-1">{caseData.createdByName || 'Unknown'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Created At</label>
                  <p className="text-sm mt-1">
                    {new Date(caseData.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Last Updated</label>
                  <p className="text-sm mt-1">
                    {new Date(caseData.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Related Data */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Related Data</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-surface/50">
                <div className="text-sm text-muted-foreground">Alerts</div>
                <div className="text-2xl font-bold mt-1">{caseData.alertIds?.length || 0}</div>
              </div>
              <div className="p-4 rounded-lg bg-surface/50">
                <div className="text-sm text-muted-foreground">Transactions</div>
                <div className="text-2xl font-bold mt-1">{caseData.transactionIds?.length || 0}</div>
              </div>
            </div>
            {caseData.totalLoss && (
              <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="text-sm text-muted-foreground">Total Loss</div>
                <div className="text-2xl font-bold mt-1 text-red-400">
                  ${caseData.totalLoss.toLocaleString()}
                </div>
              </div>
            )}
          </Card>

          {/* Resolution */}
          {caseData.resolution && (
            <Card className="p-6 bg-green-500/5 border-green-500/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Resolution
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground">Outcome</label>
                  <p className="text-sm mt-1">{caseData.outcome}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Summary</label>
                  <p className="text-sm mt-1">{caseData.resolution}</p>
                </div>
                {caseData.resolvedAt && (
                  <div>
                    <label className="text-xs text-muted-foreground">Resolved At</label>
                    <p className="text-sm mt-1">
                      {new Date(caseData.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Collaboration */}
        <div className="space-y-6">
          {/* Assignee */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-muted-foreground">Assigned To</label>
              <Button variant="ghost" size="sm">
                <Edit className="w-3 h-3" />
              </Button>
            </div>
            {caseData.assignedToName ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{caseData.assignedToName}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unassigned</p>
            )}
          </Card>

          {/* Comments & History Tabs */}
          <Card className="p-0 overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'comments'
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Comments ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <History className="w-4 h-4 inline mr-2" />
                History ({history.length})
              </button>
            </div>

            <div className="p-4 max-h-[600px] overflow-y-auto">
              {activeTab === 'comments' ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      No comments yet
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{item.action}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground">by {item.userName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment Input */}
            {activeTab === 'comments' && (
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                  />
                  <Button
                    onClick={handleSendComment}
                    disabled={sendingComment || !newComment.trim()}
                    size="sm"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

