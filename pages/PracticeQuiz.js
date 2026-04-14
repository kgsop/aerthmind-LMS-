function PracticeQuiz({ onBack }) {
    try {
        const [isOpen, setIsOpen] = React.useState(true);

        return (
            <div className="animate-in fade-in duration-300" data-name="practice-quiz" data-file="pages/PracticeQuiz.js">
                <AIGeneratedQuizModal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    defaultTopic=""
                />

                <div className="max-w-4xl" data-name="practice-quiz-note" data-file="pages/PracticeQuiz.js">
                    {!isOpen ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm" data-name="practice-quiz-closed" data-file="pages/PracticeQuiz.js">
                            {typeof onBack === 'function' ? (
                                <button
                                    onClick={() => { try { onBack(); } catch (e) { console.error('PracticeQuiz back UI error:', e); } }}
                                    className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
                                    data-name="practice-quiz-back"
                                    data-file="pages/PracticeQuiz.js"
                                >
                                    <div className="icon-arrow-left" data-name="practice-quiz-back-icon" data-file="pages/PracticeQuiz.js"></div>
                                    <span data-name="practice-quiz-back-text" data-file="pages/PracticeQuiz.js">Back</span>
                                </button>
                            ) : null}
                            <div className="w-16 h-16 bg-indigo-50 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4" data-name="practice-quiz-closed-icon-wrap" data-file="pages/PracticeQuiz.js">
                                <div className="icon-circle-check text-2xl" data-name="practice-quiz-closed-icon" data-file="pages/PracticeQuiz.js"></div>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900" data-name="practice-quiz-closed-title" data-file="pages/PracticeQuiz.js">Practice Quiz</h1>
                            <p className="text-gray-500 mt-2" data-name="practice-quiz-closed-subtitle" data-file="pages/PracticeQuiz.js">Open the generator again to practice another topic.</p>
                            <button
                                onClick={() => setIsOpen(true)}
                                className="mt-6 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center gap-2"
                                data-name="practice-quiz-open"
                                data-file="pages/PracticeQuiz.js"
                            >
                                <div className="icon-wand-sparkles text-xl" data-name="practice-quiz-open-icon" data-file="pages/PracticeQuiz.js"></div>
                                Generate a Quiz
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm" data-name="practice-quiz-help" data-file="pages/PracticeQuiz.js">
                            <div className="flex items-start gap-3" data-name="practice-quiz-help-row" data-file="pages/PracticeQuiz.js">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center" data-name="practice-quiz-help-icon-wrap" data-file="pages/PracticeQuiz.js">
                                    <div className="icon-circle-help text-xl text-[var(--primary)]" data-name="practice-quiz-help-icon" data-file="pages/PracticeQuiz.js"></div>
                                </div>
                                <div data-name="practice-quiz-help-text" data-file="pages/PracticeQuiz.js">
                                    <div className="font-bold text-slate-900" data-name="practice-quiz-help-title" data-file="pages/PracticeQuiz.js">Tips</div>
                                    <div className="text-sm text-slate-600 mt-1" data-name="practice-quiz-help-desc" data-file="pages/PracticeQuiz.js">
                                        Try short topics like “Binary Search”, “Color Theory”, “Ohm's Law”, or paste a course title.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('PracticeQuiz error:', error);
        return null;
    }
}
window.PracticeQuiz = PracticeQuiz;