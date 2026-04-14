function ErrorState({ title, message, actionLabel, onAction, iconClass }) {
    try {
        const icon = iconClass || 'icon-circle-alert';
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm" data-name="error-state" data-file="components/ErrorState.js">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4" data-name="error-state-icon-wrap" data-file="components/ErrorState.js">
                    <div className={`${icon} text-2xl`} data-name="error-state-icon" data-file="components/ErrorState.js"></div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900" data-name="error-state-title" data-file="components/ErrorState.js">{title || 'Something went wrong'}</h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto" data-name="error-state-message" data-file="components/ErrorState.js">{message || 'Please try again.'}</p>
                {actionLabel && typeof onAction === 'function' ? (
                    <button
                        onClick={onAction}
                        className="mt-6 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center gap-2"
                        data-name="error-state-action"
                        data-file="components/ErrorState.js"
                    >
                        <div className="icon-refresh-cw text-xl" data-name="error-state-action-icon" data-file="components/ErrorState.js"></div>
                        <span data-name="error-state-action-text" data-file="components/ErrorState.js">{actionLabel}</span>
                    </button>
                ) : null}
            </div>
        );
    } catch (error) {
        console.error('ErrorState error:', error);
        return null;
    }
}
window.ErrorState = ErrorState;