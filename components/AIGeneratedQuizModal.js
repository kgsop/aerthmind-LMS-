function AIGeneratedQuizModal({ isOpen, onClose, defaultTopic }) {
    try {
        const [topic, setTopic] = React.useState(defaultTopic || '');
        const [count, setCount] = React.useState(5);

        const [quiz, setQuiz] = React.useState(null); // array
        const [currentIndex, setCurrentIndex] = React.useState(0);
        const [answers, setAnswers] = React.useState({});
        const [result, setResult] = React.useState(null); // {correct,total,marks,pct}

        const [isLoading, setIsLoading] = React.useState(false);
        const [errorMsg, setErrorMsg] = React.useState('');
        const [keyMissing, setKeyMissing] = React.useState(false);

        React.useEffect(() => {
            try {
                if (isOpen) {
                    setTopic(defaultTopic || '');
                    setCount(5);
                    setQuiz(null);
                    setCurrentIndex(0);
                    setAnswers({});
                    setResult(null);
                    setErrorMsg('');
                    setIsLoading(false);

                    const hasKey = window.AIClient && window.AIClient.hasKey ? window.AIClient.hasKey() : !!String(window.StorageDB.getApiKey ? window.StorageDB.getApiKey() : '').trim();
                    setKeyMissing(!hasKey);
                }
            } catch (e) {
                console.error('AIGeneratedQuizModal open init UI error:', e);
            }
        }, [isOpen, defaultTopic]);

        React.useEffect(() => {
            try {
                if (!isOpen) return;
                const hasKey = window.AIClient && window.AIClient.hasKey ? window.AIClient.hasKey() : !!String(window.StorageDB.getApiKey ? window.StorageDB.getApiKey() : '').trim();
                setKeyMissing(!hasKey);
            } catch (e) {
                console.error('AIGeneratedQuizModal key watch UI error:', e);
            }
        }, [isOpen]);

        if (!isOpen) return null;

        const clampCount = (n) => {
            try {
                const x = Number(n);
                if (!Number.isFinite(x)) return 5;
                return Math.min(10, Math.max(1, Math.round(x)));
            } catch (e) {
                console.error('AIGeneratedQuizModal clampCount UI error:', e);
                return 5;
            }
        };

        const safeParseQuizArray = (text) => {
            try {
                if (!text) return null;
                const cleaned = String(text).replaceAll('```json', '').replaceAll('```', '').trim();
                const arrMatch = cleaned.match(/\[[\s\S]*\]/);
                const jsonText = arrMatch ? arrMatch[0] : cleaned;
                const data = JSON.parse(jsonText);

                if (!Array.isArray(data)) return null;

                const normalized = data.map(item => {
                    const q = {
                        question: String(item?.question || '').trim(),
                        options: Array.isArray(item?.options) ? item.options.map(x => String(x ?? '').trim()) : [],
                        correctIndex: Number.isFinite(Number(item?.correctIndex)) ? Number(item.correctIndex) : 0,
                        explanation: String(item?.explanation || '').trim()
                    };
                    if (q.correctIndex < 0 || q.correctIndex > 3) q.correctIndex = 0;
                    return q;
                }).filter(q => q.question && Array.isArray(q.options) && q.options.length === 4 && q.options.every(o => String(o || '').length > 0));

                if (normalized.length === 0) return null;
                return normalized;
            } catch (e) {
                return null;
            }
        };

        const generateQuiz = async () => {
            setErrorMsg('');
            setQuiz(null);
            setCurrentIndex(0);
            setAnswers({});
            setResult(null);

            const t = String(topic || '').trim();
            const c = clampCount(count);

            if (!t) {
                setErrorMsg('Please enter a topic or course title.');
                return;
            }

            const hasKey = window.AIClient && window.AIClient.hasKey ? window.AIClient.hasKey() : !!String(window.StorageDB.getApiKey ? window.StorageDB.getApiKey() : '').trim();
            if (!hasKey) {
                setKeyMissing(true);
                setErrorMsg('No API key saved. Open Settings to add your key, then try again.');
                return;
            }

            setIsLoading(true);

            try {
                const systemPrompt = [
                    'You generate practice quizzes for students.',
                    'Return JSON only. Do not wrap in markdown.',
                    'Return an array of questions. Each item schema:',
                    '{ "question": string, "options": [string,string,string,string], "correctIndex": 0|1|2|3, "explanation": string }',
                    'Make it clear, practical, and suitable for beginners unless the topic implies otherwise.',
                    'Do not repeat the same question.'
                ].join('\n');

                const userPrompt = `Topic: ${t}\nGenerate ${c} multiple-choice questions with 4 options each.`;

                const res = await window.AIClient.invokeWithKey(systemPrompt, userPrompt);
                if (!res.ok) {
                    setErrorMsg(res.error || 'Could not generate a quiz right now. Please try again.');
                    setIsLoading(false);
                    return;
                }

                const parsed = safeParseQuizArray(res.text);
                if (!parsed) {
                    setErrorMsg('Could not generate a quiz for this topic. Try a simpler title (e.g., "Data Structures").');
                    setIsLoading(false);
                    return;
                }

                const finalQuiz = parsed.slice(0, c);
                if (finalQuiz.length < c) {
                    setErrorMsg(`Generated ${finalQuiz.length} question(s). You can still take the quiz or try again.`);
                }
                setQuiz(finalQuiz);
            } catch (e) {
                setErrorMsg('Could not generate a quiz right now. Please try again in a moment.');
            } finally {
                setIsLoading(false);
            }
        };

        const currentQuestion = Array.isArray(quiz) ? quiz[currentIndex] : null;

        const selectAnswer = (idx) => {
            try {
                setAnswers(prev => ({ ...prev, [currentIndex]: idx }));
            } catch (e) {
                console.error('AIGeneratedQuizModal selectAnswer UI error:', e);
            }
        };

        const goPrev = () => {
            try {
                setCurrentIndex(i => Math.max(0, i - 1));
            } catch (e) {
                console.error('AIGeneratedQuizModal goPrev UI error:', e);
            }
        };

        const goNext = () => {
            try {
                if (!quiz) return;
                setCurrentIndex(i => Math.min(quiz.length - 1, i + 1));
            } catch (e) {
                console.error('AIGeneratedQuizModal goNext UI error:', e);
            }
        };

        const gradeQuiz = () => {
            try {
                if (!Array.isArray(quiz) || quiz.length === 0) return;
                const total = quiz.length;
                let correct = 0;
                for (let i = 0; i < total; i += 1) {
                    const q = quiz[i];
                    if (answers[i] === q.correctIndex) correct += 1;
                }
                const marks = correct;
                const pct = Math.round((correct / total) * 100);
                setResult({ correct, total, marks, pct });
            } catch (e) {
                console.error('AIGeneratedQuizModal gradeQuiz UI error:', e);
            }
        };

        const resetQuiz = () => {
            try {
                setQuiz(null);
                setCurrentIndex(0);
                setAnswers({});
                setResult(null);
                setErrorMsg('');
                setIsLoading(false);
            } catch (e) {
                console.error('AIGeneratedQuizModal resetQuiz UI error:', e);
            }
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" data-name="ai-quiz-modal" data-file="components/AIGeneratedQuizModal.js">
                <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100" data-name="ai-quiz-modal-card" data-file="components/AIGeneratedQuizModal.js">
                    <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4" data-name="ai-quiz-modal-head" data-file="components/AIGeneratedQuizModal.js">
                        <div className="flex items-start gap-3" data-name="ai-quiz-modal-head-left" data-file="components/AIGeneratedQuizModal.js">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center" data-name="ai-quiz-modal-icon-wrap" data-file="components/AIGeneratedQuizModal.js">
                                <div className="icon-circle-help text-xl text-[var(--primary)]" data-name="ai-quiz-modal-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                            </div>
                            <div data-name="ai-quiz-modal-titles" data-file="components/AIGeneratedQuizModal.js">
                                <div className="text-xl font-bold text-slate-900" data-name="ai-quiz-modal-title" data-file="components/AIGeneratedQuizModal.js">Practice Quiz Generator</div>
                                <div className="text-sm text-slate-500" data-name="ai-quiz-modal-subtitle" data-file="components/AIGeneratedQuizModal.js">Choose how many questions you want, then get your marks at the end.</div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                            data-name="ai-quiz-modal-close"
                            data-file="components/AIGeneratedQuizModal.js"
                        >
                            <div className="icon-x text-xl" data-name="ai-quiz-modal-close-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                        </button>
                    </div>

                    <div className="p-6 space-y-5" data-name="ai-quiz-modal-body" data-file="components/AIGeneratedQuizModal.js">
                        {keyMissing ? (
                            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-900" data-name="ai-quiz-modal-key-missing" data-file="components/AIGeneratedQuizModal.js">
                                <div className="flex items-start gap-3" data-name="ai-quiz-modal-key-missing-row" data-file="components/AIGeneratedQuizModal.js">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center" data-name="ai-quiz-modal-key-missing-iconwrap" data-file="components/AIGeneratedQuizModal.js">
                                        <div className="icon-triangle-alert text-xl text-amber-700" data-name="ai-quiz-modal-key-missing-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                                    </div>
                                    <div data-name="ai-quiz-modal-key-missing-text" data-file="components/AIGeneratedQuizModal.js">
                                        <div className="font-bold" data-name="ai-quiz-modal-key-missing-title" data-file="components/AIGeneratedQuizModal.js">API key required</div>
                                        <div className="mt-1" data-name="ai-quiz-modal-key-missing-desc" data-file="components/AIGeneratedQuizModal.js">
                                            Save your API key in Settings, then come back here and generate your quiz.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="grid grid-cols-1 md:grid-cols-[1fr_170px_auto] gap-3 items-end" data-name="ai-quiz-modal-controls" data-file="components/AIGeneratedQuizModal.js">
                            <div data-name="ai-quiz-modal-topic-wrap" data-file="components/AIGeneratedQuizModal.js">
                                <label className="block text-sm font-medium text-gray-700 mb-1" data-name="ai-quiz-modal-topic-label" data-file="components/AIGeneratedQuizModal.js">Topic / Title</label>
                                <input
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Data Structures, Thermodynamics, UI Typography"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    disabled={isLoading}
                                    data-name="ai-quiz-modal-topic"
                                    data-file="components/AIGeneratedQuizModal.js"
                                />
                            </div>

                            <div data-name="ai-quiz-modal-count-wrap" data-file="components/AIGeneratedQuizModal.js">
                                <label className="block text-sm font-medium text-gray-700 mb-1" data-name="ai-quiz-modal-count-label" data-file="components/AIGeneratedQuizModal.js">Questions</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="90"
                                    value={count}
                                    onChange={(e) => setCount(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    disabled={isLoading}
                                    data-name="ai-quiz-modal-count"
                                    data-file="components/AIGeneratedQuizModal.js"
                                />
                            </div>

                            <button
                                onClick={generateQuiz}
                                disabled={isLoading || keyMissing}
                                className="px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
                                data-name="ai-quiz-modal-generate"
                                data-file="components/AIGeneratedQuizModal.js"
                            >
                                <div className={`text-xl ${isLoading ? 'icon-loader animate-spin' : 'icon-wand-sparkles'}`} data-name="ai-quiz-modal-generate-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                                <span data-name="ai-quiz-modal-generate-text" data-file="components/AIGeneratedQuizModal.js">{isLoading ? 'Generating...' : 'Generate'}</span>
                            </button>
                        </div>

                        {errorMsg ? (
                            <div className={`border rounded-2xl p-4 text-sm ${String(errorMsg).toLowerCase().includes('generated') ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-red-50 border-red-100 text-red-700'}`} data-name="ai-quiz-modal-error" data-file="components/AIGeneratedQuizModal.js">
                                <div className="flex items-start gap-2" data-name="ai-quiz-modal-error-row" data-file="components/AIGeneratedQuizModal.js">
                                    <div className={`${String(errorMsg).toLowerCase().includes('generated') ? 'icon-triangle-alert text-amber-700' : 'icon-circle-alert text-red-600'} text-xl`} data-name="ai-quiz-modal-error-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                                    <div data-name="ai-quiz-modal-error-text" data-file="components/AIGeneratedQuizModal.js">{errorMsg}</div>
                                </div>
                            </div>
                        ) : null}

                        {result ? (
                            <div className="rounded-2xl border border-gray-200 overflow-hidden" data-name="ai-quiz-modal-result" data-file="components/AIGeneratedQuizModal.js">
                                <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4" data-name="ai-quiz-modal-result-head" data-file="components/AIGeneratedQuizModal.js">
                                    <div data-name="ai-quiz-modal-result-left" data-file="components/AIGeneratedQuizModal.js">
                                        <div className="text-sm font-semibold text-gray-600" data-name="ai-quiz-modal-result-label" data-file="components/AIGeneratedQuizModal.js">Your marks</div>
                                        <div className="text-4xl font-extrabold text-slate-900 mt-1" data-name="ai-quiz-modal-result-score" data-file="components/AIGeneratedQuizModal.js">
                                            {result.marks} / {result.total}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-2" data-name="ai-quiz-modal-result-meta" data-file="components/AIGeneratedQuizModal.js">
                                            Percentage: <span className="font-bold text-slate-800" data-name="ai-quiz-modal-result-pct" data-file="components/AIGeneratedQuizModal.js">{result.pct}%</span>
                                        </div>
                                    </div>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${result.pct >= 60 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`} data-name="ai-quiz-modal-result-iconwrap" data-file="components/AIGeneratedQuizModal.js">
                                        <div className={`${result.pct >= 60 ? 'icon-circle-check' : 'icon-triangle-alert'} text-3xl`} data-name="ai-quiz-modal-result-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col sm:flex-row gap-3" data-name="ai-quiz-modal-result-actions" data-file="components/AIGeneratedQuizModal.js">
                                    <button
                                        onClick={resetQuiz}
                                        className="px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center justify-center gap-2"
                                        data-name="ai-quiz-modal-result-new"
                                        data-file="components/AIGeneratedQuizModal.js"
                                    >
                                        <div className="icon-refresh-cw text-xl" data-name="ai-quiz-modal-result-new-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                                        <span data-name="ai-quiz-modal-result-new-text" data-file="components/AIGeneratedQuizModal.js">New Quiz</span>
                                    </button>

                                    <button
                                        onClick={onClose}
                                        className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
                                        data-name="ai-quiz-modal-result-close"
                                        data-file="components/AIGeneratedQuizModal.js"
                                    >
                                        <div className="icon-x text-xl" data-name="ai-quiz-modal-result-close-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                                        <span data-name="ai-quiz-modal-result-close-text" data-file="components/AIGeneratedQuizModal.js">Close</span>
                                    </button>
                                </div>
                            </div>
                        ) : Array.isArray(quiz) ? (
                            <div className="rounded-2xl border border-gray-200 overflow-hidden" data-name="ai-quiz-modal-quiz" data-file="components/AIGeneratedQuizModal.js">
                                <div className="p-5 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-4" data-name="ai-quiz-modal-question-wrap" data-file="components/AIGeneratedQuizModal.js">
                                    <div data-name="ai-quiz-modal-question-left" data-file="components/AIGeneratedQuizModal.js">
                                        <div className="text-sm font-semibold text-gray-600 mb-1" data-name="ai-quiz-modal-question-label" data-file="components/AIGeneratedQuizModal.js">
                                            Question {currentIndex + 1} of {quiz.length}
                                        </div>
                                        <div className="text-lg font-bold text-slate-900" data-name="ai-quiz-modal-question" data-file="components/AIGeneratedQuizModal.js">
                                            {currentQuestion?.question}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500" data-name="ai-quiz-modal-question-hint" data-file="components/AIGeneratedQuizModal.js">Answer all, then grade.</div>
                                </div>

                                <div className="p-5 space-y-3" data-name="ai-quiz-modal-options" data-file="components/AIGeneratedQuizModal.js">
                                    {(currentQuestion?.options || []).map((opt, idx) => {
                                        const selected = answers[currentIndex] === idx;
                                        return (
                                            <label
                                                key={idx}
                                                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-[var(--primary)] bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}
                                                data-name="ai-quiz-modal-option"
                                                data-file="components/AIGeneratedQuizModal.js"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`ai_quiz_${currentIndex}`}
                                                    checked={selected}
                                                    onChange={() => selectAnswer(idx)}
                                                    className="w-5 h-5 text-[var(--primary)]"
                                                    data-name="ai-quiz-modal-option-radio"
                                                    data-file="components/AIGeneratedQuizModal.js"
                                                />
                                                <span className="text-gray-800 font-medium" data-name="ai-quiz-modal-option-text" data-file="components/AIGeneratedQuizModal.js">{opt}</span>
                                            </label>
                                        );
                                    })}

                                    <div className="flex flex-col sm:flex-row gap-3 pt-2" data-name="ai-quiz-modal-actions" data-file="components/AIGeneratedQuizModal.js">
                                        <button
                                            onClick={goPrev}
                                            disabled={currentIndex === 0}
                                            className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                            data-name="ai-quiz-modal-prev"
                                            data-file="components/AIGeneratedQuizModal.js"
                                        >
                                            <div className="icon-chevron-left text-xl" data-name="ai-quiz-modal-prev-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                                            <span data-name="ai-quiz-modal-prev-text" data-file="components/AIGeneratedQuizModal.js">Previous</span>
                                        </button>

                                        <button
                                            onClick={goNext}
                                            disabled={currentIndex >= quiz.length - 1}
                                            className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                            data-name="ai-quiz-modal-next"
                                            data-file="components/AIGeneratedQuizModal.js"
                                        >
                                            <span data-name="ai-quiz-modal-next-text" data-file="components/AIGeneratedQuizModal.js">Next</span>
                                            <div className="icon-chevron-right text-xl" data-name="ai-quiz-modal-next-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                                        </button>

                                        <button
                                            onClick={gradeQuiz}
                                            className="flex-1 px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center justify-center gap-2"
                                            data-name="ai-quiz-modal-grade"
                                            data-file="components/AIGeneratedQuizModal.js"
                                        >
                                            <div className="icon-circle-check text-xl" data-name="ai-quiz-modal-grade-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                                            <span data-name="ai-quiz-modal-grade-text" data-file="components/AIGeneratedQuizModal.js">Grade &amp; Show Marks</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6" data-name="ai-quiz-modal-empty" data-file="components/AIGeneratedQuizModal.js">
                                <div className="flex items-start gap-3" data-name="ai-quiz-modal-empty-row" data-file="components/AIGeneratedQuizModal.js">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center" data-name="ai-quiz-modal-empty-icon-wrap" data-file="components/AIGeneratedQuizModal.js">
                                        <div className="icon-wand-sparkles text-xl text-gray-700" data-name="ai-quiz-modal-empty-icon" data-file="components/AIGeneratedQuizModal.js"></div>
                                    </div>
                                    <div data-name="ai-quiz-modal-empty-text" data-file="components/AIGeneratedQuizModal.js">
                                        <div className="font-bold text-slate-900" data-name="ai-quiz-modal-empty-title" data-file="components/AIGeneratedQuizModal.js">Ready to practice?</div>
                                        <div className="text-sm text-slate-600 mt-1" data-name="ai-quiz-modal-empty-desc" data-file="components/AIGeneratedQuizModal.js">
                                            Enter a topic, choose 1–90 questions, then generate your quiz.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-100 flex items-center justify-between" data-name="ai-quiz-modal-footer" data-file="components/AIGeneratedQuizModal.js">
                        <div className="text-xs text-gray-500" data-name="ai-quiz-modal-footer-note" data-file="components/AIGeneratedQuizModal.js">
                            Tip: use simple topics like “Binary Search” or “Color Theory”.
                        </div>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                            data-name="ai-quiz-modal-footer-close"
                            data-file="components/AIGeneratedQuizModal.js"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('AIGeneratedQuizModal error:', error);
        return null;
    }
}
window.AIGeneratedQuizModal = AIGeneratedQuizModal;