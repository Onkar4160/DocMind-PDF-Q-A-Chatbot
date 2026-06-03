import { useRef, useEffect, useState, useCallback } from 'react'
import MessageBubble from './MessageBubble'

const RobotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <rect x="8" y="15" width="2" height="2" fill="var(--accent)" />
    <rect x="14" y="15" width="2" height="2" fill="var(--accent)" />
    <path d="M12 11V7" />
    <circle cx="12" cy="5" r="2" />
    <path d="M3 15H1M23 15h-2" />
  </svg>
)

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="#0d1117" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

export default function ChatWindow({ messages, isLoading, docReady, onSend }) {
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleInputChange = (e) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
  }

  const handleSubmit = useCallback((e) => {
    e?.preventDefault()
    if (!input.trim() || isLoading || !docReady) return
    onSend(input)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [input, isLoading, docReady, onSend])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <main className="chat-main">
      <div className="chat-header">
        <div className={`chat-header-status ${docReady ? '' : 'offline'}`} />
        <span className="chat-header-title">
          {docReady ? 'Document Q&A' : 'No document loaded'}
        </span>
        <span className="chat-header-subtitle">
          {docReady ? 'Ask anything about your PDF' : 'Upload a PDF to start'}
        </span>
      </div>

      <div className="messages-list" id="messages-list">
        {messages.length === 0 && !isLoading ? (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <h1 className="empty-state-title">
              {docReady ? 'Ready to answer' : 'Welcome to DocMind'}
            </h1>
            <p className="empty-state-body">
              {docReady
                ? 'Your document is indexed. Ask any question and the AI will answer strictly from the content.'
                : 'Upload a PDF document on the left to begin your AI-powered Q&A session.'}
            </p>
            {!docReady && (
              <ol className="empty-state-steps">
                {['Upload a PDF using the panel on the left', 'Wait for indexing to complete', 'Type your question below'].map((step, i) => (
                  <li key={i}>
                    <span className="step-num">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={msg}
              UserIcon={UserIcon}
              RobotIcon={RobotIcon}
            />
          ))
        )}

        {isLoading && (
          <div className="typing-indicator">
            <div className="message-avatar ai-avatar">
              <RobotIcon />
            </div>
            <div className="typing-dots" aria-label="AI is thinking">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <form className="chat-input-form" onSubmit={handleSubmit} id="chat-form">
          <textarea
            ref={textareaRef}
            id="chat-input"
            className="chat-textarea"
            placeholder={docReady ? 'Ask a question about the document…' : 'Upload a PDF first…'}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={!docReady || isLoading}
            rows={1}
            aria-label="Chat input"
          />
          <button
            id="send-btn"
            type="submit"
            className="send-btn"
            disabled={!docReady || isLoading || !input.trim()}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>
        <p className="input-hint">
          {docReady ? 'Enter to send · Shift+Enter for new line' : 'Upload a PDF to enable chat'}
        </p>
      </div>
    </main>
  )
}
