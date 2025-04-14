import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ConstruccionesListaComponent } from './list/construcciones-lista.component';
import { ConstruccionesService } from './construcciones.service';

export default [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'construcciones',
    },
    {
        path: 'construcciones',
        component: ConstruccionesListaComponent,
        children: [
            {
                path: '',
                component: ConstruccionesListaComponent,
                resolve: {
                    construcciones: () => inject(ConstruccionesService).getConstrucciones_(0, 10, 'ctaCte', 'asc', '24-0143-09')
                   // construcciones: () => inject(ConstruccionesService).getConstrucciones_(),
                   // estados: () => inject(DominiosService).getEstados(),
                   // tiposComprobantes: () => inject(DominiosService).getTiposComprobantes()
                },
            },
        ],
    }

] as Routes;
