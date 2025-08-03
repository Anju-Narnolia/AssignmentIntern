import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionsAPI } from '../services/api';
import toast from 'react-hot-toast';

const MySessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchMySessions();
  }, []);

  const fetchMySessions = async () => {
    try {
      const response = await sessionsAPI.getMySessions();
      setSessions(response.data.sessions);
    } catch (error) {
      toast.error('Failed to fetch your sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      await sessionsAPI.deleteSession(sessionId);
      setSessions(sessions.filter(session => session.id !== sessionId));
      toast.success('Session deleted successfully');
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const handlePublish = async (sessionId) => {
    try {
      await sessionsAPI.publishSession(sessionId);
      setSessions(sessions.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'published' }
          : session
      ));
      toast.success('Session published successfully');
    } catch (error) {
      toast.error('Failed to publish session');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-semibold text-gray-900">
                Wellness Platform
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.email}
              </span>
              <Link
                to="/session-editor"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Create Session
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              My Sessions
            </h2>
            <Link
              to="/session-editor"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Create New Session
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                You haven't created any sessions yet.
              </div>
              <div className="mt-4">
                <Link
                  to="/session-editor"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Create your first session →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {session.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    {session.tags && session.tags.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {session.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-gray-500 mb-4">
                      <p>Created: {new Date(session.createdAt).toLocaleDateString()}</p>
                      <p>Updated: {new Date(session.updatedAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Link
                          to={`/session-editor/${session.id}`}
                          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        {session.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(session.id)}
                            className="text-green-600 hover:text-green-500 text-sm font-medium"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="text-red-600 hover:text-red-500 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                      <a
                        href={session.json_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                      >
                        View →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MySessions; 