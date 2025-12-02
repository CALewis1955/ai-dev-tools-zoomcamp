import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './App.css';

function App() {
  const [code, setCode] = useState('// Type your code here');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    const clientId = Date.now();
    
    // Determine WebSocket URL based on environment
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsUrl = `${protocol}//localhost:8000/ws/${clientId}`;
    
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      // Attempt to handle Codespaces/Gitpod URL patterns
      // If current host has -5173, replace with -8000
      if (window.location.hostname.includes('-5173')) {
        const backendHost = window.location.hostname.replace('-5173', '-8000');
        wsUrl = `${protocol}//${backendHost}/ws/${clientId}`;
      } else {
        // Production: use the same host and port as the page
        wsUrl = `${protocol}//${window.location.host}/ws/${clientId}`;
      }
    }

    console.log(`Connecting to WebSocket at: ${wsUrl}`);
    
    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
        setConnectionError('');
      };

      ws.current.onclose = (event) => {
        console.log('Disconnected from WebSocket', event);
        setIsConnected(false);
        if (!event.wasClean) {
            setConnectionError(`Disconnected. Code: ${event.code}. Reason: ${event.reason || 'Unknown'}`);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('WebSocket error occurred. Check console.');
      };

      ws.current.onmessage = (event) => {
        const message = event.data;
        setCode(message);
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
    }


    // Load Pyodide
    async function loadPyodide() {
      try {
        if (window.loadPyodide) {
          const pyodideInstance = await window.loadPyodide();
          setPyodide(pyodideInstance);
          console.log("Pyodide loaded");
        }
      } catch (e) {
        console.error("Error loading pyodide", e);
      }
    }
    loadPyodide();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleEditorChange = (value) => {
    setCode(value);
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(value);
    }
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);

    const defaultComments = {
      javascript: '// Type your code here',
      python: '# Type your code here',
      java: '// Type your code here'
    };

    // If the current code is one of the default comments, update it to the new language's default
    if (Object.values(defaultComments).includes(code.trim())) {
      const newCode = defaultComments[newLanguage];
      setCode(newCode);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(newCode);
      }
    }
  };

  const executeCode = async () => {
    setOutput('');
    if (language === 'javascript') {
      try {
        // Capture console.log output
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push(args.join(' '));
          originalLog(...args);
        };

        // Execute code
        new Function(code)();

        console.log = originalLog;
        setOutput(logs.join('\n'));
      } catch (error) {
        setOutput(error.toString());
      }
    } else if (language === 'python') {
      if (!pyodide) {
        setOutput('Pyodide is loading... please wait.');
        return;
      }
      try {
        let logs = [];
        pyodide.setStdout({ batched: (text) => {
            logs.push(text);
        } });
        await pyodide.runPythonAsync(code);
        setOutput(logs.join('\n'));
      } catch (error) {
        setOutput(error.toString());
      }
    } else {
      setOutput('Execution only supported for JavaScript and Python in this demo.');
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Online Interview Platform</h1>
        <div style={{ fontSize: '0.8rem', color: isConnected ? 'lightgreen' : 'red', display: 'flex', flexDirection: 'column' }}>
          <span>{isConnected ? '● Connected' : '● Disconnected'}</span>
          {!isConnected && <span style={{ fontSize: '0.6rem' }}>{connectionError}</span>}
        </div>
        <select value={language} onChange={handleLanguageChange}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <button onClick={executeCode}>Run Code</button>
      </header>
      <div className="editor-container">
        <Editor
          height="70vh"
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
        />
      </div>
      <div className="output-container">
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default App;

