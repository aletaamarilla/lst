export interface Promotion {label: string; price: number; firstPlace: number | null; lastPlace: number | null; condition: string; active: boolean}
export interface PricingDeparture {price?: number | null; regularPrice?: number | null; promotions?: unknown; state?: string; availability?: string; capacity?: {total?: number | null; available?: number | null}}
export function validatePromotions(value: unknown, regularPrice: unknown, capacity?: number | null): Promotion[];
export function promotionCondition(promotion: Promotion): string;
export function departurePricing(departure: PricingDeparture, defaults?: PricingDeparture): {price: number | null; regularPrice?: number | null; promotions?: Promotion[]; promotion?: Promotion | null};
