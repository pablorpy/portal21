import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConstruccionModel } from '../../modalConstruccion/buscar-construccion.types';
import { CommonModule } from '@angular/common';  // Importa CommonModule
import { DimensionModel } from '../../modalDimension/buscar-dimension.types';
import { DimensionService } from '../../modalDimension/buscar-dimension.service';
import { Observable } from 'rxjs';
import { ConstruccionService } from '../../modalConstruccion/buscar-construccion.service';
import { SuperficieModel } from '../../modalSuperficie/buscar-superficie.types';


@Component({
    selector       : 'new-superficie',
    templateUrl    : './new-superficie-component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations,
    standalone     : true,
    imports        : [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, 
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, 
        MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe, CommonModule],
})
export class NewSuperficieComponent implements OnInit, AfterViewInit 
{
    @Output() updateSuperficie = new EventEmitter<SuperficieModel[]>(); 
   // @ViewChild('nroFilaInput') nroFilaInput!: ElementRef;  // Usamos ViewChild para acceder al input
   @ViewChild('subZonaInput') subZonaInput!: ElementRef; // Referencia al campo Sub Zona

    public ctaCte: string;
    public superficieArray: SuperficieModel[] = [];
    public superficieForm: FormGroup; // Formulario reactivo
    //selectedConstruccion: ConstruccionModel | null = null;
    selectedSuperficieForm: UntypedFormGroup;
    flashMessage: string;
    

    superficies$: Observable<SuperficieModel[]>;
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        // private _construccionService: ConstruccionService,
       // private _superficieService: SuperficieModel,
        public dialogRef: MatDialogRef<NewSuperficieComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { ctaCte: string, superficieArray: SuperficieModel[] }
        //@Inject(MAT_DIALOG_DATA) public data: string,
    )
    {
        // Recibir el array vacío o los datos y asignarlo a la propiedad del modal
        this.ctaCte = data.ctaCte;
        this.superficieArray = data.superficieArray || [];  // Asegúrate de inicializarlo como un array vacío si no se pasa nada
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    addSuperficie(): void {
        if (this.superficieForm.valid) {
            const newSuperficie = this.superficieForm.value;
            this.superficieArray.push(newSuperficie);  // Agregar al array
            // Limpiar el formulario después de agregar
            this.superficieForm.reset({
                id: null,
                borrado: 'N',
                ctaCte: null,
                posicion: 1,
                subZona: null,
                superficieHa: null,
                superficieM2: null
            });
            this.superficieForm.markAsUntouched();
        } else {
            console.error('Formulario no válido');
        }
    }         

    closeDialog(): void {
        this.dialogRef.close(this.superficieArray); // Cierra el modal
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Inicializamos el formulario
        this.superficieForm = this._formBuilder.group({
            id              : [''],
            ctaCte           : [''],
            borrado           : ['N', [Validators.required]],
            subZona           : ['', [Validators.required]],
            superficieHa           : ['', [Validators.required]],
            superficieM2           : ['', [Validators.required]],
            posicion   : ['1', [Validators.required]], 
        });
    }

    ngAfterViewInit(): void {
        // Usamos setTimeout para asegurar que Angular haya terminado de inicializar el formulario antes de aplicar el foco
    setTimeout(() => {
        this.subZonaInput.nativeElement.focus();
      }, 0);  // Con retraso 0, pero aseguramos que Angular haya actualizado el DOM.
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

