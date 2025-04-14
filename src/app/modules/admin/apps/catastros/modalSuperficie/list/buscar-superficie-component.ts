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
import { SuperficieModel, SuperficiePagination } from '../buscar-superficie.types';
import { SuperficieService } from '../buscar-superficie.service';

@Component({
    selector       : 'buscar-superficie',
    templateUrl    : './buscar-superficie-component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations,
    standalone     : true,
    imports        : [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, 
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, 
        MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe],
})
export class BuscarSuperficieComponent implements OnInit
{
    superficies$: Observable<SuperficieModel[]>;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: SuperficiePagination;
    selectedSuperficie: SuperficieModel | null = null;
    selectedSuperficieForm: UntypedFormGroup;
    isActualizarDisabled: boolean = true;

    flashMessage: 'success' | 'error' | 'validacion' | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _superficieService: SuperficieService,
        public dialogRef: MatDialogRef<BuscarSuperficieComponent>,
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
        this.selectedSuperficieForm = this._formBuilder.group({
            id              : [''],
            ctaCte           : ['', [Validators.required]],
            borrado           : ['', [Validators.required]],
            subZona           : ['', [Validators.required]],
            superficieHa           : ['', [Validators.required]],
            superficieM2           : ['', [Validators.required]],
            posicion   : ['', [Validators.required]],          
        });

       this.superficies$ = this._superficieService.superficies$
       this.superficies$.subscribe(() => {
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
        // If the product is already selected...
        if ( this.selectedSuperficie && this.selectedSuperficie.id === valor )
        {
            // Close the details
            this.closeDetails();
            return;
        }
        // Get the product by id
            this._superficieService.getSuperficie(valor)
            .subscribe((superficie) =>
            {
                // Set the selected product
                this.selectedSuperficie = superficie;
                this.selectedSuperficieForm.reset({
                    id: superficie.id ? superficie.id : null,
                    ctaCte: superficie.ctaCte ? superficie.ctaCte : null,
                    superficieHa: superficie.superficieHa ? superficie.superficieHa : null,
                    superficieM2: superficie.superficieM2 ? superficie.superficieM2 : null,
                    borrado: superficie.borrado ? superficie.borrado : null,
                    posicion: superficie.posicion ? superficie.posicion : null,
                    subZona: superficie.subZona ? superficie.subZona : null,
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
        this.selectedSuperficie= null;
    }

    /**
     * Crear nuevo registro
     */
    agregarSuperficie(): void
    {
        // Create the product
        this._superficieService.createSuperficie().subscribe((newSuperficie) =>
        {
            // Go to new product
            this.selectedSuperficie = newSuperficie;
            // Fill the form
            this.selectedSuperficieForm.reset({
                id: newSuperficie.id,
                borrado: newSuperficie.borrado,
                ctaCte: this.data,
                subZona: newSuperficie.subZona,
                superficieHa: newSuperficie.superficieHa,
                superficieM2: newSuperficie.superficieM2,
                posicion: newSuperficie.posicion,
            });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    updateSelectedSuperficie(): void{
        // Marcar el formulario como tocado para activar los validadores
        this.selectedSuperficieForm.markAllAsTouched();

        // Verificar si el formulario es válido
        if (this.selectedSuperficieForm.invalid) {
            // Mostrar un mensaje de error
            this.showFlashMessage('validacion');
            return;
        }

        // Obtener el objeto registro del formulario
        const superficieForm = this.selectedSuperficieForm.getRawValue();
        const superficie: SuperficieModel = {
            id: superficieForm.id,
            borrado: superficieForm.borrado,
            ctaCte: superficieForm.ctaCte,
            posicion: superficieForm.posicion,
            subZona: superficieForm.subZona,
            superficieHa: superficieForm.superficieHa,
            superficieM2: superficieForm.superficieM2
        };

        // Actualizar el registro
        this._superficieService.updateSuperficie(superficieForm.id, superficie).subscribe(valor => {
            // Mostrar un mensaje de éxito
            console.log(valor);
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

