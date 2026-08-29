export interface ChartTooltipProps<T> {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ value: number; payload: T }>;
}
