function Settings({ user, onDone, onToast }) {
    try {
        const [keyInput, setKeyInput] = React.useState('');
        const [savedKey, setSavedKey] = React.useState('');
        const [reveal, setReveal] = React.useState(false);
        const [isSaving, setIsSaving] = React.useState(false);
        const [isTesting, setIsTesting] = React.useState(false);
        const [statusMsg, setStatusMsg] = React.useState('');

        React.useEffect(() => {
            try {
                const k = window.StorageDB.getApiKey ? window.StorageDB.getApiKey() : '';
                setSavedKey(String(k || ''));
            } catch (e) {
                console.error('Settings load key UI error:', e);
            }
        }, []);

        const masked = (() => {
            try {
                return window.AIClient && window.AIClient.maskKey ? window.AIClient.maskKey(savedKey) : '••••••••';
            } catch (e) {
                console.error('Settings masked UI error:', e);
                return '••••••••';
            }
        })();

        const saveKey = async () => {
            setStatusMsg('');
            const trimmed = String(keyInput || '').trim();
            if (!trimmed) {
                setStatusMsg('Paste your API key first.');
                return;
            }

            setIsSaving(true);
            try {
                window.StorageDB.setApiKey(trimmed);
                setSavedKey(trimmed);
                setKeyInput('');
                setReveal(false);
                setStatusMsg('Saved. You can now generate quizzes.');
                try {
                    onToast && onToast({ type: 'success', title: 'API key saved', message: 'Your key is stored on this device.' });
                } catch (e) {}
            } catch (e) {
                setStatusMsg('Could not save the key. Please try again.');
            } finally {
                setIsSaving(false);
            }
        };

        const removeKey = async () => {
            setStatusMsg('');
            setIsSaving(true);
            try {
                window.StorageDB.setApiKey('');
                setSavedKey('');
                setKeyInput('');
                setReveal(false);
                setStatusMsg('Removed.');
                try {
                    onToast && onToast({ type: 'info', title: 'API key removed', message: 'Quizzes will no longer call the AI service.' });
                } catch (e) {}
            } catch (e) {
                setStatusMsg('Could not remove the key.');
            } finally {
                setIsSaving(false);
            }
        };

        const testKey = async () => {
            setStatusMsg('');
            if (!savedKey) {
                setStatusMsg('Save a key first, then test it.');
                return;
            }

            setIsTesting(true);
            try {
                const systemPrompt = 'You are a helpful assistant. Reply with a single short sentence.';
                const userPrompt = 'Say "API key test successful" in one sentence.';
                const res = await window.AIClient.invokeWithKey(systemPrompt, userPrompt);
                if (!res.ok) {
                    setStatusMsg(res.error || 'Test failed.');
                    try {
                        onToast && onToast({ type: 'error', title: 'Key test failed', message: res.error || 'Please try again.' });
                    } catch (e) {}
                    return;
                }

                setStatusMsg('Success: your key works.');
                try {
                    onToast && onToast({ type: 'success', title: 'Key test passed', message: 'You can now generate AI quizzes.' });
                } catch (e) {}
            } catch (e) {
                setStatusMsg('Test failed. Please try again.');
            } finally {
                setIsTesting(false);
            }
        };

        const keyToShow = reveal ? savedKey : masked;

        const safeName = (() => {
            try {
                return String(user?.name || '').trim() || '—';
            } catch (e) {
                console.error('Settings safeName UI error:', e);
                return '—';
            }
        })();

        const safeEmail = (() => {
            try {
                return String(user?.email || '').trim() || '—';
            } catch (e) {
                console.error('Settings safeEmail UI error:', e);
                return '—';
            }
        })();

        const safeRole = (() => {
            try {
                const r = String(user?.role || '').trim();
                if (!r) return '—';
                return r.charAt(0).toUpperCase() + r.slice(1);
            } catch (e) {
                console.error('Settings safeRole UI error:', e);
                return '—';
            }
        })();

        const safeDept = (() => {
            try {
                return String(user?.department || '').trim() || '—';
            } catch (e) {
                console.error('Settings safeDept UI error:', e);
                return '—';
            }
        })();

        const safeSchoolCode = (() => {
            try {
                return String(user?.schoolCode || '').trim() || '—';
            } catch (e) {
                console.error('Settings safeSchoolCode UI error:', e);
                return '—';
            }
        })();

        return (
            <div className="animate-in fade-in duration-300 max-w-4xl" data-name="settings" data-file="pages/Settings.js">
                <div className="mb-8 flex items-start justify-between gap-4" data-name="settings-head" data-file="pages/Settings.js">
                    <div data-name="settings-head-left" data-file="pages/Settings.js">
                        <h1 className="text-3xl font-bold mb-2" data-name="settings-title" data-file="pages/Settings.js">Settings</h1>
                        <p className="text-gray-500" data-name="settings-subtitle" data-file="pages/Settings.js">
                            Manage your account details and API key for generating practice quizzes.
                        </p>
                    </div>

                    <button
                        onClick={() => { try { onDone && onDone(); } catch (e) { console.error('Settings done UI error:', e); } }}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors inline-flex items-center gap-2 shrink-0"
                        data-name="settings-back-top"
                        data-file="pages/Settings.js"
                    >
                        <div className="icon-arrow-left text-xl" data-name="settings-back-top-icon" data-file="pages/Settings.js"></div>
                        <span data-name="settings-back-top-text" data-file="pages/Settings.js">Back</span>
                    </button>
                </div>

                <div className="space-y-6" data-name="settings-stack" data-file="pages/Settings.js">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" data-name="settings-account" data-file="pages/Settings.js">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3" data-name="settings-account-head" data-file="pages/Settings.js">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center" data-name="settings-account-iconwrap" data-file="pages/Settings.js">
                                <div className="icon-user-round text-xl text-purple-600" data-name="settings-account-icon" data-file="pages/Settings.js"></div>
                            </div>
                            <div data-name="settings-account-titles" data-file="pages/Settings.js">
                                <div className="text-lg font-bold text-slate-900" data-name="settings-account-title" data-file="pages/Settings.js">Account Info</div>
                                <div className="text-sm text-slate-500" data-name="settings-account-subtitle" data-file="pages/Settings.js">Your profile details</div>
                            </div>
                        </div>

                        <div className="p-6" data-name="settings-account-body" data-file="pages/Settings.js">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-name="settings-account-grid" data-file="pages/Settings.js">
                                <div data-name="settings-account-field-name" data-file="pages/Settings.js">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-name="settings-account-label-name" data-file="pages/Settings.js">Name</div>
                                    <div className="mt-2 text-slate-900 font-semibold" data-name="settings-account-value-name" data-file="pages/Settings.js">{safeName}</div>
                                </div>

                                <div data-name="settings-account-field-email" data-file="pages/Settings.js">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-name="settings-account-label-email" data-file="pages/Settings.js">Email</div>
                                    <div className="mt-2 text-slate-900 font-semibold break-words" data-name="settings-account-value-email" data-file="pages/Settings.js">{safeEmail}</div>
                                </div>

                                <div data-name="settings-account-field-role" data-file="pages/Settings.js">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-name="settings-account-label-role" data-file="pages/Settings.js">Role</div>
                                    <div className="mt-2 text-slate-900 font-semibold" data-name="settings-account-value-role" data-file="pages/Settings.js">{safeRole}</div>
                                </div>

                                <div data-name="settings-account-field-dept" data-file="pages/Settings.js">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-name="settings-account-label-dept" data-file="pages/Settings.js">Department</div>
                                    <div className="mt-2 text-slate-900 font-semibold" data-name="settings-account-value-dept" data-file="pages/Settings.js">{safeDept}</div>
                                </div>

                                <div data-name="settings-account-field-school" data-file="pages/Settings.js">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider" data-name="settings-account-label-school" data-file="pages/Settings.js">School Code</div>
                                    <div className="mt-2 text-slate-900 font-semibold" data-name="settings-account-value-school" data-file="pages/Settings.js">{safeSchoolCode}</div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4" data-name="settings-account-note" data-file="pages/Settings.js">
                                    <div className="flex items-start gap-2" data-name="settings-account-note-row" data-file="pages/Settings.js">
                                        <div className="icon-info text-xl text-gray-700" data-name="settings-account-note-icon" data-file="pages/Settings.js"></div>
                                        <div className="text-sm text-gray-600" data-name="settings-account-note-text" data-file="pages/Settings.js">
                                            These details come from your sign-in profile. If you need to change them, sign out and create a new profile (demo).
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" data-name="settings-card" data-file="pages/Settings.js">
                        <div className="p-6 border-b border-gray-100 flex items-start justify-between gap-4" data-name="settings-card-head" data-file="pages/Settings.js">
                            <div className="flex items-start gap-3" data-name="settings-card-head-left" data-file="pages/Settings.js">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center" data-name="settings-icon-wrap" data-file="pages/Settings.js">
                                    <div className="icon-key-round text-xl text-[var(--primary)]" data-name="settings-icon" data-file="pages/Settings.js"></div>
                                </div>
                                <div data-name="settings-card-titles" data-file="pages/Settings.js">
                                    <div className="text-lg font-bold text-slate-900" data-name="settings-card-title" data-file="pages/Settings.js">API Key</div>
                                    <div className="text-sm text-slate-500" data-name="settings-card-subtitle" data-file="pages/Settings.js">
                                        Stored locally on this device. Do not share it with others.
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { try { onDone && onDone(); } catch (e) { console.error('Settings done UI error:', e); } }}
                                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors inline-flex items-center gap-2 shrink-0"
                                data-name="settings-done"
                                data-file="pages/Settings.js"
                            >
                                <div className="icon-arrow-left text-xl" data-name="settings-done-icon" data-file="pages/Settings.js"></div>
                                <span data-name="settings-done-text" data-file="pages/Settings.js">Back</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-5" data-name="settings-body" data-file="pages/Settings.js">
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4" data-name="settings-current" data-file="pages/Settings.js">
                                <div className="flex items-start justify-between gap-3" data-name="settings-current-row" data-file="pages/Settings.js">
                                    <div data-name="settings-current-left" data-file="pages/Settings.js">
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider" data-name="settings-current-label" data-file="pages/Settings.js">Current key</div>
                                        <div className="mt-2 font-mono text-sm text-slate-900 break-all" data-name="settings-current-value" data-file="pages/Settings.js">
                                            {savedKey ? keyToShow : 'No key saved'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2" data-name="settings-current-actions" data-file="pages/Settings.js">
                                        <button
                                            onClick={() => setReveal(r => !r)}
                                            disabled={!savedKey}
                                            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                            data-name="settings-reveal"
                                            data-file="pages/Settings.js"
                                        >
                                            <div className={`text-xl ${reveal ? 'icon-eye-off' : 'icon-eye'}`} data-name="settings-reveal-icon" data-file="pages/Settings.js"></div>
                                            <span data-name="settings-reveal-text" data-file="pages/Settings.js">{reveal ? 'Hide' : 'Reveal'}</span>
                                        </button>

                                        <button
                                            onClick={removeKey}
                                            disabled={!savedKey || isSaving}
                                            className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                                            data-name="settings-remove"
                                            data-file="pages/Settings.js"
                                        >
                                            <div className="icon-trash text-xl" data-name="settings-remove-icon" data-file="pages/Settings.js"></div>
                                            <span data-name="settings-remove-text" data-file="pages/Settings.js">Remove</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end" data-name="settings-save-row" data-file="pages/Settings.js">
                                <div data-name="settings-input-wrap" data-file="pages/Settings.js">
                                    <label className="block text-sm font-medium text-gray-700 mb-1" data-name="settings-input-label" data-file="pages/Settings.js">Paste a new key</label>
                                    <input
                                        value={keyInput}
                                        onChange={(e) => setKeyInput(e.target.value)}
                                        placeholder="sk-..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                        disabled={isSaving}
                                        data-name="settings-input"
                                        data-file="pages/Settings.js"
                                    />
                                    <div className="text-xs text-gray-500 mt-1" data-name="settings-input-hint" data-file="pages/Settings.js">
                                        Tip: After saving, open Practice Quiz and generate your quiz.
                                    </div>
                                </div>

                                <button
                                    onClick={saveKey}
                                    disabled={isSaving}
                                    className="px-5 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm disabled:opacity-70 inline-flex items-center justify-center gap-2"
                                    data-name="settings-save"
                                    data-file="pages/Settings.js"
                                >
                                    <div className={`text-xl ${isSaving ? 'icon-loader animate-spin' : 'icon-save'}`} data-name="settings-save-icon" data-file="pages/Settings.js"></div>
                                    <span data-name="settings-save-text" data-file="pages/Settings.js">{isSaving ? 'Saving...' : 'Save Key'}</span>
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3" data-name="settings-test-row" data-file="pages/Settings.js">
                                <button
                                    onClick={testKey}
                                    disabled={!savedKey || isTesting}
                                    className="px-5 py-3 rounded-xl bg-indigo-50 text-[var(--primary)] font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                                    data-name="settings-test"
                                    data-file="pages/Settings.js"
                                >
                                    <div className={`text-xl ${isTesting ? 'icon-loader animate-spin' : 'icon-circle-check'}`} data-name="settings-test-icon" data-file="pages/Settings.js"></div>
                                    <span data-name="settings-test-text" data-file="pages/Settings.js">{isTesting ? 'Testing...' : 'Test Key'}</span>
                                </button>

                                <button
                                    onClick={() => { try { onDone && onDone(); } catch (e) { console.error('Settings done2 UI error:', e); } }}
                                    className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors inline-flex items-center justify-center gap-2"
                                    data-name="settings-done2"
                                    data-file="pages/Settings.js"
                                >
                                    <div className="icon-check text-xl" data-name="settings-done2-icon" data-file="pages/Settings.js"></div>
                                    <span data-name="settings-done2-text" data-file="pages/Settings.js">Done</span>
                                </button>
                            </div>

                            {statusMsg ? (
                                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700" data-name="settings-status" data-file="pages/Settings.js">
                                    <div className="flex items-start gap-2" data-name="settings-status-row" data-file="pages/Settings.js">
                                        <div className="icon-info text-xl text-gray-700" data-name="settings-status-icon" data-file="pages/Settings.js"></div>
                                        <div data-name="settings-status-text" data-file="pages/Settings.js">{statusMsg}</div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-900" data-name="settings-warning" data-file="pages/Settings.js">
                        <div className="flex items-start gap-3" data-name="settings-warning-row" data-file="pages/Settings.js">
                            <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 flex items-center justify-center" data-name="settings-warning-iconwrap" data-file="pages/Settings.js">
                                <div className="icon-triangle-alert text-xl text-amber-700" data-name="settings-warning-icon" data-file="pages/Settings.js"></div>
                            </div>
                            <div data-name="settings-warning-text" data-file="pages/Settings.js">
                                <div className="font-bold" data-name="settings-warning-title" data-file="pages/Settings.js">Security note</div>
                                <div className="mt-1 text-amber-900/90" data-name="settings-warning-desc" data-file="pages/Settings.js">
                                    Your key is stored only in your browser on this device. If you share this device, remove the key when you’re done.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-400" data-name="settings-footer" data-file="pages/Settings.js">
                        &copy; 2026 Aethermind Education. All rights reserved.
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Settings error:', error);
        return null;
    }
}
window.Settings = Settings;