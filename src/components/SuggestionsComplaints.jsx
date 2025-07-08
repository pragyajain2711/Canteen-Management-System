import { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { MessageSquare, Check, X, Send, AlertCircle } from 'lucide-react';
import { saveSuggestions, loadSuggestions } from './suggestionService';
const STORAGE_KEY = 'canteen_suggestions_v2'; // Add this at the top of your file

const SuggestionsComplaints = () => {
  const { isAuthenticated, employee, isAdmin } = useContext(AuthContext);
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [responseText, setResponseText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [respondingTo, setRespondingTo] = useState(null);
  const [suggestionType, setSuggestionType] = useState('suggestion');

  // Load suggestions on component mount
  useEffect(() => {
    const loaded = loadSuggestions();
    setSuggestions(loaded);
  }, []);

  // Save suggestions whenever they change
  useEffect(() => {
    saveSuggestions(suggestions);
  }, [suggestions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;

    const suggestion = {
      id: Date.now(),
      employeeId: employee.employeeId,
      employeeName: employee.fullName,
      type: suggestionType,
      text: newSuggestion,
      date: new Date(),
      status: 'pending',
      response: null,
      responseDate: null,
    };

    setSuggestions(prev => [suggestion, ...prev]);
    setNewSuggestion('');
  };

  const handleRespond = (suggestionId) => {
    if (!responseText.trim()) return;

    const updated = suggestions.map(s => 
      s.id === suggestionId 
        ? { 
            ...s, 
            response: responseText, 
            responseDate: new Date(), 
            status: 'responded' 
          } 
        : s
    );

    setSuggestions(updated);
    setResponseText('');
    setRespondingTo(null);
  };

  const filteredSuggestions = suggestions.filter(s => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return s.status === 'pending';
    if (activeTab === 'responded') return s.status === 'responded';
    if (activeTab === 'mine') return s.employeeId === employee?.employeeId;
    if (activeTab === 'suggestions') return s.type === 'suggestion';
    if (activeTab === 'complaints') return s.type === 'complaint';
    return true;
  });

  // Clear all data (for testing purposes)
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL suggestions data?')) {
      localStorage.removeItem(STORAGE_KEY);
      setSuggestions([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Debug button - remove in production */}
      {isAdmin && (
        <button 
          onClick={clearAllData}
          className="mb-4 text-sm bg-red-500 text-white px-3 py-1 rounded"
        >
          Clear All Data (Admin Only)
        </button>
      )}

      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <MessageSquare className="mr-2" /> 
        {isAdmin ? 'Employee Feedback' : 'Suggestions & Complaints'}
      </h1>

      {/* Employee Form */}
      {isAuthenticated && !isAdmin && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Submit Feedback</h2>
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={suggestionType === 'suggestion'}
                  onChange={() => setSuggestionType('suggestion')}
                  className="mr-2"
                />
                Suggestion
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={suggestionType === 'complaint'}
                  onChange={() => setSuggestionType('complaint')}
                  className="mr-2"
                />
                Complaint
              </label>
            </div>
            <textarea
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              placeholder={`Type your ${suggestionType} here...`}
              className="w-full p-3 border rounded-lg mb-3 min-h-[120px]"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Send className="mr-2" size={16} /> Submit
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 whitespace-nowrap ${activeTab === 'all' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
        >
          All
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 whitespace-nowrap ${activeTab === 'pending' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-4 py-2 whitespace-nowrap ${activeTab === 'suggestions' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            >
              Suggestions
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-4 py-2 whitespace-nowrap ${activeTab === 'complaints' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
            >
              Complaints
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab('responded')}
          className={`px-4 py-2 whitespace-nowrap ${activeTab === 'responded' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
        >
          Responded
        </button>
        {isAuthenticated && !isAdmin && (
          <button
            onClick={() => setActiveTab('mine')}
            className={`px-4 py-2 whitespace-nowrap ${activeTab === 'mine' ? 'border-b-2 border-blue-500 font-medium' : ''}`}
          >
            My Submissions
          </button>
        )}
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="mx-auto mb-2" />
            No {activeTab === 'all' ? 'feedback' : activeTab} found
          </div>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <div 
              key={suggestion.id} 
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                suggestion.type === 'complaint' 
                  ? 'border-red-500' 
                  : 'border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{suggestion.employeeName}</h3>
                  <p className="text-sm text-gray-500">
                    {suggestion.date.toLocaleString()} • 
                    <span className={`ml-2 capitalize ${
                      suggestion.type === 'complaint' 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                    }`}>
                      {suggestion.type}
                    </span>
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  suggestion.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {suggestion.status}
                </span>
              </div>
              <p className="mb-3 whitespace-pre-line">{suggestion.text}</p>

              {suggestion.response && (
                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-blue-800">Admin Response</h4>
                    <p className="text-sm text-blue-600">
                      {suggestion.responseDate.toLocaleString()}
                    </p>
                  </div>
                  <p className="text-blue-700 whitespace-pre-line">{suggestion.response}</p>
                </div>
              )}

              {isAdmin && suggestion.status === 'pending' && (
                <div className="mt-3">
                  {respondingTo === suggestion.id ? (
                    <div>
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Type your response here..."
                        className="w-full p-3 border rounded-lg mb-2 min-h-[100px]"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRespond(suggestion.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center"
                        >
                          <Check className="mr-1" size={16} /> Submit Response
                        </button>
                        <button
                          onClick={() => setRespondingTo(null)}
                          className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 flex items-center"
                        >
                          <X className="mr-1" size={16} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(suggestion.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Respond to this {suggestion.type}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SuggestionsComplaints;