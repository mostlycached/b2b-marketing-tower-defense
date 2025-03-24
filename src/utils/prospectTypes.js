const prospectTypes = [
  { 
    name: "SMB", 
    cssClass: "smb", 
    health: 10, 
    speed: 40, 
    value: 50,
    color: "#27ae60",
    description: "Small businesses that move quickly but have lower health and value"
  },
  { 
    name: "Mid", 
    cssClass: "mid", 
    health: 20, 
    speed: 30, 
    value: 100,
    color: "#f39c12",
    description: "Mid-market companies with balanced stats"
  },
  { 
    name: "Ent", 
    cssClass: "ent", 
    health: 40, 
    speed: 20, 
    value: 200,
    color: "#8e44ad",
    description: "Enterprise prospects that move slowly but have high health and value"
  }
];

export default prospectTypes;
