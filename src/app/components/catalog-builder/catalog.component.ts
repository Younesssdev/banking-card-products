import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem, TreeNode, MessageService } from 'primeng/api';
import * as converter from 'xml-js';
import { DatePipe } from '@angular/common';
import { TreeComponent } from '../views/tree/tree.component';
import { FieldConfig } from 'src/app/shared/dynamic-form/models/config.model';
import { DataType } from 'src/app/models/tree-node-data.model';


@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css'],
  providers: [MessageService]
})
export class CatalogComponent implements OnInit {
  private fileUploaded: File;
  private xmlFile: string;
  items: MenuItem[];
  item: MenuItem[];
  xmlJson: Object;
  xsdUploaded: File;
  style: string;
  xsdFile: string;
  xsdJson: Object;
  treeNodeSelected: TreeNode;
  nodeUpdated: TreeNode;
  uploadedFiles: any[] = [];
  @ViewChild('treeComponenet') treeComponenet: TreeComponent;

  constructor(private messageService: MessageService) { }

  ngOnInit() {
    this.items = [
      { label: 'GroupData' },
      { label: 'GroupData' },
      { label: 'Characteristics' },
      { label: 'Characteristic' },
      { label: 'GroupData' },
      { label: 'Characteristics' },
      { label: 'Characteristic' },
      { label: 'GroupData' }
    ];
    this.item = [
      {
        label: 'Save as',
        icon: "pi pi-save",
        command: () => this.saveAs()
      }
    ]
  }
  uploadFile(event: any, xmlFileUpload) {

    this.fileUploaded = event.files[0];
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.xmlFile = fileReader.result as string;
      this.xmlJson = this.pareseXmlToJson(this.xmlFile);
      //console.log("compact", JSON.stringify(this.xmlJson))
    }
    fileReader.readAsText(this.fileUploaded);
    xmlFileUpload.clear();
  }
  private pareseXmlToJson(xml: string): Object {
    return converter.xml2js(xml, { compact: true });
  }

  uploadxsd(event, xsdFileUpload) {
    this.xsdUploaded = event.files[0];
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.xsdFile = fileReader.result as string;
      this.xsdJson = this.pareseXsdToJson(this.xsdFile)

    }
    fileReader.readAsText(this.xsdUploaded);
    xsdFileUpload.clear();
  }
  private pareseXsdToJson(xml: string): Object {
    return converter.xml2js(xml, { compact: true });
  }
  onSelectTreeNode(node: TreeNode) {
    this.treeNodeSelected = node;
  }
  onNodeUpdated(nodeUpdated: TreeNode) {
    this.nodeUpdated = nodeUpdated;
  }
  onXsdMandatoryAttributes(mandatory: Map<DataType, FieldConfig[]>) {
    this.treeComponenet.xsdMandatoryAttributes = mandatory;
    if (this.treeComponenet?.treeItemes?.length) {
      this.treeComponenet.updateTreeNodesValidity();
    }
  }
  saveAs() {
    const newJson = this.treeComponenet.buildNewXmlJson();
    if (newJson) {
      const outputXml = converter.js2xml(newJson, { compact: true, spaces: 4 });
      this.saveAsXml(outputXml, this.fileUploaded.name);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Some nodes are not valid' });
    }
  }
  saveBackup() {
    const datePipe = new DatePipe('en-US');
    const today = new Date();
    const outputXml = converter.js2xml(this.treeComponenet.buildNewXmlJson(), { compact: true, spaces: 4 });
    this.saveAsXml(outputXml, this.fileUploaded.name.replace(/.xml/gi, '.bak.' + datePipe.transform(today, 'yyyyMMdd,HH:mm:ss') + '.xml'));
  }
  saveAsXml(content, fileName) {
    const a = document.createElement('a');
    const file = new Blob([content], { type: 'text/xml' });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }
}