import SourceDrawer from './SourceDrawer'

export default function MessageBubble({ message, UserIcon, RobotIcon }) {
  const isUser = message.role === 'user'

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-inner">
        <div className={`message-avatar ${isUser ? 'user-avatar' : 'ai-avatar'}`}>
          {isUser ? <UserIcon /> : <RobotIcon />}
        </div>
        <div className={`bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
          {message.content}
        </div>
      </div>
      <span className="message-time">{message.time}</span>
      {!isUser && message.sources?.length > 0 && (
        <SourceDrawer sources={message.sources} />
      )}
    </div>
  )
}
