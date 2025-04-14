import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
//import { RegistrosService } from '../../registros.service';
//import { RegistroPagination, RegistroModel } from '../../registros-types';
//import { DominiosService } from '../../../parametros/dominios/dominios.service';
//import { ContribuyenteModel } from '../../../contribuyente/contribuyentes.types';
//import { ContribuyentesService } from '../../../contribuyente/contribuyentes.service';
import { MatDialog } from '@angular/material/dialog';
//import { ContribuyentesListaComponent } from '../../../contribuyente/contribuyentes/list/contribuyentes-lista.component';
//import { BuscarContribuyenteComponent } from '../../../buscar-contribuyente/buscar-contribuyente.component';
//import { OpcionModel } from '../../../parametros/dominios/dominios.types';
import { format, parse } from 'date-fns';
import { InmuebleModel, InmueblePagination } from './inmuebles-types';
import { InmueblesService } from './inmuebles.service';
import { BuscarContribuyenteComponent } from '../../buscar-contribuyente/buscar-contribuyente.component';
import { ContribuyentesService } from '../../contribuyente/contribuyentes.service';
import { DominiosService } from '../../parametros/dominios/dominios.service';
import { ContribuyenteModel } from '../../buscar-contribuyente/buscar-contribuyente.types';


@Component({
    selector       : 'inmuebles-list',
    templateUrl    : './inmuebles-lista-component.html',
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
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, 
        MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
})
export class InmueblesListaComponent implements OnInit, AfterViewInit, OnDestroy
{
    [x: string]: any;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild('nRegistro', { static: false }) nRegistro!: ElementRef;

    inmuebles$: Observable<InmuebleModel[]>;

    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: InmueblePagination;
    selectedInmueble: InmuebleModel | null = null;
    selectedContribuyente: ContribuyenteModel | null = null;
    selectedInmuebleForm: UntypedFormGroup;
   // categorias: OpcionModel[];
    public contribuyentes: ContribuyenteModel[];
    //gruposSanguineos: OpcionModel[];
   // conceptosPagos: OpcionModel[];
   // estadosRegistros: OpcionModel[];
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
        private _inmuebleService: InmueblesService,
        private _dominioService: DominiosService,
        private _contribuyenteService: ContribuyentesService,
        private _matDialog: MatDialog
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
        this.selectedInmuebleForm = this._formBuilder.group({
            id               : [{value:''}],
            ctaCorrientePadron           : ['', [Validators.required, this.maxLengthValidator(10)]],
            direccionInmueble      : ['', [Validators.required]],
            fincaInmueble           : ['', [this.maxLengthValidator(10), Validators.required]],
            contribuyente           : [''],
            pisoInmueble           : ['', [ this.maxLengthValidator(2), Validators.required]],
            dptoInmueble           : ['', [ this.maxLengthValidator(4), Validators.required]],
            numCasaInmueble       : ['', [Validators.required]],
            superficieEdificadoM2       : ['', [Validators.required]],
            superficieTierraM2       : ['', [Validators.required]],
            antiguedadEdificacion       : ['', [Validators.required]],
            metrosLinealNorte       : ['', [Validators.required]],
            metrosLinealSur       : ['', [Validators.required]],
            metrosLinealEste       : ['', [Validators.required]],
            metrosLinealOeste       : ['', [Validators.required]],
            cantidadPlantas           : ['', [Validators.required]],
            recoleccionBasura      : ['', [Validators.required]],
            barridoLimpieza           : ['', [Validators.required]],
            fechaInscripcion           : ['', [Validators.required]],
            longitud       : ['', [Validators.required]],
            latitud       : ['', [Validators.required]],
            anhoConstruccion       : ['', [Validators.required]],
            zonaCatastro       : ['', [Validators.required]],
            manzanaCatastro       : ['', [Validators.required]],
            loteCatastro       : ['', [Validators.required]],
            pisoCatastro       : ['', [Validators.required]],
            salonCatastro       : ['', [Validators.required]],
            padronCatastro       : ['', [Validators.required]],
            categoriaEdificacion : ['', [Validators.required]],
            superficieTierraHa : ['', [Validators.required]],
            nombreContribuyente: [{value:''}, [Validators.required]],
            apellidoContribuyente: [{value:''}]
        });
        // Obtener la paginación
        this._inmuebleService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: InmueblePagination) =>
            {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Obtener
        this.inmuebles$ = this._inmuebleService.inmuebles$

        // Subscribe to   input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) =>
                {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._inmuebleService.getInmuebles(0, 10, 'id', 'asc', query);
                }),
                map(() =>
                {
                    this.isLoading = false;
                }),
            )
            .subscribe();
    }

    openComposeDialog(): void
    {
        // Open the dialog
        const dialogRef = this._matDialog.open(BuscarContribuyenteComponent); 
    
        dialogRef.afterClosed()
            .subscribe((result) =>
            {
                if (result) {
                    this.selectedContribuyente = result;
                    if (this.selectedContribuyente) {
                        this.selectedContribuyente.contribuyente = result;
                    }
    
                    this.selectedInmuebleForm.patchValue({
                        contribuyente: result.id,
                        nombreContribuyente: result.nombre,
                        apellidoContribuyente: result.apellido
                    });
                   // this.focusInput();
                }
            });
    }
    
    focusInput() {
        setTimeout(() => {
          if (this.nRegistro) {
            this.nRegistro.nativeElement.focus();
          }
        }, 0);
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
                    return this._inmuebleService.getInmuebles(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() =>
                {
                    this.isLoading = false;
                }),
            ).subscribe();
          /*  this.getGruposSanguineos();
            this.getCategoriasRegistros();
            this.getConceptosPagos();
            this.getEstadosRegistros();*/
            //console.log(this.registros.id);
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
    toggleDetails(id: string): void
    {
       //     console.log("toggleDetails");
        // If the product is already selected...
        if ( this.selectedInmueble && this.selectedInmueble.id === id )
        {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the product by id
            this._inmuebleService.getInmuebleById(id)
            .subscribe((inmueble) =>
            {
                // Set the selected product
                this.selectedInmueble = inmueble;
               // console.log(inmueble.fechaInscripcion);
                this.selectedInmuebleForm.reset({
                    id: inmueble.id,
                    ctaCorrientePadron: inmueble.ctaCorrientePadron ? inmueble.ctaCorrientePadron : null,
                    direccionInmueble: inmueble.direccionInmueble ? inmueble.direccionInmueble : null,
                    fincaInmueble: inmueble.fincaInmueble ? inmueble.fincaInmueble : null,
                    pisoInmueble: inmueble.pisoInmueble ? inmueble.pisoInmueble : null,
                    dptoInmueble: inmueble.dptoInmueble ? inmueble.dptoInmueble : null,
                    numCasaInmueble: inmueble.numCasaInmueble ? inmueble.numCasaInmueble : null,
                    superficieEdificadoM2: inmueble.superficieEdificadoM2 ? inmueble.superficieEdificadoM2 : null,
                    superficieTierraM2: inmueble.superficieTierraM2 ? inmueble.superficieTierraM2 : null,
                    antiguedadEdificacion: inmueble.antiguedadEdificacion ? inmueble.antiguedadEdificacion : null,
                    metrosLinealNorte: inmueble.metrosLinealNorte ? inmueble.metrosLinealNorte : null,
                    metrosLinealSur: inmueble.metrosLinealSur ? inmueble.metrosLinealSur : null,
                    metrosLinealEste: inmueble.metrosLinealEste ? inmueble.metrosLinealEste : null,
                    metrosLinealOeste: inmueble.metrosLinealOeste ? inmueble.metrosLinealOeste : null,
                    cantidadPlantas: inmueble.cantidadPlantas ? inmueble.cantidadPlantas : null,
                    superficieTierraHa: inmueble.superficieTierraHa ? inmueble.superficieTierraHa : null,
                    barridoLimpieza: inmueble.barridoLimpieza ? inmueble.barridoLimpieza : null,
                    longitud: inmueble.longitud ? inmueble.longitud : null,
                    latitud: inmueble.latitud ? inmueble.latitud : null,
                    anhoConstruccion: inmueble.anhoConstruccion ? inmueble.anhoConstruccion : null,
                    zonaCatastro: inmueble.zonaCatastro ? inmueble.zonaCatastro : null,
                    manzanaCatastro: inmueble.manzanaCatastro ? inmueble.manzanaCatastro : null,
                    loteCatastro: inmueble.loteCatastro ? inmueble.loteCatastro : null,
                    pisoCatastro: inmueble.pisoCatastro ? inmueble.pisoCatastro : null,
                    salonCatastro: inmueble.salonCatastro ? inmueble.salonCatastro : null,
                    padronCatastro: inmueble.padronCatastro ? inmueble.padronCatastro : null,
                    contribuyente: inmueble.contribuyente ? inmueble.contribuyente.id : null,
                    recoleccionBasura: inmueble.recoleccionBasura === true,
                    //fechaInscripcion: inmueble.fechaInscripcion !== null ? this.formatDateStringBarras(inmueble.fechaInscripcion) : null,
                    categoriaEdificacion: inmueble.categoriaEdificacion ? inmueble.categoriaEdificacion.id : null,
                    nombreContribuyente: inmueble.contribuyente ? inmueble.contribuyente.nombre : null,
                    apellidoContribuyente: inmueble.contribuyente ? inmueble.contribuyente.apellido : null,
                    fechaInscripcion: (inmueble.fechaInscripcion)
                });
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            this.getCategoriasEdificaciones();
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedInmueble= null;
        this.isActualizarDisabled = true;
    }

    /**
     * Crear nuevo 
     */
     agregarInmueble(): void
    {
        this.getCategoriasEdificaciones();
        //al dar clic en agregar, se habilita el boton buscar contribuyente
        this.isActualizarDisabled = false;
        // Create the product
        this._inmuebleService.createInmueble().subscribe((newInmueble) =>
        {
            // Go to new product
            this.selectedInmueble = newInmueble;

            // Fill the form
            this.selectedInmuebleForm.reset({
                id: newInmueble.id,
                ctaCorrientePadron: newInmueble.ctaCorrientePadron,
                fechaInscripcion: newInmueble.fechaInscripcion,
                categoriaEdificacion: newInmueble.categoriaEdificacion ? {id: newInmueble.categoriaEdificacion} : null,
                contribuyente: newInmueble.contribuyente ? {id: newInmueble.contribuyente} : null,
                direccionInmueble: newInmueble.direccionInmueble,
                recoleccionBasura: newInmueble.recoleccionBasura === true,
                fincaInmueble: newInmueble.fincaInmueble,
                pisoInmueble: newInmueble.pisoInmueble,
                dptoInmueble: newInmueble.dptoInmueble,
                numCasaInmueble: newInmueble.numCasaInmueble,
                superficieEdificadoM2: newInmueble.superficieEdificadoM2,
                superficieTierraM2: newInmueble.superficieTierraM2,
                antiguedadEdificacion: newInmueble.antiguedadEdificacion,
                metrosLinealNorte: newInmueble.metrosLinealNorte,
                metrosLinealSur: newInmueble.metrosLinealSur,
                metrosLinealEste: newInmueble.metrosLinealEste,
                metrosLinealOeste: newInmueble.metrosLinealOeste,
                cantidadPlantas: newInmueble.cantidadPlantas,
                superficieTierraHa: newInmueble.superficieTierraHa,
                barridoLimpieza: newInmueble.barridoLimpieza,
                longitud: newInmueble.longitud,
                latitud: newInmueble.latitud,
                anhoConstruccion: newInmueble.anhoConstruccion,
                zonaCatastro: newInmueble.zonaCatastro,
                manzanaCatastro: newInmueble.manzanaCatastro,
                loteCatastro: newInmueble.loteCatastro,
                pisoCatastro: newInmueble.pisoCatastro,
                salonCatastro: newInmueble.salonCatastro,
                padronCatastro: newInmueble.padronCatastro
              //  nombreContribuyente: newRegistro.contribuyente ? newRegistro.contribuyente.nombre : null,
              //  apellidoContribuyente: newRegistro.contribuyente ? newRegistro.contribuyente.apellido : null
       
            });
            // Mark for check
            this._changeDetectorRef.markForCheck();
           // this.selectedContribuyenteForm.getRawValue().codigo.nativeElement.focus();
        });
    }

    formatDateStringBarras(inputDate: string): string {
        //console.log("fecha recibida: ",inputDate);
        // Dividir la fecha en partes (año, mes, día)
        const parts = inputDate.split('-');
        
        // Crear una nueva fecha con las partes en el orden correcto
        const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        //console.log("fecha salida: ",formattedDate);
        return formattedDate;
    }

    formatDateString(inputDate: string): string {
        // Dividir la fecha en partes (año, mes, día)
        //console.log(inputDate);
        const parts = inputDate.split('/');
        
        // Crear una nueva fecha con las partes en el orden correcto
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        //console.log(formattedDate);
        return formattedDate;
    }

    formatDateString_2(inputDate: string): string {
        //console.log("fecha recibida_2: ",inputDate);
        // Dividir la fecha en partes (año, mes, día)
        const parts = inputDate.split('-');
        
        // Crear una nueva fecha con las partes en el orden correcto
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
       // console.log("fecha salida_2: ",formattedDate);
        return formattedDate;
    }

    markAsTouched(control) {
        if (control) {
          control.markAsTouched();
        }
      }


    updateSelectedInmueble(): void
    {
        // Get the product object
        const inmuebleForm = this.selectedInmuebleForm.getRawValue();
        const inmueble: InmuebleModel = {
                    id: inmuebleForm.id/*,
                    fechaExpedicion: registroForm.fechaExpedicion,
                    grupoSanguineo: registroForm.grupoSanguineo ? {id: registroForm.grupoSanguineo} : null,
                    categoria: registroForm.categoria ? {id: registroForm.categoria} : null,
                    contribuyente: registroForm.contribuyente ? {id: registroForm.contribuyente} : null,
                    numeroRegistro: registroForm.numeroRegistro,
                    examenVistaOido: registroForm.examenVistaOido === true,
                    examenTeoricoPractico: registroForm.examenTeoricoPractico === true,
                    numeroPasaporte: registroForm.numeroPasaporte,
                    carnetInmigracion: registroForm.carnetInmigracion,
                    fechaRenovacion: registroForm.fechaRenovacion,
                    fechaValidez: registroForm.fechaValidez,
                    conceptoPago: registroForm.conceptoPago ? {id: registroForm.conceptoPago} : null,
                    fechaCancelacion: registroForm.fechaCancelacion,
                    estadoRegistro: registroForm.estadoRegistro ? {id: registroForm.estadoRegistro} : null,   */       
        };
       // console.log("actualizacion: " + contribuyente.estadoCivil);
       //console.log("grupo sanguineo: "+registro.grupoSanguineo);
       //console.log("categoria: "+registro.categoria.id);
        // Update the dominio on the server
        this._inmuebleService.updateInmueble(inmueble).subscribe(() =>
        {
        //     Show a success message
           this.showFlashMessage('success');
        });
    }

    /**
     * Delete the selected product using the form data
     */
   /* deleteSelectedContribuyente(): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Eliminar Contribuyente',
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
                const contribuyenteForm = this.selectedContribuyenteForm.getRawValue();

                // Delete the product on the server
                this._contribuyenteService.deleteContribuyente(contribuyenteForm.id).subscribe(() =>
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

    getCategoriasEdificaciones(): void
    {
        this._dominioService.getCategoriasEdificaciones()
        .subscribe((categoriasEdificaciones) =>
        {
            // Set the selected product
            this.categoriasEdificaciones = categoriasEdificaciones;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getGruposSanguineos(): void
    {
        this._dominioService.getGruposSanguineos()
        .subscribe((gruposSanguineos) =>
        {
            // Set the selected product
            this.gruposSanguineos = gruposSanguineos;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getConceptosPagos(): void
    {
        this._dominioService.getConceptosPagos()
        .subscribe((conceptosPagos) =>
        {
            // Set the selected product
            this.conceptosPagos = conceptosPagos;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getEstadosRegistros(): void
    {
        this._dominioService.getEstadosRegistros()
        .subscribe((estadosRegistros) =>
        {
            // Set the selected product
            this.estadosRegistros = estadosRegistros;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getContribuyentes(): void
    {
        this._contribuyenteService.getContribuyentes()
        .subscribe((contribuyentes) =>
        {
            // Set the selected product
            this.contribuyentes = contribuyentes;

            // Mark for check
          //  this._changeDetectorRef.markForCheck();
        });
    }
    

     maxLengthValidator(maxLength: number): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
          if (!control.value) {
            return null; // No hay valor, así que no hay error
          }
          const actualLength = control.value.length;
          return actualLength > maxLength ? { maxLength: { requiredLength: maxLength, actualLength } } : null;
        };
      }

        // Método para obtener el mensaje de error
  getErrorMessage(field: string): string {
    const control = this.selectedInmuebleForm.get(field);
    if (control.hasError('maxLength')) {
      const error = control.getError('maxLength');
      //return `El campo no puede tener más de 2 caracteres.`;
      return `Valor máximo: ${error.requiredLength} caracteres. (Actual: ${error.actualLength})`;
   
    }
    return '';
  }
}


