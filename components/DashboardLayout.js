function DashboardLayout({ children, activeTab, onTabChange, user, onLogout }) {
    try {
        return (
            <div className="flex min-h-screen bg-[var(--bg-color)]" data-name="dashboard-layout" data-file="components/DashboardLayout.js">
                <Sidebar activeTab={activeTab} onTabChange={onTabChange} user={user} onLogout={onLogout} />
                <main className="flex-1 ml-64 p-8" data-name="dashboard-layout-main" data-file="components/DashboardLayout.js">
                    <div className="max-w-6xl mx-auto" data-name="dashboard-layout-container" data-file="components/DashboardLayout.js">
                        {children}
                    </div>
                </main>
            </div>
        );
    } catch (error) {
        console.error('DashboardLayout error:', error);
        return null;
    }
}

window.DashboardLayout = DashboardLayout;