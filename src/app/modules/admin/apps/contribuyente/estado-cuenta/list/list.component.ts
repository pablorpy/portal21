import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CategoriaCuenta } from '../../contribuyentes.types';
import { InmuebleModel } from '../../../inmuebles/list/inmuebles-types';
import { EstadoCuentaBoxComponent } from '../estado-cuenta-box.component';
import { InmueblesService } from '../../../inmuebles/list/inmuebles.service';
import { RegistroModel } from '../../../registros/registros-types';
import { RegistrosService } from '../../../registros/registros.service';
import { ProformasService } from '../../../proformas/proformas.service';


@Component({
  selector: 'estado-cuenta-box-list',
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports      : [NgIf, MatButtonModule, MatIconModule, RouterLink, MatProgressBarModule, NgFor, NgClass, RouterOutlet, DatePipe]
})
export class EstadoCuentaBoxListComponent implements OnInit, OnDestroy
{

    @ViewChild('inmueblesList') inmueblesList: ElementRef;

    /*  */categoria: CategoriaCuenta;
    //mails: Mail[];
    inmuebles:InmuebleModel[];
    selectedInmueble: InmuebleModel;
    
    registros: RegistroModel[];
    selectedRegistro: RegistroModel;

    cargandoCuentas: boolean = false;
    pagination: any;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    conceptoIngresoActual: string;

    /**
     * Constructor
     */
    constructor(

        public estadoCuentaBoxComponent: EstadoCuentaBoxComponent,
        private _registroService: RegistrosService,
        private _inmuebleService: InmueblesService,
        private _proformaService: ProformasService
        
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
        // Categoria
        /* this._inmuebleService.categoria$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categ: CategoriaCuenta) =>
            {
                this.categoria = categ;
            }); */

            this._proformaService.conceptoIngresoActual$.subscribe(res => {
                this.conceptoIngresoActual = res;
            });

        //if (this.estadoCuentaComponent.drawer.)
        // Inmuebles
        this._inmuebleService.inmuebles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inmuebles: InmuebleModel[]) =>
            {
                this.inmuebles = inmuebles;
            });

        // Cargando inmuebles
        this._inmuebleService.cargandoInmuebles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((cargandoInmuebles: boolean) =>
            {
                this.cargandoCuentas = cargandoInmuebles;

                // Si el elemento de la lista de inmuebles está disponible & los inmuebles están cargados...
                if ( this.inmueblesList && !cargandoInmuebles )
                {
                    // Resetear la posición del scroll el elemento de la lista de inmuebles al top
                    this.inmueblesList.nativeElement.scrollTo(0, 0);
                }
            });

        // Pagination
        this._inmuebleService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination) =>
            {
                this.pagination = pagination;
            });

        // Inmueble seleccionado
        this._inmuebleService.inmueble$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inmueble: InmuebleModel) =>
            {
                this.selectedInmueble = inmueble;
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On mail selected
     *
     * @param inm El inmueble seleccionado
     */
    onInmuebleSelected(inm: InmuebleModel): void
    {
        // Si el inmuevle todavia no fue leido...
        if (!inm.leido )
        {
            // Actualizar el objeto inmueble
            inm.leido = false;

            // Update the mail on the server
            //this._mailboxService.updateMail(mail.id, {unread: false}).subscribe();
        }

        // Ejecutar el observable de inmuebleSelected observable
        this._inmuebleService.selectedInmuebleChanged.next(inm);
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
}
