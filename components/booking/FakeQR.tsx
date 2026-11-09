// QR ilustrativo (não é um QR de pagamento real) só para a demonstração do fluxo Pix.
export function FakeQR({ seed }: { seed: string }) {
  const N = 29;
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
  const finder = (x: number, y: number) => (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);
  const rects: React.ReactNode[] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) if (!finder(x, y) && rnd() > 0.52) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  const Eye = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" /><rect x="1" y="1" width="5" height="5" fill="#fff" /><rect x="2" y="2" width="3" height="3" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} className="h-44 w-44 rounded-xl bg-white p-2" fill="#06303f" shapeRendering="crispEdges" role="img" aria-label="QR Code Pix ilustrativo">
      {rects}
      <Eye x={0} y={0} /><Eye x={N - 7} y={0} /><Eye x={0} y={N - 7} />
    </svg>
  );
}
