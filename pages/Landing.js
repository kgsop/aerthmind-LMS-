function Landing({ onGetStarted, onLogin }) {
    try {
        const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);

        return (
            <div className="min-h-screen bg-[var(--bg-color)] font-sans text-gray-900" data-name="landing-page" data-file="pages/Landing.js">
                <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
                {/* Navbar */}
                <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 p-2 rounded-lg text-[var(--primary)]">
                            <div className="icon-graduation-cap text-2xl"></div>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Aethermind.</span>
                    </div>
                    <div>
                        <button 
                            onClick={onLogin}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors mr-4 shadow-sm"
                        >
                            Log In
                        </button>
                        <button 
                            onClick={onGetStarted}
                            className="px-6 py-2.5 bg-[var(--primary)] text-white font-medium rounded-xl hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
                        >
                            Get Started
                        </button>
                    </div>
                </nav>

                {/* Hero Section */}
                <main className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-8">
                        <div className="inline-block px-4 py-2 bg-indigo-50 text-[var(--primary)] font-semibold rounded-full text-sm border border-indigo-100">
                            ✨ The Future of Learning is Here
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-slate-900">
                            Master new skills with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Aethermind</span>.
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
                            Dive into interactive courses, test your knowledge with dynamic quizzes, and get personalized help from our cutting-edge AI Tutor. 
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-2">
                            <button 
                                onClick={onGetStarted}
                                className="px-8 py-4 bg-[var(--primary)] text-white text-lg font-bold rounded-2xl hover:bg-[var(--primary-hover)] transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                            >
                                Start Learning Now
                                <div className="icon-arrow-right"></div>
                            </button>
                            <button 
                                onClick={() => setIsPaymentOpen(true)}
                                className="px-8 py-4 bg-white text-[var(--primary)] border-2 border-indigo-100 text-lg font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <div className="icon-building"></div>
                                School Code
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 relative min-h-[400px] md:min-h-[500px] w-full">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-purple-100 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
                        <div 
                            className="absolute inset-0 rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden bg-cover bg-center transition-transform hover:scale-[1.02] duration-500"
                            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80")' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
                        </div>
                    </div>
                </main>

                {/* Features */}
                <section className="bg-white py-24 border-t border-gray-100 mt-12">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why learn with us?</h2>
                            <p className="text-gray-500 max-w-2xl mx-auto text-lg">Everything you need to succeed, all in one place.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                    <div className="icon-file-text text-2xl"></div>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Interactive Notes</h3>
                                <p className="text-gray-500">Access rich, detailed course materials and notes to reinforce your understanding of every topic.</p>
                            </div>
                            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                    <div className="icon-circle-check text-2xl"></div>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Knowledge Quizzes</h3>
                                <p className="text-gray-500">Test your skills at the end of each module with interactive quizzes designed to challenge you.</p>
                            </div>
                            <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                                    <div className="icon-bot text-2xl"></div>
                                </div>
                                <h3 className="text-xl font-bold mb-3">24/7 AI Tutor</h3>
                                <p className="text-gray-500">Stuck on a concept? Our built-in AI assistant is always available to explain complex topics.</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Footer */}
                <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-200 text-center text-gray-500 text-sm">
                    &copy; 2026 Aethermind Education. All rights reserved.
                </footer>
            </div>
        );
    } catch (error) {
        console.error('Landing error:', error);
        return null;
    }
}
window.Landing = Landing;