/**
 * API Client for backend communication
 * Handles all HTTP requests to the FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Log the API URL on initialization to help with debugging
console.log('[API] Initialized with API_BASE_URL:', API_BASE_URL);
console.log('[API] Environment:', import.meta.env.MODE);
console.log('[API] All env vars:', import.meta.env);

interface ApiError {
  detail: string;
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('[API] Making request to:', url);
  console.log('[API] API_BASE_URL:', API_BASE_URL);
  console.log('[API] Request options:', options);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('[API] Response status:', response.status);
    console.log('[API] Response ok:', response.ok);

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: `HTTP error! status: ${response.status}`,
      }));
      console.error('[API] Error response:', error);
      throw new Error(error.detail);
    }

    return await response.json();
  } catch (error) {
    console.error('[API] Fetch error:', error);
    console.error('[API] Error type:', error instanceof TypeError ? 'Network/CORS Error' : 'Other Error');
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Autocomplete API - Get address suggestions
 */
export async function getAutocompleteSuggestions(
  query: string
): Promise<string[]> {
  if (!query || query.length < 3) {
    return [];
  }
  
  const params = new URLSearchParams({ query });
  const response = await fetchApi<{ suggestions: string[] }>(`/api/v1/addresses/autocomplete?${params}`);
  return response.suggestions;
}

/**
 * Lookup API - Get property details by address
 */
export async function lookupProperty(address: string): Promise<{
  session_id: string;
  property: any;
  opportunities: any[];
}> {
  return fetchApi(`/api/v1/properties/lookup`, {
    method: 'POST',
    body: JSON.stringify({ address }),
  });
}

/**
 * Sessions API - Get session by ID
 */
export async function getSession(sessionId: string): Promise<{
  property: any;
  opportunities: any[];
  expires_at: string;
}> {
  return fetchApi(`/api/v1/sessions/${sessionId}`);
}

/**
 * Sessions API - List all sessions
 */
export async function listSessions(): Promise<Array<{
  session_id: string;
  address: string;
  created_at: string;
}>> {
  return fetchApi('/api/v1/sessions');
}

/**
 * Reports API - Generate PDF report
 */
export async function generatePdfReport(sessionId: string): Promise<Blob> {
  const url = `${API_BASE_URL}/api/v1/reports/pdf`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
    
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: `HTTP error! status: ${response.status}`,
      }));
      throw new Error(error.detail);
    }

    return await response.blob();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate PDF report');
  }
}

/**
 * Reports API - Email report
 */
export async function emailReport(
  sessionId: string,
  recipientEmail: string,
  optInUpdates: boolean = false
): Promise<{ message: string }> {
  return fetchApi(`/api/v1/reports/email`, {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      email: recipientEmail,
      opt_in_updates: optInUpdates
    }),
  });
}

/**
 * Waitlist API - Add email to waitlist for unsupported area
 */
export async function addToWaitlist(
  email: string,
  address: string
): Promise<{ message: string; already_registered: boolean }> {
  return fetchApi('/api/v1/waitlist', {
    method: 'POST',
    body: JSON.stringify({ email, address }),
  });
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{ status: string }> {
  return fetchApi('/');
}