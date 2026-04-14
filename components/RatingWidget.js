function RatingWidget({ courseId }) {
    try {
        const [rating, setRating] = React.useState(0);
        const [userRating, setUserRating] = React.useState(0);
        const [isSubmitting, setIsSubmitting] = React.useState(false);
        const [message, setMessage] = React.useState('');

        React.useEffect(() => {
            async function loadRating() {
                try {
                    const user = window.StorageDB.getCurrentUser();
                    if (user && user.email) {
                        const existingRating = await window.StorageDB.getUserCourseRating(user.email, courseId);
                        setUserRating(existingRating);
                        setRating(existingRating);
                    }
                } catch (e) {
                    console.error('Error loading rating:', e);
                }
            }
            loadRating();
        }, [courseId]);

        const submitRating = async () => {
            if (rating === 0) return;
            setIsSubmitting(true);
            setMessage('');
            
            try {
                const user = window.StorageDB.getCurrentUser();
                if (!user || !user.email) {
                    setMessage('Please log in to rate this course.');
                    setIsSubmitting(false);
                    return;
                }
                
                await window.StorageDB.setUserCourseRating(user.email, courseId, rating);
                setUserRating(rating);
                setMessage('Thank you for rating this course!');
            } catch (e) {
                console.error('Error submitting rating:', e);
                setMessage('Failed to submit rating. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        };

        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-5" data-name="rating-widget" data-file="components/RatingWidget.js">
                <div className="text-sm font-bold text-gray-700 mb-3" data-name="rating-widget-title" data-file="components/RatingWidget.js">
                    {userRating > 0 ? 'Your Rating' : 'Rate This Course'}
                </div>
                
                <div className="flex items-center gap-2 mb-4" data-name="rating-widget-stars" data-file="components/RatingWidget.js">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            onClick={() => !isSubmitting && setRating(star)}
                            disabled={isSubmitting}
                            className={`text-3xl transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 disabled:opacity-50`}
                            data-name="rating-widget-star"
                            data-file="components/RatingWidget.js"
                        >
                            <div className="icon-star" data-name="rating-widget-star-icon" data-file="components/RatingWidget.js"></div>
                        </button>
                    ))}
                </div>

                {rating !== userRating && rating > 0 && (
                    <button
                        onClick={submitRating}
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 text-sm"
                        data-name="rating-widget-submit"
                        data-file="components/RatingWidget.js"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                    </button>
                )}

                {message && (
                    <div className="mt-3 text-sm text-gray-600" data-name="rating-widget-message" data-file="components/RatingWidget.js">
                        {message}
                    </div>
                )}
            </div>
        );
    } catch (error) {
        console.error('RatingWidget error:', error);
        return null;
    }
}
window.RatingWidget = RatingWidget;