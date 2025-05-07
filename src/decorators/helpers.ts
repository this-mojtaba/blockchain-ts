export function convertToPathPrefixSafty(pathPrefix: string, pathSuffix: string) {
  if (pathPrefix === '/') {
    pathPrefix = '';
  } else {
    if (pathSuffix === '/') {
      pathSuffix = '';
    }
  }

  return pathPrefix + pathSuffix;
}
