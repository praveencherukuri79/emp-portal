import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { DocumentsRoutingModule } from './documents-routing.module';
import { DocumentsComponent } from './components/documents.component';

@NgModule({
  declarations: [
    DocumentsComponent
  ],
  imports: [
    SharedModule,
    DocumentsRoutingModule
  ]
})
export class DocumentsModule { }