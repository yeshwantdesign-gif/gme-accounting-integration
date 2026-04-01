export function calculateDelta(coreBalance: number, amaranthBalance: number): number {
  return coreBalance - amaranthBalance;
}

export function calculateFcyDelta(coreFcy: number, amaranthFcy: number): number {
  return coreFcy - amaranthFcy;
}
