export function matchDynamicRoute(urlPath: string, routePattern: string): { [key: string]: string } | null {
  const urlParts = urlPath.split('/');
  const routeParts = routePattern.split('/');

  if (urlParts.length !== routeParts.length) return null;

  const params: { [key: string]: string } = {};

  for (let i = 0; i < routeParts.length; i++) {
    if (routeParts[i].startsWith(':')) {
      // Extract dynamic params (e.g., :userId)
      const paramName = routeParts[i].substring(1);
      params[paramName] = urlParts[i];
    } else if (routeParts[i] !== urlParts[i]) {
      // If static part doesn't match, this isn't the correct route
      return null;
    }
  }

  return params;
}
