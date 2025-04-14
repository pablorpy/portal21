import { Routes } from '@angular/router';
import { DatosPersonalesComponent } from './datos-personales/datos-personales.component';

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
                    
                },
            },
        ],
    }

] as Routes;
