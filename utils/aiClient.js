window.AIClient = {
    // --- Provider + Key storage ---
    getProvider: () => {
        try {
            const p = localStorage.getItem('aether_ai_provider') || 'sarvam';
            return String(p || 'sarvam').trim() || 'sarvam';
        } catch (e) {
            return 'sarvam';
        }
    },

    setProvider: (provider) => {
        try {
            const p = String(provider || '').trim();
            if (!p) {
                localStorage.removeItem('aether_ai_provider');
                return;
            }
            localStorage.setItem('aether_ai_provider', p);
        } catch (e) {
            // ignore
        }
    },

    getKey: () => {
        try {
            // Backward compatible: keep using StorageDB key slot
            return window.StorageDB.getApiKey ? String(window.StorageDB.getApiKey() || '').trim() : '';
        } catch (e) {
            return '';
        }
    },

    hasKey: () => {
        try {
            return window.AIClient.getKey().length > 0;
        } catch (e) {
            return false;
        }
    },

    maskKey: (key) => {
        try {
            const k = String(key || '');
            if (k.length <= 8) return '••••••••';
            return `${k.slice(0, 4)}••••••••${k.slice(-4)}`;
        } catch (e) {
            return '••••••••';
        }
    },

    // --- Provider configuration (Sarvam default) ---
    getModel: () => {
        try {
            const provider = window.AIClient.getProvider();
            const saved = localStorage.getItem('aether_ai_model') || '';
            const s = String(saved || '').trim();
            if (s) return s;

            // Sensible defaults
            if (provider === 'sarvam') return 'sarvam-m';
            if (provider === 'openai') return 'gpt-4o-mini';
            return 'sarvam-m';
        } catch (e) {
            return 'sarvam-m';
        }
    },

    setModel: (model) => {
        try {
            const m = String(model || '').trim();
            if (!m) {
                localStorage.removeItem('aether_ai_model');
                return;
            }
            localStorage.setItem('aether_ai_model', m);
        } catch (e) {
            // ignore
        }
    },

    // NOTE: Sarvam auth header format can differ by account.
    // Default assumption: Authorization: Bearer <key>
    // If the user tells us a different header name, we can extend later.
    getAuthHeaderName: () => {
        try {
            const saved = localStorage.getItem('aether_ai_auth_header') || '';
            const s = String(saved || '').trim();
            return s || 'Authorization';
        } catch (e) {
            return 'Authorization';
        }
    },

    setAuthHeaderName: (name) => {
        try {
            const n = String(name || '').trim();
            if (!n) {
                localStorage.removeItem('aether_ai_auth_header');
                return;
            }
            localStorage.setItem('aether_ai_auth_header', n);
        } catch (e) {
            // ignore
        }
    },

    getAuthHeaderValue: (key) => {
        try {
            const headerName = window.AIClient.getAuthHeaderName();
            const k = String(key || '').trim();
            if (!k) return '';

            // If header is Authorization, default to Bearer
            if (headerName.toLowerCase() === 'authorization') return `Bearer ${k}`;

            // Otherwise send the raw key for custom header names
            // (e.g., 'api-key': '<key>')
            return k;
        } catch (e) {
            return '';
        }
    },

    getBaseUrl: () => {
        try {
            const provider = window.AIClient.getProvider();
            if (provider === 'sarvam') return 'https://api.sarvam.ai/v1/chat/completions';
        } catch (e) {
            return 'https://api.sarvam.ai/v1/chat/completions';
        }
    },

    // --- Invoke ---
    invokeWithKey: async (systemPrompt, userPrompt) => {
        try {
            const key = window.AIClient.getKey();
            if (!key) {
                return { ok: false, text: '', error: 'No API key saved. Add your key in Settings first.' };
            }

            const provider = window.AIClient.getProvider();

            // Keep demo agent path only for non-Sarvam providers
            if (provider !== 'sarvam' && typeof window.invokeAIAgent === 'function') {
                try {
                    const text = await window.invokeAIAgent(String(systemPrompt || ''), String(userPrompt || ''));
                    return { ok: true, text: String(text || ''), error: '' };
                } catch (e) {
                    return { ok: false, text: '', error: 'Could not reach the AI service. Please try again.' };
                }
            }

            const targetUrl = window.AIClient.getBaseUrl();
            const url = targetUrl;

            const model = window.AIClient.getModel();
            const headerName = window.AIClient.getAuthHeaderName();
            const headerValue = window.AIClient.getAuthHeaderValue(key);

            const headers = {
                'Content-Type': 'application/json'
            };
            headers[headerName] = headerValue;

            const payload = {
                model: String(model || ''),
                messages: [
                    { role: 'system', content: String(systemPrompt || '') },
                    { role: 'user', content: String(userPrompt || '') }
                ],
                temperature: 0.6
            };

            const resp = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                if (resp.status === 401) {
                    return { ok: false, text: '', error: 'Unauthorized (401). Your API key or auth header is invalid for the selected provider.' };
                }
                if (resp.status === 429) {
                    return { ok: false, text: '', error: 'Rate limit reached. Please wait a minute and try again.' };
                }

                let details = '';
                try {
                    const t = await resp.text();
                    details = String(t || '').slice(0, 240);
                } catch (e) {
                    details = '';
                }
                return { ok: false, text: '', error: details ? `Request failed. ${details}` : 'The AI request failed. Please try again later.' };
            }

            const data = await resp.json();

            // Try OpenAI-compatible shape first, then fallbacks
            const text = data?.choices?.[0]?.message?.content
                || data?.choices?.[0]?.delta?.content
                || data?.output?.[0]?.content?.[0]?.text
                || data?.message?.content
                || '';

            if (!text) return { ok: false, text: '', error: 'No response received from the AI service.' };
            return { ok: true, text: String(text), error: '' };
        } catch (e) {
            return { ok: false, text: '', error: 'Could not call the AI service. Check your network and try again.' };
        }
    }
};