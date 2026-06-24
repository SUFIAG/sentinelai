'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
} from 'lucide-react';

export default function SettingsUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock users - replace with real API
  const users = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@sentinel.ai',
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: '2026-01-15',
      lastLogin: '2026-06-22',
    },
    {
      id: '2',
      name: 'Analyst John',
      email: 'john@sentinel.ai',
      role: 'ANALYST',
      status: 'ACTIVE',
      createdAt: '2026-02-01',
      lastLogin: '2026-06-21',
    },
    {
      id: '3',
      name: 'Reviewer Sarah',
      email: 'sarah@sentinel.ai',
      role: 'REVIEWER',
      status: 'ACTIVE',
      createdAt: '2026-03-10',
      lastLogin: '2026-06-20',
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-400';
      case 'ANALYST':
        return 'bg-blue-500/10 text-blue-400';
      case 'REVIEWER':
        return 'bg-green-500/10 text-green-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management
            </h1>
          <p className="text-gray-600 mt-2">
            Manage users, roles, and permissions
          </p>
        </div>

        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Users</div>
          <div className="text-2xl font-bold mt-1">{users.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Users</div>
          <div className="text-2xl font-bold mt-1 text-green-400">
            {users.filter((u) => u.status === 'ACTIVE').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Admins</div>
          <div className="text-2xl font-bold mt-1 text-red-400">
            {users.filter((u) => u.role === 'ADMIN').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Analysts</div>
          <div className="text-2xl font-bold mt-1 text-blue-400">
            {users.filter((u) => u.role === 'ANALYST').length}
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                  Last Login
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border hover:bg-primary/5 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge className={`${getRoleColor(user.role)} flex items-center gap-1 w-fit`}>
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      className={
                        user.status === 'ACTIVE'
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-gray-500/10 text-gray-400'
                      }
                    >
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role Permissions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Role Permissions</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-surface/50">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-red-500/10 text-red-400">ADMIN</Badge>
              <span className="text-xs text-muted-foreground">Full Access</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Full system access, user management, configuration, audit logs
            </p>
          </div>
          <div className="p-4 rounded-lg bg-surface/50">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-blue-500/10 text-blue-400">ANALYST</Badge>
              <span className="text-xs text-muted-foreground">Investigation Access</span>
            </div>
            <p className="text-sm text-muted-foreground">
              View transactions, manage cases, review alerts, create reports
            </p>
          </div>
          <div className="p-4 rounded-lg bg-surface/50">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-green-500/10 text-green-400">REVIEWER</Badge>
              <span className="text-xs text-muted-foreground">Read Only</span>
            </div>
            <p className="text-sm text-muted-foreground">
              View transactions and alerts, no modification access
            </p>
          </div>
        </div>
      </Card>
      </div>
    </DashboardLayout>
  );
}

