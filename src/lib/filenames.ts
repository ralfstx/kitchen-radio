import { remove as removeDiacritics } from 'diacritics';

/**
 * Encodes a file name to contain only ASCII characters.
 * @param string the file name to encode
 */
export function encodeAscii(string: string): string {
  let result = string.toLowerCase();

  // Turn '&' and '+' into 'and'
  result = result.replace(/&/g, ' and ');
  result = result.replace(/\+/g, ' and ');

  // Translate diacritics to ASCII
  result = removeDiacritics(result);

  // Turn non-alphanumeric characters (colon, comma, dot, dash, etc.) into spaces
  result = result.replace(/[^a-zA-Z0-9]/g, ' ');

  // Remove leading and trailing whitespace
  result = result.trim();

  // Replace white space with dashes
  result = result.replace(/\s+/g, '-');

  return result;
}
