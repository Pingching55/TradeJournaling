"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, User, DollarSign, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface TradingAccount {
  id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  created_at: string;
}

interface UserProfile {
  full_name: string;
  username: string;
  phone_number: string;
  email?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAccount, setNewAccount] = useState({
    name: '',
    initialBalance: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError('Error loading profile');
        setLoading(false);
        return;
      }

      setUserProfile({
        ...profile,
        email: user.email
      });

      // Get trading accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('trading_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (accountsError) {
        setError('Error loading trading accounts');
      } else {
        setAccounts(accountsData || []);
      }

      setLoading(false);
    } catch (err) {
      setError('An error occurred');
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const initialBalance = parseFloat(newAccount.initialBalance);
      
      const { data, error } = await supabase
        .from('trading_accounts')
        .insert({
          user_id: user.id,
          name: newAccount.name,
          initial_balance: initialBalance,
          current_balance: initialBalance,
        })
        .select()
        .single();

      if (error) {
        setError('Error creating trading account');
        return;
      }

      setAccounts([data, ...accounts]);
      setNewAccount({ name: '', initialBalance: '' });
      setIsAddingAccount(false);
    } catch (err) {
      setError('An error occurred while creating the account');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Error loading profile</p>
          <Button onClick={() => router.push('/auth/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your trading accounts and profile information</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                  <p className="text-gray-900">{userProfile.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Username</Label>
                  <p className="text-gray-900">{userProfile.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-gray-900">{userProfile.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
                  <p className="text-gray-900">{userProfile.phone_number}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Accounts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Trading Accounts
                    </CardTitle>
                    <CardDescription>Manage your trading accounts and balances</CardDescription>
                  </div>
                  <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Trading Account</DialogTitle>
                        <DialogDescription>
                          Create a new trading account to track your trades
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddAccount} className="space-y-4">
                        <div>
                          <Label htmlFor="accountName">Account Name</Label>
                          <Input
                            id="accountName"
                            type="text"
                            placeholder="e.g., Main Trading Account"
                            value={newAccount.name}
                            onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="initialBalance">Initial Balance</Label>
                          <Input
                            id="initialBalance"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={newAccount.initialBalance}
                            onChange={(e) => setNewAccount({...newAccount, initialBalance: e.target.value})}
                            required
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" className="flex-1">
                            Create Account
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsAddingAccount(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No trading accounts yet</p>
                    <Button onClick={() => setIsAddingAccount(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Account
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {accounts.map((account) => (
                      <div key={account.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{account.name}</h3>
                            <p className="text-sm text-gray-500">
                              Created: {new Date(account.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ${Number(account.current_balance).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Initial: ${Number(account.initial_balance).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}