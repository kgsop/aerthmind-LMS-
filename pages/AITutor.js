function AITutor({ user }) {
    const API_KEY = "sk_pjuwt6zc_iBAXYp6eeT1NrKYjP25usKGo";
    const API_BASE_URL = "https://api.sarvam.ai/v1/chat/completions";
    const SYSTEM_PROMPT = "You are a helpful AI Tutor. Answer clearly and directly.";

    const [messages, setMessages] = React.useState([
        { id: 1, role: 'ai', text: 'Hello! I am your AI Tutor. What would you like to learn today?' }
    ]);
    const [input, setInput] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    // SIMPLIFIED cleaner - less aggressive
    const cleanResponseText = (text) => {
    if (!text) return "Sorry, no response received.";
    
        return text
            // Remove thinking tags completely
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            // Remove code blocks
            .replace(/```[\s\S]*?```/g, '')
            // Remove inline code  
            .replace(/`[^`]+`/g, '')
            // Remove markdown formatting
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/__(.*?)__/g, '$1')
            .replace(/_(.*?)_/g, '$1')
            // Remove headers and lists
            .replace(/^#{1,6}\s*/gm, '')
            .replace(/^\s*[-*+]\s+/gm, '')
            .replace(/^\s*\d+\.\s+/gm, '')
            // Clean quotes, dividers
            .replace(/^>\s*/gm, '')
            .replace(/[-=~]{3,}/g, '')
            // Normalize whitespace
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const handleClearChat = () => {
        setMessages([{ id: 1, role: 'ai', text: 'Hello! I am your AI Tutor. What would you like to learn today?' }]);
        setInput('');
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        const newUserMsg = { id: Date.now(), role: 'user', text: userText };
        
        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // SIMPLIFIED API call - just current message
            let responseText;
            
            if (typeof invokeAIAgent !== 'undefined') {
                responseText = await invokeAIAgent("You are a helpful AI Tutor.", userText);
            } else {
                const apiResponse = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "sarvam-m",
                        messages: [
                            { role: "system", content: SYSTEM_PROMPT },
                            { role: "user", content: userText }
                        ]
                    })
                });

                if (!apiResponse.ok) {
                    console.error('API failed:', apiResponse.status, await apiResponse.text());
                    throw new Error(`API Error: ${apiResponse.status}`);
                }

                const data = await apiResponse.json();
                console.log('API Response:', data); // DEBUG
                responseText = data.choices?.[0]?.message?.content || "No response";
            }

            const cleanedText = cleanResponseText(responseText);
            console.log('Cleaned response:', cleanedText); // DEBUG

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: cleanedText
            }]);

        } catch (err) {
            console.error("ERROR:", err);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                text: `Error: ${err.message}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col p-6 space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">AI Tutor 🤖</h1>
                    <p className="text-gray-500">Ask me anything!</p>
                </div>
                <button 
                    onClick={handleClearChat}
                    className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-2 rounded-lg border border-red-200 bg-red-50"
                >
                    <div className="icon-trash-2 w-4 h-4"></div>
                    Clear
                </button>
            </div>

            <div className="flex-1 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-lg">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 rounded-2xl ${
                                msg.role === 'user' 
                                    ? 'bg-blue-500 text-white rounded-br-none' 
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="p-4 bg-gray-100 rounded-2xl rounded-bl-none max-w-[70%]">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    Thinking...
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            placeholder="Type your question..."
                            className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            Send →
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}