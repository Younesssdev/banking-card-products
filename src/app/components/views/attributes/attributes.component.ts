import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FieldConfig, Option, FormValue } from 'src/app/shared/dynamic-form/models/config.model';
import { TreeNode } from 'primeng/api/treenode';
import { DataType, TreeNodeData } from 'src/app/models/tree-node-data.model';

@Component({
  selector: 'app-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.css']
})
export class attributesComponent {
  private _treeNodeSelected: TreeNode;
  index: number = null;
  private xsdSchema: Object;
  xsdGroupDataConfig: FieldConfig[] = [];
  xsdCharacteristicConfig: FieldConfig[] = [];
  groupDataVlue: Object;
  characteristicValue: Object;
  groupDataValueUpdated: Object;
  characteristicValueUpdated: Object;
  disableForm: boolean;
  dataType = DataType;
  xsdRequiredCharacteristic: FieldConfig[] = [];
  xsdRequiredGroupData: FieldConfig[] = [];
  @Output() treeNodeUpdated: EventEmitter<TreeNode> = new EventEmitter();
  @Output() xsdMandatoryAttributes: EventEmitter<Map<DataType, FieldConfig[]>> = new EventEmitter();
  @Input() set xsdJson(xsdJson: Object) {
    if (xsdJson) {
      this.xsdSchema = xsdJson['xs:schema'];
      this.prepareXsdAttributes();
      this.emitMandatoryAttributes();
    }
  }
  @Input() set treeNodeSelected(treeNode: TreeNode) {
    this._treeNodeSelected = treeNode;
    if (treeNode?.data) {
      switch (treeNode.data.type) {
        case DataType.GROUPDATA: {
          this.groupDataVlue = { ...treeNode.data.attributes };
          this.characteristicValue = null;
          this.index = 0;
          break;
        }
        case DataType.CHARACTERISTIC: {
          this.characteristicValue = { ...treeNode.data.attributes };
          this.groupDataVlue = null;
          this.index = 1;
          break;
        }
        default: {
          this.groupDataVlue = null;
          this.characteristicValue = null;
          this.index = null;
          break;
        }
      }
    } else {
      this.groupDataVlue = null;
      this.characteristicValue = null;
      this.index = null;
    }
  }
  get treeNodeSelected(): TreeNode {
    return this._treeNodeSelected;
  }
  constructor() { }
  private prepareXsdAttributes() {
    if (this.xsdSchema && this.xsdSchema['xs:element']) {
      const elements = this.xsdSchema['xs:element'];
      elements.forEach(element => {
        const complexType = element['xs:complexType'];
        if (complexType) {
          const attributes = element['xs:complexType']['xs:attribute'];
          if (element['_attributes'].name === "Characteristic") {
            this.xsdCharacteristicConfig = this.buildXsdAttributesConfig(attributes);
            if (this.characteristicValue) {
              this.characteristicValue = { ...this.characteristicValue };
            }
          } else if (element['_attributes'].name === "GroupData") {
            this.xsdGroupDataConfig = this.buildXsdAttributesConfig(attributes);
            if (this.groupDataVlue) {
              this.groupDataVlue = { ...this.groupDataVlue };
            }
          }
        }
      });
    }
  }
  private emitMandatoryAttributes() {
    let xsdRequiredCharacteristic: FieldConfig[];
    let xsdRequiredGroupData: FieldConfig[];
    if (this.xsdCharacteristicConfig) {
      xsdRequiredCharacteristic = this.xsdCharacteristicConfig.filter(characteristic => characteristic.required);
    }
    if (this.xsdGroupDataConfig) {
      xsdRequiredGroupData = this.xsdGroupDataConfig.filter(groupData => groupData.required);
    }
    const requiredAttributes: Map<DataType, FieldConfig[]> = new Map();
    if (xsdRequiredCharacteristic?.length) {
      requiredAttributes.set(DataType.CHARACTERISTIC, xsdRequiredCharacteristic);
    }
    if (xsdRequiredGroupData?.length) {
      requiredAttributes.set(DataType.GROUPDATA, xsdRequiredGroupData);
    }
    if (requiredAttributes.keys()) {
      this.xsdMandatoryAttributes.emit(requiredAttributes);
    }

  }
  private buildXsdAttributesConfig(xsdAttributes: Object): FieldConfig[] {
    if (!xsdAttributes) {
      return [];
    }
    const xsdAttributesConfig: FieldConfig[] = [];

    if (xsdAttributes instanceof Array) {
      xsdAttributes.forEach(attribute => {
        xsdAttributesConfig.push(this.buildFieldConfig(attribute));
      });
    } else {
      xsdAttributesConfig.push(this.buildFieldConfig(xsdAttributes));
    }
    this.mandatoryAttributes(xsdAttributesConfig)
    return xsdAttributesConfig;
  }
  private mandatoryAttributes(xsdAttributes: FieldConfig[]) {
    xsdAttributes.filter(xsdAttributes => {
      if (xsdAttributes.required) {

      }
    });
  }
  private buildLabel(label: string): string {
    return label.replace(/[^A-Z](?=[A-Z])/g, '$& ');
  }
  private buildFieldConfig(attribute: Object): FieldConfig {
    let inputType: string;
    let options: Option[] = [{
      label: '',
      value: ''
    }];
    let fieldType: string;
    const name = attribute['_attributes'].name;
    const type = attribute['_attributes'].type;
    const required = attribute['_attributes'].required;
    const fieldConfig: FieldConfig = {
      name: name,
      label: this.buildLabel(name),
      required: required
    };
    if (!type) {
      fieldType = 'input';
      inputType = 'text';
    } else {
      switch (type) {
        case 'xs:string': {
          fieldType = 'input';
          inputType = 'text';
          break;
        }
        case 'xs:integer': {
          fieldType = 'input';
          inputType = 'number';
          break;
        }
        default: {
          fieldType = 'dropdown';
          const simpleTypes = this.xsdSchema['xs:simpleType'];
          const simpleType = simpleTypes.find(simpleType => type === simpleType['_attributes'].name);
          if (simpleType) {
            const enumValues = simpleType['xs:restriction']['xs:enumeration'];
            const optionValues = enumValues?.map(element => {
              return {
                label: element['_attributes'].value,
                value: element['_attributes'].value
              }
            });
            options = [...options, ...optionValues];
          }
          break;
        }
      }
    }
    fieldConfig.type = fieldType;
    if (fieldType === 'dropdown') {
      fieldConfig.options = options;
    } else {
      fieldConfig.inputType = inputType;
    }
    return fieldConfig;
  }
  onFormValueChange(formValue: FormValue, dataType: DataType) {
    if (this.treeNodeSelected?.data?.type === dataType) {
      this.updateSelectedTreeNode(formValue, dataType);
    }
  }
  updateSelectedTreeNode(formValue: FormValue, dataType: DataType) {
    const dataValue = formValue.value;
    if (dataValue) {
      Object.entries(dataValue).forEach(([key, value]) => {
        if (!value) {
          delete dataValue[key];
        }
      });
    }
    const updatedTreeNode: TreeNode =
    {
      // key: dataValue['id'],
      label: dataValue['id'],
      expandedIcon: this.treeNodeSelected.expandedIcon,
      collapsedIcon: this.treeNodeSelected.collapsedIcon,
      children: this.treeNodeSelected.children,
      data: {
        attributes: dataValue,
        type: dataType,
        valid: formValue.valid
      }
    }
    this.treeNodeUpdated.emit(updatedTreeNode);
  }
}






