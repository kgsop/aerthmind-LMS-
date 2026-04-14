function CourseCard({ title, description, progress, onResume, isInstructor }) {
    try {
        return (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full" data-name="course-card" data-file="components/CourseCard.js">
                {/* Image Placeholder */}
                <div className="h-40 bg-indigo-100 flex items-center justify-center relative group">
                    <div className="icon-book-open text-5xl text-indigo-300 opacity-50 transition-transform group-hover:scale-110 duration-300"></div>
                    {!isInstructor && (
                        <button 
                            onClick={onResume}
                            className="absolute bottom-3 right-3 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-full transition-colors cursor-pointer"
                        >
                            {progress === 0 ? 'Start' : 'Resume'}
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-lg mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2">
                        {description}
                    </p>

                    {/* Footer Stats / Progress */}
                    <div className="mt-auto pt-4 border-t border-gray-50">
                        {isInstructor ? (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><div className="icon-users text-xs"></div> {progress || 0} Students</span>
                                    <button onClick={onResume} className="flex items-center gap-1 text-[var(--primary)] font-medium hover:underline">
                                        <div className="icon-pencil text-xs"></div>
                                        <span>Edit</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-[var(--primary)] font-medium">Progress</span>
                                    <span className="font-bold">{progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div 
                                        className="bg-[var(--primary)] h-1.5 rounded-full" 
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('CourseCard error:', error);
        return null;
    }
}
window.CourseCard = CourseCard;