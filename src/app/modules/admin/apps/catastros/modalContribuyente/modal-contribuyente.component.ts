import { AsyncPipe, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, FormGroup, FormBuilder } from '@angular/forms';
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
import { MatDialogRef } from '@angular/material/dialog';

import { DominiosService } from '../../parametros/dominios/dominios.service';
import { ContribuyenteModel, ContribuyentePagination } from '../../v2/contribuyentes/contribuyentes.types';
import { v2ContribuyentesService } from '../../v2/contribuyentes/v2-contribuyentes.service';


@Component({
    selector       : 'modal-contribuyente',
    templateUrl    : './modal-contribuyente.component.html',
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
export class ModalContribuyenteComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    contribuyentes$: Observable<ContribuyenteModel[]>;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: ContribuyentePagination;
    selectedContribuyente: ContribuyenteModel | null = null;
    selectedContribuyenteForm: UntypedFormGroup;

    flashMessage: 'success' | 'error' | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _contribuyenteService: v2ContribuyentesService,
        private _dominioService: DominiosService,
        public dialogRef: MatDialogRef<ModalContribuyenteComponent>
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
        this.selectedContribuyenteForm = this._formBuilder.group({
            rmc           : ['', [Validators.required]],
            nombreContribuyente      : ['', [Validators.required]],
            apellidoContribuyente           : ['', [Validators.required]],
            direccionContribuyente           : ['', [Validators.required]],
           /* nacionalidad           : ['', [Validators.required]],
            estadoCivil           : ['', [Validators.required]],
            tipoContribuyente       : ['', [Validators.required]],
            ciudad       : ['', [Validators.required]],
            barrio       : ['', [Validators.required]],
            estado       : ['', [Validators.required]],
            categoriaContribuyente       : ['', [Validators.required]],
            genero       : ['', [Validators.required]],
            cedulaIdentidad       : ['', [Validators.required]],
            fechaNacimiento       : ['', [Validators.required]],
            celular       : ['', [Validators.required]],
            telefono       : ['', [Validators.required]],
            correoElectronico       : ['', [Validators.required]],*/
        });

        // Obtener la paginación
        this._contribuyenteService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: ContribuyentePagination) =>
            {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
                
            });
        
        // Obtener los contribuyentes
        this.contribuyentes$ = this._contribuyenteService.contribuyentes$
        // Forzar la detección de cambios usando setTimeout
        this.contribuyentes$.subscribe(() => {
            setTimeout(() => {
            this._changeDetectorRef.detectChanges();
            }, 0);
        });

        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) =>
                {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._contribuyenteService.getContribuyentes(0, 10, 'id', 'asc', query);
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
                id          : 'id',
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
                    return this._contribuyenteService.getContribuyentes(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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
     * @param id
     */

      /**
     * Toggle product details
     *
     * @param id
     */
      enviarDatos(contrib: ContribuyenteModel): void
      {
        this.selectedContribuyente = contrib;
        this.dialogRef.close(contrib);
      }


    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedContribuyente= null;
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

