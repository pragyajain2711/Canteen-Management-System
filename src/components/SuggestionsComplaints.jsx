import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { MessageSquare, Check, X, Send, AlertCircle } from 'lucide-react';
import { feedbackApi } from './api';

const SuggestionsComplaints = () => {
  const { isAuthenticated, employee, isAdmin } = useContext(AuthContext);
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [responseText, setResponseText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [respondingTo, setRespondingTo] = useState(null);
  const [suggestionType, setSuggestionType] = useState('suggestion');

  const loadSuggestions = async () => {
    try {
      let response;
      if (isAdmin) {
        const params = {};
        if (activeTab === 'pending') params.status = 'PENDING';
        if (activeTab === 'responded') params.status = 'RESOLVED';
        
        response = await feedbackApi.getAllSuggestions(params);
      } else {
        response = await feedbackApi.getMySuggestions();
      }
      setSuggestions(response.data);
    } catch (error) {
      console.error("Failed to load suggestions:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSuggestions();
    }
  }, [activeTab, isAdmin, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;

    try {
      await feedbackApi.createSuggestion(newSuggestion);
      setNewSuggestion('');
      loadSuggestions();
    } catch (error) {
      console.error("Failed to submit suggestion:", error);
    }
  };

  const handleRespond = async (suggestionId) => {
    if (!responseText.trim()) return;

    try {
      await feedbackApi.respondToSuggestion(suggestionId, responseText);
      setResponseText('');
      setRespondingTo(null);
      loadSuggestions();
    } catch (error) {
      console.error("Failed to respond to suggestion:", error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Suggestions & Complaints</h1>
      
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col space-y-4">
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="type"
                  checked={suggestionType === 'suggestion'}
                  onChange={() => setSuggestionType('suggestion')}
                />
                <span className="ml-2">Suggestion</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio"
                  name="type"
                  checked={suggestionType === 'complaint'}
                  onChange={() => setSuggestionType('complaint')}
                />
                <span className="ml-2">Complaint</span>
              </label>
            </div>
            
            <textarea
              className="w-full p-3 border rounded"
              rows={3}
              placeholder={`Enter your ${suggestionType} here...`}
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
            />
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 self-end"
            >
              Submit
            </button>
          </div>
        </form>
      )}
      
      <div className="border rounded-lg overflow-hidden">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'all' ? 'bg-gray-100 font-medium' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          {isAdmin && (
            <>
              <button
                className={`px-4 py-2 ${activeTab === 'pending' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
              <button
                className={`px-4 py-2 ${activeTab === 'responded' ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => setActiveTab('responded')}
              >
                Responded
              </button>
            </>
          )}
        </div>
        
        <div className="divide-y">
          {suggestions.length === 0 ? (
            <p className="p-4 text-center text-gray-500">No suggestions found</p>
          ) : (
            suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {suggestion.senderName || 'Anonymous'}
                      <span className="ml-2 text-sm text-gray-500">
                        {new Date(suggestion.createdAt).toLocaleString()}
                      </span>
                    </p>
                    <p className="mt-1">{suggestion.content}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {suggestion.type === 'SUGGESTION' ? 'Suggestion' : 'Complaint'}
                  </span>
                </div>
                
                {suggestion.response && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="font-medium text-gray-700">Admin Response:</p>
                    <p className="mt-1">{suggestion.response}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(suggestion.responseAt).toLocaleString()}
                    </p>
                  </div>
                )}
                
                {isAdmin && !suggestion.response && (
                  <div className="mt-3">
                    {respondingTo === suggestion.id ? (
                      <div className="flex flex-col space-y-2">
                        <textarea
                          className="w-full p-2 border rounded"
                          rows={2}
                          placeholder="Enter your response..."
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                        />
                        <div className="flex space-x-2 justify-end">
                          <button
                            className="px-3 py-1 bg-gray-200 rounded"
                            onClick={() => setRespondingTo(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded"
                            onClick={() => handleRespond(suggestion.id)}
                          >
                            Submit Response
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="text-sm text-blue-500 hover:text-blue-700"
                        onClick={() => setRespondingTo(suggestion.id)}
                      >
                        Respond
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsComplaints;