import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TreeModule } from 'primeng/tree';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AccordionModule } from 'primeng/accordion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PanelModule } from 'primeng/panel';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonModule } from 'primeng/button';
import {DropdownModule} from 'primeng/dropdown';
import {ContextMenuModule} from 'primeng/contextmenu'
import {ToolbarModule} from 'primeng/toolbar';
import {ToastModule} from 'primeng/toast';
import {SidebarModule} from 'primeng/sidebar';





import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CatalogComponent } from './components/catalog-builder/catalog.component';
import { TreeComponent } from './components/views/tree/tree.component';
import { previewComponent } from './components/views/preview/preview.component';
import { attributesComponent } from './components/views/attributes/attributes.component';
import { ParentComponent } from './components/views/attributes/structure/parent/parent.component';
import { CurrentComponent } from './components/views/attributes/structure/current/current.component';
import { DynamicFormComponent } from './shared/dynamic-form/dynamic-form.component';
import { DynamicFormControlComponent } from './shared/dynamic-form/field-fom-control/field-form-control.component';
import { SharedModule } from './shared/shared.module';





@NgModule({
  declarations: [
    AppComponent,
    CatalogComponent,
    TreeComponent,
    previewComponent,
    attributesComponent,
    ParentComponent,
    CurrentComponent,
    DynamicFormComponent,
    DynamicFormControlComponent,
    


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TreeModule,
    HttpClientModule,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
    ScrollPanelModule,
    RadioButtonModule,
    AccordionModule,
    BrowserAnimationsModule,
    PanelModule,
    BreadcrumbModule,
    InputTextModule,
    FileUploadModule,
    SplitButtonModule,
    ButtonModule,
    SharedModule,
    ContextMenuModule,
    ToolbarModule,
    ToastModule,
    SidebarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
