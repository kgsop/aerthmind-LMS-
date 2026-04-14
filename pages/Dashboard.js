function Dashboard({ courses, stats, role, user, onResumeCourse, onViewAllCourses, onCreateCourse, onDeleteCourse, onEditCourse }) {
    try {
        const [editingCourse, setEditingCourse] = React.useState(null);
        const isInstructor = role === 'instructor';

        const handleEditClick = (course, e) => {
            try {
                e.stopPropagation();
                setEditingCourse(course);
            } catch (error) {
                console.error('Edit click error:', error);
            }
        };

        const handleSaveEdit = (updatedCourse) => {
            try {
                onEditCourse && onEditCourse(updatedCourse);
                setEditingCourse(null);
            } catch (error) {
                console.error('Save edit error:', error);
            }
        };

        return (
            <>
            <CourseEditModal course={editingCourse} isOpen={!!editingCourse} onClose={() => setEditingCourse(null)} onSave={handleSaveEdit} />
            <div className="animate-in fade-in duration-300" data-name="dashboard-view" data-file="pages/Dashboard.js">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
                    <p className="text-gray-500">
                        {isInstructor ? "Here's an overview of your teaching impact." : "Here's an overview of your learning journey today."}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {stats.map(stat => (
                        <StatCard 
                            key={stat.id}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            bgColorClass={stat.bgColorClass}
                        />
                    ))}
                </div>

                {/* Main Content Section */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">{isInstructor ? 'Your Created Courses' : 'Your Courses'}</h2>
                        {!isInstructor && courses.length > 0 && (
                            <button 
                                onClick={onViewAllCourses}
                                className="text-[var(--primary)] font-medium text-sm flex items-center gap-1 hover:text-[var(--primary-hover)] transition-colors"
                            >
                                Browse More
                                <div className="icon-arrow-right text-base"></div>
                            </button>
                        )}
                    </div>

                    {courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {courses.map((course) => (
                                <div key={`dashboard-course-${course.id}`} className="relative" data-name="dashboard-course-wrap" data-file="pages/Dashboard.js">
                                    <CourseCard 
                                        title={course.title}
                                        description={course.description}
                                        progress={isInstructor ? course.students : course.progress}
                                        onResume={isInstructor ? (e) => handleEditClick(course, e) : () => onResumeCourse(course.id)}
                                        isInstructor={isInstructor}
                                    />
                                    {isInstructor && (
                                        <button
                                            type="button"
                                            onClick={() => { try { onDeleteCourse && onDeleteCourse(course.id); } catch (e) { console.error('Dashboard delete course UI error:', e); } }}
                                            className="absolute top-3 right-3 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-colors font-semibold flex items-center gap-2"
                                            data-name="dashboard-course-delete"
                                            data-file="pages/Dashboard.js"
                                        >
                                            <div className="icon-trash text-xl" data-name="dashboard-course-delete-icon" data-file="pages/Dashboard.js"></div>
                                            <span className="text-xs" data-name="dashboard-course-delete-text" data-file="pages/Dashboard.js">Delete</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                            <div className="icon-folder-open text-4xl text-gray-300 mb-3 mx-auto"></div>
                            <p className="text-gray-500 mb-4">
                                {isInstructor ? "You haven't created any courses yet." : "You haven't started any courses yet."}
                            </p>
                            <button 
                                onClick={isInstructor ? onCreateCourse : onViewAllCourses}
                                className="px-6 py-2 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2 mx-auto"
                            >
                                <div className={isInstructor ? "icon-plus" : "icon-search"}></div>
                                <span>{isInstructor ? "Create First Course" : "Browse Courses"}</span>
                            </button>
                        </div>
                    )}
                </section>
            </div>
            </>
        );
    } catch (error) {
        console.error('Dashboard error:', error);
        return null;
    }
}
window.Dashboard = Dashboard;