import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './App.css';

function App() {
  const [code, setCode] = useState('// Type your code here');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [pyodide, setPyodide] = useState(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);
  const ws = useRef(null);

  useEffect(() => {
    const clientId = Date.now();
    // Assuming backend is running on port 8000
    ws.current = new WebSocket(`ws://localhost:8000/ws/${clientId}`);

    ws.current.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.current.onmessage = (event) => {
      const message = event.data;
      setCode(message);
    };

    // Load Pyodide
    async function loadPyodide() {
      try {
        if (window.loadPyodide) {
          const pyodideInstance = await window.loadPyodide();
          setPyodide(pyodideInstance);
          setIsPyodideLoading(false);
          console.log("Pyodide loaded");
        }
      } catch (e) {
        console.error("Error loading pyodide", e);
        setIsPyodideLoading(false);
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
        // eslint-disable-next-line no-new-func
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
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
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

