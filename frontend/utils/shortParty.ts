export function shortParty(partyId: string, length?: number) {
  const [name, hash] = partyId.split("::");

  if (!hash) return name; // no hash

  const firstName6 = name.slice(0, length || 6);
  const first = hash.slice(0, length || 6);
  const last = hash.slice(-(length || 6));

  return `${firstName6}::${first}...${last}`;
}
export function shortCid(cId: string) {
  const first6 = cId.slice(0, 6);
  const last6 = cId.slice(-6);

  return `${first6}...${last6}`;
}
