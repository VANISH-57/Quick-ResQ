// Haversine distance
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function chooseBestMechanic(mechanics, problem, userLocation) {
  let best = null;
  let bestScore = -1;

  mechanics.forEach(m => {
    if (!m.availability) return;
    if (!m.skills.includes(problem.toLowerCase())) return;

    const d = distanceKm(
      userLocation.lat,
      userLocation.lng,
      m.location.lat,
      m.location.lng
    );

    const score =
      (1 / (d + 1)) * 0.4 +     // distance
      (m.rating / 5) * 0.3 +    // rating
      (1 / (m.workload + 1)) * 0.3; // workload

    if (score > bestScore) {
      bestScore = score;
      best = {
        mechanic: m,
        distance: d.toFixed(2),
        eta: Math.ceil((d / 40) * 60)
      };
    }
  });

  return best;
}
