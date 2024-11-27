export interface FieldConfig {
  name: string;
  label: string;
  type?: string;
  value?: string;
  required?: boolean;
  placeholder?: string;
  // input
  inputType?: string;
  // drop-down
  options?: Option[];
}

export interface Option {
  label: string;
  value: string;
}

export interface FormValue {
  value: Object,
  valid: boolean,
}
