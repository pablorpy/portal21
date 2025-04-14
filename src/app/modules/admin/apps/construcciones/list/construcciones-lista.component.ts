import { AsyncPipe, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { ConstruccionModel, ConstruccionPagination } from '../construcciones.types';
import { ConstruccionesService } from '../construcciones.service';


@Component({
    selector       : 'construcciones-list',
    templateUrl    : './construcciones-lista.component.html',
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
    imports        : [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
})
export class ConstruccionesListaComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    construcciones$: Observable<ConstruccionModel[]>;

    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: ConstruccionPagination;
    selectedConstruccion: ConstruccionModel | null = null;
    selectedConstruccionForm: UntypedFormGroup;

    flashMessage: 'success' | 'error' | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _construccionService: ConstruccionesService,
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
        this.selectedConstruccionForm = this._formBuilder.group({
            nroFilaConstruccion: [''],
            anioConstruccion: [''],
            area: [''],
            borrado: [''],
            categoriaConstruccion: [''],
            ctaCte: [''],
            obs: [''],
            tipoConstruccion: [''],
        });

     

        // Obtener la paginación
        this._construccionService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ConstruccionPagination) =>
            {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Obtener los dominios
        //this._construccionService.getConstrucciones_(0, 10, 'ctaCte', 'asc', '24-0143-09')
        this.construcciones$ = this._construccionService.construcciones$
       // this.construcciones$ = this._construccionService.getConstruccionByCtaCteArray_('24-0143-09');
       // console.log(this.construcciones$)    

       // 
        
        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) =>
                {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._construccionService.getConstrucciones_(0, 10, 'ctaCte', 'asc', query);
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
        if ( this._sort && this._paginator )
        {
            // Set the initial sort
            this._sort.sort({
                id          : 'descripcion',
                start       : 'asc',
                disableClear: true,
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();

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
                    return this._construccionService.getConstrucciones_(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() =>
                {
                    this.isLoading = false;
                }),
            ).subscribe();
        }
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
     * @param fila
     */
    toggleDetails(fila: number): void
    {
        // If the product is already selected...
        if ( this.selectedConstruccion && this.selectedConstruccion.nroFilaConstruccion === fila )
        {
            // Close the details
            this.closeDetails();
            return;
        }
        console.log('selectedConstruccion?.nroFilaConstruccion:', this.selectedConstruccion?.nroFilaConstruccion);
        console.log('detalle.id:', fila);

        // Get the product by id
        this._construccionService.getDominioByNFila(fila)
            .subscribe((construccion) =>
            {
                // Set the selected product
                this.selectedConstruccion = construccion;

                // Fill the form
                // this.selectedDominioForm.patchValue(dominio);
                this.selectedConstruccionForm.reset({
                    nroFilaConstruccion: construccion.nroFilaConstruccion,
                    ctaCte: construccion.ctaCte,
                    area: construccion.area,
                    borrado: construccion.borrado,
                    categoriaConstruccion: construccion.categoriaConstruccion,
                    anioConstruccion: construccion.anioConstruccion,
                    obs: construccion.obs,
                    tipoConstruccion: construccion.tipoConstruccion,
                });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedConstruccion = null;
    }

    /**
     * Crear nuevo dominio
     */
     agregarConstruccion(): void
    {
        // Create the product
        this._construccionService.createConstruccion().subscribe((newDominio) =>
        {
            // Go to new product
            this.selectedConstruccion = newDominio;

            // Fill the form
            this.selectedConstruccionForm.reset({
                id: newDominio.nroFilaConstruccion,
               
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();
            //this.selectedDominioForm.getRawValue().codigo.nativeElement.focus();
        });
    }

    /**
     * Update the selected product using the form data
     */
    updateSelectedConstruccion(): void
    {
        // Get the product object
     /*   const dominioForm = this.selectedDominioForm.getRawValue();
        const dominio: DominioModel = {
            id: dominioForm.id,
            codigo: dominioForm.codigo,
            descripcion: dominioForm.descripcion,
            estado: dominioForm.estado === true ? 'A' : 'I',
            dominioPadre: dominioForm.dominioPadre ? { id: dominioForm.dominioPadre } : null
        };
        console.log(dominio.descripcion);

        // Update the dominio on the server
        this._dominioService.updateDominio(dominioForm.id, dominio).subscribe(() =>
        {
            // Show a success message
            this.showFlashMessage('success');
        });*/
    }

    /**
     * Delete the selected product using the form data
     */
   /* deleteSelectedDominio(): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Eliminar Dominio',
            message: '¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer!',
            actions: {
                confirm: {
                    label: 'Eliminar',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) =>
        {
            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                // Get the product object
                const dominioForm = this.selectedDominioForm.getRawValue();

                // Delete the product on the server
                this._dominioService.deleteDominio(dominioForm.id).subscribe(() =>
                {
                    // Close the details
                    this.closeDetails();
                });
            }
        });
    }*/

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

