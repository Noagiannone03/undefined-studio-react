const DASHBOARD_ORIGIN = 'https://app.undefinedstudio.fr'

export function dashboardUrl(path = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${DASHBOARD_ORIGIN}${normalizedPath}`
}
