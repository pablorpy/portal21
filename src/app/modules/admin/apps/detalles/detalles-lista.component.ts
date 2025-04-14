import { AsyncPipe, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet, registerLocaleData } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { BehaviorSubject, debounceTime, forkJoin, merge, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { DetalleDetalleModel, DetalleModel, DetallePagination } from './detalles.types';
import { DetallesService } from './detalles.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProformaModel } from '../proformas/proformas.types';
import { ProformasService } from '../proformas/proformas.service';
import { map } from 'rxjs/operators';
import { DominioModel, OpcionModel } from '../parametros/dominios/dominios.types';
import { DominiosService } from '../parametros/dominios/dominios.service';
import { CommonModule } from '@angular/common';
import { NgModule, LOCALE_ID } from '@angular/core'; // LOCALE_ID para cambiar el locale globalmente

import localeEs from '@angular/common/locales/es'; // Locale específico (en este caso, español)

// Registrar el locale que deseas (en este caso, español)
registerLocaleData(localeEs, 'es');

@Component({
    selector       : 'detalles-list',
    templateUrl    : './detalles-lista.component.html',
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
    imports        : [NgIf, MatProgressBarModule, CommonModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' } // Cambia a 'es' para el formato de España/América Latina
  ]
})
export class DetallesListaComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

    detalles$: Observable<DetalleModel[]>;
    detallesDetalles$: Observable<DetalleDetalleModel[]>;
    private _detalles = new BehaviorSubject<DetalleModel[]>([]); // Lista de DetalleModel
    detallesArray$: Observable<DetalleModel[]>;
    detalle$: Observable<DetalleModel>;
    valor$: Observable<DetalleModel>;

    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: DetallePagination;
    selectedDetalle: DetalleDetalleModel | null = null;
    selectedDetalleForm: UntypedFormGroup;
    selectedDetalleDetalleForm: UntypedFormGroup;
    selectedDetalles: DetalleDetalleModel[] | null = null; // Propiedad para almacenar una lista de detalles seleccionados
    estadosProforma: OpcionModel[] = []; 
    detalles: DetalleModel[];
    detallesA: DetalleModel[];
    flashMessage: 'success' | 'error' | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _detalleService: DetallesService,
        private proformaService: ProformasService,
        public dialogRef: MatDialogRef<DetallesListaComponent>,
        private _matDialog: MatDialog,
        private _dominioService: DominiosService,
        @Inject(MAT_DIALOG_DATA) public ProformaModelCabecera: ProformaModel
        //private _dominioService: DominiosService
        
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    
    // Método para actualizar el nombre de un detalle específico
    modificarItem(id: number, nuevoCosto: string): void {
        //cargar los estados de proforma
        this._dominioService.getEstadosProforma().subscribe((dominios) => {
            setTimeout(() => {
                if (dominios && Array.isArray(dominios)) {  // Verificamos que `dominios` esté definido y sea un array
                    this.estadosProforma = dominios; // Asignamos los datos a la variable
                } 
            });
        });
        
        //buscar coincidencia con la descripcion que recibimos
        const itemBuscado = this.estadosProforma.find((item) => item.descripcion === nuevoCosto);
       // console.log('item: '+itemBuscado)
        // Modificamos el objeto local.
        const detallesActualizados = this.detalles.map(detalles => {
          if (detalles.id === id) {
            return {
              ...detalles,
              estado: itemBuscado
            };
          }
          return detalles;
        });
    
        // Actualizamos la variable local con los detalles actualizados.
        this.detallesA = detallesActualizados;
       // console.log(this.detallesA)
      }

      onCheckboxChange(event: Event, id: number, monto: number): void {
        const input = event.target as HTMLInputElement;
        let nuevoEstado: string = "";

        if (input.checked) {
          nuevoEstado = 'ANULADA'
          this.ProformaModelCabecera.totalAPagar -= monto;
        } else {
          nuevoEstado = 'PENDIENTE'
          this.ProformaModelCabecera.totalAPagar += monto;
        }
        //buscar coincidencia con la descripcion que recibimos
        //console.log(this.estadosProforma)
        const itemBuscado = this.estadosProforma.find((item) => item.descripcion === nuevoEstado);
       // console.log(nuevoEstado + itemBuscado)
        // Modificamos el objeto local.
        const detallesActualizados = this.detalles.map(detalles => {
          if (detalles.id === id) {
            return {
              ...detalles,
              estado: itemBuscado
            };
          }
          return detalles;
        });
    
        // Actualizamos la variable local con los detalles actualizados.
        this.detallesA = detallesActualizados;
       // console.log(this.detallesA);
      }

    cargarEstadosProforma(): void {
            this._dominioService.getEstadosProforma().subscribe({
              next: (dominios) => {
                if (dominios && Array.isArray(dominios)) {
                  this.estadosProforma = dominios; // Asignamos los datos a la variable
                  this._changeDetectorRef.detectChanges(); // Notificar a Angular que verifique los cambios
                }
              },
              error: (err) => {
                console.error('Error al cargar los estados de proforma:', err); // Manejo de errores
              }
            });
    }

    ngOnInit(): void
    {
        // Create the selected product form
        this.selectedDetalleForm = this._formBuilder.group({
            id               : [{value:'', disabled:true}, [Validators.required]],
            costo           : ['', [Validators.required]],
            cantidad      : ['', [Validators.required]],
            conceptoDescripcion           : ['', [Validators.required]],
            
        });
        this.cargarEstadosProforma();

       //this.detalle$ = this._detalleService.detalle$;
       this.detallesArray$ = this._detalleService.detallesArray$;
       this.detallesArray$.subscribe(detalles => {
       this.detalles = [...detalles]; // Guardamos una copia de los datos para uso local.
      });
 
    }

    liquidarProforma() {
      forkJoin({
          ProformaDetalleDetalleModel: this._detalleService.getDetallesDetalles()
      }).subscribe(result => {
        //valdiar que detallesA sea utilizado (check)
        let detallesConDetalleDetalle
        if (this.detallesA && Array.isArray(this.detallesA)) {
          // Agrupamos los detalleDetalle bajo su respectivo detalle usando el ID de detalle (d)
           detallesConDetalleDetalle = this.detallesA.map(detalle => {
            return {
                ...detalle, // Mantenemos el detalle original
                ProformaDetalleDetalleModel: result.ProformaDetalleDetalleModel.filter(detalleDet => detalleDet.proformaDetalle.id === detalle.id) // Filtramos los detalleDetalle que pertenecen a este detalle
            };
        });
      } else {
          // Agrupamos los detalleDetalle bajo su respectivo detalle usando el ID de detalle
           detallesConDetalleDetalle = this.detalles.map(detalle => {
            return {
                ...detalle, // Mantenemos el detalle original
                ProformaDetalleDetalleModel: result.ProformaDetalleDetalleModel.filter(detalleDet => detalleDet.proformaDetalle.id === detalle.id) // Filtramos los detalleDetalle que pertenecen a este detalle
            };
        });
      }
      // Creamos el objeto combinado
      const ProformaCabeceraModel = {
        ...this.ProformaModelCabecera, // Incluimos la cabecera
        ProformaDetalleModel: detallesConDetalleDetalle // Incluimos los detalles junto con sus detalleDetalle
      };
  
      console.log('Objeto combinado:', ProformaCabeceraModel);

      const idsOnly = this.extractIds(ProformaCabeceraModel);
      console.log('objeto solo ids: ',idsOnly);
  
      this.proformaService.liquidarProforma(ProformaCabeceraModel).subscribe(
          response => {
            console.log('Proforma liquidada con éxito:', response);
          },error => {
            console.error('Error al liquidar la proforma:', error);
          }
        );
      }, error => {
          console.error('Error al obtener los detalles:', error);
      });
  }
  
  
  extractIds(obj: any): any {
    const result: any = {};
  
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null && 'id' in value) {
          result[key] = value.id;
        } else {
          result[key] = value; // Mantener otros valores
        }
      }
    }
  
    return result;
  }
      liquidarProforma_(proformaCabecera: ProformaModel) {
       // console.log(proformaCabecera);
      }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {

        //this.cargarEstadosProforma();
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

    formatDateString(inputDate: string): string {
        // Dividir la fecha en partes (año, mes, día)
        const parts = inputDate.split('/');
        
        // Crear una nueva fecha con las partes en el orden correcto
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        
        return formattedDate;
    }

    /**
     * Toggle product details
     *
     * @param id
     */
    toggleDetails(id: number): void
    {
        
        // If the product is already selected...
        if ( this.selectedDetalles && this.selectedDetalle.id === id )
            {
                console.log("entra en if");
                // Close the details
                this.closeDetails();
                return;
            }
            console.log("duera del if");
            console.log('selectedDetalle?.id:', this.selectedDetalle?.id);
    console.log('detalle.id:', id);
            // Get the product by id
       /* this._detalleService.getDetallesId_(id)
        .subscribe((detalle) =>
        {
            console.log(detalle);
        });*/

        // Obtener los detalles por id
    this._detalleService.getDetallesId_(id).subscribe((detalles) => {
        //console.log(detalles);
        this.selectedDetalles = detalles; // Asigna los detalles a la propiedad
       // console.log(this.selectedDetalles);
      });
    }

    enviarDatos(proform: ProformaModel): void {
        /*this.selectedDetalle = proform;
        this.valor$ = this._detalleService.getDetalleById(proform.id);
        this.valor$.subscribe(detalle => {
            console.log(detalle);
            this._detalleService.setDetalle(detalle); 
        });
        this._matDialog.open(DetallesListaComponent); */
    }

   
      
      
      
      
      

    /**
     * Close the details
     */
    closeDetails(): void
    {
        //this.selectedDetalles= null;
    }

    onClose(): void {
    this.dialogRef.close();
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

