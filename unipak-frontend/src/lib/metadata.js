const DEFAULT_IMAGE = '/images/NUST_islamabad.jpg';

function upsertMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function setPageMetadata({ title, description, path, image = DEFAULT_IMAGE, robots = 'index, follow' }) {
  const fullTitle = title === 'UniPak' ? title : `${title} | UniPak`;
  const url = new URL(path || window.location.pathname, window.location.origin).href;
  const imageUrl = new URL(image, window.location.origin).href;

  document.title = fullTitle;
  upsertMeta('name', 'description', description);
  upsertMeta('name', 'robots', robots);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:site_name', 'UniPak');
  upsertMeta('property', 'og:title', fullTitle);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', url);
  upsertMeta('property', 'og:image', imageUrl);
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', fullTitle);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', imageUrl);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}
