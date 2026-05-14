// Generate 100 mechanics randomly around Coimbatore

function randomOffset() {
  return (Math.random() - 0.5) * 0.1; // ~5–6 km spread
}

const skillsPool = [
  ["puncture", "battery"],
  ["engine"],
  ["tow"],
  ["general", "puncture"],
  ["engine", "battery"]
];

export const mechanics = Array.from({ length: 100 }, (_, i) => {
  const baseLat = 11.0168; // Coimbatore region (NOT fixed center usage)
  const baseLng = 76.9558;

  return {
    id: `M${i + 1}`,
    name: `Mechanic ${i + 1}`,
    skills: skillsPool[i % skillsPool.length],
    location: {
      lat: baseLat + randomOffset(),
      lng: baseLng + randomOffset()
    },
    availability: true,
    rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 – 5.0
    workload: Math.floor(Math.random() * 5)
  };
});
