function Sidebar({ activeTab, onTabChange, user, onLogout }) {
    try {
        const [showAccounts, setShowAccounts] = React.useState(false);
        const [savedAccounts, setSavedAccounts] = React.useState([]);
        const [showPasswordModal, setShowPasswordModal] = React.useState(false);
        const [selectedAccount, setSelectedAccount] = React.useState(null);
        const [password, setPassword] = React.useState('');
        const [passwordError, setPasswordError] = React.useState('');
        const [isVerifying, setIsVerifying] = React.useState(false);

        React.useEffect(() => {
            try {
                const accounts = window.StorageDB.getSavedAccounts();
                setSavedAccounts(accounts || []);
            } catch (e) {
                console.error('Sidebar load accounts UI error:', e);
            }
        }, [user?.email]);

        const handleSwitchAccount = async (account) => {
            try {
                setSelectedAccount(account);
                setPassword('');
                setPasswordError('');
                setShowAccounts(false);
                setShowPasswordModal(true);
            } catch (e) {
                console.error('Switch account UI error:', e);
            }
        };

        const verifyAndSwitch = async () => {
            try {
                setPasswordError('');
                setIsVerifying(true);

                const trimmedPassword = password.trim();
                if (!trimmedPassword) {
                    setPasswordError('Please enter your password.');
                    setIsVerifying(false);
                    return;
                }

                const storedUser = await window.StorageDB.getUserByEmail(selectedAccount.email);
                if (!storedUser) {
                    setPasswordError('Account not found.');
                    setIsVerifying(false);
                    return;
                }

                if (storedUser.password !== trimmedPassword) {
                    setPasswordError('Incorrect password. Please try again.');
                    setIsVerifying(false);
                    return;
                }

                // Save account to preserve it in the list, then switch
                window.StorageDB.saveAccount(selectedAccount);
                window.StorageDB.setCurrentUser(selectedAccount);
                window.location.reload();
            } catch (e) {
                console.error('Verify password UI error:', e);
                setPasswordError('An error occurred. Please try again.');
                setIsVerifying(false);
            }
        };

        const closePasswordModal = () => {
            setShowPasswordModal(false);
            setSelectedAccount(null);
            setPassword('');
            setPasswordError('');
        };

        const handleRemoveAccount = (email, e) => {
            try {
                e.stopPropagation();
                if (email === user?.email) {
                    // Can't remove currently active account
                    return;
                }
                window.StorageDB.removeAccount(email);
                const accounts = window.StorageDB.getSavedAccounts();
                setSavedAccounts(accounts || []);
            } catch (e) {
                console.error('Remove account UI error:', e);
            }
        };

        // Show all saved accounts (including current user) in the dropdown
        const otherAccounts = savedAccounts.filter(a => a.email !== user?.email);

        const studentNav = [
            { id: 'dashboard', label: 'Dashboard', icon: 'icon-layout-dashboard' },
            { id: 'browse', label: 'Browse Courses', icon: 'icon-compass' },
            { id: 'ai-tutor', label: 'AI Tutor', icon: 'icon-bot' },
            { id: 'practice-quiz', label: 'Practice Quiz', icon: 'icon-circle-help' },
            { id: 'recommendations', label: 'Recommendations', icon: 'icon-sparkles' },
            { id: 'settings', label: 'Settings', icon: 'icon-settings' }
        ];

        const instructorNav = [
            { id: 'dashboard', label: 'Overview', icon: 'icon-layout-dashboard' },
            { id: 'create-course', label: 'Create Course', icon: 'icon-square-plus' },
            { id: 'ai-tutor', label: 'AI Assistant', icon: 'icon-bot' },
            { id: 'practice-quiz', label: 'Practice Quiz', icon: 'icon-circle-help' },
            { id: 'settings', label: 'Settings', icon: 'icon-settings' }
        ];

        const navItems = user?.role === 'instructor' ? instructorNav : studentNav;

        return (
            <>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" data-name="password-modal" data-file="components/Sidebar.js">
                        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100" data-name="password-modal-card" data-file="components/Sidebar.js">
                            <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4" data-name="password-modal-head" data-file="components/Sidebar.js">
                                <div className="flex items-start gap-3" data-name="password-modal-head-left" data-file="components/Sidebar.js">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center" data-name="password-modal-icon-wrap" data-file="components/Sidebar.js">
                                        <div className="icon-lock text-xl text-[var(--primary)]" data-name="password-modal-icon" data-file="components/Sidebar.js"></div>
                                    </div>
                                    <div data-name="password-modal-titles" data-file="components/Sidebar.js">
                                        <div className="text-xl font-bold text-slate-900" data-name="password-modal-title" data-file="components/Sidebar.js">Verify Password</div>
                                        <div className="text-sm text-slate-500 mt-1" data-name="password-modal-subtitle" data-file="components/Sidebar.js">
                                            Enter password for {selectedAccount?.name}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={closePasswordModal}
                                    className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                                    data-name="password-modal-close"
                                    data-file="components/Sidebar.js"
                                >
                                    <div className="icon-x text-xl" data-name="password-modal-close-icon" data-file="components/Sidebar.js"></div>
                                </button>
                            </div>

                            <div className="p-6 space-y-5" data-name="password-modal-body" data-file="components/Sidebar.js">
                                {passwordError && (
                                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700" data-name="password-modal-error" data-file="components/Sidebar.js">
                                        <div className="flex items-start gap-2" data-name="password-modal-error-row" data-file="components/Sidebar.js">
                                            <div className="icon-circle-alert text-xl text-red-600" data-name="password-modal-error-icon" data-file="components/Sidebar.js"></div>
                                            <div data-name="password-modal-error-text" data-file="components/Sidebar.js">{passwordError}</div>
                                        </div>
                                    </div>
                                )}

                                <div data-name="password-modal-field" data-file="components/Sidebar.js">
                                    <label className="block text-sm font-medium text-gray-700 mb-2" data-name="password-modal-label" data-file="components/Sidebar.js">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && verifyAndSwitch()}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                        disabled={isVerifying}
                                        autoFocus
                                        data-name="password-modal-input"
                                        data-file="components/Sidebar.js"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3" data-name="password-modal-actions" data-file="components/Sidebar.js">
                                    <button
                                        onClick={verifyAndSwitch}
                                        disabled={isVerifying || !password.trim()}
                                        className="flex-1 px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                        data-name="password-modal-verify"
                                        data-file="components/Sidebar.js"
                                    >
                                        {isVerifying && <div className="icon-loader animate-spin text-xl" data-name="password-modal-verify-loading" data-file="components/Sidebar.js"></div>}
                                        <span data-name="password-modal-verify-text" data-file="components/Sidebar.js">{isVerifying ? 'Verifying...' : 'Switch Account'}</span>
                                    </button>

                                    <button
                                        onClick={closePasswordModal}
                                        disabled={isVerifying}
                                        className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                        data-name="password-modal-cancel"
                                        data-file="components/Sidebar.js"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0" data-name="sidebar" data-file="components/Sidebar.js">
                <div className="p-6 flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('dashboard')} data-name="sidebar-logo" data-file="components/Sidebar.js">
                    <div className="bg-indigo-100 p-2 rounded-lg text-[var(--primary)]" data-name="sidebar-logo-badge" data-file="components/Sidebar.js">
                        <div className="icon-graduation-cap text-2xl" data-name="sidebar-logo-icon" data-file="components/Sidebar.js"></div>
                    </div>
                    <span className="text-xl font-bold tracking-tight" data-name="sidebar-logo-text" data-file="components/Sidebar.js">Aethermind.</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4" data-name="sidebar-nav" data-file="components/Sidebar.js">
                    {navItems.map(item => (
                        <div
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => onTabChange(item.id)}
                            data-name="sidebar-nav-item"
                            data-file="components/Sidebar.js"
                        >
                            <div className={`${item.icon} text-lg`} data-name="sidebar-nav-icon" data-file="components/Sidebar.js"></div>
                            <span data-name="sidebar-nav-label" data-file="components/Sidebar.js">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200" data-name="sidebar-bottom" data-file="components/Sidebar.js">
                    <div className="relative" data-name="sidebar-account-switcher" data-file="components/Sidebar.js">
                        <button
                            onClick={() => setShowAccounts(!showAccounts)}
                            className="flex items-center gap-3 px-2 py-3 w-full hover:bg-gray-50 rounded-xl transition-colors"
                            data-name="sidebar-user"
                            data-file="components/Sidebar.js"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${user?.colorClass || 'bg-gray-100 text-gray-600'}`} data-name="sidebar-avatar" data-file="components/Sidebar.js">
                                {user?.initials || 'U'}
                            </div>
                            <div className="flex flex-col flex-1 text-left" data-name="sidebar-user-meta" data-file="components/Sidebar.js">
                                <span className="font-semibold text-sm" data-name="sidebar-user-name" data-file="components/Sidebar.js">{user?.name || 'User'}</span>
                                <span className="text-xs text-gray-500 capitalize" data-name="sidebar-user-role" data-file="components/Sidebar.js">{user?.role || 'Guest'}</span>
                            </div>
                            <div className="icon-chevrons-up-down text-gray-400" data-name="sidebar-user-chevron" data-file="components/Sidebar.js"></div>
                        </button>

                        {showAccounts && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden" data-name="sidebar-accounts-dropdown" data-file="components/Sidebar.js">
                                <div className="p-3 border-b border-gray-100" data-name="sidebar-current-account" data-file="components/Sidebar.js">
                                    <div className="flex items-center gap-3 px-2 py-2" data-name="sidebar-current-row" data-file="components/Sidebar.js">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${user?.colorClass || 'bg-gray-100 text-gray-600'}`} data-name="sidebar-current-avatar" data-file="components/Sidebar.js">
                                            {user?.initials || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0" data-name="sidebar-current-info" data-file="components/Sidebar.js">
                                            <div className="font-semibold text-sm truncate" data-name="sidebar-current-name" data-file="components/Sidebar.js">{user?.name || 'User'}</div>
                                            <div className="text-xs text-gray-500 truncate" data-name="sidebar-current-email" data-file="components/Sidebar.js">{user?.email || ''}</div>
                                        </div>
                                        <div className="icon-circle-check text-[var(--primary)] text-xl" data-name="sidebar-current-check" data-file="components/Sidebar.js"></div>
                                    </div>
                                </div>

                                {otherAccounts.length > 0 && (
                                    <div className="max-h-64 overflow-y-auto" data-name="sidebar-other-accounts" data-file="components/Sidebar.js">
                                        {otherAccounts.map(account => (
                                            <div key={account.email} className="relative group" data-name="sidebar-account-wrapper" data-file="components/Sidebar.js">
                                                <button
                                                    onClick={() => handleSwitchAccount(account)}
                                                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                                                    data-name="sidebar-account-item"
                                                    data-file="components/Sidebar.js"
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${account.colorClass || 'bg-gray-100 text-gray-600'}`} data-name="sidebar-account-avatar" data-file="components/Sidebar.js">
                                                        {account.initials}
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left" data-name="sidebar-account-info" data-file="components/Sidebar.js">
                                                        <div className="font-semibold text-sm truncate" data-name="sidebar-account-name" data-file="components/Sidebar.js">{account.name}</div>
                                                        <div className="text-xs text-gray-500 truncate" data-name="sidebar-account-email" data-file="components/Sidebar.js">{account.email}</div>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={(e) => handleRemoveAccount(account.email, e)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
                                                    data-name="sidebar-account-remove"
                                                    data-file="components/Sidebar.js"
                                                >
                                                    <div className="icon-trash text-sm" data-name="sidebar-account-remove-icon" data-file="components/Sidebar.js"></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="border-t border-gray-100" data-name="sidebar-actions" data-file="components/Sidebar.js">
                                    <button
                                        onClick={() => { setShowAccounts(false); onLogout(); }}
                                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                                        data-name="sidebar-add-account"
                                        data-file="components/Sidebar.js"
                                    >
                                        <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center" data-name="sidebar-add-icon-wrap" data-file="components/Sidebar.js">
                                            <div className="icon-plus text-gray-600" data-name="sidebar-add-icon" data-file="components/Sidebar.js"></div>
                                        </div>
                                        <span data-name="sidebar-add-text" data-file="components/Sidebar.js">Add account</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => { setShowAccounts(false); onLogout(); }}
                                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-600 font-medium transition-colors border-t border-gray-100"
                                        data-name="sidebar-logout"
                                        data-file="components/Sidebar.js"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center" data-name="sidebar-logout-icon-wrap" data-file="components/Sidebar.js">
                                            <div className="icon-log-out text-red-600" data-name="sidebar-logout-icon" data-file="components/Sidebar.js"></div>
                                        </div>
                                        <span data-name="sidebar-logout-text" data-file="components/Sidebar.js">Log out of {user?.name?.split(' ')[0] || 'account'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                </aside>
            </>
        );
    } catch (error) {
        console.error('Sidebar error:', error);
        return null;
    }
}
window.Sidebar = Sidebar;