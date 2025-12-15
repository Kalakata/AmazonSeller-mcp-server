import axios from 'axios';

// Regional endpoints
const ENDPOINTS = {
  'us-east-1': 'https://sellingpartnerapi-na.amazon.com',
  'eu-west-1': 'https://sellingpartnerapi-eu.amazon.com',
  'us-west-2': 'https://sellingpartnerapi-fe.amazon.com',
};

// Cache for access tokens
let accessTokenCache = {
  token: null,
  expiresAt: 0
};

/**
 * Get an access token for SP-API
 */
export async function getAccessToken() {
  // Check if we have a valid cached token (with 60s buffer)
  const now = Date.now();
  if (accessTokenCache.token && accessTokenCache.expiresAt > now) {
    return accessTokenCache.token;
  }

  try {
    const response = await axios.post(
      'https://api.amazon.com/auth/o2/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.SP_API_REFRESH_TOKEN,
        client_id: process.env.SP_API_CLIENT_ID,
        client_secret: process.env.SP_API_CLIENT_SECRET
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000
      }
    );

    // Cache the token
    const expiresIn = response.data.expires_in || 3600;
    accessTokenCache = {
      token: response.data.access_token,
      expiresAt: now + (expiresIn * 1000) - 60000 // Subtract 1 minute for safety
    };

    return accessTokenCache.token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw new Error(`Failed to authenticate with Amazon SP-API: ${error.response?.data?.error_description || error.message}`);
  }
}

/**
 * Clear the token cache
 */
export function clearTokenCache() {
  accessTokenCache = {
    token: null,
    expiresAt: 0
  };
}

/**
 * Make a request to the SP-API (without AWS Signature V4)
 */
export async function makeSpApiRequest(method, path, data = null, queryParams = {}) {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const accessToken = await getAccessToken();
      const region = process.env.SP_API_REGION || 'eu-west-1';
      const baseUrl = ENDPOINTS[region] || ENDPOINTS['eu-west-1'];
      const url = `${baseUrl}${path}`;

      const response = await axios({
        method,
        url,
        params: queryParams,
        data: data,
        headers: {
          'x-amz-access-token': accessToken,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      return response.data;
    } catch (error) {
      lastError = error;
      const status = error.response?.status;

      // Handle auth errors
      if (status === 401 || status === 403) {
        clearTokenCache();
        if (attempt === 1) {
          console.error('Auth error, refreshing token and retrying...');
          continue;
        }
      }

      // Handle rate limiting
      if (status === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        console.error(`Rate limited, waiting ${delay/1000}s before retry (attempt ${attempt}/${maxRetries})`);
        await sleep(delay);
        continue;
      }

      // Handle server errors
      if (status >= 500 && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.error(`Server error (${status}), retrying in ${delay/1000}s (attempt ${attempt}/${maxRetries})`);
        await sleep(delay);
        continue;
      }

      // Don't retry on client errors
      if (status >= 400 && status < 500) {
        break;
      }

      // Network errors - retry
      if (!error.response && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.error(`Network error, retrying in ${delay/1000}s (attempt ${attempt}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
    }
  }

  const errorMessage = lastError?.response?.data?.errors?.[0]?.message
    || lastError?.response?.data?.message
    || lastError?.message
    || 'Unknown error';

  console.error('SP-API request failed:', lastError?.response?.data || lastError?.message);
  throw new Error(`SP-API request failed: ${errorMessage}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
