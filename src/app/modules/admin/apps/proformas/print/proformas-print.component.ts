import { CdkScrollable } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { Observable } from 'rxjs';
import { ProformaModel } from '../proformas.types';
import { ProformasService } from '../proformas.service';
import { CommonModule } from '@angular/common';


@Component({
    selector       : 'proformas-print',
    templateUrl    : './proformas-print.component.html',
    styleUrls      : ['./proformas-print.css'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [CdkScrollable, MatButtonModule, MatDividerModule, MatIconModule, CommonModule],
})
export class ProformasPrintComponent
{
    proforma$: Observable<ProformaModel>;
    /**
     * Constructor
     */
    constructor(
        private _proformaService: ProformasService,
    )
    {
    }

    ngOnInit(): void
    {
        // Obtener los dominios
        //this.proforma$ = this._proformaService.getProformaById("4");
        //console.log(this.proforma$);
    }

      // Función para imprimir el contenido
    print() {
        // Obtén el contenido HTML que deseas imprimir
        const printContents = document.getElementById('print-section').innerHTML;
        const originalContents = document.body.innerHTML;

        // Crea una nueva ventana para la impresión
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.open();
        printWindow.document.write(`
        <html>
            <head>
            <title>Imprimir Proformas</title>
            <style>
                /* Puedes añadir estilos aquí */
                body { font-family: Arial, sans-serif; }
            </style>
            </head>
            <body onload="window.print(); window.close();">
            ${printContents}
            </body>
        </html>
        `);
        printWindow.document.close();
    }
}