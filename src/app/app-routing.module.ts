import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SortingVisualizerComponent } from './sorting-visualizer/sorting-visualizer.component';
import { ServerControlComponent } from './server-control/server-control.component';

const routes: Routes = [
  { path: '', component: SortingVisualizerComponent },
  { path: 'control/xKMs79q', component: ServerControlComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
