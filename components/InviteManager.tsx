'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Send, UserPlus, CheckCircle, AlertCircle, Clock, User, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

interface InviteManagerProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'send' | 'history';
}

interface Invite {
  id: number;
  recipient_email?: string;
  sender_name?: string;
  sender_email?: string;
  sender_photo?: string;
  status: string;
  message?: string;
  created_at: string;
}

const InviteManager: React.FC<InviteManagerProps> = ({ isOpen, onClose, mode = 'send' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sent');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [sentInvites, setSentInvites] = useState<Invite[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<Invite[]>([]);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const sentResponse = await fetch('/api/invites/sent', {
        credentials: 'include',
      });
      if (sentResponse.ok) {
        const sentData = await sentResponse.json();
        setSentInvites(sentData.invites);
      }

      const receivedResponse = await fetch('/api/invites/received', {
        credentials: 'include',
      });
      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json();
        setReceivedInvites(receivedData.invites);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invites/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          recipient_email: email,
          message: message
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setEmail('');
        setMessage('');
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send invite');
      }
    } catch (err) {
      setError('Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      const response = await fetch(`/api/invites/accept/${inviteId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        fetchInvites();
        toast.success('Invite accepted successfully!');
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      toast.error('Failed to accept invite');
    }
  };

  const handleDeclineInvite = async (inviteId: number) => {
    try {
      const response = await fetch(`/api/invites/decline/${inviteId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        fetchInvites();
        toast.success('Invite declined successfully!');
      }
    } catch (error) {
      console.error('Error declining invite:', error);
      toast.error('Failed to decline invite');
    }
  };

  useEffect(() => {
    if (mode === 'history') {
      fetchInvites();
    }
  }, [mode]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined': return <X className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'declined': return 'Declined';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  if (mode === 'send') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
          {/* Header */}
          <div className="relative bg-black text-white p-6 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Send Invitation</h2>
                <p className="text-gray-300 text-sm">Invite someone to collaborate</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Invite Sent!</h3>
                <p className="text-gray-600">Your invitation has been sent successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Message (Optional)
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Add a personal message to your invitation..."
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !email}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        <span>Send Invite</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // History mode
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Invite History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="bg-black text-white p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Invite History</h2>
                  <p className="text-gray-300 text-sm">Manage your invitations</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('sent')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'sent'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sent Invites ({sentInvites.length})
                </button>
                <button
                  onClick={() => setActiveTab('received')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'received'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Received Invites ({receivedInvites.length})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading invites...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTab === 'sent' ? (
                    sentInvites.length === 0 ? (
                      <div className="text-center py-8">
                        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No sent invites</h3>
                        <p className="text-gray-600">You haven't sent any invitations yet.</p>
                      </div>
                    ) : (
                      sentInvites.map((invite) => (
                        <div key={invite.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Mail className="h-5 w-5 text-gray-400" />
                                <span className="font-medium text-gray-900">{invite.recipient_email}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invite.status)}`}>
                                  {getStatusText(invite.status)}
                                </span>
                              </div>
                              {invite.message && (
                                <p className="text-gray-600 text-sm mt-2 italic">"{invite.message}"</p>
                              )}
                              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(invite.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    receivedInvites.length === 0 ? (
                      <div className="text-center py-8">
                        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No received invites</h3>
                        <p className="text-gray-600">You haven't received any invitations yet.</p>
                      </div>
                    ) : (
                      receivedInvites.map((invite) => (
                        <div key={invite.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {invite.sender_photo ? (
                                <img
                                  src={invite.sender_photo}
                                  alt={invite.sender_name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-medium text-gray-900">{invite.sender_name}</h4>
                                  <p className="text-sm text-gray-600">{invite.sender_email}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invite.status)}`}>
                                  {getStatusText(invite.status)}
                                </span>
                              </div>
                              {invite.message && (
                                <p className="text-gray-600 text-sm mb-3 italic">"{invite.message}"</p>
                              )}
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(invite.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                              {invite.status === 'pending' && (
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleAcceptInvite(invite.id)}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    onClick={() => handleDeclineInvite(invite.id)}
                                    size="sm"
                                    variant="destructive"
                                  >
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InviteManager;









