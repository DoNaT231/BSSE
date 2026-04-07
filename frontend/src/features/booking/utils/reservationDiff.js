export function diffReservations(originalList = [], currentList = []) {

  const origMap = new Map(
    originalList.map((r) => [r.startTime, r])
  );

  const currMap = new Map(
    currentList.map((r) => [r.startTime, r])
  );

  const added = [];
  const removed = [];

  for (const [startTime, reservation] of currMap) {
    if (!origMap.has(startTime)) {
      added.push(reservation);
    }
  }

  for (const [startTime, reservation] of origMap) {
    if (!currMap.has(startTime)) {
      removed.push(reservation);
    }
  }

  return {
    added,
    removed,
    changed: added.length > 0 || removed.length > 0,
  };
}