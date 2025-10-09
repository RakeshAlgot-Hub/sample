import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Bell, Send, Users, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout/Layout';
import { useProjectConfig } from '../hooks/useProjectConfig';
import { useAdminStore } from '../stores/useAdminStore';
import { useToast } from '../components/UI/ToastContainer';
import Button from '../components/UI/Button';
import type { AdminTabType, SubscribedUser } from '../types/admin';

const AdminPage: React.FC = () => {
  const { projectName, theme } = useProjectConfig();
  const {
    subscribedUsers,
    allUsers,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    fetchAllUsers,
    fetchSubscribedUsers,
    sendNotificationToAll,
    sendNotificationToUser,
    sendEmailToUser,
    clearError
  } = useAdminStore();

  const { showSuccess, showError } = useToast();

  // State for bulk messaging
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  // State for individual messaging
  const [individualMessages, setIndividualMessages] = useState<Record<string, string>>({});
  const [individualSubjects, setIndividualSubjects] = useState<Record<string, string>>({});
  const [sendingToUser, setSendingToUser] = useState<string | null>(null);

  useEffect(() => {
    fetchAllUsers();
    fetchSubscribedUsers();
  }, []);

  useEffect(() => {
    if (error) {
      showError('Admin Error', error);
      clearError();
    }
  }, [error, showError, clearError]);

  const handleTabChange = (tab: AdminTabType) => {
    setActiveTab(tab);
    setBulkMessage('');
    setBulkSubject('');
    setIndividualMessages({});
    setIndividualSubjects({});
  };

  const handleBulkSend = async () => {
    if (!bulkMessage.trim()) {
      showError('Validation Error', 'Please enter a message');
      return;
    }

    if (activeTab === 'sendEmail' && !bulkSubject.trim()) {
      showError('Validation Error', 'Please enter a subject for email');
      return;
    }

    setIsSendingBulk(true);

    try {
      if (activeTab === 'pushNotification') {
        const response = await sendNotificationToAll(bulkMessage);
        if (response.code === 1107) {
          showSuccess('Success', 'Push notifications sent to all users successfully!');
          setBulkMessage('');
        } else {
          showError('Failed', response.message || 'Failed to send notifications');
        }
      } else {
        // For email, we need to send to each user individually since we only have single email endpoint
        const emailPromises = allUsers.map(user => 
          sendEmailToUser({
            email: user.email,
            subject: bulkSubject,
            message: bulkMessage,
            templateName: 'generalTemplate.html',
            isHtml: true
          })
        );

        await Promise.all(emailPromises);
        showSuccess('Success', 'Emails sent to all users successfully!');
        setBulkMessage('');
        setBulkSubject('');
      }
    } catch (error) {
      showError('Failed', `Failed to send ${activeTab === 'pushNotification' ? 'notifications' : 'emails'}`);
    } finally {
      setIsSendingBulk(false);
    }
  };

  const handleIndividualSend = async (userId: string, userEmail: string) => {
    const message = individualMessages[userId];
    const subject = individualSubjects[userId];
     console.log("userId", userId)

    if (!message?.trim()) {
      showError('Validation Error', 'Please enter a message');
      return;
    }

    if (activeTab === 'sendEmail' && !subject?.trim()) {
      showError('Validation Error', 'Please enter a subject for email');
      return;
    }

    setSendingToUser(userId);

    try {
      if (activeTab === 'pushNotification') {
        console.log("userId", userId)
        const response = await sendNotificationToUser(userId, message);
        if (response.code === 1110) {
          showSuccess('Success', 'Push notification sent successfully!');
          setIndividualMessages(prev => ({ ...prev, [userId]: '' }));
        } else {
          showError('Failed', response.message || 'Failed to send notification');
        }
      } else {
        const response = await sendEmailToUser({
          email: userEmail,
          subject: subject,
          message: message,
          templateName: 'generalTemplate.html',
          isHtml: true
        });
        
        if (response.code === 1051) {
          showSuccess('Success', 'Email sent successfully!');
          setIndividualMessages(prev => ({ ...prev, [userId]: '' }));
          setIndividualSubjects(prev => ({ ...prev, [userId]: '' }));
        } else {
          showError('Failed', response.message || 'Failed to send email');
        }
      }
    } catch (error) {
      showError('Failed', `Failed to send ${activeTab === 'pushNotification' ? 'notification' : 'email'}`);
    } finally {
      setSendingToUser(null);
    }
  };

  const updateIndividualMessage = (userId: string, message: string) => {
    setIndividualMessages(prev => ({ ...prev, [userId]: message }));
  };

  const updateIndividualSubject = (userId: string, subject: string) => {
    setIndividualSubjects(prev => ({ ...prev, [userId]: subject }));
  };

  // Get users based on active tab
  const getUsersForTab = () => {
    if (activeTab === 'pushNotification') {
      return subscribedUsers;
    } else {
      return allUsers;
    }
  };

  const users = getUsersForTab();
  console.log("users", users)

  return (
    <Layout>
      <div className="min-h-screen relative overflow-hidden">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: theme.colors.primary[600] }}
            >
              Admin Dashboard
            </h1>
            <p
              className="text-lg"
              style={{ color: theme.colors.primary[500] }}
            >
              Manage notifications and emails for {projectName}
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20 flex">
              <button
                onClick={() => handleTabChange('sendEmail')}
                data-testid="send-email-tab-button"
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'sendEmail'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Mail className="w-5 h-5" />
                Send Email
              </button>
              <button
                onClick={() => handleTabChange('pushNotification')}
                data-testid="push-notification-tab-button"
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'pushNotification'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-5 h-5" />
                Push Notification
              </button>
            </div>
          </motion.div>

          {/* Bulk Messaging Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${theme.colors.primary[500]}20` }}
              >
                <MessageSquare className="w-6 h-6" style={{ color: theme.colors.primary[600] }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: theme.colors.primary[700] }}>
                Send to All Users
              </h2>
            </div>

            <div className="space-y-4">
              {activeTab === 'sendEmail' && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.primary[700] }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={bulkSubject}
                    data-testid="bulk-email-subject"
                    onChange={(e) => setBulkSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: theme.colors.primary[700] }}>
                  Message
                </label>
                <textarea
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  data-testid="bulk-notification-message"
                  placeholder={`Enter your ${activeTab === 'pushNotification' ? 'notification' : 'email'} message`}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              <Button
                onClick={handleBulkSend}
                loading={isSendingBulk}
                data-testid="send-to-all-button"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Send className="w-5 h-5 mr-2" />
                Send to All ({users.length} users)
              </Button>
            </div>
          </motion.div>

          {/* Users List Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${theme.colors.secondary[500]}20` }}
              >
                <Users className="w-6 h-6" style={{ color: theme.colors.secondary[600] }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: theme.colors.secondary[700] }}>
                {activeTab === 'pushNotification' ? 'Subscribed Users' : 'All Users'} ({users.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No {activeTab === 'pushNotification' ? 'subscribed' : ''} users found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {users?.map((user) => {
                  const userId = (user as SubscribedUser).userId ?? user.id;
                  return (
                    <div
                      key={userId}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <div className="flex gap-2 mt-1">
                                {user.role && (
                                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    {user.role}
                                  </span>
                                )}
                                {activeTab === 'pushNotification' && 'subscribed' in user && (
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                    user.subscribed 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user.subscribed ? 'Subscribed' : 'Unsubscribed'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Message inputs and button in horizontal layout */}
                            <div className="flex items-center gap-2 flex-1 max-w-2xl">
                              {activeTab === 'sendEmail' && (
                                <input
                                  type="text"
                                  value={individualSubjects[userId] || ''}
                                  data-testid={`individual-subject-${userId}`}
                                  onChange={(e) => updateIndividualSubject(userId, e.target.value)}
                                  placeholder="Subject"
                                  className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-sm flex-1 min-w-0"
                                />
                              )}

                              <input
                                type="text"
                                value={individualMessages[userId] || ''}
                                data-testid={`individual-message-${userId}`}
                                onChange={(e) => updateIndividualMessage(userId, e.target.value)}
                                placeholder={`${activeTab === 'pushNotification' ? 'Notification' : 'Email'} message`}
                                className="px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors text-sm flex-1 min-w-0"
                              />

                              <button
                                onClick={() => handleIndividualSend(userId, user.email)}
                                disabled={sendingToUser === userId}
                                data-testid={`send-to-user-button-${userId}`}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                                  activeTab === 'pushNotification'
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {sendingToUser === userId ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <Send className="w-4 h-4" />
                                    <span>Send</span>
                                  </div>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;