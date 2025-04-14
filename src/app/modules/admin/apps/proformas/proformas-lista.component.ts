import { AsyncPipe, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterContentChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { debounceTime, map, merge, Observable, Subject, switchMap, take, takeUntil } from 'rxjs';
import { ProformaModel, ProformaPagination } from './proformas.types';
import { ProformasService } from './proformas.service';
import { MatDialog } from '@angular/material/dialog';
import { BuscarContribuyenteComponent } from '../buscar-contribuyente/buscar-contribuyente.component';
import { DetallesListaComponent } from '../detalles/detalles-lista.component';
import { DetalleModel } from '../detalles/detalles.types';
import { DetallesService } from '../detalles/detalles.service';
import { ProformasPrintComponent } from './print/proformas-print.component';
@Component({
    selector       : 'proformas-list',
    templateUrl    : './proformas-lista.component.html',
    styles         : [
        /* language=SCSS */
        `
            .inventory-grid {
                grid-template-columns: auto 72px;

                @screen sm {
                    grid-template-columns: 110px auto 72px;
                }

                @screen md {
                    grid-template-columns: 110px auto 72px 72px;
                }

                @screen lg {
                    grid-template-columns: 110px auto 72px 72px;
                }
            }
        `,
    ],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations,
    standalone     : true,
    imports        : [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, 
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, 
        MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
})
export class ProformasListaComponent implements OnInit, AfterViewInit, OnDestroy, AfterContentChecked
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    proformas$: Observable<ProformaModel[]>;
    detalles$: Observable<DetalleModel[]>;
    valor$: Observable<DetalleModel[]>;

    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: ProformaPagination;
    selectedProforma: ProformaModel | null = null;
    selectedProformaForm: UntypedFormGroup;
   // dominiosPadre: DominioModel[];

    flashMessage: 'success' | 'error' | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    detalles: any;
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _proformaService: ProformasService,
        private _matDialog: MatDialog,
        private _detalleService: DetallesService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    
    ngAfterContentChecked(): void {
        this._changeDetectorRef.detectChanges();
      }
    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the selected product form
        this.selectedProformaForm = this._formBuilder.group({
            id               : [''],
            ruc           : ['', [Validators.required]],
            nombre_apellido      : ['', [Validators.required]],
            contribuyente     : [''],
            estado     : [''],
            total     : [''],
            montoDescuento     : [''],
        });

        // Obtener la paginación
        this._proformaService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ProformaPagination) =>
            {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Obtener proformas
        this.proformas$ = this._proformaService.proformas$;
        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
        .pipe(
            takeUntil(this._unsubscribeAll),
            debounceTime(300),
            switchMap((query) => {
                this.closeDetails();
                this.isLoading = true;
    
                // Validar si el campo está vacío
                if (!query || query.trim() === '') {
                    this.isLoading = false;
                    return this._proformaService.proformas$;  // Devuelve un observable vacío
                }
                return this._proformaService.getProformasSinPaginado(query);
            }),
            map(() => {
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
        if ( this._sort && this._paginator )
        {
            // Set the initial sort
            this._sort.sort({
                id          : 'id',
                start       : 'asc',
                disableClear: true,
            });

            // Mark for check
           // this._changeDetectorRef.markForCheck();

            // If the user changes the sort order...
            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() =>
                {
                    // Reset back to the first page
                    this._paginator.pageIndex = 0;

                    // Close the details
                    this.closeDetails();
                });

            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() =>
                {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._proformaService.getProformas(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() =>
                {
                    this.isLoading = false;
                }),
            ).subscribe();

        }
    }

    consultarCi(searchQuery: string): any{
        // Validar si el campo está vacío
        if (!searchQuery || searchQuery.trim() === '') {
            // Obtener proformas
            this._proformaService.getProformas().subscribe();
           // return this._proformaService.proformas$;
        }else{
            this._proformaService.getProformasSinPaginado(searchQuery).subscribe();
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
          // this.searchQuery$.next(query);
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
    // ----------------------------------------------------------------------------------------------------

          /**
     * Toggle product details
     *
     * @param id
     */

            enviarDatos(proform: ProformaModel): void {
                this.selectedProforma = proform;
            
                // Obtener el detalle asociado con la proforma
                this.valor$ = this._detalleService.getDetalleByIdArray(proform.id);
            
                // Suscribirse para obtener el detalle
                this.valor$.pipe(take(1)).subscribe(
                    detalleArray => {
                        if (detalleArray && detalleArray.length > 0) {
                            this._detalleService.setDetalle(detalleArray);
            
                            // Utilizar setTimeout para forzar la detección de cambios
                            setTimeout(() => {
                                // Abrir el diálogo con los datos de la proforma
                                this._matDialog.open(DetallesListaComponent, {
                                    data: proform
                                });
                            });
            
                        } else {
                            console.warn('detalleArray está vacío o no tiene datos.');
                        }
                    },
                    error => {
                        console.error('Error al obtener el detalle:', error);
                        // Manejar el error (mostrar notificación, etc.)
                    }
                );
            }
            
     
    
            
    print(proform: ProformaModel): void {
            this._matDialog.open(ProformasPrintComponent); 
    }
        
    /*
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedProforma = null;
    }

    /**
     * Show flash message
     */
    showFlashMessage(type: 'success' | 'error'): void
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

