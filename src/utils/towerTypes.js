const towerTypes = {
  content: {
    name: "Content Marketing",
    icon: "📝",
    color: "#2ecc71",
    cost: 100,
    range: 80,
    power: 15,
    rate: 1.5,         // seconds between attacks
    upgradeMultiplier: 1.3,
    targetStrategy: "furthest",
    projectileColor: "#2ecc71",
    description: "Balanced tower with good range and power. Targets prospects furthest along the path."
  },
  social: {
    name: "Social Media",
    icon: "🔗",
    color: "#3498db",
    cost: 75,
    range: 70,
    power: 10,
    rate: 0.8,
    upgradeMultiplier: 1.25,
    targetStrategy: "closest",
    projectileColor: "#3498db",
    description: "Fast attack speed but lower power. Targets closest prospects for quick engagement."
  },
  event: {
    name: "Events",
    icon: "🎪",
    color: "#f1c40f",
    cost: 200,
    range: 90,
    power: 25,
    rate: 2,
    upgradeMultiplier: 1.4,
    targetStrategy: "multi",
    maxTargets: 3,
    projectileColor: "#f1c40f",
    description: "Expensive but can target multiple prospects at once. High impact marketing."
  },
  paid: {
    name: "Paid Advertising",
    icon: "💰",
    color: "#9b59b6",
    cost: 150,
    range: 100,
    power: 20,
    rate: 1.2,
    upgradeMultiplier: 1.35,
    targetStrategy: "highValue",
    projectileColor: "#9b59b6",
    description: "Long range and targets high-value prospects first. Good for enterprise clients."
  }
};

export default towerTypes;
