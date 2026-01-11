import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithflutter, isClaudeConfigured } from '../lib/claude';
import styles from './Chat.module.css';

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:  "Hello, friend! 🦋 I'm Flutter, your journaling companion. How are you feeling today?  I'm here to listen and help you reflect.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (! input.trim() || isLoading) return;

    const userMessage:  ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [... messages, userMessage]. map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      const response = await chatWithflutter(chatHistory);

      const flutterResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, flutterResponse]);
    } catch (error) {
      console.error('Failed to get response:', error);
      const errorResponse: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having a little trouble right now, but I'm still here for you!  Could you try again?  🦋",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerEmoji}>🦋</span>
        <div>
          <h1 className={styles.headerTitle}>Chat with Flutter</h1>
          <p className={styles.headerSubtitle}>
            {isClaudeConfigured() ? 'Powered by Claude' : 'Your wellness companion'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        {messages. map(message => (
          <div
            key={message. id}
            className={`${styles.messageRow} ${
              message.role === 'user' ?  styles.messageRowUser : styles.messageRowAssistant
            }`}
          >
            <div
              className={`${styles.messageBubble} ${
                message.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.messageRow} ${styles. messageRowAssistant}`}>
            <div className={`${styles.messageBubble} ${styles.messageBubbleAssistant}`}>
              <span className={styles.loadingMessage}>
                <span className={styles.loadingEmoji}>🦋</span>
                <span className={styles.loadingText}>Flutter is thinking... </span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.inputContainer}>
        <div className={styles. inputWrapper}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ! e.shiftKey && sendMessage()}
            placeholder="Talk to Flutter..."
            className={styles.textInput}
          />
          <button
            onClick={sendMessage}
            disabled={! input.trim() || isLoading}
            className={styles.sendButton}
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}