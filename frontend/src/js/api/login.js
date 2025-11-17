import { API_V1_BASE_URL } from './api.js';
import { getCsrfToken } from '../scripts/get-csrf-token.js';

export async function loginUser(username, password, remember_me) {
    // read CSRF token using shared helper
    const csrfToken = getCsrfToken();

    const headers = {
        'Content-Type': 'application/json',
    };
    if (csrfToken) headers['X-CSRFToken'] = csrfToken;

    const response = await fetch(`${API_V1_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
            username,
            password,
            remember_me,
        }),
    });

    const data = await response.json();

    if (response.ok) {
        // successful login - redirect to dashboard
        window.location.href = 'dashboard.html';
        return data;
    } else {
        const detail = data.detail || 'Unknown error';
        const message = data.message || '';
        const statusCode = response.status;

        throw new Error(`[${statusCode}] ${detail}${message ? ` - ${message}` : ''}`);
    }
}
