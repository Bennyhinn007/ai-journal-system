const API_BASE = 'http://localhost:5000/api';

const { useState, useEffect } = React;

function App() {
  const [activeTab, setActiveTab] = useState('write');
  const [userId, setUserId] = useState('');
  const [ambience, setAmbience] = useState('forest');
  const [journalText, setJournalText] = useState('');
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load entries when userId changes
  useEffect(() => {
    if (userId) {
      loadEntries();
      loadInsights();
    }
  }, [userId]);

  const loadEntries = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_BASE}/journal/${userId}`);
      const data = await response.json();
      setEntries(data || []);
    } catch (error) {
      setMessage('Error loading entries: ' + error.message);
    }
  };

  const loadInsights = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_BASE}/journal/insights/${userId}`);
      const data = await response.json();
      setInsights(data);
    } catch (error) {
      setMessage('Error loading insights: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !journalText) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ambience, text: journalText }),
      });

      if (response.ok) {
        setMessage('✓ Journal entry saved successfully!');
        setJournalText('');
        loadEntries();
        loadInsights();
      } else {
        setMessage('Error saving entry');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
    setLoading(false);
  };

  const handleAnalyze = async (text) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/journal/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      setMessage('Error analyzing: ' + error.message);
    }
    setLoading(false);
  };

  return React.createElement(
    'div',
    { className: 'container' },
    React.createElement('h1', null, '🌿 AI Journal System'),
    React.createElement(
      'div',
      { className: 'form-group' },
      React.createElement('label', null, 'User ID'),
      React.createElement('input', {
        type: 'text',
        value: userId,
        onChange: (e) => setUserId(e.target.value),
        placeholder: 'Enter your user ID',
      })
    ),
    message &&
      React.createElement('div', {
        className: message.includes('Error') ? 'error' : 'success',
        dangerHTML: { __html: message },
      }),
    React.createElement(
      'div',
      { className: 'tabs' },
      React.createElement(
        'button',
        {
          className: 'tab-button ' + (activeTab === 'write' ? 'active' : ''),
          onClick: () => setActiveTab('write'),
        },
        'Write Entry'
      ),
      React.createElement(
        'button',
        {
          className: 'tab-button ' + (activeTab === 'entries' ? 'active' : ''),
          onClick: () => setActiveTab('entries'),
        },
        'Previous Entries'
      ),
      React.createElement(
        'button',
        {
          className: 'tab-button ' + (activeTab === 'insights' ? 'active' : ''),
          onClick: () => setActiveTab('insights'),
        },
        'Insights'
      )
    ),
    React.createElement(
      'div',
      {
        className: 'tab-content ' + (activeTab === 'write' ? 'active' : ''),
      },
      React.createElement('h2', null, 'Write New Journal Entry'),
      React.createElement(
        'form',
        { onSubmit: handleSubmit },
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', null, 'Session Ambience'),
          React.createElement(
            'select',
            {
              value: ambience,
              onChange: (e) => setAmbience(e.target.value),
            },
            React.createElement('option', { value: 'forest' }, '🌲 Forest'),
            React.createElement('option', { value: 'ocean' }, '🌊 Ocean'),
            React.createElement('option', { value: 'mountain' }, '⛰️ Mountain')
          )
        ),
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', null, 'Journal Entry'),
          React.createElement('textarea', {
            value: journalText,
            onChange: (e) => setJournalText(e.target.value),
            placeholder: 'Write your thoughts and feelings...',
          })
        ),
        React.createElement(
          'button',
          { type: 'submit', disabled: loading },
          loading ? 'Saving...' : '📝 Save Entry'
        )
      )
    ),
    React.createElement(
      'div',
      {
        className: 'tab-content ' + (activeTab === 'entries' ? 'active' : ''),
      },
      React.createElement('h2', null, 'Your Journal Entries'),
      entries.length === 0
        ? React.createElement('p', null, 'No entries yet. Start by writing one!')
        : entries.map((entry, idx) =>
            React.createElement(
              'div',
              { key: idx, className: 'entry' },
              React.createElement(
                'div',
                { className: 'entry-header' },
                React.createElement(
                  'span',
                  { className: 'entry-ambience' },
                  entry.ambience
                ),
                React.createElement(
                  'span',
                  { className: 'entry-date' },
                  new Date(entry.createdAt).toLocaleDateString()
                )
              ),
              React.createElement('p', { className: 'entry-text' }, entry.text),
              React.createElement(
                'button',
                {
                  onClick: () => handleAnalyze(entry.text),
                  disabled: loading,
                },
                loading ? 'Analyzing...' : '🔍 Analyze Emotion'
              ),
              analysis &&
                React.createElement(
                  'div',
                  { className: 'analysis-result' },
                  React.createElement(
                    'div',
                    { className: 'emotion-badge' },
                    '😊 ' + analysis.emotion
                  ),
                  React.createElement('p', null, analysis.summary),
                  React.createElement(
                    'div',
                    { className: 'keywords' },
                    analysis.keywords.map((kw, i) =>
                      React.createElement(
                        'span',
                        { key: i, className: 'keyword' },
                        kw
                      )
                    )
                  )
                )
            )
          )
    ),
    React.createElement(
      'div',
      {
        className: 'tab-content ' + (activeTab === 'insights' ? 'active' : ''),
      },
      React.createElement('h2', null, 'Your Insights'),
      insights
        ? React.createElement(
            'div',
            { className: 'insights' },
            React.createElement(
              'div',
              { className: 'insight-stat' },
              '📊 Total Entries: ',
              React.createElement('strong', null, insights.totalEntries)
            ),
            insights.topEmotion &&
              React.createElement(
                'div',
                { className: 'insight-stat' },
                '😊 Top Emotion: ',
                React.createElement('strong', null, insights.topEmotion)
              ),
            insights.mostUsedAmbience &&
              React.createElement(
                'div',
                { className: 'insight-stat' },
                '🌍 Favorite Setting: ',
                React.createElement('strong', null, insights.mostUsedAmbience)
              ),
            React.createElement(
              'div',
              { className: 'insight-stat' },
              '🏷️ Common Keywords: ',
              React.createElement(
                'strong',
                null,
                insights.recentKeywords.join(', ')
              )
            )
          )
        : React.createElement('p', null, 'Load insights by selecting a user ID.')
    )
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
