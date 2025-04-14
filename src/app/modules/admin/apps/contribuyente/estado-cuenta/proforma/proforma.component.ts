import { AsyncPipe, NgClass, NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FuseDrawerComponent } from '@fuse/components/drawer';
import { FuseConfig, FuseConfigService, Scheme, Theme, Themes } from '@fuse/services/config';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { Observable, ReplaySubject, Subject, takeUntil, tap } from 'rxjs';
import { InmueblesService } from '../../../inmuebles/list/inmuebles.service';
import { ProformasService } from '../../../proformas/proformas.service';
import { InmuebleFinanciacionModel, ProformaDetalleModel } from '../estado-cuenta-box.types';

import { registerLocaleData } from '@angular/common';
import localePy from '@angular/common/locales/es-PY';
import { UntypedFormGroup } from '@angular/forms';
import { MatDrawer, MatDrawerContent } from '@angular/material/sidenav';
import { FinanciamientoInmComponent } from '../financiamiento-inm/financiamiento-inm.component';
import { MatDialog } from '@angular/material/dialog';
import { DominiosService } from '../../../parametros/dominios/dominios.service';
import { toInteger } from 'lodash';
registerLocaleData(localePy, 'py');

@Component({
    selector     : 'proforma',
    templateUrl  : './proforma.component.html',
    styles       : [
        `
            settings {
                position: static;
                display: block;
                flex: none;
                width: auto;
            }

            @media (screen and min-width: 1280px) {

                empty-layout + settings .settings-cog {
                    right: 0 !important;
                }
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [MatIconModule, FuseDrawerComponent, MatButtonModule, NgFor, NgIf, NgClass, MatTooltipModule, CurrencyPipe],
})
export class ProformaComponent implements OnInit, OnDestroy
{
    config: FuseConfig;
    layout: string;
    scheme: 'dark' | 'light';
    theme: string;
    themes: Themes;
    proformaCargaDetalles : ProformaDetalleModel[];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    montoTotalAPagar : number = 0;
    montoTotalSinDescuento : number = 0;
    montoTotalDescuento : number = 0;
    
    //Financiamiento impuesto inmobiliario
    financiarImpuestosInmobiliarios : boolean = false;
    financiacion: InmuebleFinanciacionModel;
    finanImpuestoInmForm: UntypedFormGroup;
    //contacts: Contact[];

    //detallesProforma: ProformaDetalleModel[];

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _fuseConfigService: FuseConfigService,
        private _proformaService : ProformasService,
        private _formBuilder: UntypedFormBuilder,
        private _matDialog: MatDialog,
        private _dominioService : DominiosService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to config changes
        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: FuseConfig) =>
            {
                // Store the config
                this.config = config;
            });

        this.proformaCargaDetalles = this._proformaService.proformaCargaDetalles;

        this._proformaService.montoTotalAPagar$.subscribe(res => {
            this.montoTotalAPagar = res;
        });

        this._proformaService.montoTotalSinDescuento$.subscribe(res => {
            this.montoTotalSinDescuento = res;
        });

        this._proformaService.montoDescuento$.subscribe(res => {
            this.montoTotalDescuento = res;
        });

        this.finanImpuestoInmForm = this._formBuilder.group({
            cantidadCuotas           : ['', [Validators.required]],
            importeEntrega           : ['', [Validators.required]],
            observaciones            : ['']
        });
        
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

        /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
        trackByFn(index: number, item: any): any
        {
            return item.id || index;
        }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set the layout on the config
     *
     * @param layout
     */
    setLayout(layout: string): void
    {
        // Clear the 'layout' query param to allow layout changes
        this._router.navigate([], {
            queryParams        : {
                layout: null,
            },
            queryParamsHandling: 'merge',
        }).then(() =>
        {
            // Set the config
            this._fuseConfigService.config = {layout};
        });
    }

    /**
     * Set the scheme on the config
     *
     * @param scheme
     */
    setScheme(scheme: Scheme): void
    {
        this._fuseConfigService.config = {scheme};
    }

    /**
     * Set the theme on the config
     *
     * @param theme
     */
    setTheme(theme: Theme): void
    {
        this._fuseConfigService.config = {theme};
    }

    calcularDctoMontoAPagar(descuento : any, det : ProformaDetalleModel): void{
        if (!isNaN(descuento.value)){
            if (descuento.value > 100) descuento.value = 100;
            else if (descuento.value < 0) descuento.value = 0;
            console.log("det.porcentajeDescuento: " + descuento.value);
            det.porcentajeDescuento = descuento.value;
            det.montoDescuento = det.cuentaInmueble.totalPagar * descuento.value/100;
            det.montoAPagar = det.cuentaInmueble.totalPagar - det.montoDescuento;
            det.montoCuentaSinDescuento = det.cuentaInmueble.totalPagar;
        }
        this._proformaService.calcularMontoTotalAPagar();
    }

    insertarProforma() : void {
        this._proformaService.createProforma();
    }

    toggleFinanciarImpuestosInm(financiar : boolean){
        this.financiarImpuestosInmobiliarios = financiar;
        // Open the dialog
        
        const dialogRef = this._matDialog.open(FinanciamientoInmComponent, {
            data: this.montoTotalAPagar
        });

        dialogRef.afterClosed()
            .subscribe((result) =>
            {
                //RECIBIMOS EL COMPONENTE DE FINANCIACION Y GUARDAMOS
                let componenteFinan : FinanciamientoInmComponent = result;
                let financiacion: InmuebleFinanciacionModel = {
                    id: '',
                    cantidadCuotas: componenteFinan.getCantCuotasSeleccionadas(),
                    importePagar: this.montoTotalAPagar,
                    importeEntrega: componenteFinan.importeEntrega,
                    saldo: this.montoTotalAPagar - componenteFinan.importeEntrega,
                    importeDescuento: this.montoTotalDescuento,
                    porcentajeInteres: 0,
                    observacion: componenteFinan.finanImpuestoInmForm.get("observaciones").value,
                    estado: this._dominioService.getOpcionByCodDominioAndCodOpcion('ESTGEN', 'ACT'),
                    inmueblesCuentasFraccionadas: this.proformaCargaDetalles,
                    contribuyente: this._proformaService.contribuyenteProformaActual,
                    rmcDeudor: toInteger(this._proformaService.contribuyenteProformaActual.rmc != '' ? this._proformaService.contribuyenteProformaActual.rmc : 0)
                }
                console.log('Compose dialog was closed!');
            });
    }

    financiarProforma() : void {
        this._proformaService.createProforma();
    }


      generarMontosCuotas() :  void {

      }      
    /* calcularMontoTotalAPagar() : void {
        this.montoTotalAPagar = 0;
        this.proformaCargaDetalles.forEach(x => {
            this.montoTotalAPagar += x.montoAPagar;
        });
    } */
}
