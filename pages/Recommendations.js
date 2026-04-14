function Recommendations({ enrolledCourses, allCourses, user, onBrowse }) {
    try {
        const [recs, setRecs] = React.useState([]);
        const [isLoading, setIsLoading] = React.useState(true);
        const [error, setError] = React.useState(null);
        const [hasCompletedCourse, setHasCompletedCourse] = React.useState(false);
        const [hasUsedAITutor, setHasUsedAITutor] = React.useState(false);
        const [prereqsReady, setPrereqsReady] = React.useState(false);

        // Resolve async prerequisites first
        React.useEffect(() => {
            let cancelled = false;
            async function checkPrereqs() {
                const completed = enrolledCourses?.some(c => c.progress === 100) || false;
                let usedTutor = false;
                try {
                    usedTutor = await StorageDB.getAITutorUsed(user?.email);
                } catch (e) {
                    console.error("Error checking AI tutor usage:", e);
                }
                if (!cancelled) {
                    setHasCompletedCourse(completed);
                    setHasUsedAITutor(usedTutor);
                    setPrereqsReady(true);
                }
            }
            checkPrereqs();
            return () => { cancelled = true; };
        }, [user?.email, enrolledCourses?.length]);

        // Fetch AI recommendations after prereqs are resolved
        React.useEffect(() => {
            if (!prereqsReady) return;

            if (!hasCompletedCourse && !hasUsedAITutor) {
                setIsLoading(false);
                return;
            }

            let cancelled = false;

            const fetchAIRecommendations = async () => {
                setIsLoading(true);
                setError(null);

                const coursesPool = allCourses || [];

                const availableCourses = coursesPool.filter(course => {
                    const isSampleCourse = course.schoolCode === 'DEMO123';
                    if (course.schoolCode !== user?.schoolCode && !isSampleCourse) return false;
                    if (!isSampleCourse && course.targetDepartment !== 'All' && course.targetDepartment !== user?.department) return false;
                    const isEnrolled = enrolledCourses?.some(ec => ec.id === course.id);
                    if (isEnrolled) return false;
                    return true;
                });

                if (availableCourses.length === 0) {
                    if (!cancelled) {
                        setRecs([]);
                        setIsLoading(false);
                    }
                    return;
                }

                const systemPrompt = `You are an intelligent course recommendation engine for an educational dashboard.
Your task is to recommend the top 4 best courses for the user from the "Available Courses" list, based on their "User Info" and "Enrolled Courses".
Output your response as a pure JSON array of objects. Do not include markdown formatting or backticks.
Each object must have:
- id: the course id (number)
- match: a string representing the match percentage (e.g., "95%")
- reason: a brief, encouraging reason for the recommendation (1 sentence)`;

                const userPrompt = `User Info: Role=${user?.role}, Department=${user?.department}
Enrolled Courses: ${JSON.stringify(enrolledCourses?.map(c => ({ id: c.id, title: c.title, category: c.category })))}
Available Courses: ${JSON.stringify(availableCourses.map(c => ({ id: c.id, title: c.title, category: c.category, targetDepartment: c.targetDepartment })))}`;

                let responseText = '';
                const apiKey = StorageDB.getApiKey();

                try {
                    if (typeof window.invokeAIAgent === 'function') {
                        responseText = await window.invokeAIAgent(systemPrompt, userPrompt);
                    } else if (apiKey) {
                        const TARGET_API_URL = "https://api.sarvam.ai/v1/chat/completions";
                        const FETCH_URL = TARGET_API_URL;
                        
                        const apiResponse = await fetch(FETCH_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${apiKey}`
                            },
                            body: JSON.stringify({
                                model: "sarvam-m",
                                messages: [
                                    { role: "system", content: systemPrompt },
                                    { role: "user", content: userPrompt }
                                ]
                            })
                        });

                        const rawResponseText = await apiResponse.text();

                        if (!apiResponse.ok) {
                            if (apiResponse.status === 401) throw new Error("Invalid API Key. Please update your key in the AI Tutor Settings.");
                            if (apiResponse.status === 429) throw new Error("Rate limit exceeded. Please wait a moment and try again.");
                            throw new Error(`API Error: ${apiResponse.status}`);
                        }

                        try {
                            const data = JSON.parse(rawResponseText);
                            responseText = data.choices[0].message.content;
                        } catch (e) {
                            throw new Error("Received unexpected response format from API.");
                        }
                    } else {
                        throw new Error("No API key configured. Please set your OpenAI API key in the AI Tutor section first.");
                    }

                    // Parse JSON with safe extraction and a graceful fallback
                    let parsedData;
                    try {
                        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
                        if (jsonMatch) {
                            parsedData = JSON.parse(jsonMatch[0]);
                        } else {
                            const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                            parsedData = JSON.parse(cleanedText);
                        }
                    } catch (e) {
                        console.warn("Failed to parse AI recommendations, using smart defaults. Raw:", responseText);
                        parsedData = availableCourses.slice(0, 4).map(c => ({
                            id: c.id,
                            match: "Top Pick",
                            reason: "Highly recommended based on your department and current availability."
                        }));
                    }

                    const finalRecs = parsedData.map(aiRec => {
                        const course = availableCourses.find(c => String(c.id) === String(aiRec.id));
                        if (course) {
                            return { ...course, match: aiRec.match, reason: aiRec.reason };
                        }
                        return null;
                    }).filter(Boolean);

                    if (!cancelled) {
                        setRecs(finalRecs.slice(0, 4));
                    }
                } catch (err) {
                    console.error("AI Recommendation Error:", err);
                    if (!cancelled) {
                        setError(err.message);
                    }
                } finally {
                    if (!cancelled) {
                        setIsLoading(false);
                    }
                }
            };

            fetchAIRecommendations();
            return () => { cancelled = true; };
        }, [prereqsReady, hasCompletedCourse, hasUsedAITutor, user?.email, user?.department, user?.role, user?.schoolCode, enrolledCourses?.length]);


        // Empty state if user hasn't started learning or chatting
        if (prereqsReady && !hasCompletedCourse && !hasUsedAITutor) {
            return (
                <div className="animate-in fade-in duration-300" data-name="recommendations" data-file="pages/Recommendations.js">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Recommendations ✨</h1>
                        <p className="text-gray-500">Personalized courses just for you.</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                        <div className="w-20 h-20 bg-indigo-50 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <div className="icon-sparkles text-4xl"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">We need to learn more about you!</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            To give you the best course recommendations, we first need to see your learning style. Complete a course or chat with the AI Tutor so we can curate your personalized list!
                        </p>
                        <button 
                            onClick={onBrowse}
                            className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2 mx-auto"
                        >
                            <div className="icon-search text-lg"></div>
                            Browse Courses
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="animate-in fade-in duration-300" data-name="recommendations" data-file="pages/Recommendations.js">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Recommendations ✨</h1>
                    <p className="text-gray-500">
                        AI-curated courses based on your learning history and goals.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="icon-loader animate-spin text-[var(--primary)] text-4xl mb-4"></div>
                        <p className="text-gray-500 font-medium">AI is analyzing your profile to find the best courses...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 rounded-2xl border border-red-100 p-8 text-center shadow-sm max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="icon-circle-alert text-2xl"></div>
                        </div>
                        <h3 className="text-xl font-bold text-red-900 mb-2">Oops, something went wrong</h3>
                        <p className="text-red-700 mb-4">{error}</p>
                    </div>
                ) : recs.length > 0 ? (
                    <div className="space-y-4">
                        {recs.map(rec => (
                            <div key={rec.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-[var(--primary)] flex-shrink-0">
                                        <div className="icon-sparkles text-xl"></div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                                            {rec.category && (
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
                                                    {rec.category}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">{rec.reason}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 mt-4 md:mt-0">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Match</span>
                                        <span className="font-bold text-green-600 text-lg">{rec.match}</span>
                                    </div>
                                    <button 
                                        onClick={onBrowse}
                                        className="px-5 py-2.5 bg-indigo-50 text-[var(--primary)] rounded-xl font-medium hover:bg-indigo-100 transition-colors whitespace-nowrap"
                                    >
                                        View in Browse
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-indigo-50 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="icon-folder-open text-2xl"></div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
                        <p className="text-gray-500 max-w-md mx-auto">There are no new course recommendations at the moment. Check back later when instructors publish new content.</p>
                        <button 
                            onClick={onBrowse}
                            className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                            Back to Browse
                        </button>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('Recommendations error:', error);
        return null;
    }
}