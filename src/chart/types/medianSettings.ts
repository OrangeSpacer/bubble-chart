/** Значение медианы и её собственный знак приходят из вызывающего приложения. */
export interface MedianAxisSettings {
  value: number;
  /** Знак после значения, например «%» или « ₽»; не зависит от знака делений оси. */
  sign?: string;
}

export interface MedianSettings {
  x?: MedianAxisSettings | null;
  y?: MedianAxisSettings | null;
}
