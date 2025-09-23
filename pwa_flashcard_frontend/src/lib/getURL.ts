export function getURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== 'undefined' && window.location?.origin) ??
    'http://localhost:3000';

  if (typeof url !== 'string') {
    url = 'http://localhost:3000';
  }

  url = url.startsWith('http') ? url : `https://${url}`;
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
}
