import data from "@/data/availability.json";

/**
 * Weekly availability — edit `src/data/availability.json` to update.
 * `weeklyHoursTotal` is the cap; `allocations` are current commitments.
 * Available capacity is computed (total minus the sum of allocations).
 */
export interface AvailabilityAllocation {
  label: string;
  hours: number;
}

export interface AvailabilityData {
  weeklyHoursTotal: number;
  allocations: AvailabilityAllocation[];
}

export function getAvailability(): AvailabilityData {
  return data as AvailabilityData;
}

export function getAllocatedHours(d: AvailabilityData): number {
  return d.allocations.reduce((sum, a) => sum + a.hours, 0);
}

export function getAvailableHours(d: AvailabilityData): number {
  return Math.max(0, d.weeklyHoursTotal - getAllocatedHours(d));
}
