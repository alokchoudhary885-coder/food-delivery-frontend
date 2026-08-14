import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useCartStore from '../store/cartStore';

const QUICK_PROMPTS = [
  '🌶️ 2 logon ke liye under ₹500 spicy dinner',
  '🥗 High protein healthy dinner',
  '🍰 Late night sweet desserts',
  '🍕 Best pizza & burger combo',
  '🍲 Authentic Biryani & Rolls',
];

export default function FoodieBot() {
  const [isOpen, setIsOpen]         = useState(false);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [listening, setListening]   = useState(false);
  const [messages, setMessages]     = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Namaste! 👋 Main hoon FoodieBot, aapka FoodRush AI Assistant. Mujhe batayein aapka mood, budget ya kya khane ka man hai!',
      recommendations: [],
    },
  ]);

  const { addItem, replaceCart } = useCartStore();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle Send AI Query
  const handleSend = async (queryText) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/recommend', { query: textToSend });
      const botResponse = data.data;

      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse.reply || 'Maine aapke liye ye dishes select ki hain! 🍕✨',
        totalPrice: botResponse.totalEstimatedPrice,
        recommendations: botResponse.recommendations || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('FoodieBot error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Oops! Abhi AI recommendations fetch karne mein dikkat aayi. Kripya thodi der baad dubara try karein.',
          recommendations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Add single item to cart
  const handleAddToCart = (item) => {
    const restId = item.restaurant?._id || 'ai_restaurant';
    const restName = item.restaurant?.name || 'Top Restaurant';
    const result = addItem(item, restId, restName);

    if (result?.conflict) {
      replaceCart(item, restId, restName);
      toast.success(`Cart updated with ${item.name}! 🛒`);
    } else {
      toast.success(`${item.name} added to cart! 🛒`);
    }
  };

  // Add all recommended items to cart
  const handleAddAllToCart = (recommendations) => {
    if (!recommendations || recommendations.length === 0) return;

    let addedCount = 0;
    recommendations.forEach((item, index) => {
      const restId = item.restaurant?._id || 'ai_restaurant';
      const restName = item.restaurant?.name || 'Top Restaurant';

      if (index === 0) {
        replaceCart(item, restId, restName);
      } else {
        addItem(item, restId, restName);
      }
      addedCount++;
    });

    toast.success(`🎉 Added all ${addedCount} dishes to your cart!`, { duration: 4000 });
  };

  // Voice Search for AI Assistant
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return toast.error('Voice search is not supported in this browser.');
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      toast.loading('🎙️ Sun raha hoon... Bolye! (e.g. 2 logon ke liye spicy pizza under 500)', { id: 'bot-voice' });
    };

    recognition.onresult = (e) => {
      const speechText = e.results[0][0].transcript;
      setListening(false);
      toast.success(`🎙️ "${speechText}"`, { id: 'bot-voice' });
      handleSend(speechText);
    };

    recognition.onerror = () => {
      setListening(false);
      toast.error('Voice samajh nahi aayi, please dobara try karein', { id: 'bot-voice' });
    };

    recognition.onend = () => setListening(false);

    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <>
      {/* ── Floating AI Trigger Button ── */}
      <div className="foodiebot-trigger-wrapper">
        <motion.button
          type="button"
          className="foodiebot-pill-btn"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open FoodieBot AI"
        >
          <span className="bot-emoji-icon">🤖</span>
          <span className="bot-btn-text">FoodieBot AI</span>
          <span className="bot-live-pulse" />
        </motion.button>
      </div>

      {/* ── Expandable AI Assistant Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="foodiebot-window glass"
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="foodiebot-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="bot-avatar-badge">🤖</div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    FoodieBot AI <span className="badge-ai-model">Smart Assistant</span>
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: '#22C55E', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span className="green-dot" /> Live MongoDB Connected
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="bot-header-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close FoodieBot"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Prompts Chips */}
            <div className="quick-prompts-scroller">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-chip"
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="foodiebot-messages">
              {messages.map((msg) => (
                <div key={msg.id} className={`message-row ${msg.sender}`}>
                  {msg.sender === 'bot' && <div className="msg-bot-avatar">🤖</div>}

                  <div className={`message-bubble ${msg.sender}`}>
                    <p style={{ margin: 0, lineHeight: 1.45 }}>{msg.text}</p>

                    {/* Dish Recommendation Cards */}
                    {msg.recommendations && msg.recommendations.length > 0 && (
                      <div className="ai-dish-recommendations">
                        {msg.recommendations.map((item) => (
                          <div key={item._id} className="ai-dish-card">
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                              alt={item.name}
                              className="ai-dish-img"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200';
                              }}
                            />
                            <div className="ai-dish-info">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span className={item.isVeg ? 'veg-badge' : 'non-veg-badge'}>
                                  {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                                </span>
                                {item.spiceLevel === 'hot' && <span className="spice-tag">🌶️ Spicy</span>}
                              </div>
                              <h4 className="ai-dish-title">{item.name}</h4>
                              <p className="ai-dish-rest">
                                🏪 {item.restaurant?.name} • ⭐ {item.restaurant?.rating}
                              </p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                                <span className="ai-dish-price">₹{item.price}</span>
                                <button
                                  type="button"
                                  className="ai-add-btn"
                                  onClick={() => handleAddToCart(item)}
                                >
                                  + Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add All Button Bar */}
                        <div className="ai-cart-summary-bar">
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                            Total: ₹{msg.totalPrice || msg.recommendations.reduce((s, i) => s + i.price, 0)}
                          </span>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAddAllToCart(msg.recommendations)}
                            style={{ borderRadius: 8 }}
                          >
                            🛒 Add All to Cart
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="message-row bot">
                  <div className="msg-bot-avatar">🤖</div>
                  <div className="message-bubble bot typing">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="foodiebot-input-bar"
            >
              <input
                type="text"
                className="bot-text-input"
                placeholder="Ask e.g. 2 logon ke liye spicy dinner..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className={`bot-mic-btn ${listening ? 'listening' : ''}`}
                onClick={handleVoiceInput}
                title="Speak to FoodieBot 🎙️"
              >
                🎙️
              </button>
              <button
                type="submit"
                className="bot-send-btn"
                disabled={loading || !input.trim()}
              >
                ➔
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .foodiebot-trigger-wrapper {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
        }
        .foodiebot-pill-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 50%, #E94560 100%);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.92rem;
          box-shadow: 0 8px 30px rgba(255, 107, 53, 0.45), 0 0 20px rgba(233, 69, 96, 0.35);
          cursor: pointer;
          transition: all 0.2s;
        }
        .foodiebot-pill-btn:hover {
          box-shadow: 0 12px 40px rgba(255, 107, 53, 0.65);
        }
        .bot-emoji-icon { font-size: 1.25rem; }
        .bot-live-pulse {
          width: 8px; height: 8px; border-radius: 50%;
          background: #22C55E;
          box-shadow: 0 0 8px #22C55E;
          animation: pulseGreen 1.5s infinite;
        }
        @keyframes pulseGreen {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }

        .foodiebot-window {
          position: fixed;
          bottom: 84px;
          right: 24px;
          width: 400px;
          max-width: calc(100vw - 32px);
          height: 580px;
          max-height: calc(100vh - 120px);
          background: rgba(22, 21, 42, 0.96);
          border: 1px solid rgba(255, 107, 53, 0.35);
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(255,107,53,0.15);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          overflow: hidden;
        }

        .foodiebot-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.04);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .bot-avatar-badge {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #FF6B35, #E94560);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }
        .badge-ai-model {
          font-size: 0.65rem; padding: 2px 6px; border-radius: 6px;
          background: rgba(255, 107, 53, 0.2); color: var(--color-orange);
          font-weight: 600;
        }
        .green-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #22C55E; display: inline-block;
        }
        .bot-header-btn {
          background: rgba(255, 255, 255, 0.08); border: none; color: var(--color-text-muted);
          width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
          display: flex; align-items: center; justify-content: center; font-size: 0.85rem;
          transition: all 0.2s;
        }
        .bot-header-btn:hover { background: rgba(239, 68, 68, 0.2); color: #EF4444; }

        .quick-prompts-scroller {
          display: flex; gap: 6px; overflow-x: auto; padding: 10px 14px;
          background: rgba(0, 0, 0, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          scrollbar-width: none;
        }
        .quick-prompts-scroller::-webkit-scrollbar { display: none; }
        .quick-chip {
          white-space: nowrap; font-size: 0.75rem; font-weight: 600; padding: 5px 10px;
          border-radius: 12px; background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12); color: var(--color-text);
          cursor: pointer; transition: all 0.2s;
        }
        .quick-chip:hover {
          background: rgba(255, 107, 53, 0.2); border-color: var(--color-orange); color: var(--color-orange);
        }

        .foodiebot-messages {
          flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px;
        }
        .message-row { display: flex; gap: 8px; width: 100%; }
        .message-row.user { justify-content: flex-end; }
        .msg-bot-avatar {
          width: 28px; height: 28px; border-radius: 8px;
          background: rgba(255,107,53,0.2); border: 1px solid var(--color-orange);
          display: flex; align-items: center; justify-content: center; font-size: 0.9rem;
          flex-shrink: 0;
        }
        .message-bubble {
          max-width: 82%; padding: 10px 14px; border-radius: 14px; font-size: 0.88rem;
        }
        .message-bubble.user {
          background: linear-gradient(135deg, #FF6B35, #FF8C42);
          color: #ffffff; border-bottom-right-radius: 2px;
          font-weight: 500;
        }
        .message-bubble.bot {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: var(--color-text); border-top-left-radius: 2px;
        }

        .typing { display: flex; gap: 4px; padding: 12px 16px; align-items: center; }
        .typing-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--color-orange);
          animation: typingPulse 1.2s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.1); opacity: 1; }
        }

        .ai-dish-recommendations {
          display: flex; flex-direction: column; gap: 10px; margin-top: 10px;
        }
        .ai-dish-card {
          display: flex; gap: 10px; padding: 8px; border-radius: 12px;
          background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.08);
          align-items: center;
        }
        .ai-dish-img {
          width: 64px; height: 64px; border-radius: 8px; object-fit: cover; flex-shrink: 0;
        }
        .ai-dish-info { flex: 1; min-width: 0; }
        .ai-dish-title {
          font-size: 0.85rem; font-weight: 700; margin: 2px 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ai-dish-rest { font-size: 0.72rem; color: var(--color-text-muted); margin: 0; }
        .ai-dish-price { font-size: 0.9rem; font-weight: 800; color: var(--color-orange); }
        .ai-add-btn {
          padding: 4px 10px; border-radius: 6px; background: rgba(255, 107, 53, 0.18);
          border: 1px solid var(--color-orange); color: var(--color-orange);
          font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .ai-add-btn:hover { background: var(--color-orange); color: #fff; }

        .veg-badge { font-size: 0.65rem; color: #22C55E; font-weight: 700; }
        .non-veg-badge { font-size: 0.65rem; color: #EF4444; font-weight: 700; }
        .spice-tag { font-size: 0.65rem; color: #FF8C42; font-weight: 700; margin-left: 4px; }

        .ai-cart-summary-bar {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 12px; border-radius: 10px; background: rgba(255, 107, 53, 0.12);
          border: 1px solid rgba(255, 107, 53, 0.3); margin-top: 4px;
        }

        .foodiebot-input-bar {
          display: flex; gap: 8px; padding: 12px 14px;
          background: rgba(0, 0, 0, 0.25); border-top: 1px solid rgba(255, 255, 255, 0.08);
          align-items: center;
        }
        .bot-text-input {
          flex: 1; background: rgba(255, 255, 255, 0.06); border: 1px solid var(--color-border);
          border-radius: 12px; padding: 10px 14px; color: #fff; font-size: 0.88rem;
        }
        .bot-text-input:focus { border-color: var(--color-orange); outline: none; }
        .bot-mic-btn {
          width: 36px; height: 36px; border-radius: 10px; background: rgba(255, 255, 255, 0.08);
          border: 1px solid var(--color-border); cursor: pointer; display: flex;
          align-items: center; justify-content: center; font-size: 1rem; transition: all 0.2s;
        }
        .bot-mic-btn:hover { background: rgba(255, 107, 53, 0.2); }
        .bot-mic-btn.listening { animation: pulseMic 1s infinite alternate; }
        .bot-send-btn {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #FF6B35, #FF8C42);
          border: none; color: #fff; font-size: 1.1rem; font-weight: 800;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: all 0.2s;
        }
        .bot-send-btn:hover:not(:disabled) { transform: scale(1.05); }
        .bot-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </>
  );
}
