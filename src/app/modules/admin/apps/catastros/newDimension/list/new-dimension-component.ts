import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';  // Importa CommonModule
import { Observable, Subject } from 'rxjs';
import { DimensionModel } from '../../modalDimension/buscar-dimension.types';
import { DimensionService } from '../../modalDimension/buscar-dimension.service';


@Component({
    selector       : 'new-dimension',
    templateUrl    : './new-dimension-component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations,
    standalone     : true,
    imports        : [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, 
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, 
        MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe, CommonModule],
})
export class NewDimensionComponent implements OnInit, AfterViewInit, OnDestroy
{

    @Output() updateDimension = new EventEmitter<DimensionModel[]>(); 

    public ctaCte: string;
    public dimensionArray: DimensionModel[] = [];
    public dimensionForm: FormGroup; // Formulario reactivo
    //selectedConstruccion: ConstruccionModel | null = null;
    selectedDimensionForm: UntypedFormGroup;
   // dimensiones$: Observable<DimensionModel[]>;
    flashMessage: 'success' | 'error' | 'validacion' | null = null;
  

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
       // private _construccionService: ConstruccionService,
        private _dimensionService: DimensionService,
        public dialogRef: MatDialogRef<NewDimensionComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { ctaCte: string, dimensionArray: DimensionModel[] }
    )
    {
        // Recibir el array vacío o los datos y asignarlo a la propiedad del modal
        this.ctaCte = data.ctaCte;
        this.dimensionArray = data.dimensionArray || [];  // Asegúrate de inicializarlo como un array vacío si no se pasa nada
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    addDimension(): void {
            if (this.dimensionForm.valid) {
              const newDimension = this.dimensionForm.value;
              this.dimensionArray.push(newDimension);  // Agregar al array
          
             // this.focusNroFila();
               // Limpiar el formulario después de agregar
                this.dimensionForm.reset({
                    dimension: newDimension.dimension,
                    areaDimension: newDimension.areaDimension,
                    borrado: newDimension.borrado,
                    calle: newDimension.calle,
                    callePrincipal: newDimension.callePrincipal,
                    categoriaZona: newDimension.categoriaZona,
                    ctaCte: null,
                    desdeAnio: newDimension.desdeAnio,
                    frentes: newDimension.frentes,
                    observacion: newDimension.observacion,
                    orientacion: newDimension.orientacion,
                    posicion: newDimension.posicion,
                    tramoCalle: newDimension.tramoCalle,
                });
              this.dimensionForm.markAsUntouched(); // Restablecer el estado "touched" (tildado en rojo)
              this.closeDetails();
            } else {
              console.error('Formulario no válido');
            }
    }

    closeDialog(): void {
        this.dialogRef.close(this.dimensionArray); // Cierra el modal
    }

    markAsTouched(control) {
      if (control) {
        control.markAsTouched();
      }
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Inicializamos el formulario
    this.dimensionForm = this._formBuilder.group({
        dimension              : [''],
        ctaCte           : [''],
        tramoCalle           : ['', [Validators.required]],
        categoriaZona           : ['', [Validators.required]],
        calle           : ['', [Validators.required]],
        callePrincipal           : ['', [Validators.required]],
        frentes           : ['', [Validators.required]],
        areaDimension   : ['', [Validators.required]],
        orientacion           : ['', [Validators.required]],
        observacion   : ['', [Validators.required]],
        posicion   : ['1', [Validators.required]],
        borrado           : ['N'],
        desdeAnio   : ['0'], 
      });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
      
    }
    

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
      //  this._unsubscribeAll.next(null);
     //   this._unsubscribeAll.complete();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedDimensionForm= null;
      //  this.isActualizarDisabled = true;
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

