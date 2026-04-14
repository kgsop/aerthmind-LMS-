function Login({ onLogin, onBackToLanding, initialMode }) {
    try {
        const [isSignUp, setIsSignUp] = React.useState(initialMode === 'signup');
        const [name, setName] = React.useState('');
        const [email, setEmail] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [role, setRole] = React.useState('student');
        const [department, setDepartment] = React.useState('Computer Science');
        const [schoolCode, setSchoolCode] = React.useState('');
        const [error, setError] = React.useState('');
        const [isLoading, setIsLoading] = React.useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setIsLoading(true);

            try {
                const emailClean = email.trim().toLowerCase();
                const passwordClean = password.trim();

                if (isSignUp) {
                    if (!name.trim() || !emailClean || !passwordClean || !schoolCode.trim()) {
                        setError('Please fill in all required fields.');
                        setIsLoading(false);
                        return;
                    }
                    
                    const existingUser = await window.StorageDB.getUserByEmail(emailClean);
                    if (existingUser) {
                        setError('An account with this email already exists. Please log in.');
                        setIsLoading(false);
                        return;
                    }

                    const displayName = name.trim();
                    const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    
                    const newUser = {
                        name: displayName,
                        email: emailClean,
                        password: passwordClean,
                        initials: initials || 'U',
                        role: role,
                        schoolCode: schoolCode.trim().toUpperCase(),
                        department: role === 'student' ? department : null,
                        colorClass: role === 'student' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    };
                    
                    await window.StorageDB.saveUser(newUser);
                    onLogin(newUser, true);
                } else {
                    if (!emailClean || !passwordClean) {
                        setError('Please enter both email and password.');
                        setIsLoading(false);
                        return;
                    }
                    
                    const existingUser = await window.StorageDB.getUserByEmail(emailClean);
                    if (!existingUser) {
                        setError('Account not found. Please sign up first.');
                        setIsLoading(false);
                        return;
                    }

                    if (existingUser.password !== passwordClean) {
                        setError('Incorrect password. Please try again.');
                        setIsLoading(false);
                        return;
                    }

                    onLogin(existingUser, false);
                }
            } catch (err) {
                console.error('Login submit error:', err);
                setError('An error occurred during process: ' + (err.message || 'Unknown error'));
                setIsLoading(false);
            }
        };

        return (
            <div className="min-h-screen bg-[var(--bg-color)] flex flex-col justify-center items-center p-4 animate-in fade-in duration-500" data-name="login-page" data-file="pages/Login.js">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative">
                    <button
                        onClick={onBackToLanding}
                        className="absolute top-4 right-4 p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Back to landing page"
                        data-name="login-back"
                        data-file="pages/Login.js"
                    >
                        <div className="icon-x text-xl" data-name="login-back-icon" data-file="pages/Login.js"></div>
                    </button>
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl text-[var(--primary)] mb-6">
                            <div className="icon-user-round text-4xl"></div>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            {isSignUp ? 'Create an Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-gray-500 mt-2">
                            {isSignUp ? 'Join Aethermind to start your journey.' : 'Enter your credentials to log in.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input 
                                    type="text"
                                    required={isSignUp}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
                                    placeholder="e.g. Snighda Singh"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input 
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
                                placeholder="••••••••"
                            />
                        </div>

                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">School Access Code</label>
                                <input 
                                    type="text"
                                    required
                                    value={schoolCode}
                                    onChange={(e) => setSchoolCode(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
                                    placeholder="e.g. DEMO123"
                                />
                                <p className="text-xs text-gray-500 mt-1">Provided by your instructor to connect to your school.</p>
                            </div>
                        )}

                        {isSignUp && role === 'student' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Department / Major</label>
                                <select 
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
                                >
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Design">Design</option>
                                    <option value="Business">Business</option>
                                    <option value="Engineering">Engineering</option>
                                </select>
                            </div>
                        )}

                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    I am a...
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${role === 'student' ? 'border-[var(--primary)] bg-indigo-50 text-[var(--primary)]' : 'border-gray-100 hover:border-indigo-200 text-gray-500'}`}>
                                        <input 
                                            type="radio" 
                                            name="role" 
                                            value="student" 
                                            checked={role === 'student'}
                                            onChange={() => setRole('student')}
                                            className="hidden"
                                        />
                                        <div className="icon-graduation-cap text-2xl mb-2"></div>
                                        <span className="font-medium">Student</span>
                                    </label>
                                    <label className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${role === 'instructor' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 hover:border-blue-200 text-gray-500'}`}>
                                        <input 
                                            type="radio" 
                                            name="role" 
                                            value="instructor" 
                                            checked={role === 'instructor'}
                                            onChange={() => setRole('instructor')}
                                            className="hidden"
                                        />
                                        <div className="icon-presentation text-2xl mb-2"></div>
                                        <span className="font-medium">Instructor</span>
                                    </label>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 mt-2 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                            {isLoading && <div className="icon-loader animate-spin"></div>}
                            {isSignUp ? 'Create Account' : 'Log In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-500">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
                        </span>
                        <button 
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="ml-2 text-[var(--primary)] font-semibold hover:underline"
                        >
                            {isSignUp ? 'Log in' : 'Sign up'}
                        </button>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Login component error:', error);
        return null;
    }
}
window.Login = Login;
