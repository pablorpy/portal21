import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { ContribuyentesService } from './contribuyentes.service';
import { EstadoCuentaBoxComponent } from './estado-cuenta/estado-cuenta-box.component';


export default [
    {
        /* path     : 'estado-cuenta',
        component: EstadoCuentaBoxComponent,
        children : [
            {
                path     : '',
                component: EstadoCuentaBoxComponent,
                resolve  : {
                    contribuyentes   : () => inject(ContribuyentesService).getContribuyentes(),
                    //tiposDocumentos   : () => inject(DominiosService).getOpcionesByDominio('TIPDOCIDENT')
                },
            },
        ], */
    },
] as Routes;
