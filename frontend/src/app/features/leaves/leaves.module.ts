import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { LeavesRoutingModule } from './leaves-routing.module';
import { LeavesComponent } from './components/leaves.component';

@NgModule({
  declarations: [LeavesComponent],
  imports: [SharedModule, LeavesRoutingModule]
})
export class LeavesModule { }