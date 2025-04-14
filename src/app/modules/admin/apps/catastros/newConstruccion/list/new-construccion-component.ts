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


@Component({
    selector       : 'new-construccion',
    templateUrl    : './new-construccion-component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations,
    standalone     : true,
    imports        : [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, 
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, 
        MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe, CommonModule],
})
export class NewConstruccionComponent implements OnInit, AfterViewInit, OnDestroy
{
   /* [x: string]: any;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    construcciones$: Observable<ConstruccionModel[]>;
   // construccion$: Observable<ConstruccionModel>;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: ConstruccionPagination;
    selectedConstruccion: ConstruccionModel | null = null;
    
    isActualizarDisabled: boolean = true;

    flashMessage: 'success' | 'error' | 'validacion' | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();*/

   // @Input() construccionArray: ConstruccionModel[] = []; // Recibimos el array desde el componente principal
    @Output() updateConstruccion = new EventEmitter<ConstruccionModel[]>(); 
    @ViewChild('categoriaConstruccion') categoriaConstruccion!: ElementRef;  // Usamos ViewChild para acceder al input

    public ctaCte: string;
    public construccionArray: ConstruccionModel[] = [];
    public construccionForm: FormGroup; // Formulario reactivo
    //selectedConstruccion: ConstruccionModel | null = null;
    selectedConstruccionForm: UntypedFormGroup;
    flashMessage: string;
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

     // construcciones$: Observable<ConstruccionModel[]>;
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
       // private _construccionService: ConstruccionService,
       private _construccionService: ConstruccionService,
        public dialogRef: MatDialogRef<NewConstruccionComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { ctaCte: string, construccionArray: ConstruccionModel[] }
        //@Inject(MAT_DIALOG_DATA) public data: string,
    )
    {
        // Recibir el array vacío o los datos y asignarlo a la propiedad del modal
        this.ctaCte = data.ctaCte;
        this.construccionArray = data.construccionArray || [];  // Asegúrate de inicializarlo como un array vacío si no se pasa nada
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    addConstruccion(): void {
        if (this.construccionForm.valid) {
              const newConstruccion = this.construccionForm.value;
              this.construccionArray.push(newConstruccion);  // Agregar al array

                this.construccionForm.reset({
                    nroFilaConstruccion: null,
                    anioConstruccion: 0,
                    area: null,
                    borrado: 'N',  // Aseguramos que el valor de 'borrado' sea 'N'
                    categoriaConstruccion: '',
                    ctaCte: '',
                    obs: '',
                    tipoConstruccion: ''
                });
              this.construccionForm.markAsUntouched();
        } else {
            console.error('Formulario no válido');
        }
    }
          
          
    focusNroFila(): void {
        if (this.categoriaConstruccion) {
              this.categoriaConstruccion.nativeElement.focus();  // Establecer el foco en el campo
        }
    }
          

    closeDialog(): void {
        this.dialogRef.close(this.construccionArray); // Cierra el modal
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Inicializamos el formulario
    this.construccionForm = this._formBuilder.group({
        nroFilaConstruccion: [''],
        anioConstruccion: ['0', [Validators.required]],
        area: ['', [Validators.required]], 
        borrado: ['N', Validators.required],
        categoriaConstruccion: ['', Validators.required],
        ctaCte: [''],
        obs:  ['', Validators.required],
        tipoConstruccion: ['', Validators.required]
      });
      /*this._construccionService.getConstruccionByCtaCteArray('24-0045-12').subscribe({
        next: (construcciones) => {
          // Mostrar el resultado por consola
          console.log('Construcciones obtenidas:', construcciones);
        },
        error: (err) => {
          // Manejo de errores
          console.error('Error al obtener construcciones:', err);
        }
      });*/

    /*  this.construcciones$ = this._construccionService.getConstruccionByCtaCteArray(this.ctaCte);
      console.log(this.construcciones$);*/
    }

 

    markAsTouched(control) {
        if (control) {
          control.markAsTouched();
        }
      }
    /**
     * After view init
     */
    ngAfterViewInit(): void
    {
        /*if ( this._sort && this._paginator )
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
                    return this._construccionService.getConstrucciones(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() =>
                {
                    this.isLoading = false;
                }),
            ).subscribe();
        } */
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        //this._unsubscribeAll.next(null);
       // this._unsubscribeAll.complete();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.construccionForm= null;
    }

    /**
     * Crear nuevo registro
     */
    agregarConstruccion(): void
    {
        // Create the product
       /* this._construccionService.createConstruccion().subscribe((newConstruccion) =>
        {
            // Go to new product
            this.selectedConstruccion = newConstruccion;

            // Fill the form
            this.selectedConstruccionForm.reset({
                nroFilaConstruccion: newConstruccion.nroFilaConstruccion,
                anioConstruccion: 2025,
                area: newConstruccion.area,
                borrado: 'N',
                categoriaConstruccion: newConstruccion.categoriaConstruccion,
                ctaCte: this.data,
                obs: newConstruccion.obs,
                tipoConstruccion: newConstruccion.tipoConstruccion
            });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });*/
    }


    updateSelectedConstruccion(): void{
      /*  // Marcar el formulario como tocado para activar los validadores
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
        };*/

        // Actualizar el registro
       /* this._construccionService.updateCOnstruccion(construccionForm.nroFilaConstruccion, construccion).subscribe(() => {
            // Mostrar un mensaje de éxito
            this.showFlashMessage('success');
        });*/
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

