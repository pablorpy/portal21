import { AsyncPipe, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { debounceTime, map, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { AutorizacionesService } from './autorizantes.service';

import { query } from '@angular/animations';
import { ContribuyenteModel } from '../contribuyente/contribuyentes.types';
import { OpcionModel } from '../menues/menues.types';
import { AutorizanteModel, AutorizantePagination } from './autorizantes-types';
import { GuaraniPipe } from './guarani.pipe'; 


@Component({
    selector       : 'autorizantes-list',
    templateUrl    : './autorizantes-lista-component.html',
   // styleUrl       : './autorizantes-lista-component.scss',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations,
    standalone     : true,
    
    imports        : [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, 
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, 
        MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe, GuaraniPipe],
})
export class AutorizantesListaComponent implements OnInit, AfterViewInit, OnDestroy
{
    [x: string]: any;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild('nRegistro', { static: false }) nRegistro!: ElementRef;

    registros$: Observable<AutorizanteModel[]>;

    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: AutorizantePagination;
    selectedAutorizante: AutorizanteModel | null = null;
    selectedContribuyente: ContribuyenteModel | null = null;
    selectedAutorizanteForm: UntypedFormGroup;
    categorias: OpcionModel[];
    public contribuyentes: ContribuyenteModel[];
    isActualizarDisabled: boolean = true;
    detalles: any[] = []; // Define una propiedad para almacenar los datos
    detalleDetalles: any[] = []; 
    flashMessage: 'success' | 'error' | 'validacion' | null = null;
    inputValue: number = 0;
    totalAPagar: number = 0;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _autorizanteService: AutorizacionesService,
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
        // Create the selected product form
        this.selectedRegistroForm = this._formBuilder.group({
            id               : [{value:'', disabled:true}],            
        });
 
        // Obtener la paginación
        this._autorizanteService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: AutorizantePagination) =>
            {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Obtener los dominios
        this.autorizantes$ = this._autorizanteService.autorizantes$
        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) =>
                {
                    this.closeDetails();
                    this.isLoading = true;
                    console.log(query);
                    return this._autorizanteService.getProformasAutorizantes(0, 10, 'id', 'asc', query);
                }),
                
                map(() =>
                {
                    this.isLoading = false;
                }),
                
            )
            .subscribe();
    }   

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        //vacio
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
     * Toggle product details
     *
     * @param id
     */

            expandedRowId: string | null = null; // Propiedad para rastrear la fila expandida
            expandedRowId_2: string | null = null;

            toggleDetails(id: string, total: number): void {
                if (this.expandedRowId === id) {
                    // Si la fila ya está expandida, la colapsa
                    this.expandedRowId = null;
                    // Si la fila ya está expandida, la colapsa
                    this.expandedRowId_2 = null;
                    this.totalAPagar = 0;
                } else {
                    // Expande la fila y carga los detalles
                    this.expandedRowId = id;
                    this._autorizanteService.getDetalleById(id)
                        .subscribe((valor) => {
                            this.detalles = valor; // Asigna los detalles
                            this.totalAPagar = total;
                            this._changeDetectorRef.markForCheck();
                        });
                   // this.totalAPagar = 0;
                }
            }

            toggleDetails_2(id: string): void {
                if (this.expandedRowId_2 === id) {
                    // Si la fila ya está expandida, la colapsa
                    this.expandedRowId_2 = null;
                    
                } else {
                    // Expande la fila y carga los detalles
                    this.expandedRowId_2 = id;
                    this._liquidacionService.getDetalleDetalleById(id)
                        .subscribe((valor) => {
                            this.detalleDetalles = valor; // Asigna los detalles
                            this._changeDetectorRef.markForCheck();
                        });
                }
            }

            onKeyDown(event: KeyboardEvent, detalle: any): void {
                const allowedKeys = ['Backspace', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Delete', '.'];

                // Permite solo números y algunos caracteres especiales
                if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key)) {
                    event.preventDefault();
                }
                // Verifica si la tecla presionada es 'Enter'
                if (event.key === 'Enter') {
                    // Evita el comportamiento por defecto del evento (por ejemplo, evitar el envío de un formulario)
                    event.preventDefault();
            
                    // Obtiene el elemento de entrada que desencadenó el evento
                    const inputElement = event.target as HTMLInputElement;
                    // Convierte el valor del input a un número de punto flotante
                    const value = parseFloat(inputElement.value);
                    
                    // Calcula el monto de descuento basado en el costo y el porcentaje ingresado
                    const descuento = detalle.costo * (value / 100);
                    // Calcula el monto final después de aplicar el descuento
                    const montoFinal = detalle.costo - descuento;
            
                    // Asigna el monto de descuento y el porcentaje de descuento al detalle correspondiente
                    detalle.montoDescuento = descuento;
                    detalle.porcentajeDescuento = value;
            
                    // Recalcula el total a pagar iterando sobre todos los detalles
                    this.totalAPagar = this.detalles.reduce((total, detalle) => {
                        // Obtiene el monto de descuento de este detalle
                        const descuento = detalle.montoDescuento || 0;
                        // Obtiene el costo del detalle, asegurándose de que sea 0 si no está definido
                        const costo = detalle.costo || 0;
                        // Calcula el total para este detalle después de aplicar el descuento
                        const totalPorDetalle = costo - descuento;
                        // Suma el total de este detalle al total acumulado
                        return total + totalPorDetalle;
                    }, 0); // Comienza la suma desde 0
                }
            }

            // Función para validar números y guion medio
            validarNumerosGuion(event: KeyboardEvent) {
                const charCode = (event.which) ? event.which : event.keyCode;
                // Permite solo números (0-9) y el guion medio (-)
                if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 45) {
                event.preventDefault();
                }
            }
        
              /**
     * Filter by query
     *
     * @param query
     */
        filterByQuery(query: string): void
        {
           this.searchQuery$.next(query);
        }
            
        consultarCi(searchQuery: string): any{
            // Validar si el campo está vacío
            if (!searchQuery || searchQuery.trim() === '') {
                // Obtener proformas
                this._autorizanteService.getProformasAutorizantes().subscribe();
                // return this._proformaService.proformas$;
            }else{
                this._autorizanteService.getAutorizantesSinPaginado(searchQuery).subscribe();
            }       
        }

              
    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedRegistro= null;
        this.isActualizarDisabled = true;
    }

    markAsTouched(control) {
        if (control) {
          control.markAsTouched();
        }
      }
   
    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error' | 'validacion'): void
    {
        // Show the message
        this.flashMessage = type;

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Hide it after 3 seconds
        setTimeout(() =>
        {
            this.flashMessage = null;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        }, 3000);
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

