import { inject } from '@angular/core';
import { Routes } from '@angular/router';

import { CatastrosListaComponent } from './list/catastros-lista-component';
import { CatastrosService } from './list/catastros.service';

export default [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'catastros',
    },
    {
        path: 'catastros',
        component: CatastrosListaComponent,
        children: [
            {
                path: '',
                component: CatastrosListaComponent,
                resolve: {
                    catastros: () => inject(CatastrosService).getCatastros(),
                   // estados: () => inject(DominiosService).getEstados(),
                   // tiposComprobantes: () => inject(DominiosService).getTiposComprobantes()
                },
            },
        ],
    }

] as Routes;
