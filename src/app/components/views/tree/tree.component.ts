import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TreeNode, MenuItem } from 'primeng/api';
import { DataType, TreeNodeData } from 'src/app/models/tree-node-data.model';
import { MenuItemAction } from 'src/app/models/menu-item-actions';
import { FieldConfig } from 'src/app/shared/dynamic-form/models/config.model';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css']
})
export class TreeComponent {
  private _xmlJson: Object
  private _xsdMandatoryAttributes: Map<DataType, FieldConfig[]> = new Map();
  treeItemes: TreeNode[] = [];
  nodeSelected: TreeNode;
  nodeCopied: TreeNode;
  validNodes: boolean;
  set xsdMandatoryAttributes(xsdMandatoryAttributes: Map<DataType, FieldConfig[]>) {
    if (xsdMandatoryAttributes) {
      this._xsdMandatoryAttributes = xsdMandatoryAttributes;
    }
  }
  get xsdMandatoryAttributes(): Map<DataType, FieldConfig[]> {
    return this._xsdMandatoryAttributes;
  }
  @Input() set xmlJson(xmlJson: object) {
    this._xmlJson = xmlJson;
    this.treeItemes = [];
    xmlJson && this.buildTreeNode(xmlJson['GroupData'], this.treeItemes, null);
  }
  get xmlJson(): object {
    return this._xmlJson;
  }
  @Output() onSelectTreeNode: EventEmitter<TreeNode> = new EventEmitter();
  @Input() set nodeUpdated(nodeUpdated: TreeNode) {
    this.editNode(nodeUpdated);
  }
  items: MenuItem[];

  constructor() { }
  // mapping to tree 
  buildTreeNode(groupData: Object, treeItemes: TreeNode[], parent: TreeNode) {
    if (groupData) {
      const id = groupData['_attributes'] && groupData['_attributes']['id'] ? groupData['_attributes']['id'] : null;
      const groupChildren = groupData['GroupData'];
      const characteristics = groupData['Characteristics'];
      const groupeData: TreeNode = {
        // key: id,
        label: id,
        expandedIcon: "pi pi-folder-open",
        collapsedIcon: "pi pi-folder",
        parent: parent,
        data: {
          attributes: groupData['_attributes'],
          type: DataType.GROUPDATA,
          valid: this.validAttributes(groupData['_attributes'], DataType.GROUPDATA, parent)
        }
      }
      groupeData.children = this.buildChildrens(groupChildren instanceof Array ? groupChildren : [groupChildren], characteristics, groupeData);
      treeItemes.push(groupeData);
    }
  }
  private buildChildrens(groupChildren: object[], characteristics: object, parent: TreeNode): TreeNode[] {
    const children: TreeNode[] = [];
    if (characteristics && characteristics['Characteristic']) {
      const characteristic = characteristics['Characteristic'];
      const characteristicGroup: TreeNode = {
        label: "Characteristics",
        expandedIcon: "pi pi-folder-open",
        collapsedIcon: "pi pi-folder",
        parent: parent,
        data: {
          attributes: null,
          type: DataType.GROUPCHARACTERISTIC,
          valid: true
        }
      }
      characteristicGroup.children = this.buildCharacteristicChildrens(characteristic instanceof Array ? characteristic : [characteristic], characteristicGroup);
      children.push(characteristicGroup);
    }
    if (groupChildren) {
      groupChildren.forEach(child => {
        if (child) {
          this.buildTreeNode(child, children, parent);
        }
      });
    }
    return children;
  }
  private buildCharacteristicChildrens(characteristics: object[], parent: TreeNode): TreeNode[] {
    return characteristics.map(characteristic => {
      const id = characteristic['_attributes']['id']
      return {
        // key: id,
        label: id,
        icon: "pi pi-file",
        parent: parent,
        data: {
          attributes: characteristic['_attributes'],
          parentStructure: characteristic['ParentStructure'],
          currentStructure: characteristic['CurrentStructure'],
          type: DataType.CHARACTERISTIC,
          valid: this.validAttributes(characteristic['_attributes'], DataType.CHARACTERISTIC, parent)
        }
      }
    });
  }
  private validAttributes(attributes: Object, dataType: DataType, parent: TreeNode): boolean {
    let valid = true;
    if (dataType && dataType !== DataType.GROUPCHARACTERISTIC
      && this.xsdMandatoryAttributes && this.xsdMandatoryAttributes.get(dataType)) {
      if (attributes) {
        const xsdMandatory = this.xsdMandatoryAttributes.get(dataType);
        for (const mandatory of xsdMandatory) {
          const isExist = Object.entries(attributes).some(([key, value]) => {
            return mandatory.name === key && !!value;
          });
          if (!isExist) {
            this.setInvalidParent(parent);
            valid = false;
            break;
          }
        }
      } else {
        this.setInvalidParent(parent);
        valid = false;
      }
    }
    return valid;
  }
  private setInvalidParent(parent: TreeNode) {
    if (parent?.data && !parent.data.hasInvalidChild) {
      parent.data.hasInvalidChild = true;
      this.setInvalidParent(parent.parent);
    }
  }

  private updateParentValidity(parent: TreeNode) {
    if (parent?.data && parent.children) {
      if (!parent.children.some(child => (child?.data && child.data.hasInvalidChild))) {
        const invalidchildren = parent.children.filter(child => (child?.data && !child.data.valid));
        if (invalidchildren.length === 0) {
          parent.data.hasInvalidChild = false;
          this.checkParentValidity(parent.parent);
        }
      }
    }
  }

  private checkParentValidity(parent: TreeNode) {
    if (parent?.data && parent.children) {
      const invalidchildren = parent.children.filter(child => (child?.data && child.data.hasInvalidChild));
      if (invalidchildren.length === 0) {
        parent.data.hasInvalidChild = false;
        this.checkParentValidity(parent.parent);
      }
    }
  }
  updateTreeNodesValidity() {
    if (this.xsdMandatoryAttributes && this.treeItemes?.length) {
      this.treeItemes.forEach(item => this.validNode(item));
    }
  }
  validNode(node: TreeNode) {
    if (node?.data?.type) {
      node.data.valid = this.validAttributes(node.data.attributes, node.data.type, node.parent);
      if (node.children) {
        node.children.forEach(child => this.validNode(child));
      }
    }
  }
  onNodeSelect(event: any) {
    this.onSelectTreeNode.emit(event.node);
    this.buildMenuItems(event?.node?.data?.type);
  }
  nodeUnselect(event: any) {
    this.onSelectTreeNode.emit(null);
  }
  private editNode(nodeUpdated: TreeNode) {
    if (nodeUpdated && this.nodeSelected) {
      if (this.nodeSelected.data && nodeUpdated.data) {
        if (this.nodeSelected.data.valid !== nodeUpdated.data.valid) {
          if (!nodeUpdated.data.valid) {
            this.setInvalidParent(this.nodeSelected.parent);
          } else {
            this.nodeSelected.data = nodeUpdated.data;
            this.updateParentValidity(this.nodeSelected.parent);
          }
        }
      }
      this.nodeSelected.label = nodeUpdated.label;
      this.nodeSelected.data = nodeUpdated.data;
    };
  }
  buildNewXmlJson(): Object {
    if (this.treeItemes?.length) {
      this.validNodes = true;
      const newJson = {};
      newJson["_declaration"] = this.xmlJson["_declaration"];
      newJson["GroupData"] = {};
      this.buildXmlJsonOutput(newJson["GroupData"], this.treeItemes[0]);
      return this.validNodes ? newJson : null;
    }
    return {};
  }
  private buildMenuItems(type: DataType) {
    switch (type) {
      case DataType.GROUPDATA: {
        this.items = [
          {
            label: 'GroupData'
          },
          {
            label: 'Add',
            icon: 'pi pi-fw pi-plus',
            command: () => this.addGroupData(), disabled: this.disableRootNode()
          },
          {
            label: 'Sub',
            icon: 'pi pi-plus-circle',
            command: () => this.subGroup()
          },
          {
            label: 'Remove',
            icon: 'pi pi-fw pi-trash',
            command: () => this.removeGroupData(), disabled: this.disableRootNode()
          },
          {
            label: 'Add characteristic',
            icon: 'pi pi-plus-circle',
            command: () => this.addCharacteristic(null), disabled: this.disableRootNode()
          },
          {
            label: 'Paste characteristic',
            icon: 'pi pi-copy',
            disabled: this.disablePaste(),
            command: () => this.pasteCharacteristic(),
          },
          {
            label: 'Move',
            disabled: this.disableMoveAll(),
            icon: 'pi pi-sort',
            items: [
              { label: 'Move Up ', icon: 'pi pi-sort-up', command: () => this.move(MenuItemAction.MOVEUP), disabled: this.disableMove(MenuItemAction.MOVEUP) },
              { label: 'Move Down', icon: 'pi pi-sort-down', command: () => this.move(MenuItemAction.MOVEDOWN), disabled: this.disableMove(MenuItemAction.MOVEDOWN) }
            ]
          }
        ];
        break;
      }
      case DataType.CHARACTERISTIC: {
        this.items = [
          {
            label: 'Characteristic'
          },
          {
            label: 'Add',
            icon: 'pi pi-fw pi-plus',
            command: () => this.updateChildren(MenuItemAction.ADD, null)
          },
          {
            label: 'Duplicate',
            icon: 'pi pi-clone',
            command: () => this.clone()

          },
          {
            label: 'Remove',
            icon: 'pi pi-fw pi-trash',
            command: () => this.remove()
          },
          {
            label: 'Copy',
            icon: 'pi pi-copy',
            command: () => this.copy()
          },
          {
            label: 'Paste',
            icon: 'pi pi-copy',
            disabled: !this.nodeCopied,
            command: () => this.paste()
          },
          {
            label: 'Move',
            disabled: this.disableMoveAll(),
            icon: 'pi pi-sort',
            items: [
              { label: 'Move Up', icon: 'pi pi-sort-up', command: () => this.move(MenuItemAction.MOVEUP), disabled: this.disableMove(MenuItemAction.MOVEUP) },
              { label: 'Move Down', icon: 'pi pi-sort-down', command: () => this.move(MenuItemAction.MOVEDOWN), disabled: this.disableMove(MenuItemAction.MOVEDOWN) }
            ]
          }
        ];
        break;
      }
      case DataType.GROUPCHARACTERISTIC: {
        this.items = [
          {
            label: 'Characteristics'
          },
          {
            label: 'Add',
            icon: 'pi pi-fw pi-plus',
            command: () => this.addCharacteristicChildren(null)
          },
          {
            label: 'Paste',
            icon: 'pi pi-copy',
            disabled: !this.nodeCopied,
            command: () => this.pasteCharacteristicChildren()
          },
        ];
        break;
      }
      default: {
        this.items = [];
        break;
      }
    }
  }
  private updateChildren(action: MenuItemAction, treeNodeData: TreeNodeData) {
    if (this.nodeSelected) {
      const parent = this.nodeSelected?.parent;
      if (parent) {
        parent.children = parent.children ? parent.children : [];
        const selectedIndex = parent.children.indexOf(this.nodeSelected);
        if (selectedIndex >= 0) {
          switch (action) {
            case MenuItemAction.PASTE:
            case MenuItemAction.CLONE:
            case MenuItemAction.ADD: {
              parent.children.splice(selectedIndex + 1, 0, {
                //  key: treeNodeData?.attributes?.id,
                label: treeNodeData?.attributes?.id,
                icon: "pi pi-file",
                parent: parent,
                data: {
                  attributes: treeNodeData?.attributes,
                  type: DataType.CHARACTERISTIC,
                  valid: this.validAttributes(treeNodeData?.attributes, DataType.CHARACTERISTIC, parent)
                }
              });
              break;
            }
            case MenuItemAction.REMOVE: {
              parent.children.splice(selectedIndex, 1);
              this.onSelectTreeNode.emit(null);
              this.updateParentValidity(this.nodeSelected.parent);
              break;
            }
          }
        } else {
          parent.children.push({
            label: treeNodeData?.attributes?.id,
            icon: "pi pi-file",
            parent: parent,
            data: {
              attributes: treeNodeData?.attributes,
              type: DataType.CHARACTERISTIC,
              valid: this.validAttributes(treeNodeData?.attributes, DataType.CHARACTERISTIC, parent)
            }
          });
        }
      }
    }
  }
  private clone() {
    if (this.nodeSelected) {
      this.updateChildren(MenuItemAction.CLONE, this.nodeSelected?.data);
    }
  }
  private remove() {
    if (this.nodeSelected) {
      this.updateChildren(MenuItemAction.REMOVE, this.nodeSelected?.data);

    }
  }
  private copy() {
    if (this.nodeSelected) {
      this.nodeCopied = this.nodeSelected;
      this.items[5].disabled = false;
    }
  }
  private paste() {
    if (this.nodeSelected && this.nodeCopied) {
      this.updateChildren(MenuItemAction.PASTE, this.nodeCopied?.data);
    }
  }
  private addCharacteristicChildren(treeNodeData: TreeNodeData) {
    if (this.nodeSelected) {
      this.nodeSelected.children = this.nodeSelected.children ? this.nodeSelected.children : [];
      this.nodeSelected.children.push({
        label: treeNodeData?.attributes?.id,
        icon: "pi pi-file",
        parent: this.nodeSelected,
        data: {
          attributes: treeNodeData?.attributes,
          type: DataType.CHARACTERISTIC,
          valid: this.validAttributes(treeNodeData?.attributes, DataType.CHARACTERISTIC, this.nodeSelected)
        }
      });
    }
  }
  private pasteCharacteristicChildren() {
    if (this.nodeSelected && this.nodeCopied) {
      this.addCharacteristicChildren(this.nodeCopied?.data);
    }
  }
  private move(moveAction: MenuItemAction) {
    if (this.nodeSelected) {
      const parent = this.nodeSelected?.parent;
      if (parent?.children?.length >= 1) {
        switch (moveAction) {
          case MenuItemAction.MOVEDOWN: {
            const selectedIndex = parent.children.indexOf(this.nodeSelected);
            let nodeMoveDown = parent.children[selectedIndex + 1];
            parent.children[selectedIndex + 1] = this.nodeSelected;
            parent.children[selectedIndex] = nodeMoveDown;
            break;
          }
          case MenuItemAction.MOVEUP: {
            const selectedIndex = parent.children.indexOf(this.nodeSelected);
            let nodeMoveUp = parent.children[selectedIndex - 1];
            parent.children[selectedIndex - 1] = this.nodeSelected;
            parent.children[selectedIndex] = nodeMoveUp;
            break;
          }
        }
      }
    }
  }
  private disableMove(moveAction: MenuItemAction): boolean {
    if (this.nodeSelected) {
      const index = this.nodeSelected?.parent?.children.indexOf(this.nodeSelected);
      if (index >= 0) {
        if (moveAction === MenuItemAction.MOVEUP) {
          return index === 0;
        } else if (moveAction === MenuItemAction.MOVEDOWN) {
          return index === this.nodeSelected.parent.children.length - 1;
        }
      }
    }
    return true;
  }
  private disableMoveAll(): boolean {
    if (this.nodeSelected?.parent?.children) {
      if (this.nodeSelected?.data?.type === DataType.GROUPDATA) {
        return this.nodeSelected.parent.children.filter(child => child?.data?.type === DataType.GROUPDATA).length === 1;
      } else {
        return this.nodeSelected.parent.children.length === 1;
      }
    }
    return true;
  }
  private disableRootNode() {
    if (this.nodeSelected?.data?.attributes?.id === "PANFeatures") {
      return true
    } else {
      return false
    }
  }
  private disablePaste() {
    if (!this.nodeCopied || this.nodeSelected?.data?.attributes?.id === "PANFeatures") {
      return true
    } else {
      return false
    }
  }
  private addGroupData() {
    if (this.nodeSelected) {
      const parent = this.nodeSelected?.parent;
      if (parent) {
        parent.children = parent.children ? parent.children : [];
        const selectedIndex = parent.children.indexOf(this.nodeSelected);
        if (selectedIndex >= 0) {
          parent.children.splice(selectedIndex + 1, 0, {
            expandedIcon: "pi pi-folder-open",
            collapsedIcon: "pi pi-folder",
            parent: parent,
            data: {
              attributes: null,
              type: DataType.GROUPDATA,
              valid: this.validAttributes(null, DataType.GROUPDATA, parent)
            }
          });
        } else {
          parent.children.push({
            expandedIcon: "pi pi-folder-open",
            collapsedIcon: "pi pi-folder",
            parent: parent,
            data: {
              attributes: null,
              type: DataType.GROUPDATA,
              valid: this.validAttributes(null, DataType.GROUPDATA, parent)
            }
          });
        }
      }
    }
  }

  private subGroup() {
    if (this.nodeSelected) {
      this.nodeSelected.children = this.nodeSelected.children ? this.nodeSelected.children : [];
      this.nodeSelected.children.push({
        expandedIcon: "pi pi-folder-open",
        collapsedIcon: "pi pi-folder",
        parent: this.nodeSelected,
        data: {
          attributes: null,
          type: DataType.GROUPDATA,
          valid: this.validAttributes(null, DataType.GROUPDATA, this.nodeSelected)
        }
      });
    }

  }
  private removeGroupData() {
    if (this.nodeSelected) {
      const parent = this.nodeSelected?.parent;
      if (parent?.children) {
        const selectedIndex = parent.children.indexOf(this.nodeSelected);
        if (selectedIndex >= 0) {
          parent.children.splice(selectedIndex, 1);
          this.onSelectTreeNode.emit(null);
          this.updateParentValidity(this.nodeSelected.parent);
        }
      }
    }
  }
  private pasteCharacteristic() {
    if (this.nodeSelected && this.nodeCopied) {
      this.addCharacteristic(this.nodeCopied?.data);
    }
  }
  private addCharacteristic(treeNodeData: TreeNodeData) {
    if (this.nodeSelected) {
      if (this.nodeSelected?.children && this.nodeSelected?.children[0]?.data?.type === DataType.GROUPCHARACTERISTIC) {
        this.addCharacteristicChild(treeNodeData);
      } else {
        this.addCharacteristics(treeNodeData);
      }
    }
  }

  private addCharacteristics(treeNodeData: TreeNodeData) {
    this.nodeSelected.children = this.nodeSelected.children ? this.nodeSelected.children : [];
    const characteristicGroup: TreeNode = {
      label: "Characteristics",
      expandedIcon: "pi pi-folder-open",
      collapsedIcon: "pi pi-folder",
      parent: this.nodeSelected,
      data: {
        attributes: null,
        type: DataType.GROUPCHARACTERISTIC,
        valid: true
      }
    };
    characteristicGroup.children = [
      {
        label: treeNodeData?.attributes?.id,
        icon: "pi pi-file",
        parent: characteristicGroup,
        data: {
          attributes: treeNodeData?.attributes,
          type: DataType.CHARACTERISTIC,
          valid: this.validAttributes(treeNodeData?.attributes, DataType.CHARACTERISTIC, characteristicGroup)
        }
      }
    ]
    this.nodeSelected.children.splice(0, 0, characteristicGroup);
  }
  private addCharacteristicChild(treeNodeData: TreeNodeData) {
    const characteristicGroup = this.nodeSelected.children[0];
    characteristicGroup.children.push({
      label: treeNodeData?.attributes?.id,
      icon: "pi pi-file",
      parent: characteristicGroup,
      data: {
        attributes: treeNodeData?.attributes,
        type: DataType.CHARACTERISTIC,
        valid: this.validAttributes(treeNodeData?.attributes, DataType.CHARACTERISTIC, characteristicGroup)
      }
    });
  }

  private buildXmlJsonOutput(xmlJsonBuilder: Object, treeNode: TreeNode) {
    if (treeNode?.data?.type === DataType.GROUPDATA) {
      if (!treeNode.data.valid) {
        this.validNodes = false;
        return;
      }
      if (treeNode?.data?.attributes) {
        xmlJsonBuilder["_attributes"] = treeNode?.data?.attributes;
      }
      if (treeNode?.children?.length) {
        const characteristics = treeNode.children.find(child => child?.data?.type === DataType.GROUPCHARACTERISTIC);
        const groupDataChildren = treeNode.children.filter(child => child?.data?.type === DataType.GROUPDATA);
        if (characteristics?.children?.length) {
          xmlJsonBuilder["Characteristics"] = {};
          this.buildXmlJsonCharacteristics(xmlJsonBuilder["Characteristics"], characteristics);
        }
        if (groupDataChildren.length > 1) {
          xmlJsonBuilder["GroupData"] = [];
          groupDataChildren.forEach(child => {
            if (child) {
              const groupDataChild = {};
              xmlJsonBuilder["GroupData"].push(groupDataChild);
              this.buildXmlJsonOutput(groupDataChild, child);
            }
          });
        } else if (groupDataChildren.length === 1) {
          xmlJsonBuilder["GroupData"] = {};
          this.buildXmlJsonOutput(xmlJsonBuilder["GroupData"], groupDataChildren[0]);
        }
      }
    }
  }
  private buildXmlJsonCharacteristics(characteristicsElement: Object, characteristics: TreeNode) {
    if (characteristics?.children?.length > 1) {
      characteristicsElement["Characteristic"] = characteristics.children
        .filter(characteristic => characteristic?.data?.type === DataType.CHARACTERISTIC)
        .map(characteristic => this.buildXmlJsonCharacteristic(characteristic));
    } else if (characteristics?.children?.length === 1 && characteristics?.children[0]?.data?.type == DataType.CHARACTERISTIC) {
      characteristicsElement["Characteristic"] = this.buildXmlJsonCharacteristic(characteristics.children[0]);
    }
  }
  private buildXmlJsonCharacteristic(characteristic: TreeNode): Object {
    const characteristicElement = {};
    if (characteristic?.data?.type == DataType.CHARACTERISTIC) {
      if (!characteristic.data.valid) {
        this.validNodes = false;
        return;
      }
      if (characteristic?.data?.attributes) {
        characteristicElement["_attributes"] = characteristic?.data?.attributes;
      };
      if (characteristic?.data?.parentStructure) {
        characteristicElement["ParentStructure"] = characteristic?.data?.parentStructure;
      };
      if (characteristic?.data?.currentStructure) {
        characteristicElement["CurrentStructure"] = characteristic?.data?.currentStructure;
      };
    }
    return characteristicElement;
  }

}

