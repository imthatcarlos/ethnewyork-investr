export const timestampToDate = (ts) => {
  var date = new Date(ts);
  return date.toLocaleString("en-US", { hour12: true, weekday: 'long', month: 'long', day: 'numeric' });
}
