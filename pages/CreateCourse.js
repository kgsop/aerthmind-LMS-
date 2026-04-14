function CreateCourse({ onCreate, myCourses, onDeleteCourse }) {
    try {
        const makeEmptyQuestion = () => ({
            id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            question: '',
            options: ['', '', '', ''],
            correctIndex: 0
        });

        const [formData, setFormData] = React.useState({
            title: '',
            description: '',
            category: 'Development',
            targetDepartment: 'All',
            notes: '',
            quizQuestions: [makeEmptyQuestion()]
        });

        const [activeQuestionIndex, setActiveQuestionIndex] = React.useState(0);

        const safeSetActiveIndex = (idx, listLen) => {
            try {
                const n = Number(idx);
                const max = Math.max(0, (listLen || 1) - 1);
                if (!Number.isFinite(n)) return 0;
                return Math.max(0, Math.min(max, n));
            } catch (e) {
                console.error('CreateCourse safeSetActiveIndex UI error:', e);
                return 0;
            }
        };

        const updateActiveQuestion = (patch) => {
            try {
                setFormData(prev => {
                    const list = Array.isArray(prev.quizQuestions) ? [...prev.quizQuestions] : [];
                    if (list.length === 0) list.push(makeEmptyQuestion());

                    const idx = safeSetActiveIndex(activeQuestionIndex, list.length);
                    const current = list[idx] || makeEmptyQuestion();
                    list[idx] = { ...current, ...patch };

                    return { ...prev, quizQuestions: list };
                });
            } catch (error) {
                console.error('CreateCourse updateActiveQuestion UI error:', error);
            }
        };

        const handleOptionChange = (index, value) => {
            try {
                const idx = Number(index);
                if (!Number.isFinite(idx) || idx < 0 || idx > 3) return;

                const list = Array.isArray(formData.quizQuestions) ? formData.quizQuestions : [];
                const q = list[activeQuestionIndex] || makeEmptyQuestion();
                const nextOptions = Array.isArray(q.options) ? [...q.options] : ['', '', '', ''];
                nextOptions[idx] = value;

                updateActiveQuestion({ options: nextOptions });
            } catch (error) {
                console.error('CreateCourse option change UI error:', error);
            }
        };

        const addNewQuestion = () => {
            try {
                setFormData(prev => {
                    const list = Array.isArray(prev.quizQuestions) ? [...prev.quizQuestions] : [];
                    const next = [...list, makeEmptyQuestion()];
                    return { ...prev, quizQuestions: next };
                });

                setTimeout(() => {
                    try {
                        setActiveQuestionIndex((i) => {
                            const nextLen = (formData.quizQuestions?.length || 0) + 1;
                            return safeSetActiveIndex(nextLen - 1, nextLen);
                        });
                    } catch (e) {
                        console.error('CreateCourse addNewQuestion timeout UI error:', e);
                    }
                }, 0);
            } catch (error) {
                console.error('CreateCourse addNewQuestion UI error:', error);
            }
        };

        const removeQuestionAt = (idx) => {
            try {
                setFormData(prev => {
                    const list = Array.isArray(prev.quizQuestions) ? [...prev.quizQuestions] : [];
                    const next = list.filter((_, i) => i !== idx);
                    if (next.length === 0) next.push(makeEmptyQuestion());
                    return { ...prev, quizQuestions: next };
                });

                setActiveQuestionIndex((current) => {
                    const nextLen = Math.max(1, (formData.quizQuestions?.length || 1) - 1);
                    if (current > idx) return safeSetActiveIndex(current - 1, nextLen);
                    if (current === idx) return safeSetActiveIndex(current, nextLen);
                    return safeSetActiveIndex(current, nextLen);
                });
            } catch (error) {
                console.error('CreateCourse removeQuestionAt UI error:', error);
            }
        };

        const validateQuizQuestions = (quizQuestions) => {
            try {
                const list = Array.isArray(quizQuestions) ? quizQuestions : [];
                if (list.length === 0) return { ok: false, message: 'Please add at least one quiz question.' };

                for (let i = 0; i < list.length; i += 1) {
                    const q = list[i];
                    const questionText = String(q?.question || '').trim();
                    const options = Array.isArray(q?.options) ? q.options : [];
                    const has4 = options.length === 4;
                    const filledOpts = has4 && options.every(o => String(o || '').trim().length > 0);
                    const correctIndex = Number(q?.correctIndex);

                    if (!questionText) return { ok: false, message: `Quiz question ${i + 1} is missing a question text.` };
                    if (!has4 || !filledOpts) return { ok: false, message: `Quiz question ${i + 1} must have 4 filled options.` };
                    if (!Number.isFinite(correctIndex) || correctIndex < 0 || correctIndex > 3) return { ok: false, message: `Quiz question ${i + 1} has an invalid correct answer.` };
                }

                return { ok: true, message: '' };
            } catch (error) {
                console.error('CreateCourse validateQuizQuestions UI error:', error);
                return { ok: false, message: 'Could not validate quiz questions.' };
            }
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            try {
                const validation = validateQuizQuestions(formData.quizQuestions);
                if (!validation.ok) {
                    console.error('CreateCourse submit validation:', validation.message);
                    return;
                }

                const newCourse = {
                    id: Date.now(),
                    title: formData.title,
                    description: formData.description,
                    category: formData.category,
                    targetDepartment: formData.targetDepartment,
                    notes: formData.notes,
                    quiz: (formData.quizQuestions || []).map(q => ({
                        question: String(q.question || '').trim(),
                        options: (q.options || []).map(x => String(x || '').trim()),
                        correctIndex: parseInt(q.correctIndex, 10)
                    })),
                    progress: 0,
                    students: 0
                };

                onCreate(newCourse);

                setFormData({
                    title: '',
                    description: '',
                    category: 'Development',
                    targetDepartment: 'All',
                    notes: '',
                    quizQuestions: [makeEmptyQuestion()]
                });
                setActiveQuestionIndex(0);
            } catch (error) {
                console.error('CreateCourse submit UI error:', error);
            }
        };

        const quizList = Array.isArray(formData.quizQuestions) ? formData.quizQuestions : [makeEmptyQuestion()];
        const activeIndex = safeSetActiveIndex(activeQuestionIndex, quizList.length);
        const activeQuestion = quizList[activeIndex] || makeEmptyQuestion();

        const miniLabel = (text) => {
            try {
                const t = String(text || '').trim();
                return t.length > 0 ? t : 'Untitled question';
            } catch (e) {
                console.error('CreateCourse miniLabel UI error:', e);
                return 'Untitled question';
            }
        };

        const quizValidation = validateQuizQuestions(quizList);

        return (
            <div className="animate-in fade-in duration-300 max-w-3xl" data-name="create-course" data-file="pages/CreateCourse.js">
                <div className="mb-8" data-name="create-course-head" data-file="pages/CreateCourse.js">
                    <h1 className="text-3xl font-bold mb-2" data-name="create-course-title" data-file="pages/CreateCourse.js">Create New Course</h1>
                    <p className="text-gray-500" data-name="create-course-subtitle" data-file="pages/CreateCourse.js">Design a new learning experience for your students.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-name="create-course-grid" data-file="pages/CreateCourse.js">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6" data-name="create-course-form" data-file="pages/CreateCourse.js">
                        <div data-name="create-course-field-title" data-file="pages/CreateCourse.js">
                            <label className="block text-sm font-medium text-gray-700 mb-2" data-name="create-course-title-label" data-file="pages/CreateCourse.js">Course Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                placeholder="e.g., Advanced Machine Learning"
                                data-name="create-course-title-input"
                                data-file="pages/CreateCourse.js"
                            />
                        </div>

                        <div data-name="create-course-field-category" data-file="pages/CreateCourse.js">
                            <label className="block text-sm font-medium text-gray-700 mb-2" data-name="create-course-category-label" data-file="pages/CreateCourse.js">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                data-name="create-course-category"
                                data-file="pages/CreateCourse.js"
                            >
                                <option data-name="create-course-category-opt" data-file="pages/CreateCourse.js">Development</option>
                                <option data-name="create-course-category-opt" data-file="pages/CreateCourse.js">Design</option>
                                <option data-name="create-course-category-opt" data-file="pages/CreateCourse.js">Business</option>
                                <option data-name="create-course-category-opt" data-file="pages/CreateCourse.js">Data Science</option>
                                <option data-name="create-course-category-opt" data-file="pages/CreateCourse.js">Marketing</option>
                            </select>
                        </div>

                        <div data-name="create-course-field-audience" data-file="pages/CreateCourse.js">
                            <label className="block text-sm font-medium text-gray-700 mb-2" data-name="create-course-audience-label" data-file="pages/CreateCourse.js">Target Audience (Department)</label>
                            <select
                                value={formData.targetDepartment}
                                onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                data-name="create-course-audience"
                                data-file="pages/CreateCourse.js"
                            >
                                <option value="All" data-name="create-course-audience-opt" data-file="pages/CreateCourse.js">All Students</option>
                                <option value="Computer Science" data-name="create-course-audience-opt" data-file="pages/CreateCourse.js">Computer Science</option>
                                <option value="Design" data-name="create-course-audience-opt" data-file="pages/CreateCourse.js">Design</option>
                                <option value="Business" data-name="create-course-audience-opt" data-file="pages/CreateCourse.js">Business</option>
                                <option value="Engineering" data-name="create-course-audience-opt" data-file="pages/CreateCourse.js">Engineering</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1" data-name="create-course-audience-note" data-file="pages/CreateCourse.js">Only students in the selected department will see this course.</p>
                        </div>

                        <div data-name="create-course-field-desc" data-file="pages/CreateCourse.js">
                            <label className="block text-sm font-medium text-gray-700 mb-2" data-name="create-course-desc-label" data-file="pages/CreateCourse.js">Course Description</label>
                            <textarea
                                required
                                rows="2"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                                placeholder="Describe what students will learn..."
                                data-name="create-course-desc"
                                data-file="pages/CreateCourse.js"
                            ></textarea>
                        </div>

                        <div className="pt-6 border-t border-gray-100" data-name="create-course-notes" data-file="pages/CreateCourse.js">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" data-name="create-course-notes-title" data-file="pages/CreateCourse.js">
                                <div className="icon-file-text text-[var(--primary)] text-xl" data-name="create-course-notes-icon" data-file="pages/CreateCourse.js"></div>
                                <span data-name="create-course-notes-title-text" data-file="pages/CreateCourse.js">Course Notes</span>
                            </h2>
                            <label className="block text-sm font-medium text-gray-700 mb-2" data-name="create-course-notes-label" data-file="pages/CreateCourse.js">Detailed Content</label>
                            <textarea
                                required
                                rows="6"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                                placeholder="Enter the comprehensive notes and study materials for this module..."
                                data-name="create-course-notes-textarea"
                                data-file="pages/CreateCourse.js"
                            ></textarea>
                        </div>

                        <div className="pt-6 border-t border-gray-100" data-name="create-course-quiz" data-file="pages/CreateCourse.js">
                            <div className="flex items-start justify-between gap-3 mb-4" data-name="create-course-quiz-head" data-file="pages/CreateCourse.js">
                                <div data-name="create-course-quiz-head-left" data-file="pages/CreateCourse.js">
                                    <h2 className="text-xl font-bold flex items-center gap-2" data-name="create-course-quiz-title" data-file="pages/CreateCourse.js">
                                        <div className="icon-circle-help text-[var(--primary)] text-xl" data-name="create-course-quiz-icon" data-file="pages/CreateCourse.js"></div>
                                        <span data-name="create-course-quiz-title-text" data-file="pages/CreateCourse.js">Knowledge Check Quiz</span>
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1" data-name="create-course-quiz-subtitle" data-file="pages/CreateCourse.js">Add as many questions as you want. Students will be graded across all of them.</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={addNewQuestion}
                                    className="px-4 py-2 rounded-xl bg-indigo-50 text-[var(--primary)] font-semibold hover:bg-indigo-100 transition-colors inline-flex items-center gap-2 shrink-0"
                                    data-name="create-course-quiz-add"
                                    data-file="pages/CreateCourse.js"
                                >
                                    <div className="icon-square-plus text-xl" data-name="create-course-quiz-add-icon" data-file="pages/CreateCourse.js"></div>
                                    <span data-name="create-course-quiz-add-text" data-file="pages/CreateCourse.js">Add Question</span>
                                </button>
                            </div>

                            {!quizValidation.ok ? (
                                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800" data-name="create-course-quiz-validation" data-file="pages/CreateCourse.js">
                                    <div className="flex items-start gap-2" data-name="create-course-quiz-validation-row" data-file="pages/CreateCourse.js">
                                        <div className="icon-triangle-alert text-xl text-amber-700" data-name="create-course-quiz-validation-icon" data-file="pages/CreateCourse.js"></div>
                                        <div data-name="create-course-quiz-validation-text" data-file="pages/CreateCourse.js">
                                            {quizValidation.message} (Tip: make sure every question has 4 options.)
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4" data-name="create-course-quiz-body" data-file="pages/CreateCourse.js">
                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3" data-name="create-course-quiz-list" data-file="pages/CreateCourse.js">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-2" data-name="create-course-quiz-list-title" data-file="pages/CreateCourse.js">
                                        Questions ({quizList.length})
                                    </div>

                                    <div className="space-y-2" data-name="create-course-quiz-list-items" data-file="pages/CreateCourse.js">
                                        {quizList.map((q, idx) => {
                                            const isActive = idx === activeIndex;
                                            return (
                                                <div
                                                    key={q.id || `q-${idx}`}
                                                    className={`w-full rounded-xl border px-3 py-2 cursor-pointer transition-colors ${isActive ? 'border-indigo-200 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}
                                                    onClick={() => setActiveQuestionIndex(idx)}
                                                    data-name="create-course-quiz-list-item"
                                                    data-file="pages/CreateCourse.js"
                                                >
                                                    <div className="flex items-start justify-between gap-2" data-name="create-course-quiz-list-item-row" data-file="pages/CreateCourse.js">
                                                        <div className="min-w-0" data-name="create-course-quiz-list-item-left" data-file="pages/CreateCourse.js">
                                                            <div className={`text-xs font-bold ${isActive ? 'text-slate-900' : 'text-slate-700'}`} data-name="create-course-quiz-list-item-title" data-file="pages/CreateCourse.js">
                                                                Q{idx + 1}
                                                            </div>
                                                            <div className="text-[11px] text-gray-500 truncate" data-name="create-course-quiz-list-item-sub" data-file="pages/CreateCourse.js">
                                                                {miniLabel(q.question)}
                                                            </div>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={(e) => { try { e.stopPropagation(); removeQuestionAt(idx); } catch (er) { console.error('CreateCourse remove question UI error:', er); } }}
                                                            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 transition-colors"
                                                            title="Remove question"
                                                            data-name="create-course-quiz-remove"
                                                            data-file="pages/CreateCourse.js"
                                                        >
                                                            <div className="icon-trash text-base" data-name="create-course-quiz-remove-icon" data-file="pages/CreateCourse.js"></div>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-4" data-name="create-course-quiz-fields" data-file="pages/CreateCourse.js">
                                    <div className="rounded-2xl border border-gray-100 bg-white p-4" data-name="create-course-quiz-editor" data-file="pages/CreateCourse.js">
                                        <div className="flex items-start justify-between gap-3 mb-3" data-name="create-course-quiz-editor-head" data-file="pages/CreateCourse.js">
                                            <div data-name="create-course-quiz-editor-head-left" data-file="pages/CreateCourse.js">
                                                <div className="text-sm font-bold text-slate-900" data-name="create-course-quiz-editor-title" data-file="pages/CreateCourse.js">
                                                    Editing Question {activeIndex + 1}
                                                </div>
                                                <div className="text-xs text-gray-500" data-name="create-course-quiz-editor-subtitle" data-file="pages/CreateCourse.js">
                                                    Fill the question and all 4 options, then pick the correct answer.
                                                </div>
                                            </div>
                                            <div className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600" data-name="create-course-quiz-editor-badge" data-file="pages/CreateCourse.js">
                                                Correct: Option {Number(activeQuestion.correctIndex) + 1}
                                            </div>
                                        </div>

                                        <div data-name="create-course-quiz-q-wrap" data-file="pages/CreateCourse.js">
                                            <label className="block text-sm font-medium text-gray-700 mb-2" data-name="create-course-quiz-q-label" data-file="pages/CreateCourse.js">Quiz Question</label>
                                            <input
                                                type="text"
                                                required
                                                value={activeQuestion.question}
                                                onChange={(e) => updateActiveQuestion({ question: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                                placeholder="e.g., What is the main principle of..."
                                                data-name="create-course-quiz-q"
                                                data-file="pages/CreateCourse.js"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" data-name="create-course-quiz-options" data-file="pages/CreateCourse.js">
                                            {(activeQuestion.options || []).map((opt, idx) => (
                                                <div key={idx} data-name="create-course-quiz-option-wrap" data-file="pages/CreateCourse.js">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1" data-name="create-course-quiz-option-label" data-file="pages/CreateCourse.js">Option {idx + 1}</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={opt}
                                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                                        placeholder={`Answer option ${idx + 1}`}
                                                        data-name="create-course-quiz-option"
                                                        data-file="pages/CreateCourse.js"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-4" data-name="create-course-quiz-correct-wrap" data-file="pages/CreateCourse.js">
                                            <label className="block text-sm font-medium text-gray-700 mb-2" data-name="create-course-quiz-correct-label" data-file="pages/CreateCourse.js">Correct Answer</label>
                                            <select
                                                value={activeQuestion.correctIndex}
                                                onChange={(e) => updateActiveQuestion({ correctIndex: Number(e.target.value) })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                                data-name="create-course-quiz-correct"
                                                data-file="pages/CreateCourse.js"
                                            >
                                                <option value={0} data-name="create-course-quiz-correct-opt" data-file="pages/CreateCourse.js">Option 1</option>
                                                <option value={1} data-name="create-course-quiz-correct-opt" data-file="pages/CreateCourse.js">Option 2</option>
                                                <option value={2} data-name="create-course-quiz-correct-opt" data-file="pages/CreateCourse.js">Option 3</option>
                                                <option value={3} data-name="create-course-quiz-correct-opt" data-file="pages/CreateCourse.js">Option 4</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600" data-name="create-course-quiz-hint" data-file="pages/CreateCourse.js">
                                        <div className="flex items-start gap-2" data-name="create-course-quiz-hint-row" data-file="pages/CreateCourse.js">
                                            <div className="icon-info text-xl text-gray-700" data-name="create-course-quiz-hint-icon" data-file="pages/CreateCourse.js"></div>
                                            <div data-name="create-course-quiz-hint-text" data-file="pages/CreateCourse.js">
                                                You can add more questions any time. When students take this course, their marks will be calculated across all questions.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100" data-name="create-course-submit-wrap" data-file="pages/CreateCourse.js">
                            <button
                                type="submit"
                                className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex justify-center items-center gap-2"
                                data-name="create-course-submit"
                                data-file="pages/CreateCourse.js"
                            >
                                <div className="icon-square-plus text-xl" data-name="create-course-submit-icon" data-file="pages/CreateCourse.js"></div>
                                <span data-name="create-course-submit-text" data-file="pages/CreateCourse.js">Publish Course</span>
                            </button>

                            <div className="text-xs text-gray-500 mt-2" data-name="create-course-submit-note" data-file="pages/CreateCourse.js">
                                Note: if publishing doesn’t work, make sure every quiz question has 4 filled options and a selected correct answer.
                            </div>
                        </div>
                    </form>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit" data-name="create-course-manage" data-file="pages/CreateCourse.js">
                        <div className="flex items-start justify-between gap-3 mb-4" data-name="create-course-manage-head" data-file="pages/CreateCourse.js">
                            <div data-name="create-course-manage-left" data-file="pages/CreateCourse.js">
                                <h2 className="text-lg font-bold text-slate-900" data-name="create-course-manage-title" data-file="pages/CreateCourse.js">Manage Courses</h2>
                                <p className="text-sm text-gray-500" data-name="create-course-manage-subtitle" data-file="pages/CreateCourse.js">Delete courses you created (demo).</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center" data-name="create-course-manage-icon-wrap" data-file="pages/CreateCourse.js">
                                <div className="icon-trash text-xl text-indigo-700" data-name="create-course-manage-icon" data-file="pages/CreateCourse.js"></div>
                            </div>
                        </div>

                        {(Array.isArray(myCourses) && myCourses.length > 0) ? (
                            <div className="space-y-3" data-name="create-course-manage-list" data-file="pages/CreateCourse.js">
                                {myCourses.map((c) => (
                                    <div key={c.id} className="rounded-2xl border border-gray-100 p-4 flex items-start justify-between gap-3" data-name="create-course-manage-item" data-file="pages/CreateCourse.js">
                                        <div className="min-w-0" data-name="create-course-manage-item-left" data-file="pages/CreateCourse.js">
                                            <div className="font-bold text-slate-900 truncate" data-name="create-course-manage-item-title" data-file="pages/CreateCourse.js">{c.title}</div>
                                            <div className="text-xs text-gray-500 mt-1" data-name="create-course-manage-item-meta" data-file="pages/CreateCourse.js">
                                                {c.category || 'Course'} • Audience: {c.targetDepartment || 'All'}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { try { onDeleteCourse && onDeleteCourse(c.id); } catch (e) { console.error('Delete course button UI error:', e); } }}
                                            className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors font-semibold flex items-center gap-2 shrink-0"
                                            data-name="create-course-delete"
                                            data-file="pages/CreateCourse.js"
                                        >
                                            <div className="icon-trash text-xl" data-name="create-course-delete-icon" data-file="pages/CreateCourse.js"></div>
                                            <span data-name="create-course-delete-text" data-file="pages/CreateCourse.js">Delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-600" data-name="create-course-manage-empty" data-file="pages/CreateCourse.js">
                                <div className="flex items-start gap-2" data-name="create-course-manage-empty-row" data-file="pages/CreateCourse.js">
                                    <div className="icon-circle-help text-xl text-gray-700" data-name="create-course-manage-empty-icon" data-file="pages/CreateCourse.js"></div>
                                    <div data-name="create-course-manage-empty-text" data-file="pages/CreateCourse.js">
                                        <div className="font-bold text-slate-900" data-name="create-course-manage-empty-title" data-file="pages/CreateCourse.js">No created courses</div>
                                        <div className="mt-1" data-name="create-course-manage-empty-desc" data-file="pages/CreateCourse.js">Publish a course and it will appear here for management.</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('CreateCourse error:', error);
        return null;
    }
}
window.CreateCourse = CreateCourse;