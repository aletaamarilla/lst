// Ask Sanity's image CDN for a size that fits the layout instead of the original upload.
const isSanity = source => typeof source === 'string' && source.startsWith('https://cdn.sanity.io/images/');

export function sizedPhoto(source, width) {
  return isSanity(source) ? `${source}${source.includes('?') ? '&' : '?'}w=${width}&fit=max&auto=format` : source;
}

// Returns '' for local assets so callers can append it unconditionally.
export function photoSrcset(source, widths) {
  return isSanity(source) ? widths.map(width => `${sizedPhoto(source, width)} ${width}w`).join(', ') : '';
}
