import { API_V1_BASE_URL } from './api.js';

export async function activateAccount(userId, token) {
    try {
        const response = await fetch(`${API_V1_BASE_URL}/users/profile/${userId}/activate/${token}/`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            return { success: true, message: 'Account activated successfully!' };
        } else {
            const data = await response.json();
            return {
                success: false,
                message: data.detail || 'Failed to activate account.'
            };
        }
    } catch (err) {
        console.error('Activation error:', err);
        return {
            success: false,
            message: 'Network error. Please check your connection and try again.'
        };
    }
}
