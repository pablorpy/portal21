import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
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
import { RegistrosService } from '../../registros.service';
import { RegistroPagination, RegistroModel } from '../../registros-types';
import { DominiosService } from '../../../parametros/dominios/dominios.service';
import { ContribuyenteModel } from '../../../contribuyente/contribuyentes.types';
import { ContribuyentesService } from '../../../contribuyente/contribuyentes.service';
import { MatDialog } from '@angular/material/dialog';
import { ContribuyentesListaComponent } from '../../../contribuyente/contribuyentes/list/contribuyentes-lista.component';
import { BuscarContribuyenteComponent } from '../../../buscar-contribuyente/buscar-contribuyente.component';
import { OpcionModel } from '../../../parametros/dominios/dominios.types';
import { format, parse } from 'date-fns';


@Component({
    selector       : 'registros-list',
    templateUrl    : './registros-lista-component.html',
    styleUrl       : './registros-lista-component.scss',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations,
    standalone     : true,
    imports        : [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, 
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, 
        MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
})
export class RegistrosListaComponent implements OnInit, AfterViewInit, OnDestroy
{
    [x: string]: any;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild('nRegistro', { static: false }) nRegistro!: ElementRef;

    registros$: Observable<RegistroModel[]>;

    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: RegistroPagination;
    selectedRegistro: RegistroModel | null = null;
    selectedContribuyente: ContribuyenteModel | null = null;
    selectedRegistroForm: UntypedFormGroup;
    categorias: OpcionModel[];
    public contribuyentes: ContribuyenteModel[];
    gruposSanguineos: OpcionModel[];
    conceptosPagos: OpcionModel[];
    estadosRegistros: OpcionModel[];
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
        private _registroService: RegistrosService,
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
        this.selectedRegistroForm = this._formBuilder.group({
            id               : [{value:'', disabled:true}],
           // id               : ['', [Validators.required]],
            fechaExpedicion           : ['', [Validators.required]],
            numeroRegistro      : [''],
            categoria           : ['', [Validators.required]],
            contribuyente           : ['', [Validators.required]],
            grupoSanguineo           : ['', [Validators.required]],
            examenVistaOido           : ['', [Validators.required]],
            examenTeoricoPractico       : ['', [Validators.required]],
            numeroPasaporte       : ['', [Validators.required]],
            carnetInmigracion       : ['', [Validators.required]],
            fechaRenovacion       : ['', [Validators.required]],
            fechaValidez       : ['', [Validators.required]],
            conceptoPago       : ['', [Validators.required]],
            fechaCancelacion: [''],
            estadoRegistro       : ['', [Validators.required]],
            nombreContribuyente: ['', [Validators.required]],
            apellidoContribuyente: ['']
            
        });

        
        // Obtener la paginación
        this._registroService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: RegistroPagination) =>
            {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Obtener los dominios
        this.registros$ = this._registroService.registros$
        //alert(this.contribuyentes$);
        console.log(this.registros$);
        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) =>
                {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._registroService.getRegistros(0, 10, 'id', 'asc', query);
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
        const dialogRef = this._matDialog.open(BuscarContribuyenteComponent); //ContribuyentesListaComponent  //MailboxComposeComponent
    
        dialogRef.afterClosed()
            .subscribe((result) =>
            {
                if (result) {
                    this.selectedContribuyente = result;
                    if (this.selectedRegistro) {
                        this.selectedRegistro.contribuyente = result;
                    }
    
                    this.selectedRegistroForm.patchValue({
                        contribuyente: result.id,
                        nombreContribuyente: result.nombre,
                        apellidoContribuyente: result.apellido
                    });
                    this.focusInput();
                }
            });
    
        this.getGruposSanguineos();
        this.getCategoriasRegistros();
        this.getConceptosPagos();
        this.getEstadosRegistros();
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
                    return this._registroService.getRegistros(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() =>
                {
                    this.isLoading = false;
                }),
            ).subscribe();
            this.getGruposSanguineos();
            this.getCategoriasRegistros();
            this.getConceptosPagos();
            this.getEstadosRegistros();
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
    toggleDetails(id: string): void
    {
        // If the product is already selected...
        if ( this.selectedRegistro && this.selectedRegistro.id === id )
        {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the product by id
        this.getGruposSanguineos();
        this.getCategoriasRegistros();
        this.getConceptosPagos();
        this.getEstadosRegistros();

        // Get the product by id
            this._registroService.getRegistroById(id)
            .subscribe((registro) =>
            {
                // Set the selected product
                this.selectedRegistro = registro;
               
                this.selectedRegistroForm.reset({
                    id: registro.id,
                    fechaExpedicion: registro.fechaExpedicion !== null ? this.formatDateString(registro.fechaExpedicion) : null,
                    grupoSanguineo: registro.grupoSanguineo ? registro.grupoSanguineo.id : null,
                    categoria: registro.categoria ? registro.categoria.id : null,
                    contribuyente: registro.contribuyente ? registro.contribuyente.id : null,
                    numeroRegistro: registro.numeroRegistro,
                    examenVistaOido: registro.examenVistaOido === true,
                    examenTeoricoPractico: registro.examenTeoricoPractico === true,
                    numeroPasaporte: registro.numeroPasaporte,
                    carnetInmigracion: registro.carnetInmigracion,
                    fechaRenovacion: registro.fechaRenovacion !== null ? this.formatDateString(registro.fechaRenovacion) : null,
                    fechaValidez: registro.fechaValidez !== null ? this.formatDateString(registro.fechaValidez) : null,
                    conceptoPago: registro.conceptoPago ? registro.conceptoPago.id : null,
                    fechaCancelacion: registro.fechaCancelacion !== null ? this.formatDateString(registro.fechaCancelacion) : null,
                    estadoRegistro: registro.estadoRegistro ? registro.estadoRegistro.id : null,
                    nombreContribuyente: registro.contribuyente ? registro.contribuyente.nombre : null,
                    apellidoContribuyente: registro.contribuyente ? registro.contribuyente.apellido : null
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
        this.selectedRegistro= null;
        this.isActualizarDisabled = true;
    }

    /**
     * Crear nuevo registro
     */
     agregarRegistro(): void
    {
        //al dar clic en agregar, se habilita el boton buscar contribuyente
        this.isActualizarDisabled = false;
        // Create the product
        this._registroService.createRegistro().subscribe((newRegistro) =>
        {
            // Go to new product
            this.selectedRegistro = newRegistro;

            // Fill the form
            this.selectedRegistroForm.reset({
                id: newRegistro.id,
                fechaExpedicion: newRegistro.fechaExpedicion,
                grupoSanguineo: newRegistro.grupoSanguineo ? newRegistro.grupoSanguineo.id : null,
                categoria: newRegistro.categoria ? {id: newRegistro.categoria} : null,
                contribuyente: newRegistro.contribuyente ? {id: newRegistro.contribuyente} : null,
                numeroRegistro: newRegistro.numeroRegistro,
                examenVistaOido: newRegistro.examenVistaOido === true,
                examenTeoricoPractico: newRegistro.examenTeoricoPractico === true,
                numeroPasaporte: newRegistro.numeroPasaporte,
                carnetInmigracion: newRegistro.carnetInmigracion,
                fechaRenovacion: newRegistro.fechaRenovacion,
                fechaValidez: newRegistro.fechaValidez,
                conceptoPago: newRegistro.conceptoPago ? {id: newRegistro.conceptoPago} : null,
                fechaCancelacion: newRegistro.fechaCancelacion,
                estadoRegistro: newRegistro.estadoRegistro ? {id: newRegistro.estadoRegistro} : null, 
                nombreContribuyente: newRegistro.contribuyente ? newRegistro.contribuyente.nombre : null,
                apellidoContribuyente: newRegistro.contribuyente ? newRegistro.contribuyente.apellido : null
       
            });
            //enviar fecha actual al campo fecha expedicion
            const fechaActual = new Date().toISOString().substring(0, 10); // Formato YYYY-MM-DD
            this.selectedRegistroForm.get('fechaExpedicion')?.setValue(fechaActual);
            //enviar fecha actual * tiempo determinado al campo fecha validez
            // Obtener la fecha actual
            const fechaActual_ = new Date();
            // Agregar 5 años a la fecha actual
            fechaActual_.setFullYear(fechaActual_.getFullYear() + 5);
            // Convertir la fecha a formato YYYY-MM-DD
            const fechaCon5Anios = fechaActual_.toISOString().substring(0, 10);
            // Asignar la nueva fecha al FormControl
            this.selectedRegistroForm.get('fechaValidez')?.setValue(fechaCon5Anios);

            // Mark for check
            this._changeDetectorRef.markForCheck();
           // this.selectedContribuyenteForm.getRawValue().codigo.nativeElement.focus();
        });
    }

    formatDateStringBarras(inputDate: string): string {
        // Dividir la fecha en partes (año, mes, día)
        const parts = inputDate.split('-');
        
        // Crear una nueva fecha con las partes en el orden correcto
        const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        
        return formattedDate;
    }

    markAsTouched(control) {
        if (control) {
          control.markAsTouched();
        }
      }


    updateSelectedRegistro(): void
    {
    // Marcar el formulario como tocado para activar los validadores
    this.selectedRegistroForm.markAllAsTouched();

    // Verificar si el formulario es válido
    if (this.selectedRegistroForm.invalid) {
        // Mostrar un mensaje de error
        this.showFlashMessage('validacion');
        return;
    }

    // Obtener el objeto registro del formulario
    const registroForm = this.selectedRegistroForm.getRawValue();
    const registro: RegistroModel = {
        id: registroForm.id,
        fechaExpedicion: registroForm.fechaExpedicion !== null ? this.formatDateStringBarras(registroForm.fechaExpedicion) : null,
        grupoSanguineo: registroForm.grupoSanguineo ? {id: registroForm.grupoSanguineo} : null,
        categoria: registroForm.categoria ? {id: registroForm.categoria} : null,
        contribuyente: registroForm.contribuyente ? {id: registroForm.contribuyente} : null,
        numeroRegistro: registroForm.numeroRegistro,
        examenVistaOido: registroForm.examenVistaOido === true,
        examenTeoricoPractico: registroForm.examenTeoricoPractico === true,
        numeroPasaporte: registroForm.numeroPasaporte,
        carnetInmigracion: registroForm.carnetInmigracion,
        fechaRenovacion: registroForm.fechaRenovacion !== null ? this.formatDateStringBarras(registroForm.fechaRenovacion) : null,
        fechaValidez: registroForm.fechaValidez !== null ? this.formatDateStringBarras(registroForm.fechaValidez) : null,
        conceptoPago: registroForm.conceptoPago ? {id: registroForm.conceptoPago} : null,
        fechaCancelacion: registroForm.fechaCancelacion !== null ? this.formatDateStringBarras(registroForm.fechaCancelacion) : null,
        estadoRegistro: registroForm.estadoRegistro ? {id: registroForm.estadoRegistro} : null,
    };

    // Actualizar el registro
    this._registroService.updateRegistro(registroForm.id, registro).subscribe(() => {
        // Mostrar un mensaje de éxito
        this.showFlashMessage('success');
        this.isActualizarDisabled = true;
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

    getCategoriasRegistros(): void
    {
        this._dominioService.getCategoriasRegistros()
        .subscribe((categorias) =>
        {
            // Set the selected product
            this.categorias = categorias;

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

}

