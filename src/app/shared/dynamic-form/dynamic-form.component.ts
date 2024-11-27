import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { FieldConfig, FormValue } from './models/config.model';


@Component({
    selector: 'app-dynamic-form',
    templateUrl: './dynamic-form.component.html'
})
export class DynamicFormComponent {
    private _config: FieldConfig[];
    @Output() valueUpdated: EventEmitter<FormValue> = new EventEmitter()
    form: FormGroup;
    @Input() set formGroupValue(value: Object) {
        this.form.reset();
        if (value) {
            this.form.patchValue(value);
        }
        this.form.updateValueAndValidity();
    }
    @Input() set config(config: FieldConfig[]) {
        this._config = config;
        if (config?.length) {
            this.buildFormGroup();
        }
    }
    get config(): FieldConfig[] {
        return this._config;
    }
    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({});
    }
    private buildFormGroup() {
        this.config.forEach(fieldConfig => {
            this.form.addControl(fieldConfig.name, this.createFormControl(fieldConfig));
        });
    }
    private createFormControl(fieldConfig: FieldConfig): FormControl {
        return this.fb.control(fieldConfig.value, this.prepareValidation(fieldConfig))
    }
    private prepareValidation(fieldConfig: FieldConfig): ValidatorFn[] {
        return fieldConfig.required ? [Validators.required] : [];
    }
    onFormValueChange() {
        this.valueUpdated.emit({
            value: this.form.getRawValue(),
            valid: this.form.valid
        });
    }
}
