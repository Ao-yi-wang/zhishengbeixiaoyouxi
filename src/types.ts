export type Side = 'flat' | 'convex';

export interface JiaobeiState {
  side: Side;
  rotation: number;
  x: number;
  y: number;
  flipX: boolean;
}

export type TossResult = '圣杯' | '笑杯' | '怒杯' | null;

export interface TossRecord {
  id: string;
  timestamp: number;
  sequence: number;
  result: TossResult;
  wish?: string;
}
