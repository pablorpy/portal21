import { Routes } from '@angular/router';
import { DatosPersonalesComponent } from './datos-personales/datos-personales.component';
import { inject } from '@angular/core';
import { TipoDocumentoService } from '../parametros/tipo-documento/tipo-documento.service';
import { PersonaContribuyenteService } from '../parametros/persona-contribuyente/personas-contribuyentes.service';
import { SexoService } from '../parametros/sexo/sexos.service';
import { EstadoCivilService } from '../parametros/estado-civil/estados-civiles.service';
import { PersonaSeparacionBienService } from '../parametros/persona-separacion-bien/personas-separaciones-bienes.service';
import { DomicilioCategoriaService } from '../parametros/domicilio-categoria/domicilios-categorias.service';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'datos-personales',
    },
    {
        path     : 'datos-personales',
        component: DatosPersonalesComponent,
        children : [
            {
                path     : '',
                component: DatosPersonalesComponent,
                resolve  : {
                    tiposDocumentos: () => inject(TipoDocumentoService).getTiposDocumentos(),
                    personasContribuyentes: () => inject(PersonaContribuyenteService).getPersonasContribuyentes(),
                    sexos: () => inject(SexoService).getSexos(),
                    estadosCiviles: () => inject(EstadoCivilService).getestadosCiviles(),
                    personasSeparacionesBienes: () => inject(PersonaSeparacionBienService).getPersonasSeparacionesBienes(),
                    //domiciliosCategorias: () => inject(DomicilioCategoriaService).getDomiciliosCategorias(),
                },
            }
        ],
    }

] as Routes;
