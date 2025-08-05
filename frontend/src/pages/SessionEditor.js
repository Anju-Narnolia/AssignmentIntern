import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sessionsAPI } from '../services/api';
import toast from 'react-hot-toast';

const SessionEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    tags: '',
    json_file_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  // Load existing session if editing
  useEffect(() => {
    if (id) {
      loadSession();
    }
  }, [id]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const response = await sessionsAPI.getMySession(id);
      const session = response.data.session;
      
      setFormData({
        title: session.title,
        tags: session.tags.join(', '),
        json_file_url: session.json_file_url
      });
      setSessionId(session.id);
    } catch (error) {
      toast.error('Failed to load session');
      navigate('/my-sessions');
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-save function
  const debouncedAutoSave = useCallback(
    (() => {
      let timeoutId;
      return (data) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          saveDraft(data);
        }, 5000); // 5 seconds delay
      };
    })(),
    []
  );

  // Handle form changes with auto-save
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    
    setFormData(newData);
    
    // Trigger auto-save after 5 seconds of inactivity
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      debouncedAutoSave(newData);
    }, 5000);
    
    setAutoSaveTimer(timer);
  };

  const saveDraft = async (data = formData) => {
    if (!data.title || !data.json_file_url) {
      return; // Don't save if required fields are empty
    }

    try {
      setSaving(true);
      const response = await sessionsAPI.saveDraft({
        ...data,
        sessionId: sessionId
      });
      
      if (!sessionId) {
        setSessionId(response.data.session.id);
      }
      
      setLastSaved(new Date());
      toast.success('Draft saved automatically');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    await saveDraft();
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    
    if (!sessionId) {
      toast.error('Please save as draft first');
      return;
    }

    try {
      setLoading(true);
      await sessionsAPI.publishSession(sessionId);
      toast.success('Session published successfully!');
      navigate('/my-sessions');
    } catch (error) {
      toast.error('Failed to publish session');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

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
              <button
                onClick={() => navigate('/my-sessions')}
                className="text-xl font-semibold text-gray-900"
              >
                ← Back to My Sessions
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.email}
              </span>
              {lastSaved && (
                <span className="text-xs text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {id ? 'Edit Session' : 'Create New Session'}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Create your wellness session. Your work will be auto-saved every 5 seconds.
              </p>
            </div>

            <form className="px-6 py-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Session Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter session title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="yoga, meditation, wellness (comma-separated)"
                  value={formData.tags}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Separate tags with commas
                </p>
              </div>

              <div>
                <label htmlFor="json_file_url" className="block text-sm font-medium text-gray-700">
                  JSON File URL *
                </label>
                <input
                  type="url"
                  id="json_file_url"
                  name="json_file_url"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://example.com/session.json"
                  value={formData.json_file_url}
                  onChange={handleChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  URL to your session JSON file
                </p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={saving || !formData.title || !formData.json_file_url}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={loading || !sessionId}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Publishing...' : 'Publish Session'}
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  {saving && 'Auto-saving...'}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionEditor; 