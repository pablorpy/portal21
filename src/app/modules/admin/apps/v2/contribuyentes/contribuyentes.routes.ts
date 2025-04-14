import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { v2ContribuyentesService } from './v2-contribuyentes.service';
import { v2ContribuyentesListaComponent } from './list/contribuyentes-lista.component';
//import { EstadoCuentaBoxComponent } from './estado-cuenta/estado-cuenta-box.component';


export default [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'contribuyentesv2',
    },
    {
        path: 'contribuyentesv2',
        component: v2ContribuyentesListaComponent,
        children: [
            {
                path: '',
                component: v2ContribuyentesListaComponent,
                resolve: {
                    contribuyentes: () => inject(v2ContribuyentesService).getContribuyentes(),
                    //ciudades: () => inject(ContribuyentesService).getCiudadesV2(),
                    //barrios: () => inject(ContribuyentesService).getBarriosV2(),
                    /*
                    tiposComprobantes: () => inject(DominiosService).getTiposComprobantes()*/
                },
            },
        ],
    }

] as Routes;
