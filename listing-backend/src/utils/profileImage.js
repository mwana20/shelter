export function isValidProfileImageUrl(value) {
  if (/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(value)) {
    const encoded = value.slice('data:image/jpeg;base64,'.length);
    if (value.length > 2_000_000) return false;

    const bytes = Buffer.from(encoded, 'base64');
    return bytes.toString('base64') === encoded &&
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
