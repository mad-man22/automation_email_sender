import { useState, useRef } from 'react';
import { UploadCloud, FileText, Send, Loader2, Paperclip, X, Type } from 'lucide-react';

function App() {
  const [inputMode, setInputMode] = useState('csv'); // 'csv' or 'manual'
  const [manualEmails, setManualEmails] = useState('');
  const [file, setFile] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const csvInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleCsvDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        showToast("Please upload a valid CSV file.", "error");
      }
    }
  };

  const handleCsvChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAttachmentChange = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
    // reset input so the exact same file can be selected again if it was removed
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputMode === 'csv' && !file) {
      showToast("Please upload a CSV file.", "error");
      return;
    }
    if (inputMode === 'manual' && !manualEmails.trim()) {
      showToast("Please enter at least one email address.", "error");
      return;
    }
    if (!subject || !body) {
      showToast("Please fill in the subject and email body.", "error");
      return;
    }

    setLoading(true);
    setToast(null);

    const formData = new FormData();
    if (inputMode === 'csv' && file) {
      formData.append('csvFile', file);
    } else if (inputMode === 'manual') {
      formData.append('manualEmails', manualEmails);
    }
    
    formData.append('subject', subject);
    formData.append('body', body);
    
    // Append all selected attachments
    attachments.forEach(attachment => {
      formData.append('attachments', attachment);
    });

    try {
      const response = await fetch('http://localhost:3000/api/send-emails', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails');
      }

      showToast(`Success! Sent ${data.successful} emails.`, "success");
      
      // Reset form
      setFile(null);
      setManualEmails('');
      setAttachments([]);
      setSubject('');
      setBody('');
      if (csvInputRef.current) csvInputRef.current.value = '';
      if (attachmentInputRef.current) attachmentInputRef.current.value = '';
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header-brand">
        <img src="/logo.png" alt="PESFOSS Logo" className="brand-logo" onError={(e) => e.target.style.display='none'} />
        <h1>PESFOSS Mail Sender Automation</h1>
      </div>
      <p className="subtitle">Upload your CSV or type emails to reach everyone instantly.</p>

      <div className="glass-card">
        <form onSubmit={handleSubmit}>
          
          <div className="input-mode-toggle">
            <button 
              type="button" 
              className={`toggle-btn ${inputMode === 'csv' ? 'active' : ''}`}
              onClick={() => setInputMode('csv')}
            >
              <UploadCloud size={16} /> Upload CSV
            </button>
            <button 
              type="button" 
              className={`toggle-btn ${inputMode === 'manual' ? 'active' : ''}`}
              onClick={() => setInputMode('manual')}
            >
              <Type size={16} /> Type Emails
            </button>
          </div>

          <div className="form-group">
            {inputMode === 'csv' ? (
              <div 
                className={`file-drop-area ${dragActive ? "drag-active" : ""}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleCsvDrop}
                onClick={() => csvInputRef.current?.click()}
              >
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvChange}
                  style={{ display: "none" }}
                />
                {file ? (
                  <>
                    <FileText size={48} />
                    <p className="file-name">{file.name}</p>
                    <p className="file-drop-text">Click to change CSV data file</p>
                  </>
                ) : (
                  <>
                    <UploadCloud size={48} />
                    <p className="file-drop-text">Drag & drop your <strong>CSV Data file</strong> here</p>
                    <p className="file-drop-text" style={{ marginTop: '0.5rem' }}>or click to browse</p>
                  </>
                )}
              </div>
            ) : (
              <div className="manual-entry-area">
                <label htmlFor="manualEmails">Email Addresses</label>
                <textarea 
                  id="manualEmails"
                  placeholder="test1@example.com, test2@example.com&#10;test3@example.com"
                  value={manualEmails}
                  onChange={(e) => setManualEmails(e.target.value)}
                  className="manual-emails-textarea"
                ></textarea>
                <span className="helper-text">Separate emails with commas, spaces, or newlines.</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="subject">Email Subject</label>
            <input 
              type="text" 
              id="subject"
              placeholder="e.g. Welcome to our platform, {{FirstName}}!" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            {inputMode === 'csv' && (
              <span className="helper-text">You can use {'{{ColumnName}}'} to personalize your subject.</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="body">Email Body (Plain Text)</label>
            <textarea 
              id="body"
              placeholder={'Hi {{FirstName}},\n\nHere is a custom message for you!\n\nBest,\nTeam'}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            ></textarea>
            {inputMode === 'csv' && (
              <span className="helper-text">You can use {'{{ColumnName}}'} to personalize the body.</span>
            )}
          </div>

          <div className="form-group attachments-section">
            <div className="attachment-header">
              <label>Attachments (Optional)</label>
              <button 
                type="button" 
                className="btn-attach"
                onClick={() => attachmentInputRef.current?.click()}
              >
                <Paperclip size={16} />
                Add Files
              </button>
            </div>
            
            <input
              ref={attachmentInputRef}
              type="file"
              multiple
              onChange={handleAttachmentChange}
              style={{ display: "none" }}
            />
            
            {attachments.length > 0 && (
              <div className="attachments-list">
                {attachments.map((att, idx) => (
                  <div key={idx} className="attachment-item">
                    <div className="attachment-info">
                      <FileText size={16} className="attachment-icon" />
                      <span className="attachment-name" title={att.name}>{att.name}</span>
                      <span className="attachment-size">({formatBytes(att.size)})</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-remove-attachment"
                      onClick={() => removeAttachment(idx)}
                      title="Remove attachment"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                Sending...
              </>
            ) : (
              <>
                <Send size={20} />
                Send Emails
              </>
            )}
          </button>
        </form>

        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
