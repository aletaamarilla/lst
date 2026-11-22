export interface EarlyBird {price: number; until: string}
export interface LiveEarlyBird extends EarlyBird {saving: number}
export interface PricingDeparture {price?: number | null; regularPrice?: number | null; earlyBird?: unknown; start?: string; state?: string; availability?: string; capacity?: {total?: number | null; available?: number | null}}
export function earlyBirdUntilLong(until: string): string;
export function earlyBirdUntilShort(until: string): string;
export function validateEarlyBird(value: unknown, regularPrice: unknown, start?: string | null): EarlyBird | null;
export function departurePricing(departure: PricingDeparture, context?: {today?: string; state?: string; availability?: string; capacity?: {total?: number | null; available?: number | null}}): {price: number | null; regularPrice: number | null; earlyBird: LiveEarlyBird | null};
