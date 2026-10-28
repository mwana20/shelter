export interface NavigationRoute {
  page: string;
  propertyId: string | null;
  areaFilter: string | null;
  token?: string | null;
}

export const VALID_PAGES = new Set([
  'home',
  'search',
  'buy',
  'rent',
  'commercial',
  'land',
  'property-detail',
  'list-property',
  'seller-dashboard',
  'sign-in',
  'create-account',
  'forgot-password',
  'reset-password',
  'email-verification',
  'my-payments',
  'admin',
  'saved',
  'areas',
  'agents',
  'about',
  'contact',
  'terms',
  'privacy'
]);

export function normalizePage(rawPage: string | null | undefined): string {
  if (!rawPage) return 'home';
  const clean = rawPage.toLowerCase().trim();
  if (clean === '' || clean === '/' || clean === 'home') return 'home';
  if (clean === 'explore') return 'areas';
  if (clean === 'my-sheltered') return 'seller-dashboard';
  if (clean === 'admin-dashboard' || clean === 'admin-settings' || clean === 'admin-console') return 'admin';
  if (clean === 'payments' || clean === 'payment-requests') return 'my-payments';
  if (VALID_PAGES.has(clean)) return clean;
  return 'home';
}

export function buildRouteHash(
  page: string,
  propertyId?: string | null,
  areaFilter?: string | null,
  token?: string | null
): string {
  const normPage = normalizePage(page);
  if (normPage === 'property-detail' && propertyId) {
    return `#/property-detail?id=${encodeURIComponent(propertyId)}`;
  }
  if (normPage === 'reset-password' && token) {
    return `#/reset-password?token=${encodeURIComponent(token)}`;
  }
  if (normPage === 'email-verification' && token) {
    return `#/email-verification?token=${encodeURIComponent(token)}`;
  }
  if (normPage === 'areas' && areaFilter) {
    return `#/areas?area=${encodeURIComponent(areaFilter)}`;
  }
  if (normPage === 'home') {
    return `#/`;
  }
  return `#/${normPage}`;
}

export function parseRouteFromLocation(): NavigationRoute {
  // 1. Try URL hash first (e.g. #/property-detail?id=prop-mbale-1 or #/reset-password?token=XYZ)
  if (typeof window !== 'undefined') {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const rawClean = hash.replace(/^#\/?/, '');
      const [path, query] = rawClean.split('?');
      const params = new URLSearchParams(query || '');
      const page = normalizePage(path);
      const propertyId = params.get('id') || params.get('propertyId') || null;
      const areaFilter = params.get('area') || null;
      const token = params.get('token') || null;

      return { page, propertyId, areaFilter, token };
    }

    // 2. Try URL query parameters (e.g. ?page=reset-password&token=XYZ)
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('page')) {
      const page = normalizePage(searchParams.get('page'));
      const propertyId = searchParams.get('id') || searchParams.get('propertyId') || null;
      const areaFilter = searchParams.get('area') || null;
      const token = searchParams.get('token') || null;
      return { page, propertyId, areaFilter, token };
    }

    // 3. Fallback to session storage if refreshed on bare URL
    try {
      const saved = sessionStorage.getItem('sheltered_active_route_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.page === 'string') {
          return {
            page: normalizePage(parsed.page),
            propertyId: parsed.propertyId || null,
            areaFilter: parsed.areaFilter || null,
            token: parsed.token || null
          };
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    page: 'home',
    propertyId: null,
    areaFilter: null,
    token: null
  };
}

export function saveActiveRoute(route: NavigationRoute) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem('sheltered_active_route_v3', JSON.stringify(route));
  } catch {
    // ignore
  }
}
