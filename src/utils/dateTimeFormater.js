
export function postDateTimeFormat(rawDate) {
  const fullDate = new Date(rawDate);

  const options = {
    year: 'numeric',
    month: 'long', // 'long' for "January", 'short' for "Jan", 'numeric' for "1"
    day: 'numeric'
  };

  return fullDate.toLocaleDateString(undefined, options);
}