import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ContribuyentesService } from '../contribuyente/contribuyentes.service';
import { ContribuyentesListaComponent } from '../contribuyente/contribuyentes/list/contribuyentes-lista.component';
import { RegistrosListaComponent } from '../registros/registros/list/registros-lista-component';
import { RegistrosService } from '../registros/registros.service';
import { InmueblesListaComponent } from '../inmuebles/list/inmuebles-lista-component';
import { InmueblesService } from '../inmuebles/list/inmuebles.service';
import { BuscarContribuyenteComponent } from '../buscar-contribuyente/buscar-contribuyente.component';
import { TimbradoComponent } from './timbrado/timbrado.component';
import { DominiosService } from '../parametros/dominios/dominios.service';
import { TimbradosService } from './timbrado/timbrados.service';

export default [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'comprobantes',
    },
    {
        path: 'timbrados',
        component: TimbradoComponent,
        children: [
            {
                path: '',
                component: TimbradoComponent,
                resolve: {
                    timbrados: () => inject(TimbradosService).getTimbrados(),
                    estados: () => inject(DominiosService).getEstados(),
                    tiposComprobantes: () => inject(DominiosService).getTiposComprobantes()
                },
            },
        ],
    }

] as Routes;
