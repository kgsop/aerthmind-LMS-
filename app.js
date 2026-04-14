class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50" data-name="error-boundary" data-file="app.js">
          <div className="text-center" data-name="error-boundary-center" data-file="app.js">
            <h1 className="text-2xl font-bold text-gray-900 mb-4" data-name="error-boundary-title" data-file="app.js">Something went wrong</h1>
            <p className="text-gray-600 mb-4" data-name="error-boundary-text" data-file="app.js">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              data-name="error-boundary-reload"
              data-file="app.js"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const savedUser = window.StorageDB.getCurrentUser();
    const [appState, setAppState] = React.useState(savedUser ? 'app' : 'landing'); // 'landing', 'login', 'app'
    const [loginMode, setLoginMode] = React.useState('login'); // 'login' or 'signup'
    const [user, setUser] = React.useState(savedUser);
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [practiceQuizOpen, setPracticeQuizOpen] = React.useState(false);
    const [activeCourseId, setActiveCourseId] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(!!savedUser);
    const [loadError, setLoadError] = React.useState(null);
    const [reloadKey, setReloadKey] = React.useState(0);

    const [myCourses, setMyCourses] = React.useState([]);
    const [allCourses, setAllCourses] = React.useState([]);
    const [stats, setStats] = React.useState([]);

    const [toasts, setToasts] = React.useState([]);

    const pushToast = React.useCallback((toast) => {
        try {
            const id = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
            const payload = {
                id,
                type: toast?.type || 'info',
                title: toast?.title || '',
                message: toast?.message || '',
                durationMs: Number.isFinite(Number(toast?.durationMs)) ? Number(toast.durationMs) : 3500
            };
            setToasts(prev => [...prev, payload]);
        } catch (e) {
            console.error('pushToast UI error:', e);
        }
    }, []);

    const removeToast = React.useCallback((id) => {
        try {
            setToasts(prev => prev.filter(t => t.id !== id));
        } catch (e) {
            console.error('removeToast UI error:', e);
        }
    }, []);

    const getFallbackStats = async (userObj, coursesArray) => {
        try {
            if (!userObj) return [];
            const courseCount = Array.isArray(coursesArray) ? coursesArray.length : 0;
            if (userObj.role === 'student') {
                return [
                    { id: 1, title: 'Enrolled Courses', value: String(courseCount), icon: 'icon-book-open', bgColorClass: 'bg-indigo-500' },
                    { id: 2, title: 'Modules Completed', value: '0', icon: 'icon-trophy', bgColorClass: 'bg-purple-500' },
                    { id: 3, title: 'Learning Hours', value: '0h', icon: 'icon-clock', bgColorClass: 'bg-slate-900' },
                ];
            }
            
            // Calculate total students across all instructor courses
            let totalStudents = 0;
            for (const course of coursesArray) {
                totalStudents += course.students || 0;
            }
            
            return [
                { id: 1, title: 'Total Students', value: String(totalStudents), icon: 'icon-users', bgColorClass: 'bg-indigo-500' },
                { id: 2, title: 'Courses Created', value: String(courseCount), icon: 'icon-book-open', bgColorClass: 'bg-blue-500' },
                { id: 3, title: 'Avg Rating', value: '0.0', icon: 'icon-star', bgColorClass: 'bg-slate-900' },
            ];
        } catch (e) {
            console.error('getFallbackStats UI error:', e);
            return [];
        }
    };

    const SAMPLE_COURSES = [
        { id: 101, title: 'Introduction to Computer Science', description: 'A foundational course covering algorithms, data structures, and the basics of programming.', category: 'Development', targetDepartment: 'Computer Science', schoolCode: 'DEMO123' },
        { id: 102, title: 'Advanced Machine Learning', description: 'Dive deep into neural networks, deep learning, and advanced AI concepts.', category: 'Development', targetDepartment: 'Computer Science', schoolCode: 'DEMO123' },
        { id: 103, title: 'Web Development Bootcamp', description: 'Learn to build modern, responsive websites using HTML, CSS, and React.', category: 'Development', targetDepartment: 'Computer Science', schoolCode: 'DEMO123' },
        { id: 104, title: 'Data Structures and Algorithms', description: 'Master the core data structures and algorithmic paradigms used in software engineering.', category: 'Development', targetDepartment: 'Computer Science', schoolCode: 'DEMO123' },
        { id: 201, title: 'UI/UX Design Fundamentals', description: 'Learn the core principles of user interface and user experience design to create beautiful applications.', category: 'Design', targetDepartment: 'Design', schoolCode: 'DEMO123' },
        { id: 202, title: 'Typography and Layout', description: 'Understand how to use typography and grid systems effectively in your digital designs.', category: 'Design', targetDepartment: 'Design', schoolCode: 'DEMO123' },
        { id: 203, title: 'Advanced Prototyping', description: 'Take your UI skills to the next level with interactive prototypes and dynamic animations.', category: 'Design', targetDepartment: 'Design', schoolCode: 'DEMO123' },
        { id: 204, title: 'Color Theory in Digital Design', description: 'Explore the psychology of color, visual hierarchy, and how to create accessible palettes.', category: 'Design', targetDepartment: 'Design', schoolCode: 'DEMO123' },
        { id: 301, title: 'Business Strategy & Management', description: 'Explore modern business strategies, organizational behavior, and effective management techniques.', category: 'Business', targetDepartment: 'Business', schoolCode: 'DEMO123' },
        { id: 302, title: 'Marketing Principles', description: 'Learn the fundamentals of market research, brand positioning, and digital marketing strategies.', category: 'Business', targetDepartment: 'Business', schoolCode: 'DEMO123' },
        { id: 303, title: 'Financial Accounting Basics', description: 'An introduction to financial statements, accounting cycles, and essential cash flow analysis.', category: 'Business', targetDepartment: 'Business', schoolCode: 'DEMO123' },
        { id: 304, title: 'Entrepreneurship 101', description: 'From initial idea to execution: learn how to start, fund, and scale your own modern business.', category: 'Business', targetDepartment: 'Business', schoolCode: 'DEMO123' },
        { id: 401, title: 'Engineering Mechanics', description: 'Understand the fundamental principles of mechanics and their application to real-world engineering problems.', category: 'Engineering', targetDepartment: 'Engineering', schoolCode: 'DEMO123' },
        { id: 402, title: 'Thermodynamics Foundations', description: 'Learn about energy transfer, the laws of thermodynamics, and basic power cycles.', category: 'Engineering', targetDepartment: 'Engineering', schoolCode: 'DEMO123' },
        { id: 403, title: 'Introduction to Circuits', description: 'Master the basics of electrical circuits, Ohm\'s law, network theorems, and AC/DC power.', category: 'Engineering', targetDepartment: 'Engineering', schoolCode: 'DEMO123' },
        { id: 404, title: 'Fluid Dynamics', description: 'Study the behavior of fluids in motion, pressure gradients, and their critical engineering applications.', category: 'Engineering', targetDepartment: 'Engineering', schoolCode: 'DEMO123' }
    ];

    const isFailedToFetch = (err) => {
        try {
            const msg = String(err?.message || err || '').toLowerCase();
            return msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed');
        } catch (e) {
            console.error('isFailedToFetch UI error:', e);
            return false;
        }
    };

    const retryLoadWorkspace = React.useCallback(() => {
        try {
            setLoadError(null);
            setIsLoading(true);
            setReloadKey((k) => k + 1);
        } catch (e) {
            console.error('retryLoadWorkspace UI error:', e);
        }
    }, []);

    React.useEffect(() => {
        let isMounted = true;
        async function loadData() {
            try {
                if (isMounted) {
                    setIsLoading(true);
                    setLoadError(null);
                }

                let globalCourses = await window.StorageDB.getAllCourses();

                const missingSamples = SAMPLE_COURSES.filter(sc => !globalCourses.some(gc => gc.id === sc.id));
                if (missingSamples.length > 0) {
                    for (const course of missingSamples) {
                        await window.StorageDB.addCourse(course);
                    }
                    globalCourses = await window.StorageDB.getAllCourses();
                }

                // Deduplicate courses by ID
                const uniqueCourses = [];
                const seenIds = new Set();
                for (const course of globalCourses) {
                    if (!seenIds.has(course.id)) {
                        seenIds.add(course.id);
                        uniqueCourses.push(course);
                    }
                }

                if (user) {
                    let mCourses = await window.StorageDB.getMyCourses(user.email);
                    
                    // Deduplicate user courses by ID
                    const uniqueMyCourses = [];
                    const seenMyCourseIds = new Set();
                    for (const course of mCourses) {
                        if (!seenMyCourseIds.has(course.id)) {
                            seenMyCourseIds.add(course.id);
                            uniqueMyCourses.push(course);
                        }
                    }
                    
                    // Load enrollment counts and ratings for instructor courses
                    if (user.role === 'instructor') {
                        for (let i = 0; i < uniqueMyCourses.length; i++) {
                            const enrollmentCount = await window.StorageDB.getCourseEnrollments(uniqueMyCourses[i].id);
                            const avgRating = await window.StorageDB.getCourseRating(uniqueMyCourses[i].id);
                            uniqueMyCourses[i] = { ...uniqueMyCourses[i], students: enrollmentCount, rating: avgRating };
                        }
                    }
                    
                    const uStats = await window.StorageDB.getStats(user.email);

                    if (isMounted) {
                        setAllCourses(uniqueCourses);
                        setMyCourses(uniqueMyCourses);
                        if (uStats && uStats.length > 0) {
                            // Recalculate stats with fresh enrollment and rating data
                            if (user.role === 'instructor') {
                                let totalStudents = 0;
                                let totalRating = 0;
                                let ratedCourses = 0;
                                for (const course of uniqueMyCourses) {
                                    totalStudents += course.students || 0;
                                    const rating = parseFloat(course.rating || '0');
                                    if (rating > 0) {
                                        totalRating += rating;
                                        ratedCourses++;
                                    }
                                }
                                const avgRating = ratedCourses > 0 ? (totalRating / ratedCourses).toFixed(1) : '0.0';
                                const refreshedStats = uStats.map(stat => {
                                    if (stat.id === 1) return { ...stat, value: String(totalStudents) };
                                    if (stat.id === 3) return { ...stat, value: avgRating };
                                    return stat;
                                });
                                setStats(refreshedStats);
                                await window.StorageDB.setStats(user.email, refreshedStats);
                            } else {
                                setStats(uStats);
                            }
                        } else {
                            const fallbackStats = await getFallbackStats(user, uniqueMyCourses);
                            setStats(fallbackStats);
                        }
                        setIsLoading(false);
                    }
                } else {
                    if (isMounted) {
                        setAllCourses(uniqueCourses);
                        setIsLoading(false);
                    }
                }
            } catch (e) {
                if (isMounted) {
                    const friendly = isFailedToFetch(e)
                        ? {
                            title: 'Network issue while loading courses',
                            message: 'Your connection or a service is blocking requests. Check your network and try again.'
                        }
                        : {
                            title: 'Could not load your workspace',
                            message: 'Please try again. If this keeps happening, sign out and sign in again.'
                        };
                    setLoadError(friendly);
                    setIsLoading(false);
                }

                pushToast({
                    type: 'error',
                    title: 'Could not load course catalog',
                    message: isFailedToFetch(e) ? 'Network issue detected. Please retry.' : 'Please refresh the page and try again.'
                });
            }
        }
        loadData();
        return () => { isMounted = false; };
    }, [user, pushToast, reloadKey]);

    const handleLogin = async (loggedInUser, isNewUser) => {
        try {
            setUser(loggedInUser);
            window.StorageDB.setCurrentUser(loggedInUser);
            // Always save account to recent list (adds new or updates existing)
            window.StorageDB.saveAccount(loggedInUser);
            setAppState('app');
            setActiveTab('dashboard');
            setActiveCourseId(null);
            setIsLoading(true);

            if (isNewUser) {
                const globalCourses = await window.StorageDB.getAllCourses();
                setAllCourses(globalCourses);

                if (loggedInUser.role === 'student') {
                    let autoEnrollCourses = globalCourses.filter(c => {
                        const isSampleCourse = c.schoolCode === 'DEMO123';
                        const matchesDept = c.targetDepartment === 'All' || c.targetDepartment === loggedInUser.department;
                        return isSampleCourse && matchesDept;
                    });

                    const initialCourses = autoEnrollCourses.map(c => ({ ...c, progress: 0 }));
                    setMyCourses(initialCourses);
                    await window.StorageDB.setMyCourses(loggedInUser.email, initialCourses);

                    const courseCount = initialCourses.length;
                    const newStats = [
                        { id: 1, title: 'Enrolled Courses', value: String(courseCount), icon: 'icon-book-open', bgColorClass: 'bg-indigo-500' },
                        { id: 2, title: 'Modules Completed', value: '0', icon: 'icon-trophy', bgColorClass: 'bg-purple-500' },
                        { id: 3, title: 'Learning Hours', value: '0h', icon: 'icon-clock', bgColorClass: 'bg-slate-900' },
                    ];
                    setStats(newStats);
                    await window.StorageDB.setStats(loggedInUser.email, newStats);
                } else {
                    setMyCourses([]);
                    await window.StorageDB.setMyCourses(loggedInUser.email, []);
                    const newStats = await getFallbackStats(loggedInUser, []);
                    setStats(newStats);
                    await window.StorageDB.setStats(loggedInUser.email, newStats);
                }
                setIsLoading(false);
                pushToast({ type: 'success', title: 'Welcome to Aethermind', message: 'Your account is ready.' });
            }
        } catch (e) {
            setIsLoading(false);
            pushToast({ type: 'error', title: 'Sign-in failed', message: 'Please try again in a moment.' });
        }
    };

    const handleLogout = () => {
        try {
            // Keep all accounts in saved list for easy switching later
            setUser(null);
            window.StorageDB.setCurrentUser(null);
            setMyCourses([]);
            setStats([]);
            setAppState('landing');
            pushToast({ type: 'info', title: 'Signed out', message: 'See you next time.' });
        } catch (e) {
            console.error('Logout UI error:', e);
        }
    };

    const handleResumeCourse = (courseId) => {
        setActiveCourseId(courseId);
    };

    const handleCourseComplete = async (courseId, score = 100, progress = 100) => {
        try {
            const updatedCourses = myCourses.map(course => {
                if (course.id === courseId) {
                    return {
                        ...course,
                        progress: Math.max(course.progress || 0, progress),
                        lastScore: score > 0 ? score : course.lastScore
                    };
                }
                return course;
            });

            setMyCourses(updatedCourses);
            await window.StorageDB.setMyCourses(user.email, updatedCourses);

            if (progress === 100) {
                const updatedStats = stats.map(stat => {
                    if (stat.id === 2) return { ...stat, value: String(parseInt(stat.value) + 1) };
                    if (stat.id === 3) return { ...stat, value: `${parseInt(stat.value) + 2}h` };
                    return stat;
                });
                setStats(updatedStats);
                await window.StorageDB.setStats(user.email, updatedStats);
                pushToast({ type: 'success', title: 'Module completed', message: 'Nice work — progress saved.' });
            }
        } catch (e) {
            pushToast({ type: 'error', title: 'Could not save progress', message: 'Your changes may not be saved. Please try again.' });
        }
    };

    const handleEnroll = async (course) => {
        try {
            const isEnrolled = myCourses.some(c => c.id === course.id);
            if (!isEnrolled) {
                const updatedCourses = [...myCourses, { ...course, progress: 0 }];
                
                // Deduplicate before saving
                const uniqueCourses = [];
                const seenIds = new Set();
                for (const c of updatedCourses) {
                    if (!seenIds.has(c.id)) {
                        seenIds.add(c.id);
                        uniqueCourses.push(c);
                    }
                }
                
                setMyCourses(uniqueCourses);
                await window.StorageDB.setMyCourses(user.email, uniqueCourses);

                const newCourseCount = uniqueCourses.length;
                const updatedStats = stats.map(stat => {
                    if (stat.id === 1) return { ...stat, value: String(newCourseCount) };
                    return stat;
                });
                setStats(updatedStats);
                await window.StorageDB.setStats(user.email, updatedStats);

                pushToast({ type: 'success', title: 'Enrolled', message: `Added "${course.title}" to your dashboard.` });
            }
            setActiveTab('dashboard');
            setReloadKey((k) => k + 1);
        } catch (e) {
            pushToast({ type: 'error', title: 'Enrollment failed', message: 'Please try again.' });
        }
    };

    const handleCreateCourse = async (newCourse) => {
        try {
            const courseWithSchool = { ...newCourse, schoolCode: user.schoolCode };
            await window.StorageDB.addCourse(courseWithSchool);

            const updatedMyCourses = [...myCourses, courseWithSchool];
            
            // Deduplicate before saving
            const uniqueMyCourses = [];
            const seenIds = new Set();
            for (const c of updatedMyCourses) {
                if (!seenIds.has(c.id)) {
                    seenIds.add(c.id);
                    uniqueMyCourses.push(c);
                }
            }
            
            setMyCourses(uniqueMyCourses);
            await window.StorageDB.setMyCourses(user.email, uniqueMyCourses);

            const updatedAllCourses = [...allCourses, courseWithSchool];
            const uniqueAllCourses = [];
            const seenAllIds = new Set();
            for (const c of updatedAllCourses) {
                if (!seenAllIds.has(c.id)) {
                    seenAllIds.add(c.id);
                    uniqueAllCourses.push(c);
                }
            }
            setAllCourses(uniqueAllCourses);

            const updatedStats = stats.map(stat => {
                if (stat.id === 2) return { ...stat, value: String(parseInt(stat.value) + 1) };
                return stat;
            });
            setStats(updatedStats);
            await window.StorageDB.setStats(user.email, updatedStats);

            setActiveTab('dashboard');
            pushToast({ type: 'success', title: 'Course published', message: 'Students will see it in Browse Courses.' });
        } catch (e) {
            pushToast({ type: 'error', title: 'Publish failed', message: 'Please try again.' });
        }
    };

    const handleDeleteCourse = async (courseId) => {
        try {
            if (!user || user.role !== 'instructor') return;

            const updatedAll = (allCourses || []).filter(c => c.id !== courseId);
            setAllCourses(updatedAll);

            const updatedMine = (myCourses || []).filter(c => c.id !== courseId);
            setMyCourses(updatedMine);
            await window.StorageDB.setMyCourses(user.email, updatedMine);

            await window.StorageDB.deleteCourseById(courseId);

            const updatedStats = (stats || []).map(stat => {
                if (stat.id === 2) {
                    const next = Math.max(0, parseInt(stat.value || '0', 10) - 1);
                    return { ...stat, value: String(next) };
                }
                return stat;
            });
            setStats(updatedStats);
            await window.StorageDB.setStats(user.email, updatedStats);
        } catch (error) {
            console.error('Delete course handler error:', error);
        }
    };

    const handleEditCourse = async (updatedCourse) => {
        try {
            if (!user || user.role !== 'instructor') return;

            await window.StorageDB.addCourse(updatedCourse);

            const updatedAll = allCourses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
            setAllCourses(updatedAll);

            const updatedMine = myCourses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
            setMyCourses(updatedMine);
            await window.StorageDB.setMyCourses(user.email, updatedMine);

            pushToast({ type: 'success', title: 'Course updated', message: 'Changes saved successfully.' });
        } catch (error) {
            console.error('Edit course handler error:', error);
            pushToast({ type: 'error', title: 'Update failed', message: 'Please try again.' });
        }
    };

    const handleGoSettings = () => {
        try {
            setPracticeQuizOpen(false);
            setActiveCourseId(null);
            setActiveTab('settings');
        } catch (e) {
            console.error('handleGoSettings UI error:', e);
        }
    };

    const renderView = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center py-32" data-name="app-loading" data-file="app.js">
                    <div className="icon-loader animate-spin text-[var(--primary)] text-5xl mb-4" data-name="app-loading-icon" data-file="app.js"></div>
                    <p className="text-gray-500 font-medium" data-name="app-loading-text" data-file="app.js">Loading your workspace...</p>
                </div>
            );
        }

        if (loadError) {
            return (
                <div className="py-10" data-name="app-load-error" data-file="app.js">
                    <ErrorState
                        title={loadError.title}
                        message={loadError.message}
                        actionLabel="Retry"
                        onAction={retryLoadWorkspace}
                        iconClass="icon-circle-alert"
                    />
                    <div className="mt-4 text-center text-sm text-gray-500" data-name="app-load-error-hint" data-file="app.js">
                        If you’re using an API key, verify it in Settings or sign out and sign in again.
                    </div>
                </div>
            );
        }

        if (practiceQuizOpen) {
            return <PracticeQuiz onBack={() => setPracticeQuizOpen(false)} />;
        }

        if (activeCourseId) {
            const course = myCourses.find(c => c.id === activeCourseId);
            if (course) {
                return <CoursePlayer 
                    course={course} 
                    onBack={() => setActiveCourseId(null)} 
                    onComplete={(score, progress) => handleCourseComplete(course.id, score, progress)} 
                />;
            }
        }

        switch (activeTab) {
            case 'dashboard':
                return (
                    <Dashboard 
                        courses={myCourses} 
                        stats={stats} 
                        role={user?.role}
                        user={user}
                        onResumeCourse={handleResumeCourse}
                        onViewAllCourses={() => setActiveTab('browse')}
                        onCreateCourse={() => setActiveTab('create-course')}
                        onDeleteCourse={handleDeleteCourse}
                        onEditCourse={handleEditCourse}
                    />
                );
            case 'browse':
                return <BrowseCourses courses={allCourses} enrolledCourses={myCourses} onEnroll={handleEnroll} user={user} />;
            case 'create-course':
                return <CreateCourse onCreate={handleCreateCourse} myCourses={myCourses} onDeleteCourse={handleDeleteCourse} />;
            case 'ai-tutor':
                return <AITutor user={user} onOpenSettings={handleGoSettings} />;
            case 'recommendations':
                return <Recommendations enrolledCourses={myCourses} allCourses={allCourses} user={user} onBrowse={() => setActiveTab('browse')} />;
            case 'settings':
                return <Settings user={user} onDone={() => setActiveTab('dashboard')} onToast={pushToast} />;
            default:
                return <Dashboard courses={myCourses} stats={stats} role={user?.role} user={user} />;
        }
    };

    if (appState === 'landing') {
        return <Landing 
            onGetStarted={() => { setLoginMode('signup'); setAppState('login'); }} 
            onLogin={() => { setLoginMode('login'); setAppState('login'); }}
        />;
    }

    if (appState === 'login') {
        return <Login 
            onLogin={handleLogin} 
            onBackToLanding={() => setAppState('landing')}
            initialMode={loginMode}
        />;
    }

    return (
      <div className="min-h-screen" data-name="app-shell" data-file="app.js">
        <AlertToast toasts={toasts} onDismiss={removeToast} />
        <DashboardLayout 
            activeTab={activeTab} 
            onTabChange={(tab) => { 
                try {
                    if (tab === 'practice-quiz') {
                        setPracticeQuizOpen(true);
                        return;
                    }
                    setPracticeQuizOpen(false);
                    setActiveTab(tab); 
                    setActiveCourseId(null); 
                } catch (e) {
                    console.error('Tab change UI error:', e);
                }
            }}
            user={user}
            onLogout={handleLogout}
        >
            {renderView()}
        </DashboardLayout>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);