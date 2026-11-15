export const PALETTE = {
  breakwater: '#c9c9b8',
  oxidized: '#266b64',
  oxidizedShadow: '#26312f',
  sea: '#123c49',
  amber: '#e2a848',
  operator: '#266b64',
  raider: '#92503d',
  suit: '#26312f',
  skin: '#c9a27f',
  device: '#d84e3d',
  pulse: '#f1b44c',
  glass: '#79b8c2',
};

export function shade(name) {
  return PALETTE[name] ?? PALETTE.breakwater;
}
