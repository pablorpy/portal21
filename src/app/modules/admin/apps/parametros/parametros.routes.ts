import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ContribuyentesService } from '../contribuyente/contribuyentes.service'; 
import { ContribuyentesListaComponent } from '../contribuyente/contribuyentes/list/contribuyentes-lista.component';
import { DominiosListaComponent } from './dominios/list/dominios-lista.component';
import { DominiosService } from './dominios/dominios.service';
import { RegistrosListaComponent } from '../registros/registros/list/registros-lista-component';
import { RegistrosService } from '../registros/registros.service';
import { InmueblesListaComponent } from '../inmuebles/list/inmuebles-lista-component';
import { InmueblesService } from '../inmuebles/list/inmuebles.service';
import { BuscarContribuyenteComponent } from '../buscar-contribuyente/buscar-contribuyente.component';
import { ProformasListaComponent } from '../proformas/proformas-lista.component';
import { ProformasService } from '../proformas/proformas.service';
import { DetallesListaComponent } from '../detalles/detalles-lista.component';
import { DetallesService } from '../detalles/detalles.service';
import { LiquidacionesListaComponent } from '../liquidaciones/liquidaciones/list/liquidaciones-lista-component';
import { LiquidacionesService } from '../liquidaciones/liquidaciones.service';
import { AutorizantesListaComponent } from '../autorizantes/autorizantes-lista-component';
import { AutorizacionesService } from '../autorizantes/autorizantes.service';
import { v2ContribuyentesListaComponent } from '../v2/contribuyentes/list/contribuyentes-lista.component';
import { SuperficieService } from '../catastros/modalSuperficie/buscar-superficie.service';
import { ConstruccionesListaComponent } from '../construcciones/list/construcciones-lista.component';
import { ConstruccionesService } from '../construcciones/construcciones.service';
import { BuscarSuperficieComponent } from '../catastros/modalSuperficie/list/buscar-superficie-component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'dominios',
    },
    {
        path     : 'dominios',
        component: DominiosListaComponent,
        children : [
            {
                path     : '',
                component: DominiosListaComponent,
                resolve  : {
                    dominios   : () => inject(DominiosService).getDominios(),
                    dominiosPadre   : () => inject(DominiosService).getDominiosPadres()
                },
            },
        ],
    },
    {
        path     : 'contribuyentes',
        component: ContribuyentesListaComponent,
        children : [
            {
                path     : '',
                component: ContribuyentesListaComponent,
                resolve  : {
                    contribuyentes   : () => inject(ContribuyentesService).getContribuyentes(),
                    nacionalidades   : () => inject(DominiosService).getNacionalidades(),
                    ciudades   : () => inject(DominiosService).getCiudades(),
                    barrios   : () => inject(DominiosService).getBarrios(),
                    estadosCiviles   : () => inject(DominiosService).getEstadosCiviles(),
                    generos   : () => inject(DominiosService).getGeneros(),
                    tiposContribuyentes   : () => inject(DominiosService).getTiposContribuyentes(),
                    categorias   : () => inject(DominiosService).getCategorias(),
                    estados   : () => inject(DominiosService).getEstados()

                },
            },
        ],
    },
    {
        path     : 'contribuyentesv2',
        component: ContribuyentesListaComponent,
        children : [
            {
                path     : '',
                component: ContribuyentesListaComponent,
                resolve  : {
                   // contribuyentes   : () => inject(v2ContribuyentesListaComponent).ge(),
                   // nacionalidades   : () => inject(DominiosService).getNacionalidades(),
                    ciudades   : () => inject(v2ContribuyentesListaComponent).getCiudades(),
                    barrios   : () => inject(v2ContribuyentesListaComponent).getBarrios(),
                   // estadosCiviles   : () => inject(DominiosService).getEstadosCiviles(),
                    //generos   : () => inject(DominiosService).getGeneros(),
                   // tiposContribuyentes   : () => inject(DominiosService).getTiposContribuyentes(),
                    //categorias   : () => inject(DominiosService).getCategorias(),
                    //estados   : () => inject(DominiosService).getEstados()

                },
            },
        ],
    },
    {
        path     : 'registros',
        component: RegistrosListaComponent,
        children : [
            {
                path     : '',
                component: RegistrosListaComponent,
                resolve  : {
                    Registros   : () => inject(RegistrosService).getRegistros(),
                    contribuyentes   : () => inject(ContribuyentesService).getContribuyentes(),
                    gruposSanguineos   : () => inject(DominiosService).getGruposSanguineos,
                    categoriasRegistros   : () => inject(DominiosService).getCategoriasRegistros(),
                    conceptosPagos   : () => inject(DominiosService).getConceptosPagos(),
                    estadosRegistros   : () => inject(DominiosService).getEstadosRegistros()
                },
            },
        ],
    },
    {
        path     : 'inmuebles',
        component: InmueblesListaComponent,
        children : [
            {
                path     : '',
                component: InmueblesListaComponent,
                resolve  : {
                    inmuebles   : () => inject(InmueblesService).getInmuebles(),
                    contribuyentes   : () => inject(ContribuyentesService).getContribuyentes(),
                    categoriasEdificaciones   : () => inject(DominiosService).getCategoriasEdificaciones(),
                  //  categoriasRegistros   : () => inject(DominiosService).getCategoriasRegistros(),
                  //  conceptosPagos   : () => inject(DominiosService).getConceptosPagos(),
                  //  estadosRegistros   : () => inject(DominiosService).getEstadosRegistros()
                },
            },
        ],
    },
    {
        path     : 'buscar-contribuyente',
        component: BuscarContribuyenteComponent,
        children : [
            {
                path     : '',
                component: BuscarContribuyenteComponent,
                resolve  : {
                    contribuyentes   : () => inject(ContribuyentesService).getContribuyentes(),
                   /* nacionalidades   : () => inject(DominiosService).getNacionalidades(),
                    ciudades   : () => inject(DominiosService).getCiudades(),
                    barrios   : () => inject(DominiosService).getBarrios(),
                    estadosCiviles   : () => inject(DominiosService).getEstadosCiviles(),
                    generos   : () => inject(DominiosService).getGeneros(),
                    tiposContribuyentes   : () => inject(DominiosService).getTiposContribuyentes(),
                    categorias   : () => inject(DominiosService).getCategorias(),
                    estados   : () => inject(DominiosService).getEstados()*/
                },
            },
        ],
    },
    {
        path     : 'buscar-superficie',
        component: BuscarSuperficieComponent,
        children : [
            {
                path     : '',
                component: BuscarSuperficieComponent,
                resolve  : {
                    superficies   : () => inject(SuperficieService).getSuperficies(),
                   /* nacionalidades   : () => inject(DominiosService).getNacionalidades(),
                    ciudades   : () => inject(DominiosService).getCiudades(),
                    barrios   : () => inject(DominiosService).getBarrios(),
                    estadosCiviles   : () => inject(DominiosService).getEstadosCiviles(),
                    generos   : () => inject(DominiosService).getGeneros(),
                    tiposContribuyentes   : () => inject(DominiosService).getTiposContribuyentes(),
                    categorias   : () => inject(DominiosService).getCategorias(),
                    estados   : () => inject(DominiosService).getEstados()*/
                },
            },
        ],
    },
    {
        path     : 'proformas',
        component: ProformasListaComponent,
        children : [
            {
                path     : '',
                component: ProformasListaComponent,
                resolve  : {
                    proformas   : () => inject(ProformasService).getProformas(),
                    detalles   : () => inject(DetallesService).getDetallesSinPaginado()
                   /* nacionalidades   : () => inject(DominiosService).getNacionalidades(),
                    ciudades   : () => inject(DominiosService).getCiudades(),
                    barrios   : () => inject(DominiosService).getBarrios(),
                    estadosCiviles   : () => inject(DominiosService).getEstadosCiviles(),
                    generos   : () => inject(DominiosService).getGeneros(),
                    tiposContribuyentes   : () => inject(DominiosService).getTiposContribuyentes(),
                    categorias   : () => inject(DominiosService).getCategorias(),
                    estados   : () => inject(DominiosService).getEstados()*/
                },
            },
        ],
    },
    {
        path     : 'detalles',
        component: DetallesListaComponent,
        children : [
            {
                path     : '',
                component: DetallesListaComponent,
                resolve  : {
                    //detalles   : () => inject(DetallesService).getDetallesSinPaginado()
                   /* nacionalidades   : () => inject(DominiosService).getNacionalidades(),
                    ciudades   : () => inject(DominiosService).getCiudades(),
                    barrios   : () => inject(DominiosService).getBarrios(),
                    estadosCiviles   : () => inject(DominiosService).getEstadosCiviles(),
                    generos   : () => inject(DominiosService).getGeneros(),
                    tiposContribuyentes   : () => inject(DominiosService).getTiposContribuyentes(),
                    categorias   : () => inject(DominiosService).getCategorias(),
                    estados   : () => inject(DominiosService).getEstados()*/
                },
            },
        ],
    },
    {
        path     : 'liquidaciones',
        component: LiquidacionesListaComponent,
        children : [
            {
                path     : '',
                component: LiquidacionesListaComponent,
                resolve  : {
                    liquidaciones   : () => inject(LiquidacionesService).getLiquidaciones()
                   /* nacionalidades   : () => inject(DominiosService).getNacionalidades(),
                    ciudades   : () => inject(DominiosService).getCiudades(),
                    barrios   : () => inject(DominiosService).getBarrios(),
                    estadosCiviles   : () => inject(DominiosService).getEstadosCiviles(),
                    generos   : () => inject(DominiosService).getGeneros(),
                    tiposContribuyentes   : () => inject(DominiosService).getTiposContribuyentes(),
                    categorias   : () => inject(DominiosService).getCategorias(),
                    estados   : () => inject(DominiosService).getEstados()*/
                },
            },
        ],
    },
    {
        path     : 'autorizantes',
        component: AutorizantesListaComponent,
        children : [
            {
                path     : '',
                component: AutorizantesListaComponent,
                resolve  : {
                    autorizantes   : () => inject(AutorizacionesService).getProformasAutorizantes()
                },
            },
        ],
    }/*,
    {
        path     : 'construcciones',
        component: ConstruccionesListaComponent,
        children : [
            {
                path     : '',
                component: ConstruccionesListaComponent,
                resolve  : {
                    construcciones   : () => inject(ConstruccionesService).getConstrucciones()
                },
            },
        ],
    }*/

] as Routes;
