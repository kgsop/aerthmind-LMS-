function StatCard({ title, value, icon, bgColorClass }) {
    try {
        return (
            <div className={`p-6 rounded-2xl text-white flex flex-col justify-between ${bgColorClass} min-h-[140px] shadow-sm`} data-name="stat-card" data-file="components/StatCard.js">
                <div className="flex items-center gap-2 text-white/80 mb-4 font-medium">
                    <div className={`text-lg ${icon}`}></div>
                    <span>{title}</span>
                </div>
                <div className="text-5xl font-bold tracking-tight">
                    {value}
                </div>
            </div>
        );
    } catch (error) {
        console.error('StatCard error:', error);
        return null;
    }
}
window.StatCard = StatCard;