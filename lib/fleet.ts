export type ProductId = "buggy-duna" | "buggy-familia" | "quadri-4x4" | "ebike-fat";
export type Kind = "buggy" | "quad" | "ebike";

export type Product = {
  id: ProductId;
  name: string;
  tagline: string;
  kind: Kind;
  seats: number;
  price: number; // por diária (valores ilustrativos)
  units: number; // estoque real de veículos
  color: string;
  bg: [string, string];
  specs: string[];
  badge?: string;
  photo: string;
  focus: string; // object-position da foto
};

export const PRODUCTS: Product[] = [
  {
    id: "buggy-duna",
    photo: "/img/fleet/buggy-duna.jpg",
    focus: "center 60%",
    name: "Buggy Duna",
    tagline: "O clássico das dunas para dois aventureiros.",
    kind: "buggy",
    seats: 2,
    price: 480,
    units: 5,
    color: "#FF6A4D",
    bg: ["#FFE0A3", "#FF9F7A"],
    specs: ["2 lugares", "Câmbio automático", "Capacete e óculos"],
    badge: "Mais pedido",
  },
  {
    id: "buggy-familia",
    photo: "/img/fleet/buggy-familia.jpg",
    focus: "center 55%",
    name: "Buggy Família",
    tagline: "Espaço pra todo mundo curtir a lagoa junto.",
    kind: "buggy",
    seats: 4,
    price: 780,
    units: 4,
    color: "#17A168",
    bg: ["#C9F2D8", "#6FD4A4"],
    specs: ["4 lugares", "Santo Antônio reforçado", "Cooler incluso"],
  },
  {
    id: "quadri-4x4",
    photo: "/img/fleet/quadri-4x4.jpg",
    focus: "center 55%",
    name: "Quadriciclo 4x4",
    tagline: "Tração total para atravessar areia fofa e riacho.",
    kind: "quad",
    seats: 1,
    price: 380,
    units: 8,
    color: "#0EA5B7",
    bg: ["#BDF1F4", "#5CCBD6"],
    specs: ["1 piloto (+1 garupa)", "Tração 4x4", "Guia opcional"],
    badge: "Aventura",
  },
  {
    id: "ebike-fat",
    photo: "/img/fleet/ebike-fat.jpg",
    focus: "center 60%",
    name: "E-Bike Fat Tire",
    tagline: "Pedalada assistida de pneu largo, no seu ritmo.",
    kind: "ebike",
    seats: 1,
    price: 160,
    units: 6,
    color: "#FF3F8E",
    bg: ["#FFD1E3", "#FF8FB9"],
    specs: ["Pneu 4.0 p/ areia", "Autonomia 60 km", "Silenciosa"],
    badge: "Novo",
  },
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const unitIdsOf = (p: Product) => Array.from({ length: p.units }, (_, i) => `${p.id}-${i + 1}`);

export type Addon = { id: string; name: string; desc: string; price: number; per: "reserva" | "dia" };
export const ADDONS: Addon[] = [
  { id: "guia", name: "Guia local", desc: "Conduz o grupo pelos melhores pontos.", price: 150, per: "reserva" },
  { id: "fotos", name: "Fotos e vídeo GoPro", desc: "Material do passeio no seu WhatsApp.", price: 90, per: "reserva" },
  { id: "seguro", name: "Seguro premium", desc: "Cobertura ampliada para danos.", price: 35, per: "dia" },
];
