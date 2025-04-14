import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { debounceTime, map, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { LiquidacionesService } from '../../liquidaciones.service';
import { LiquidacionModel, LiquidacionPagination } from '../../liquidaciones-types';
import { ContribuyenteModel } from '../../../contribuyente/contribuyentes.types';
import { OpcionModel } from '../../../parametros/dominios/dominios.types';
import { GuaraniPipe } from '../../../autorizantes/guarani.pipe';

@Component({
    selector       : 'liquidaciones-list',
    templateUrl    : './liquidaciones-lista-component.html',
    styleUrl       : './liquidaciones-lista-component.scss',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations,
    standalone     : true,
    imports        : [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, 
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, 
        MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe, GuaraniPipe],
})
export class LiquidacionesListaComponent implements OnInit, AfterViewInit, OnDestroy
{
    [x: string]: any;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild('nRegistro', { static: false }) nRegistro!: ElementRef;

    registros$: Observable<LiquidacionModel[]>;

    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: LiquidacionPagination;
    selectedLiquidacion: LiquidacionModel | null = null;
    selectedContribuyente: ContribuyenteModel | null = null;
    selectedLiquidacionForm: UntypedFormGroup;
    categorias: OpcionModel[];
    public contribuyentes: ContribuyenteModel[];
    gruposSanguineos: OpcionModel[];
    conceptosPagos: OpcionModel[];
    estadosRegistros: OpcionModel[];
    isActualizarDisabled: boolean = true;
    detalles: any[] = []; // Define una propiedad para almacenar los datos
    detalleDetalles: any[] = []; 
    flashMessage: 'success' | 'error' | 'validacion' | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _liquidacionService: LiquidacionesService,
        private _changeDetectorRef: ChangeDetectorRef
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
        // Obtener la paginación
        this._liquidacionService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: LiquidacionPagination) =>
            {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Obtener los dominios
        this.liquidaciones$ = this._liquidacionService.liquidaciones$
        
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
                    return this._liquidacionService.getLiquidaciones(0, 10, 'id', 'asc', query);
                    
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

            toggleDetails(id: string): void {
                if (this.expandedRowId === id) {
                    // Si la fila ya está expandida, la colapsa
                    this.expandedRowId = null;
                    // Si la fila ya está expandida, la colapsa
                    this.expandedRowId_2 = null;
                } else {
                    // Expande la fila y carga los detalles
                    this.expandedRowId = id;
                    this._liquidacionService.getDetalleByIdd(id)
                        .subscribe((valor) => {
                            this.detalles = valor; // Asigna los detalles
                            this._changeDetectorRef.markForCheck();
                        });
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

    // Función para validar números y guion medio
    validarNumerosGuion(event: KeyboardEvent) {
        const charCode = (event.which) ? event.which : event.keyCode;
        // Permite solo números (0-9) y el guion medio (-)
        if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 45) {
        event.preventDefault();
        }
    }

    consultarCi(searchQuery: string): any{
        // Validar si el campo está vacío
        if (!searchQuery || searchQuery.trim() === '') {
            // Obtener proformas
            this._liquidacionService.getLiquidaciones().subscribe();
            // return this._proformaService.proformas$;
        }else{
            this._liquidacionService.getLiquidacionesSinPaginado(searchQuery).subscribe();
        }       
    }

    filterByQuery(query: string): void{
        //this.searchQuery$.next(query);
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

