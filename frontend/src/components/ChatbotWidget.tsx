import { useState } from "react";
import { chatIntent } from "@/lib/api";
import { Bot, Send, Loader2 } from "lucide-react";

interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
}

interface ChatbotWidgetProps {
    onAction: (action: string, data: any) => void;
}

export default function ChatbotWidget({ onAction }: ChatbotWidgetProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'assistant', text: "Namaste! I'm Lana, your MirrorMed AI. Ask me to generate datasets, e.g., 'Give me 30 oncology patients' or 'Create a directory of 15 neurologists'." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const msg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: msg }]);
        setLoading(true);

        try {
            const res = await chatIntent(msg);
            setMessages(prev => [...prev, { role: 'assistant', text: res.reply }]);
            
            if (res.action) {
                // Delay slightly for effect
                setTimeout(() => {
                    onAction(res.action, res.action_data);
                }, 1000);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I couldn't understand that request." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card flex flex-col h-full overflow-hidden">
            <div className="p-4 bg-[var(--panel-2)] border-b border-[var(--line)] flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[var(--signal)]/10 flex items-center justify-center border border-[var(--signal)]">
                    <Bot className="w-4 h-4 text-[var(--signal)]" />
                </div>
                <h3 className="font-mono text-[var(--bone)] uppercase tracking-wider">Ask Lana</h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[var(--ink)]">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded font-mono text-sm ${
                            m.role === 'user' 
                                ? 'bg-[var(--signal)]/10 text-[var(--signal)] border border-[var(--signal)] rounded-tr-none' 
                                : 'bg-[var(--panel-2)] text-[var(--bone)] rounded-tl-none border border-[var(--line)]'
                        }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-[var(--panel-2)] text-[var(--bone)] p-3 rounded rounded-tl-none text-sm border border-[var(--line)]">
                            <Loader2 className="w-4 h-4 animate-spin text-[var(--signal)]" />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 bg-[var(--panel-2)] border-t border-[var(--line)]">
                <div className="flex relative items-center">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your request here..."
                        className="w-full bg-[var(--ink)] border border-[var(--line)] rounded font-mono pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:border-[var(--signal)] focus:ring-1 focus:ring-[var(--signal)] transition-all text-[var(--bone)] placeholder-[var(--slate-dim)]"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="absolute right-1.5 p-1.5 bg-[var(--signal)]/20 hover:bg-[var(--signal)]/40 border border-[var(--signal)] rounded text-[var(--signal)] transition-colors disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
