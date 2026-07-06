"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Sparkles, Send } from "lucide-react";

const INITIAL_MESSAGE =
  "Welcome to Rosapenna! I'm your golf concierge. Whether you're planning your first visit or returning to our championship links, I'm here to help you make the most of your experience. Did you know we have three world-class courses? Ask me anything!";

const SUGGESTIONS = [
  "TELL ME ABOUT ST PATRICK'S",
  "THREE LINKS TICKET?",
  "WHICH COURSE FIRST?",
  "BEST TIME TO VISIT?",
];

const RESPONSES: Record<string, string> = {
  "TELL ME ABOUT ST PATRICK'S":
    "St Patrick's Links is truly extraordinary — ranked in the World Top 50, it was designed by Tom Doak and opened in 2021. The course winds through towering sand dunes with breathtaking ocean views from every hole. It's a Par 73 that will test every aspect of your game.\n\nBut here's what makes Rosapenna special — you can pair St Patrick's with our other two championship links. Many guests tell us that playing Sandy Hills the day before gives them the perfect warm-up for St Patrick's dramatic terrain. Have you considered our Three Links Ticket at €250?",
  "THREE LINKS TICKET?":
    "The Three Links Ticket is our most popular offering at just €250 per person. It gives you access to all three championship courses:\n\n🏆 St Patrick's Links — World Top 50, Tom Doak design\n⛳ Sandy Hills Links — Ireland's Top 10, Pat Ruddy design\n🏛️ Old Tom Morris Links — Historic 1893 course\n\nMost guests who play all three tell us it was the highlight of their golfing year. Each course has its own distinct character, and together they offer the most complete links golf experience in Ireland. Shall I help you build a stay-and-play package?",
  "WHICH COURSE FIRST?":
    "Welcome to Rosapenna! I'm your golf concierge. I'd love to help you discover our three championship links courses. Are you planning a golf trip to Donegal? I can recommend the perfect combination of courses for your stay.",
  "BEST TIME TO VISIT?":
    "That's a great question! If I had to recommend just one course, it would depend on what you're looking for:\n\n• For the ultimate \"bucket list\" experience: St Patrick's Links (World Top 50)\n• For raw, dramatic links golf: Sandy Hills Links\n• For history and classic design: Old Tom Morris Links\n\nBut honestly? The magic of Rosapenna is playing at least two — ideally all three. Each course reveals a completely different side of links golf, and together they create an experience you simply can't get anywhere else in the world. The Three Links Ticket at €250 is exceptional value for what you get.",
};

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");

    // Simulate bot typing delay
    setTimeout(() => {
      // Find matching response or use fallback
      const response =
        RESPONSES[text.toUpperCase()] || INITIAL_MESSAGE;

      setMessages([...newMessages, { role: "bot", content: response }]);
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSend(input);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#D4AF55] hover:bg-[#c7a042] text-black rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 z-50"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-full max-w-[380px] h-[600px] max-h-[80vh] bg-[#0A0A0A] border border-[#1A1A1A] flex flex-col z-50 shadow-2xl animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#1A1A1A]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-[#D4AF55] flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-[#D4AF55]" />
              </div>
              <div>
                <h3 className="font-serif text-white font-semibold text-[14px]">
                  Golf Concierge
                </h3>
                <p className="uppercase tracking-[0.2em] text-[9px] text-[#D4AF55] mt-1">
                  AI-Powered
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#757575] hover:text-white transition-colors p-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6 min-h-0">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 text-[12px] leading-relaxed whitespace-pre-wrap ${msg.role === "user"
                    ? "bg-[#D4AF55] text-black"
                    : "bg-[#111111] text-[#E2C78A]"
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages[messages.length - 1]?.role === "bot" && (
            <div className="p-4 border-t border-[#1A1A1A] bg-[#0A0A0A] shrink-0">
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    className="border border-[#5D4A20] text-[#D4AF55] text-[9px] uppercase tracking-[0.1em] px-3 py-2 hover:bg-[#D4AF55]/10 transition-colors text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-[#0A0A0A] border-t border-[#1A1A1A] shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about our courses..."
                className="flex-1 bg-[#111111] border border-[#1A1A1A] text-white px-4 h-12 text-sm outline-none focus:border-[#D4AF55] placeholder-[#555] transition-colors"
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="w-12 h-12 bg-[#5d4a20] hover:bg-[#D4AF55] disabled:bg-[#222] disabled:text-[#555] text-black flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
