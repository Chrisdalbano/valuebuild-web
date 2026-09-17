export interface DemoItem {
  id: string;
  name: string;
  category: string;
  cost: number;
  efficiency: number;
  attack: number;
  health: number;
  symbol: string;
}
// Deliberately fictional fixtures. Not current League balance or recommendations.
export const demoItems: readonly DemoItem[] = [
  {
    id: "01",
    name: "Sunbreaker",
    category: "Offense",
    cost: 3200,
    efficiency: 118,
    attack: 65,
    health: 0,
    symbol: "↗",
  },
  {
    id: "02",
    name: "Hollowguard",
    category: "Defense",
    cost: 2800,
    efficiency: 109,
    attack: 0,
    health: 500,
    symbol: "◇",
  },
  {
    id: "03",
    name: "Stormthread",
    category: "Utility",
    cost: 2600,
    efficiency: 104,
    attack: 30,
    health: 150,
    symbol: "ϟ",
  },
  {
    id: "04",
    name: "Cinderwake",
    category: "Offense",
    cost: 3000,
    efficiency: 112,
    attack: 50,
    health: 250,
    symbol: "⌁",
  },
];
