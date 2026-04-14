function CourseEditModal({ course, isOpen, onClose, onSave }) {
    try {
        const [formData, setFormData] = React.useState({
            title: course?.title || '',
            description: course?.description || '',
            category: course?.category || 'Development',
            targetDepartment: course?.targetDepartment || 'All'
        });

        React.useEffect(() => {
            if (course) {
                setFormData({
                    title: course.title || '',
                    description: course.description || '',
                    category: course.category || 'Development',
                    targetDepartment: course.targetDepartment || 'All'
                });
            }
        }, [course?.id]);

        if (!isOpen || !course) return null;

        const handleSubmit = (e) => {
            e.preventDefault();
            onSave({ ...course, ...formData });
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" data-name="edit-course-modal" data-file="components/CourseEditModal.js">
                <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100" data-name="edit-course-modal-card" data-file="components/CourseEditModal.js">
                    <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4" data-name="edit-course-modal-head" data-file="components/CourseEditModal.js">
                        <div className="flex items-start gap-3" data-name="edit-course-modal-head-left" data-file="components/CourseEditModal.js">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center" data-name="edit-course-modal-icon-wrap" data-file="components/CourseEditModal.js">
                                <div className="icon-pencil text-xl text-[var(--primary)]" data-name="edit-course-modal-icon" data-file="components/CourseEditModal.js"></div>
                            </div>
                            <div data-name="edit-course-modal-titles" data-file="components/CourseEditModal.js">
                                <div className="text-xl font-bold text-slate-900" data-name="edit-course-modal-title" data-file="components/CourseEditModal.js">Edit Course</div>
                                <div className="text-sm text-slate-500" data-name="edit-course-modal-subtitle" data-file="components/CourseEditModal.js">Update course details</div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors" data-name="edit-course-modal-close" data-file="components/CourseEditModal.js">
                            <div className="icon-x text-xl" data-name="edit-course-modal-close-icon" data-file="components/CourseEditModal.js"></div>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5" data-name="edit-course-modal-form" data-file="components/CourseEditModal.js">
                        <div data-name="edit-course-modal-title-field" data-file="components/CourseEditModal.js">
                            <label className="block text-sm font-medium text-gray-700 mb-2" data-name="edit-course-modal-title-label" data-file="components/CourseEditModal.js">Course Title</label>
                            <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" data-name="edit-course-modal-title-input" data-file="components/CourseEditModal.js" />
                        </div>

                        <div data-name="edit-course-modal-desc-field" data-file="components/CourseEditModal.js">
                            <label className="block text-sm font-medium text-gray-700 mb-2" data-name="edit-course-modal-desc-label" data-file="components/CourseEditModal.js">Description</label>
                            <textarea required rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none" data-name="edit-course-modal-desc-input" data-file="components/CourseEditModal.js"></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4" data-name="edit-course-modal-grid" data-file="components/CourseEditModal.js">
                            <div data-name="edit-course-modal-category-field" data-file="components/CourseEditModal.js">
                                <label className="block text-sm font-medium text-gray-700 mb-2" data-name="edit-course-modal-category-label" data-file="components/CourseEditModal.js">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" data-name="edit-course-modal-category-select" data-file="components/CourseEditModal.js">
                                    <option>Development</option>
                                    <option>Design</option>
                                    <option>Business</option>
                                    <option>Data Science</option>
                                    <option>Marketing</option>
                                    <option>Engineering</option>
                                </select>
                            </div>
                            <div data-name="edit-course-modal-dept-field" data-file="components/CourseEditModal.js">
                                <label className="block text-sm font-medium text-gray-700 mb-2" data-name="edit-course-modal-dept-label" data-file="components/CourseEditModal.js">Target Department</label>
                                <select value={formData.targetDepartment} onChange={(e) => setFormData({...formData, targetDepartment: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" data-name="edit-course-modal-dept-select" data-file="components/CourseEditModal.js">
                                    <option value="All">All Students</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Design">Design</option>
                                    <option value="Business">Business</option>
                                    <option value="Engineering">Engineering</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4" data-name="edit-course-modal-actions" data-file="components/CourseEditModal.js">
                            <button type="submit" className="flex-1 px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors" data-name="edit-course-modal-save" data-file="components/CourseEditModal.js">Save Changes</button>
                            <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors" data-name="edit-course-modal-cancel" data-file="components/CourseEditModal.js">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    } catch (error) {
        console.error('CourseEditModal error:', error);
        return null;
    }
}
window.CourseEditModal = CourseEditModal;