function CoursePlayer({ course, onBack, onComplete }) {
    try {
        const [activeTab, setActiveTab] = React.useState('notes'); // 'notes' | 'quiz'

        const normalizeQuizArray = (quizRaw) => {
            try {
                if (!quizRaw) return [];
                if (Array.isArray(quizRaw)) return quizRaw;
                if (typeof quizRaw === 'object') return [quizRaw];
                return [];
            } catch (e) {
                console.error('CoursePlayer normalizeQuizArray UI error:', e);
                return [];
            }
        };

        const toSafeQuestion = (q) => {
            try {
                const question = String(q?.question || '').trim();
                const options = Array.isArray(q?.options) ? q.options.map(x => String(x ?? '')) : [];
                const correctIndexRaw = Number(q?.correctIndex);
                const correctIndex = Number.isFinite(correctIndexRaw) ? Math.max(0, Math.min(3, correctIndexRaw)) : 0;

                const safeOptions = new Array(4).fill('').map((_, i) => String(options[i] ?? '').trim());
                return {
                    question,
                    options: safeOptions,
                    correctIndex
                };
            } catch (e) {
                console.error('CoursePlayer toSafeQuestion UI error:', e);
                return { question: '', options: ['', '', '', ''], correctIndex: 0 };
            }
        };

        const legacyQuizFallback = [{
            question: `What is a key learning outcome of the "${course?.title || 'this'}" course?`,
            options: [
                "Mastering advanced cooking techniques.",
                "Understanding core concepts and foundational principles.",
                "Learning how to fly an airplane.",
                "Memorizing historical dates."
            ],
            correctIndex: 1
        }];

        const initialQuiz = (() => {
            try {
                const items = normalizeQuizArray(course?.quiz);
                const base = (items && items.length > 0) ? items : legacyQuizFallback;
                return base.map(toSafeQuestion);
            } catch (e) {
                console.error('CoursePlayer initialQuiz UI error:', e);
                return legacyQuizFallback.map(toSafeQuestion);
            }
        })();

        const [quizQuestions, setQuizQuestions] = React.useState(initialQuiz);
        const [currentIndex, setCurrentIndex] = React.useState(0);
        const [answers, setAnswers] = React.useState({});
        const [selectedAnswer, setSelectedAnswer] = React.useState(null);

        const [graded, setGraded] = React.useState(false);
        const [quizScore, setQuizScore] = React.useState(null);

        React.useEffect(() => {
            try {
                const items = normalizeQuizArray(course?.quiz);
                const base = (items && items.length > 0) ? items : legacyQuizFallback;
                const next = base.map(toSafeQuestion);
                setQuizQuestions(next);
                setCurrentIndex(0);
                setAnswers({});
                setSelectedAnswer(null);
                setGraded(false);
                setQuizScore(null);
            } catch (e) {
                console.error('CoursePlayer reinit quiz UI error:', e);
            }
        }, [course?.id]);

        React.useEffect(() => {
            try {
                if (course?.progress === 0 && typeof onComplete === 'function') {
                    onComplete(0, 5);
                }
            } catch (e) {
                console.error('CoursePlayer initial progress UI error:', e);
            }
        }, []);

        const currentQuestion = (quizQuestions || [])[currentIndex] || null;

        const selectAnswer = (idx) => {
            try {
                if (!Number.isFinite(Number(idx))) return;
                setSelectedAnswer(Number(idx));
                setAnswers(prev => ({ ...prev, [currentIndex]: Number(idx) }));
            } catch (e) {
                console.error('CoursePlayer selectAnswer UI error:', e);
            }
        };

        const goPrev = () => {
            try {
                const nextIndex = Math.max(0, currentIndex - 1);
                setCurrentIndex(nextIndex);
                const existing = answers[nextIndex];
                setSelectedAnswer(Number.isFinite(Number(existing)) ? Number(existing) : null);
            } catch (e) {
                console.error('CoursePlayer goPrev UI error:', e);
            }
        };

        const goNext = () => {
            try {
                const maxIndex = Math.max(0, (quizQuestions?.length || 1) - 1);
                const nextIndex = Math.min(maxIndex, currentIndex + 1);
                setCurrentIndex(nextIndex);
                const existing = answers[nextIndex];
                setSelectedAnswer(Number.isFinite(Number(existing)) ? Number(existing) : null);
            } catch (e) {
                console.error('CoursePlayer goNext UI error:', e);
            }
        };

        const addQuestion = () => {
            try {
                setQuizQuestions(prev => {
                    const next = [...(prev || [])];
                    next.push({ question: '', options: ['', '', '', ''], correctIndex: 0 });
                    return next;
                });

                setTimeout(() => {
                    try {
                        const nextIndex = (quizQuestions?.length || 0);
                        setCurrentIndex(nextIndex);
                        setSelectedAnswer(null);
                        setGraded(false);
                        setQuizScore(null);
                    } catch (e) {
                        console.error('CoursePlayer addQuestion timeout UI error:', e);
                    }
                }, 0);
            } catch (e) {
                console.error('CoursePlayer addQuestion UI error:', e);
            }
        };

        const updateQuestionText = (value) => {
            try {
                setQuizQuestions(prev => {
                    const next = [...(prev || [])];
                    const q = next[currentIndex] || { question: '', options: ['', '', '', ''], correctIndex: 0 };
                    next[currentIndex] = { ...q, question: String(value || '') };
                    return next;
                });
                setGraded(false);
                setQuizScore(null);
            } catch (e) {
                console.error('CoursePlayer updateQuestionText UI error:', e);
            }
        };

        const updateOptionText = (optIndex, value) => {
            try {
                setQuizQuestions(prev => {
                    const next = [...(prev || [])];
                    const q = next[currentIndex] || { question: '', options: ['', '', '', ''], correctIndex: 0 };
                    const options = Array.isArray(q.options) ? [...q.options] : ['', '', '', ''];
                    options[optIndex] = String(value || '');
                    next[currentIndex] = { ...q, options };
                    return next;
                });
                setGraded(false);
                setQuizScore(null);
            } catch (e) {
                console.error('CoursePlayer updateOptionText UI error:', e);
            }
        };

        const setCorrectIndex = (idx) => {
            try {
                setQuizQuestions(prev => {
                    const next = [...(prev || [])];
                    const q = next[currentIndex] || { question: '', options: ['', '', '', ''], correctIndex: 0 };
                    next[currentIndex] = { ...q, correctIndex: Math.max(0, Math.min(3, Number(idx))) };
                    return next;
                });
                setGraded(false);
                setQuizScore(null);
            } catch (e) {
                console.error('CoursePlayer setCorrectIndex UI error:', e);
            }
        };

        const validateQuiz = () => {
            try {
                const list = quizQuestions || [];
                if (list.length === 0) return { ok: false, reason: 'No questions found.' };
                for (let i = 0; i < list.length; i += 1) {
                    const q = list[i];
                    const questionText = String(q?.question || '').trim();
                    const options = Array.isArray(q?.options) ? q.options : [];
                    const has4 = options.length === 4;
                    const filledOpts = has4 && options.every(o => String(o || '').trim().length > 0);
                    if (!questionText || !has4 || !filledOpts) {
                        return { ok: false, reason: `Question ${i + 1} is incomplete. Please fill the question and all 4 options.` };
                    }
                }
                return { ok: true, reason: '' };
            } catch (e) {
                console.error('CoursePlayer validateQuiz UI error:', e);
                return { ok: false, reason: 'Could not validate quiz.' };
            }
        };

        const gradeQuiz = () => {
            try {
                const validation = validateQuiz();
                if (!validation.ok) {
                    setGraded(false);
                    setQuizScore(null);
                    return { ok: false, reason: validation.reason };
                }

                const total = quizQuestions.length;
                let correct = 0;
                for (let i = 0; i < total; i += 1) {
                    const q = quizQuestions[i];
                    const a = answers[i];
                    if (Number.isFinite(Number(a)) && Number(a) === Number(q.correctIndex)) correct += 1;
                }
                const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

                setQuizScore(pct);
                setGraded(true);

                if (typeof onComplete === 'function') {
                    if (pct === 100) onComplete(100, 100);
                    else if (pct >= 60) onComplete(pct, 80);
                    else onComplete(pct, 40);
                }

                return { ok: true, reason: '' };
            } catch (e) {
                console.error('CoursePlayer gradeQuiz UI error:', e);
                return { ok: false, reason: 'Could not grade the quiz.' };
            }
        };

        const resetQuiz = () => {
            try {
                setAnswers({});
                setSelectedAnswer(null);
                setCurrentIndex(0);
                setGraded(false);
                setQuizScore(null);
            } catch (e) {
                console.error('CoursePlayer resetQuiz UI error:', e);
            }
        };

        const isInstructorMode = (() => {
            try {
                const hasEditable = Array.isArray(course?.quiz) || (course?.quiz && typeof course?.quiz === 'object' && course?.quiz?.question);
                return !!hasEditable;
            } catch (e) {
                console.error('CoursePlayer isInstructorMode UI error:', e);
                return false;
            }
        })();

        const submitGrade = () => {
            try {
                gradeQuiz();
            } catch (e) {
                console.error('CoursePlayer submitGrade UI error:', e);
            }
        };

        const validation = validateQuiz();

        return (
            <div className="animate-in fade-in duration-300" data-name="course-player" data-file="pages/CoursePlayer.js">
                <div className="mb-6 flex items-center justify-between" data-name="course-player-head" data-file="pages/CoursePlayer.js">
                    <div data-name="course-player-head-left" data-file="pages/CoursePlayer.js">
                        <button
                            onClick={onBack}
                            className="text-gray-500 hover:text-gray-800 flex items-center gap-2 mb-2 text-sm font-medium transition-colors"
                            data-name="course-player-back"
                            data-file="pages/CoursePlayer.js"
                        >
                            <div className="icon-arrow-left" data-name="course-player-back-icon" data-file="pages/CoursePlayer.js"></div>
                            <span data-name="course-player-back-text" data-file="pages/CoursePlayer.js">Back to Dashboard</span>
                        </button>
                        <h1 className="text-3xl font-bold" data-name="course-player-title" data-file="pages/CoursePlayer.js">{course?.title}</h1>
                    </div>

                    {graded && quizScore === 100 ? (
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold flex items-center gap-2" data-name="course-player-complete-badge" data-file="pages/CoursePlayer.js">
                            <div className="icon-circle-check" data-name="course-player-complete-badge-icon" data-file="pages/CoursePlayer.js"></div>
                            <span data-name="course-player-complete-badge-text" data-file="pages/CoursePlayer.js">Module Completed</span>
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-col md:flex-row gap-8" data-name="course-player-body" data-file="pages/CoursePlayer.js">
                    <div className="w-full md:w-64 flex-shrink-0 space-y-2" data-name="course-player-menu" data-file="pages/CoursePlayer.js">
                        <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2" data-name="course-player-menu-title" data-file="pages/CoursePlayer.js">Course Content</div>

                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'notes' ? 'bg-[var(--primary)] text-white font-medium shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'}`}
                            data-name="course-player-tab-notes"
                            data-file="pages/CoursePlayer.js"
                        >
                            <div className="icon-file-text" data-name="course-player-tab-notes-icon" data-file="pages/CoursePlayer.js"></div>
                            <span data-name="course-player-tab-notes-text" data-file="pages/CoursePlayer.js">Course Notes</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('quiz')}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'quiz' ? 'bg-[var(--primary)] text-white font-medium shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'}`}
                            data-name="course-player-tab-quiz"
                            data-file="pages/CoursePlayer.js"
                        >
                            <div className="icon-circle-help" data-name="course-player-tab-quiz-icon" data-file="pages/CoursePlayer.js"></div>
                            <span data-name="course-player-tab-quiz-text" data-file="pages/CoursePlayer.js">Knowledge Check</span>
                        </button>
                    </div>

                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] overflow-hidden" data-name="course-player-main" data-file="pages/CoursePlayer.js">
                        {activeTab === 'notes' ? (
                            <div className="p-8" data-name="course-player-notes" data-file="pages/CoursePlayer.js">
                                <h2 className="text-2xl font-bold mb-6 border-b border-gray-100 pb-4 flex items-center gap-3" data-name="course-player-notes-title" data-file="pages/CoursePlayer.js">
                                    <div className="icon-book-open text-[var(--primary)]" data-name="course-player-notes-title-icon" data-file="pages/CoursePlayer.js"></div>
                                    <span data-name="course-player-notes-title-text" data-file="pages/CoursePlayer.js">Module 1: Introduction</span>
                                </h2>

                                <div className="prose prose-indigo max-w-none text-gray-600 leading-relaxed space-y-6" data-name="course-player-notes-body" data-file="pages/CoursePlayer.js">
                                    {course?.notes ? (
                                        course.notes.split('\n').map((paragraph, idx) => (
                                            paragraph.trim()
                                                ? <p key={idx} data-name="course-player-notes-p" data-file="pages/CoursePlayer.js">{paragraph}</p>
                                                : <br key={idx} data-name="course-player-notes-br" data-file="pages/CoursePlayer.js" />
                                        ))
                                    ) : (
                                        <div data-name="course-player-notes-fallback" data-file="pages/CoursePlayer.js">
                                            <p className="text-lg" data-name="course-player-notes-fallback-p1" data-file="pages/CoursePlayer.js">
                                                Welcome to <strong data-name="course-player-notes-strong" data-file="pages/CoursePlayer.js">{course?.title}</strong>! This module provides a comprehensive overview of the fundamental concepts you need to succeed.
                                            </p>
                                            <div className="bg-indigo-50 border-l-4 border-[var(--primary)] p-6 rounded-r-xl" data-name="course-player-notes-callout" data-file="pages/CoursePlayer.js">
                                                <h3 className="text-indigo-900 font-bold mb-2" data-name="course-player-notes-callout-title" data-file="pages/CoursePlayer.js">Key Takeaways:</h3>
                                                <ul className="list-disc list-inside space-y-2 text-indigo-800" data-name="course-player-notes-list" data-file="pages/CoursePlayer.js">
                                                    <li data-name="course-player-notes-li" data-file="pages/CoursePlayer.js">Understand the basic terminology and tools.</li>
                                                    <li data-name="course-player-notes-li" data-file="pages/CoursePlayer.js">Analyze common patterns and best practices.</li>
                                                    <li data-name="course-player-notes-li" data-file="pages/CoursePlayer.js">Apply theoretical knowledge to practical scenarios.</li>
                                                </ul>
                                            </div>
                                            <p data-name="course-player-notes-fallback-p2" data-file="pages/CoursePlayer.js">
                                                When you’re ready, switch to Knowledge Check to answer all questions and get your marks.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-12 flex justify-end" data-name="course-player-notes-actions" data-file="pages/CoursePlayer.js">
                                    <button
                                        onClick={() => setActiveTab('quiz')}
                                        className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
                                        data-name="course-player-notes-to-quiz"
                                        data-file="pages/CoursePlayer.js"
                                    >
                                        <span data-name="course-player-notes-to-quiz-text" data-file="pages/CoursePlayer.js">Proceed to Quiz</span>
                                        <div className="icon-arrow-right" data-name="course-player-notes-to-quiz-icon" data-file="pages/CoursePlayer.js"></div>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8" data-name="course-player-quiz" data-file="pages/CoursePlayer.js">
                                <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4 mb-6" data-name="course-player-quiz-head" data-file="pages/CoursePlayer.js">
                                    <div data-name="course-player-quiz-head-left" data-file="pages/CoursePlayer.js">
                                        <h2 className="text-2xl font-bold flex items-center gap-3" data-name="course-player-quiz-title" data-file="pages/CoursePlayer.js">
                                            <div className="icon-circle-help text-[var(--primary)]" data-name="course-player-quiz-title-icon" data-file="pages/CoursePlayer.js"></div>
                                            <span data-name="course-player-quiz-title-text" data-file="pages/CoursePlayer.js">Knowledge Check</span>
                                        </h2>
                                        <div className="text-sm text-gray-500 mt-1" data-name="course-player-quiz-subtitle" data-file="pages/CoursePlayer.js">
                                            Answer all questions, then grade to get your marks.
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2" data-name="course-player-quiz-actions" data-file="pages/CoursePlayer.js">
                                        <button
                                            onClick={resetQuiz}
                                            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                                            data-name="course-player-reset-quiz"
                                            data-file="pages/CoursePlayer.js"
                                        >
                                            <div className="icon-refresh-cw text-xl" data-name="course-player-reset-quiz-icon" data-file="pages/CoursePlayer.js"></div>
                                            <span data-name="course-player-reset-quiz-text" data-file="pages/CoursePlayer.js">Reset</span>
                                        </button>
                                    </div>
                                </div>

                                {graded ? (
                                    <div className="rounded-2xl border border-gray-200 overflow-hidden" data-name="course-player-quiz-result" data-file="pages/CoursePlayer.js">
                                        <div className="p-6 bg-gray-50 border-b border-gray-200 flex items-start justify-between gap-4" data-name="course-player-quiz-result-head" data-file="pages/CoursePlayer.js">
                                            <div data-name="course-player-quiz-result-left" data-file="pages/CoursePlayer.js">
                                                <div className="text-sm font-semibold text-gray-600" data-name="course-player-quiz-result-label" data-file="pages/CoursePlayer.js">Your marks</div>
                                                <div className="text-4xl font-extrabold text-slate-900 mt-1" data-name="course-player-quiz-result-score" data-file="pages/CoursePlayer.js">
                                                    {Math.round(((quizScore || 0) / 100) * (quizQuestions?.length || 0))} / {quizQuestions?.length || 0}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-2" data-name="course-player-quiz-result-meta" data-file="pages/CoursePlayer.js">
                                                    Percentage: <span className="font-bold text-slate-800" data-name="course-player-quiz-result-pct" data-file="pages/CoursePlayer.js">{quizScore}%</span>
                                                </div>
                                            </div>
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${quizScore >= 60 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`} data-name="course-player-quiz-result-iconwrap" data-file="pages/CoursePlayer.js">
                                                <div className={`${quizScore >= 60 ? 'icon-circle-check' : 'icon-triangle-alert'} text-3xl`} data-name="course-player-quiz-result-icon" data-file="pages/CoursePlayer.js"></div>
                                            </div>
                                        </div>

                                        <div className="p-6 space-y-6" data-name="course-player-quiz-result-body" data-file="pages/CoursePlayer.js">
                                            <div className="space-y-4" data-name="course-player-quiz-answers" data-file="pages/CoursePlayer.js">
                                                <div className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3" data-name="course-player-quiz-answers-title" data-file="pages/CoursePlayer.js">Review Answers</div>
                                                {quizQuestions.map((q, idx) => {
                                                    const userAnswer = answers[idx];
                                                    const isCorrect = Number(userAnswer) === Number(q.correctIndex);
                                                    return (
                                                        <div key={idx} className="rounded-2xl border border-gray-200 overflow-hidden" data-name="course-player-answer-card" data-file="pages/CoursePlayer.js">
                                                            <div className={`p-4 ${isCorrect ? 'bg-green-50 border-b border-green-100' : 'bg-red-50 border-b border-red-100'}`} data-name="course-player-answer-head" data-file="pages/CoursePlayer.js">
                                                                <div className="flex items-start gap-3" data-name="course-player-answer-head-row" data-file="pages/CoursePlayer.js">
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`} data-name="course-player-answer-icon-wrap" data-file="pages/CoursePlayer.js">
                                                                        <div className={`${isCorrect ? 'icon-circle-check text-green-600' : 'icon-circle-x text-red-600'} text-xl`} data-name="course-player-answer-icon" data-file="pages/CoursePlayer.js"></div>
                                                                    </div>
                                                                    <div className="flex-1" data-name="course-player-answer-text" data-file="pages/CoursePlayer.js">
                                                                        <div className="text-xs font-bold text-gray-600 mb-1" data-name="course-player-answer-label" data-file="pages/CoursePlayer.js">Question {idx + 1}</div>
                                                                        <div className="font-bold text-slate-900" data-name="course-player-answer-question" data-file="pages/CoursePlayer.js">{q.question}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 bg-white space-y-2" data-name="course-player-answer-options" data-file="pages/CoursePlayer.js">
                                                                {q.options.map((opt, optIdx) => {
                                                                    const isUserAnswer = Number(userAnswer) === optIdx;
                                                                    const isCorrectAnswer = Number(q.correctIndex) === optIdx;
                                                                    let optClass = 'border-gray-200 bg-gray-50';
                                                                    if (isCorrectAnswer) optClass = 'border-green-200 bg-green-50';
                                                                    if (isUserAnswer && !isCorrect) optClass = 'border-red-200 bg-red-50';
                                                                    return (
                                                                        <div key={optIdx} className={`p-3 rounded-xl border-2 ${optClass} flex items-center gap-3`} data-name="course-player-answer-option" data-file="pages/CoursePlayer.js">
                                                                            {isCorrectAnswer && <div className="icon-circle-check text-green-600" data-name="course-player-answer-correct-icon" data-file="pages/CoursePlayer.js"></div>}
                                                                            {isUserAnswer && !isCorrect && <div className="icon-circle-x text-red-600" data-name="course-player-answer-wrong-icon" data-file="pages/CoursePlayer.js"></div>}
                                                                            <span className={`${isCorrectAnswer ? 'font-bold text-green-900' : isUserAnswer && !isCorrect ? 'font-bold text-red-900' : 'text-gray-700'}`} data-name="course-player-answer-option-text" data-file="pages/CoursePlayer.js">{opt}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            
                                            <RatingWidget courseId={course.id} />
                                            
                                            <div className="flex flex-col sm:flex-row gap-3" data-name="course-player-quiz-result-actions" data-file="pages/CoursePlayer.js">
                                                <button
                                                    onClick={resetQuiz}
                                                    className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center justify-center gap-2"
                                                    data-name="course-player-quiz-result-retry"
                                                    data-file="pages/CoursePlayer.js"
                                                >
                                                    <div className="icon-refresh-cw text-xl" data-name="course-player-quiz-result-retry-icon" data-file="pages/CoursePlayer.js"></div>
                                                    <span data-name="course-player-quiz-result-retry-text" data-file="pages/CoursePlayer.js">Try Again</span>
                                                </button>

                                                <button
                                                    onClick={onBack}
                                                    className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
                                                    data-name="course-player-quiz-result-back"
                                                    data-file="pages/CoursePlayer.js"
                                                >
                                                    <div className="icon-arrow-left text-xl" data-name="course-player-quiz-result-back-icon" data-file="pages/CoursePlayer.js"></div>
                                                    <span data-name="course-player-quiz-result-back-text" data-file="pages/CoursePlayer.js">Back to Dashboard</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 max-w-3xl" data-name="course-player-quiz-body" data-file="pages/CoursePlayer.js">
                                        <div className="text-sm font-semibold text-gray-600 mb-4" data-name="course-player-quiz-progress-label" data-file="pages/CoursePlayer.js">
                                            Question {currentIndex + 1} of {quizQuestions.length}
                                        </div>

                                        {currentQuestion ? (
                                            <div className="rounded-2xl border border-gray-200 overflow-hidden" data-name="course-player-quiz-card" data-file="pages/CoursePlayer.js">
                                                <div className="p-5 bg-gray-50 border-b border-gray-200" data-name="course-player-quiz-qwrap" data-file="pages/CoursePlayer.js">
                                                    <div className="text-lg font-bold text-slate-900" data-name="course-player-quiz-question" data-file="pages/CoursePlayer.js">
                                                        {currentQuestion.question}
                                                    </div>
                                                </div>

                                                <div className="p-5 space-y-3" data-name="course-player-quiz-options" data-file="pages/CoursePlayer.js">
                                                    {(currentQuestion.options || []).map((option, index) => (
                                                        <label
                                                            key={index}
                                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAnswer === index ? 'border-[var(--primary)] bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}
                                                            data-name="course-player-quiz-option"
                                                            data-file="pages/CoursePlayer.js"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`quiz_${currentIndex}`}
                                                                checked={selectedAnswer === index}
                                                                onChange={() => selectAnswer(index)}
                                                                className="w-5 h-5 text-[var(--primary)]"
                                                                data-name="course-player-quiz-option-radio"
                                                                data-file="pages/CoursePlayer.js"
                                                            />
                                                            <span className="text-gray-700 font-medium" data-name="course-player-quiz-option-text" data-file="pages/CoursePlayer.js">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}

                                        <div className="flex items-center justify-between gap-3 pt-6 border-t border-gray-100" data-name="course-player-quiz-nav" data-file="pages/CoursePlayer.js">
                                            <button
                                                onClick={goPrev}
                                                disabled={currentIndex === 0}
                                                className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-30 inline-flex items-center justify-center gap-2"
                                                data-name="course-player-quiz-prev"
                                                data-file="pages/CoursePlayer.js"
                                            >
                                                <div className="icon-chevron-left text-xl" data-name="course-player-quiz-prev-icon" data-file="pages/CoursePlayer.js"></div>
                                                <span data-name="course-player-quiz-prev-text" data-file="pages/CoursePlayer.js">Previous</span>
                                            </button>

                                            <button
                                                onClick={goNext}
                                                disabled={currentIndex >= quizQuestions.length - 1}
                                                className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-30 inline-flex items-center justify-center gap-2"
                                                data-name="course-player-quiz-next"
                                                data-file="pages/CoursePlayer.js"
                                            >
                                                <span data-name="course-player-quiz-next-text" data-file="pages/CoursePlayer.js">Next</span>
                                                <div className="icon-chevron-right text-xl" data-name="course-player-quiz-next-icon" data-file="pages/CoursePlayer.js"></div>
                                            </button>

                                            <button
                                                onClick={submitGrade}
                                                className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center justify-center gap-2"
                                                data-name="course-player-quiz-grade"
                                                data-file="pages/CoursePlayer.js"
                                            >
                                                <div className="icon-circle-check text-xl" data-name="course-player-quiz-grade-icon" data-file="pages/CoursePlayer.js"></div>
                                                <span data-name="course-player-quiz-grade-text" data-file="pages/CoursePlayer.js">Grade Quiz</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('CoursePlayer error:', error);
        return null;
    }
}
window.CoursePlayer = CoursePlayer;