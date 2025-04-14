import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation, inject } from '@angular/core';
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
import { ConstruccionModel, ConstruccionPagination } from '../buscar-construccion.types';
import { ConstruccionService } from '../buscar-construccion.service';

@Component({
    selector       : 'buscar-construccion',
    templateUrl    : './buscar-construccion-component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations,
    standalone     : true,
    imports        : [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, 
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, 
        MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
})
export class BuscarConstruccionComponent implements OnInit, OnDestroy
{
    construcciones$: Observable<ConstruccionModel[]>;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: ConstruccionPagination;
    selectedConstruccion: ConstruccionModel | null = null;
    selectedConstruccionForm: UntypedFormGroup;
    isActualizarDisabled: boolean = true;
    flashMessage: 'success' | 'error' | 'validacion' | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

  //  @Output() updateConstruccion = new EventEmitter<ConstruccionModel[]>(); 

    tipoConstrucciones = [
        { id: 'AA', descripcion: 'A - ANTIGUA' },
        { id: 'AN', descripcion: 'A - NUEVA' },
        { id: 'BA', descripcion: 'B - ANTIGUA' },
        { id: 'BN', descripcion: 'B - NUEVA' },
        { id: 'CA', descripcion: 'C - ANTIGUA' },
        { id: 'CN', descripcion: 'C - NUEVA' },
        { id: 'DO', descripcion: 'D - A VERIFICAR' },
        { id: 'DA', descripcion: 'D - ANTIGUA' },
        { id: 'DN', descripcion: 'D - NUEVA' },
        { id: 'EA', descripcion: 'E - ANTIGUA' },
        { id: 'EN', descripcion: 'E - NUEVA' },
        { id: 'FA', descripcion: 'ESTACIONAMIENTO F - ANTIGUA' },
        { id: 'FN', descripcion: 'ESTACIONAMIENTO F - NUEVA' },
        { id: 'NN', descripcion: 'NO IDENTIFICADO' },
        { id: 'RA', descripcion: 'R - ANTIGUA' },
        { id: 'RN', descripcion: 'R - NUEVA' },
        { id: 'GA', descripcion: 'TINGLADO,GALPON G - ANTIGUA' },
        { id: 'GN', descripcion: 'TINGLADO,GALPON G - NUEVA' },
        { id: 'HA', descripcion: 'TINGLADO,GALPON H - ANTIGUA' },
        { id: 'HN', descripcion: 'TINGLADO,GALPON H - NUEVA' },
      ];
    categoriaConstrucciones  = [
        { id: 'CA', descripcion: 'ADMINISTRATIVO'  },
        { id: 'CE', descripcion: 'EDUCACIONAL' },
        { id: 'CO', descripcion: 'COMERCIO' },
        { id: 'CS', descripcion: 'SALUD' },
        { id: 'CT', descripcion: 'COMUNITARIO'  },
        { id: 'DE', descripcion: 'DEPOSITO' },
        { id: 'ED', descripcion: 'EDUCATIVO' },
        { id: 'ES', descripcion: 'ESTACIONAMIENTO AUTOVEHICULO' },
        { id: 'ET', descripcion: 'ESTATAL'  },
        { id: 'FA', descripcion: 'FABRICA' },
        { id: 'GA', descripcion: 'GALPON' },
        { id: 'IN', descripcion: 'INDUSTRIAL' },
        { id: 'MI', descripcion: 'MIXTO'  },
        { id: 'NE', descripcion: 'COMERCIAL' },
        { id: 'NN', descripcion: 'NO IDENTIFICADO' },
        { id: 'RT', descripcion: 'RECREATIVO' },
        { id: 'SI', descripcion: 'SILO' },
        { id: 'SP', descripcion: 'SERVICIO PUBLICO' },
        { id: 'SV', descripcion: 'SERVICIO'  },
        { id: 'TA', descripcion: 'TAMBO' },
        { id: 'TI', descripcion: 'TINGLADO' },
        { id: 'VI', descripcion: 'VIVIENDA' }
      ];

      public ctaCte: string;
      public construccionArray: ConstruccionModel[] = [];
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _construccionService: ConstruccionService,
        public dialogRef: MatDialogRef<BuscarConstruccionComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { ctaCte: string, construccionArray: ConstruccionModel[] }
    )
    {
        this.ctaCte = data.ctaCte;
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
            nroFilaConstruccion               : [''],
            ctaCte:  ['', [Validators.required]],
            area: ['', [Validators.required]],
            borrado: ['', [Validators.required]],
            categoriaConstruccion: ['', [Validators.required]],
            anioConstruccion: ['', [Validators.required]],
            obs: ['', [Validators.required]],
            tipoConstruccion: ['', [Validators.required]],            
        });
        //cargar la variable
        this.construcciones$ = this._construccionService.construcciones$;
        this.construcciones$.subscribe(() => {
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle product details
     *
     * @param n_fila
     */
    toggleDetails(n_fila: number): void
    {
        // If the product is already selected...
        if ( this.selectedConstruccion && this.selectedConstruccion.nroFilaConstruccion === n_fila )
        {
            // Close the details
            this.closeDetails();
            return;
        }
        // Get the product by id
            this._construccionService.getConstruccionByNFila(n_fila)
            .subscribe((construccion) =>
            {
                // Set the selected product
                this.selectedConstruccion = construccion;
                console.log("entra en get");
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
        this.selectedConstruccion= null;
        this.isActualizarDisabled = true;
    }

    /**
     * Crear nuevo registro
     */
    agregarConstruccion(): void
    {
        // Create the product
        this._construccionService.createConstruccion().subscribe((newConstruccion) =>
        {
            // Go to new product
            this.selectedConstruccion = newConstruccion;

            // Fill the form
            this.selectedConstruccionForm.reset({
                nroFilaConstruccion: newConstruccion.nroFilaConstruccion,
                anioConstruccion: newConstruccion.anioConstruccion,
                area: newConstruccion.area,
                borrado: newConstruccion.borrado,
                categoriaConstruccion: newConstruccion.categoriaConstruccion,
                ctaCte: this.data,
                obs: newConstruccion.obs,
                tipoConstruccion: newConstruccion.tipoConstruccion
            });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    markAsTouched(control) {
        if (control) {
          control.markAsTouched();
        }
      }

    updateSelectedConstruccion(): void{
        // Marcar el formulario como tocado para activar los validadores
        this.selectedConstruccionForm.markAllAsTouched();

        // Verificar si el formulario es válido
        if (this.selectedConstruccionForm.invalid) {
            // Mostrar un mensaje de error
            this.showFlashMessage('validacion');
            return;
        }

        // Obtener el objeto registro del formulario
        const construccionForm = this.selectedConstruccionForm.getRawValue();
        const construccion: ConstruccionModel = {
            nroFilaConstruccion: construccionForm.nroFilaConstruccion,
            anioConstruccion: 2025,
            area: construccionForm.area,
            borrado: 'N',
            categoriaConstruccion: construccionForm.categoriaConstruccion,
            ctaCte: construccionForm.ctaCte,
            obs: construccionForm.obs,
            tipoConstruccion: construccionForm.tipoConstruccion
        };
        // Actualizar el registro
        this._construccionService.updateCOnstruccion(construccionForm.nroFilaConstruccion, construccion).subscribe(() => {
            // Mostrar un mensaje de éxito
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

