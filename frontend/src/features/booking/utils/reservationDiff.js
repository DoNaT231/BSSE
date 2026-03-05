export function diffReservations(originalList, currentList) {
  const origSet = new Set((originalList || []).map((r) => r.startTime));
  const currSet = new Set((currentList || []).map((r) => r.startTime));

  const added = [...currSet].filter((t) => !origSet.has(t));
  const removed = [...origSet].filter((t) => !currSet.has(t));

  return {
    added,
    removed,
    changed: added.length > 0 || removed.length > 0,
  };
}