export interface tbToolbarFilterTypes {
  id: string;
  title: string;
  options: tbToolbarFilterOption[];
}

export interface tbToolbarFilterOption<T = any> {
  value: T;
  label: string;
  icon?: string;
}
