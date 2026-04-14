function PaymentModal({ isOpen, onClose }) {
    try {
        const [step, setStep] = React.useState('form'); // form, processing, success
        const [code, setCode] = React.useState('');

        if (!isOpen) return null;

        const handlePayment = (e) => {
            e.preventDefault();
            setStep('processing');
            
            // Simulate payment processing
            setTimeout(() => {
                const generated = 'AETH-' + Math.floor(1000 + Math.random() * 9000);
                setCode(generated);
                setStep('success');
            }, 2000);
        };

        const handleClose = () => {
            setStep('form');
            setCode('');
            onClose();
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" data-name="payment-modal" data-file="components/PaymentModal.js">
                <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden relative">
                    {/* Close button */}
                    {step !== 'processing' && (
                        <button 
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
                        >
                            <div className="icon-x"></div>
                        </button>
                    )}

                    {step === 'form' && (
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-indigo-100 text-[var(--primary)] rounded-xl flex items-center justify-center">
                                    <div className="icon-credit-card text-xl"></div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Purchase School Code</h2>
                                    <p className="text-sm text-gray-500">Total: ₹499.00</p>
                                </div>
                            </div>

                            <form onSubmit={handlePayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                        placeholder="Shraddha Bauni"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            required
                                            pattern="\d{16}"
                                            maxLength="16"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                            placeholder="0000 0000 0000 0000"
                                        />
                                        <div className="icon-credit-card absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="MM/YY"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                        <input 
                                            type="password" 
                                            required
                                            maxLength="4"
                                            placeholder="123"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full py-3 mt-4 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
                                >
                                    Pay ₹499.00
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                            <div className="icon-loader text-5xl text-[var(--primary)] animate-spin mb-4"></div>
                            <h2 className="text-xl font-bold mb-2">Processing Payment</h2>
                            <p className="text-gray-500">Please do not close this window...</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <div className="icon-circle-check text-4xl"></div>
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                            <p className="text-gray-500 mb-6">Your new school code has been generated. Share this with your students.</p>
                            
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block">Your School Code</span>
                                <div className="text-3xl font-mono font-bold tracking-widest text-[var(--primary)]">
                                    {code}
                                </div>
                            </div>

                            <button 
                                onClick={handleClose}
                                className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('PaymentModal error:', error);
        return null;
    }
}
window.PaymentModal = PaymentModal;