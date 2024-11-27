import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '../models/config.model';

@Component({
  selector: 'app-field-form-control',
  templateUrl: './field-form-control.component.html',
})
export class DynamicFormControlComponent {
  @Input() fieldConfig: FieldConfig;
  @Input() form: FormGroup;
  @Output() valueChange: EventEmitter<void> = new EventEmitter();
  
  get isValid() {
    return this.form.get(this.fieldConfig.name).valid;
  }
  emitValueChange() {
    this.valueChange.emit();
  }
}

