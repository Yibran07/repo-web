/**
 * Converts a relative API path to a complete URL
 * @param {string} path - The relative path from the API
 * @returns {string|null} - The complete URL or null if path is invalid
 */
export const getCompleteFileUrl = (path) => {
  if (!path) return null;

  // If the path already starts with http:// or https://, don't modify it
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Get the API base URL from env variables or use default
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:10000";

  // CRITICAL FIX: For paths starting with /files/, make sure we don't add /api/
  if (path.startsWith("/files/")) {
    // Direct connection to files endpoint - must NOT include /api/
    return `${apiBaseUrl}${path}`;
  }

  // For API paths
  if (path.startsWith("/api/")) {
    return `${apiBaseUrl}${path}`;
  }

  // For other paths, append to base URL with appropriate slashes
  return path.startsWith("/")
    ? `${apiBaseUrl}${path}`
    : `${apiBaseUrl}/${path}`;
};
