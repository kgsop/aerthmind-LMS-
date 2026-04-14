function BrowseCourses({ courses, enrolledCourses, onEnroll, user }) {
    try {
        // Filter out courses the student is already enrolled in, AND
        // filter by department AND ensure it matches the user's school code
        const availableCourses = courses.filter(c => {
            const notEnrolled = !enrolledCourses.some(ec => ec.id === c.id);
            const isSampleCourse = c.schoolCode === 'DEMO123';
            // Sample courses bypass the school code check, but MUST still match the department
            const matchesDepartment = c.targetDepartment === 'All' || c.targetDepartment === user?.department;
            const matchesSchool = c.schoolCode === user?.schoolCode || isSampleCourse;
            
            return notEnrolled && matchesDepartment && matchesSchool;
        });

        return (
            <div className="animate-in fade-in duration-300" data-name="browse-courses" data-file="pages/BrowseCourses.js">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Browse Courses 📚</h1>
                    <p className="text-gray-500">Discover new topics tailored for {user?.department ? `the ${user.department} department` : 'you'}.</p>
                </div>

                {availableCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableCourses.map((course, index) => (
                            <div key={course.id || `avail-${index}`} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-2">
                                        <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-[var(--primary)] rounded-md">
                                            {course.category}
                                        </span>
                                        {course.targetDepartment !== 'All' && (
                                            <span className="text-xs font-semibold px-2 py-1 bg-purple-50 text-purple-600 rounded-md flex items-center gap-1">
                                                <div className="icon-users text-[10px]"></div>
                                                {course.targetDepartment}
                                            </span>
                                        )}
                                    </div>
                                    <div className="icon-bookmark text-gray-400 cursor-pointer hover:text-[var(--primary)]"></div>
                                </div>
                                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                                <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-3">
                                    {course.description}
                                </p>
                                <button 
                                    onClick={() => onEnroll(course)}
                                    className="w-full py-2 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
                                >
                                    Enroll Now
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                        <div className="w-20 h-20 bg-indigo-50 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <div className="icon-circle-check text-4xl"></div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">No courses available yet</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            When your instructors create and publish new courses for your department, they will automatically appear right here. Check back later!
                        </p>
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('BrowseCourses error:', error);
        return null;
    }
}
window.BrowseCourses = BrowseCourses;