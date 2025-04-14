import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
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
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DimensionModel } from '../buscar-dimension.types';
import { DimensionPagination } from '../buscar-dimension.types';
import { DimensionService } from '../buscar-dimension.service';

@Component({
    selector       : 'buscar-dimension',
    templateUrl    : './buscar-dimension-component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations,
    standalone     : true,
    imports        : [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, 
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, 
        MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe],
})
export class BuscarDimensionComponent implements OnInit
{
    dimensiones$: Observable<DimensionModel[]>;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: DimensionPagination;
    selectedDimension: DimensionModel | null = null;
    selectedDimensionForm: UntypedFormGroup;
    isActualizarDisabled: boolean = true;

    flashMessage: 'success' | 'error' | 'validacion' | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    orientaciones = [
        { id: '1', descripcion: 'Norte' },
        { id: '2', descripcion: 'Sur' },
        { id: '3', descripcion: 'Este' },
        { id: '4', descripcion: 'Oeste' },
        { id: '5', descripcion: 'Norte-Este' },
        { id: '6', descripcion: 'Norte-Oeste' },
        { id: '7', descripcion: 'Sur-Este' },
        { id: '8', descripcion: 'Sur-Oeste' }
      ];
    calles = [
        { id: '1', descripcion: 'RUTA INTERNACIONAL' },
        { id: '10', descripcion: 'HORMIGON ARMADO' },
        { id: '11', descripcion: 'ADOQUINADO DE GRANITO' },
        { id: '12', descripcion: 'ADOQUINADO DE CEMENTO' },
        { id: '13', descripcion: 'LINDERO' },
        { id: '2', descripcion: 'ASFALTADO' },
        { id: '4', descripcion: 'EMPEDRADO' },
        { id: '5', descripcion: 'RIPIO' },
        { id: '6', descripcion: 'TIERRA' },
        { id: '8', descripcion: 'NH' },
      ];
    callesPrincipales = [
        { id: 'S', descripcion: 'SI' },
        { id: 'N', descripcion: 'NO' }
      ];
    frentes = [
        { id: 'S', descripcion: 'SI' },
        { id: 'N', descripcion: 'NO' }
      ];
    categoriasZonas  = [
        { id: '00', descripcion: 'A VERIFICAR'  },
        { id: '1', descripcion: 'ZONA URBANA' },
        { id: '2', descripcion: 'ZONA SUBURBANA' },
        { id: '3', descripcion: 'ZONA PERIFERICA' }
      ];

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _dimensionService: DimensionService,
        public dialogRef: MatDialogRef<BuscarDimensionComponent>,
        @Inject(MAT_DIALOG_DATA) public data: string,
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
        this.selectedDimensionForm = this._formBuilder.group({
            dimension              : [''],
            ctaCte           : ['', [Validators.required]],
            tramoCalle           : ['', [Validators.required]],
            categoriaZona           : ['', [Validators.required]],
            calle           : ['', [Validators.required]],
            callePrincipal           : ['', [Validators.required]],
            frentes           : ['', [Validators.required]],
            areaDimension   : ['', [Validators.required]],
            orientacion           : ['', [Validators.required]],
            observacion   : ['', [Validators.required]],
            posicion   : ['', [Validators.required]],
            borrado           : [''],
            desdeAnio   : [''],          
        });
       this.dimensiones$ = this._dimensionService.dimensiones$
       this.dimensiones$.subscribe(() => {
        // Forzar la detección de cambios inmediatamente
        this._changeDetectorRef.detectChanges();
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

    closeDialog(): void {
        this.dialogRef.close(); // Cierra el modal
    }

    markAsTouched(control) {
        if (control) {
          control.markAsTouched();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle product details
     *
     * @param valor
     */
    toggleDetails(valor: number): void
    {
        console.log(valor);
        // If the product is already selected...
        if ( this.selectedDimension && this.selectedDimension.dimension === valor )
        {
            // Close the details
            this.closeDetails();
            return;
        }
        // Get the product by id
            this._dimensionService.getDimension(valor)
            .subscribe((dimension) =>
            {
                // Set the selected product
                this.selectedDimension = dimension;
                this.selectedDimensionForm.reset({
                    dimension: dimension.dimension ? dimension.dimension : null,
                        ctaCte: dimension.ctaCte ? dimension.ctaCte : null,
                        tramoCalle: dimension.tramoCalle ? dimension.tramoCalle : null,
                        categoriaZona: dimension.categoriaZona ? dimension.categoriaZona : null,
                        calle: dimension.calle ? dimension.calle : null,
                        callePrincipal: dimension.callePrincipal ? dimension.callePrincipal : null,
                        frentes: dimension.frentes ? dimension.frentes : null,
                        areaDimension: dimension.areaDimension ? dimension.areaDimension : null, 
                        orientacion: dimension.orientacion ? dimension.orientacion : null,
                        observacion: dimension.observacion ? dimension.observacion : null,
                        borrado: dimension.borrado ? dimension.borrado : null,
                        desdeAnio: dimension.desdeAnio ? dimension.desdeAnio : null,
                        posicion: dimension.posicion ? dimension.posicion : null,
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
        this.selectedDimension= null;
    }

    /**
     * Crear nuevo registro
     */
    agregarDimension(): void
    {
        // Create the product
        this._dimensionService.createDimension().subscribe((newDimension) =>
        {
            // Go to new product
            this.selectedDimension = newDimension;
            console.log("entra en add dimension");
            // Fill the form
            this.selectedDimensionForm.reset({
                dimension: newDimension.dimension,
                areaDimension: newDimension.areaDimension,
                borrado: newDimension.borrado,
                calle: newDimension.calle,
                callePrincipal: newDimension.callePrincipal,
                categoriaZona: newDimension.categoriaZona,
                ctaCte: this.data,
                desdeAnio: newDimension.desdeAnio,
                frentes: newDimension.frentes,
                observacion: newDimension.observacion,
                orientacion: newDimension.orientacion,
                posicion: newDimension.posicion,
                tramoCalle: newDimension.tramoCalle,
            });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    updateSelectedDimension(): void{
        // Marcar el formulario como tocado para activar los validadores
        this.selectedDimensionForm.markAllAsTouched();

        // Verificar si el formulario es válido
        if (this.selectedDimensionForm.invalid) {
            // Mostrar un mensaje de error
            this.showFlashMessage('validacion');
            return;
        }

        // Obtener el objeto registro del formulario
        const dimensionForm = this.selectedDimensionForm.getRawValue();
        const dimension: DimensionModel = {
            dimension: dimensionForm.dimension,
            areaDimension: dimensionForm.areaDimension,
            borrado: dimensionForm.borrado,
            calle: dimensionForm.calle,
            callePrincipal: dimensionForm.callePrincipal,
            categoriaZona: dimensionForm.categoriaZona,
            ctaCte: this.data,
            desdeAnio: dimensionForm.desdeAnio,
            frentes: dimensionForm.frentes,
            observacion: dimensionForm.observacion,
            orientacion: dimensionForm.orientacion,
            posicion: dimensionForm.posicion,
            tramoCalle: dimensionForm.tramoCalle,
            utm1x: '',
            utm1y: '',
            utm2x: '',
            utm2y: ''
        };

        // Actualizar el registro
        this._dimensionService.updateDimension(dimensionForm.dimension, dimension).subscribe(updatedConstruccion => {
            // Mostrar un mensaje de éxito
            console.log(updatedConstruccion);
            this.showFlashMessage('success');
        });
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

