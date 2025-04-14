import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ContribuyentesService } from '../contribuyente/contribuyentes.service'; 
import { ContribuyentesListaComponent } from '../contribuyente/contribuyentes/list/contribuyentes-lista.component';
import { RegistrosListaComponent } from '../registros/registros/list/registros-lista-component';
import { RegistrosService } from '../registros/registros.service';
import { InmueblesListaComponent } from '../inmuebles/list/inmuebles-lista-component';
import { InmueblesService } from '../inmuebles/list/inmuebles.service';
import { BuscarContribuyenteComponent } from '../buscar-contribuyente/buscar-contribuyente.component';
import { MenuesComponent } from './menues.component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'menues',
    },
    {
        path     : 'menues',
        component: MenuesComponent,
        children : [
            {
                path     : '',
                component: MenuesComponent,
                resolve  : {
                   // menues   : () => inject(DominiosService).getDominios(),
                   // dominiosPadre   : () => inject(DominiosService).getDominiosPadres()
                },
            },
        ],
    }

] as Routes;
