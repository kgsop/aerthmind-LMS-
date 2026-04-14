function AlertToast({ toasts, onDismiss }) {
    try {
        React.useEffect(() => {
            try {
                const timers = (toasts || []).map(t => {
                    if (!t || !t.id) return null;
                    if (!t.durationMs) return null;
                    return setTimeout(() => {
                        try { onDismiss && onDismiss(t.id); } catch (e) { console.error('Toast dismiss UI error:', e); }
                    }, t.durationMs);
                }).filter(Boolean);

                return () => {
                    try { timers.forEach(clearTimeout); } catch (e) { console.error('Toast cleanup UI error:', e); }
                };
            } catch (e) {
                console.error('Toast effect UI error:', e);
            }
        }, [toasts, onDismiss]);

        const getStyle = (type) => {
            if (type === 'success') return { wrap: 'border-green-100 bg-green-50', icon: 'icon-circle-check text-green-600', title: 'text-green-900', text: 'text-green-800' };
            if (type === 'error') return { wrap: 'border-red-100 bg-red-50', icon: 'icon-circle-alert text-red-600', title: 'text-red-900', text: 'text-red-800' };
            if (type === 'warning') return { wrap: 'border-amber-100 bg-amber-50', icon: 'icon-triangle-alert text-amber-600', title: 'text-amber-900', text: 'text-amber-800' };
            return { wrap: 'border-gray-200 bg-white', icon: 'icon-info text-gray-700', title: 'text-gray-900', text: 'text-gray-700' };
        };

        return (
            <div className="fixed top-4 right-4 z-[60] w-[min(420px,calc(100vw-2rem))] space-y-3" data-name="alert-toast" data-file="components/AlertToast.js">
                {(toasts || []).map(t => {
                    const style = getStyle(t.type);
                    return (
                        <div key={t.id} className={`rounded-2xl border shadow-sm p-4 backdrop-blur ${style.wrap}`} data-name="alert-toast-item" data-file="components/AlertToast.js">
                            <div className="flex items-start gap-3" data-name="alert-toast-row" data-file="components/AlertToast.js">
                                <div className={`text-xl mt-0.5 ${style.icon}`} data-name="alert-toast-icon" data-file="components/AlertToast.js"></div>
                                <div className="min-w-0 flex-1" data-name="alert-toast-body" data-file="components/AlertToast.js">
                                    {t.title ? (
                                        <div className={`font-bold ${style.title}`} data-name="alert-toast-title" data-file="components/AlertToast.js">{t.title}</div>
                                    ) : null}
                                    {t.message ? (
                                        <div className={`text-sm mt-0.5 ${style.text}`} data-name="alert-toast-message" data-file="components/AlertToast.js">{t.message}</div>
                                    ) : null}
                                </div>
                                <button
                                    onClick={() => { try { onDismiss && onDismiss(t.id); } catch (e) { console.error('Toast close UI error:', e); } }}
                                    className="p-2 rounded-xl bg-white/60 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
                                    data-name="alert-toast-close"
                                    data-file="components/AlertToast.js"
                                >
                                    <div className="icon-x text-xl" data-name="alert-toast-close-icon" data-file="components/AlertToast.js"></div>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    } catch (error) {
        console.error('AlertToast error:', error);
        return null;
    }
}
window.AlertToast = AlertToast;