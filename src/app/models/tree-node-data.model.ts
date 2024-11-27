export interface TreeNodeData {
    attributes: {
        id?: string
    };
    type: DataType;
    parentStructure: Object;
    currentStructure: Object;
    valid: boolean;
    hasInvalidChild: boolean;
    invalidCount: number;
}
export enum DataType {
    CHARACTERISTIC = 'characteristic',
    GROUPCHARACTERISTIC = 'groupcharacteristic',
    GROUPDATA = 'groupdata'
}