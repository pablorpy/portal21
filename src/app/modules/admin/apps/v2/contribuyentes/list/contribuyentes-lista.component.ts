import { NgIf, NgFor, NgTemplateOutlet, NgClass, AsyncPipe, CurrencyPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS, MatNativeDateModule, MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { fuseAnimations } from '@fuse/animations';
import { Observable, Subject, debounceTime, map, merge, switchMap, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { BarriosV2Model, CiudadesV2Model, ContribuyenteModel, ContribuyentePagination, EstadosCivilesV2Model, NacionalidadesV2Model, SexosV2Model, TiposContribuyentesV2Model, TiposDocContribuyentesV2Model } from '../contribuyentes.types';

import { v2ContribuyentesService } from '../v2-contribuyentes.service';

import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';


// Define el formato de fecha
export const MY_FORMATS = {
    parse: {
      dateInput: 'DD/MM/YYYY',
    },
    display: {
      dateInput: 'DD/MM/YYYY',
      monthYearLabel: 'MMMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY',
    },
  };

@Component({
    selector: 'contribuyentes-list',
    templateUrl: './v2-contribuyentes-lista.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, 
        MatDatepickerModule, MatInputModule, FormsModule, ReactiveFormsModule, 
        MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, 
        NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe,
        //agregado para las fechas
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatMomentDateModule],
       
        providers: [
            { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
            { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
            { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
            [DatePipe]
          ]
})
export class v2ContribuyentesListaComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild('ci', { static: false }) ci!: ElementRef;

    contribuyentes$: Observable<ContribuyenteModel[]>;

    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: ContribuyentePagination;
    selectedContribuyente: ContribuyenteModel | null = null;
    selectedContribuyenteFormv2: UntypedFormGroup;
    nacionalidades: NacionalidadesV2Model[];
    estadosCiviles: EstadosCivilesV2Model[];
    tiposContribuyentes: TiposContribuyentesV2Model[];
    tiposDocContribuyentes: TiposDocContribuyentesV2Model[];
    sexos: SexosV2Model[];
    ciudades: CiudadesV2Model[];
    barriosV2: BarriosV2Model[];
   // estados: OpcionModel[];
   // categoriasContribuyentes: OpcionModel[];
   // generos: OpcionModel[];

    flashMessage: 'success' | 'error' | 'validacion' | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedRegistro: any;
    selectedRegistroForm: any;

    public mask = {
        guide: true,
        showMask : true,
        mask: [/\d/, /\d/, '/', /\d/, /\d/, '/',/\d/, /\d/,/\d/, /\d/]
      };
      
    
    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _contribuyenteService: v2ContribuyentesService,
        // private _dominioService: DominiosService,
        private _matDialog: MatDialog,
        private datePipe: DatePipe,
    )
    {
        moment.locale('es');  // Configura moment para usar el idioma español
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
        this.selectedContribuyenteFormv2 = this._formBuilder.group({
            rmc               : [{value:'', disabled:true}],
            ci       : [null],
            nombreContribuyente      : [''],
            razonSocialContribuyente: [''],
            apellidoContribuyente: [''],
            fechaNacimiento: [''],
            fechaClauContribuyente : [''],
            fechaInscripcionContribuyente: [''],
            apellidoCasadoContribuyente: [''],
            ciFull: [''],
            codCiudad       : [''],
            codBarrio       : [''],
            codNacionalidad       : [''],
            estadoCivilContribuyente       : [''],
            direccionContribuyente: [''],
            lugarNacimiento        : [''],
            email                    : [''],
            observacion        : [''],
            ruc                    : [''],
            documento                    : [''],
            difunto                    : [''],
            docExtranjero                    : [''],
            fcDifunto                  :[''],
            grupoSanguineo             :[''],
            nacContribuyente           :[''],
            migrado                    :[''],
            nroCasa                    :[''],
            rmcOld                     :[''],
            sexoContribuyente   : [''],
            tipoContribuyente   : [''],
            tipoDocumento   : [''],
            telefonoContribuyente   : [''],
            /*rmc           : ['', [Validators.required]],
            nombre      : ['', [Validators.required]],
            apellido           : ['', [Validators.required]],
            direccion           : ['', [Validators.required]],
            nacionalidad           : ['', [Validators.required]],
            estadoCivil           : ['', [Validators.required]],
            tipoContribuyente       : ['', [Validators.required]],
            
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
        
        //alert(this.contribuyentes$);
        console.log(this.contribuyentes$);
        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) =>
                {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._contribuyenteService.getContribuyentes(0, 10, 'rmc', 'asc', query);
                }),
                map(() =>
                {
                    this.isLoading = false;
                }),
            )
            .subscribe();
            this._contribuyenteService.getCiudadesV2();
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

           // this.getNacionalidades();
            this.getCiudades();
            this.getBarrios();
            this.getNacionalidades();
            this.getEstadosCiviles();
            this.getTiposContribuyentes();
            this.getTiposDocContribuyentes();
            this.getSexos();
          //  this.getEstadosCiviles();
          //  this.getGeneros();
           // this.getTiposContribuyentes();
          //  this.getCategorias();
          //  this.getEstados();
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

    formatDateStringBarras(inputDate: string): string {
        // Dividir la fecha en partes (año, mes, día)
        const parts = inputDate.split('-');
        
        // Crear una nueva fecha con las partes en el orden correcto
        const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        
        return formattedDate;
    }

    formatDate(inputDate: string): string {
        // La fecha inputDate se espera que esté en formato ISO 8601 (por ejemplo, 'yyyy-MM-ddTHH:mm:ss.sssZ')
    const formattedDate = inputDate.split('T')[0];

    // Se retorna la fecha formateada en el formato 'yyyy-MM-dd'
    return formattedDate;
    }

    /**
     * Toggle product details
     *
     * @param rmc
     */
    toggleDetails(rmc: number): void
    {
        // If the product is already selected...
        if ( this.selectedContribuyente && this.selectedContribuyente.rmc === rmc )
        {
            // Close the details
            this.closeDetails();
            return;
        }
            this.getCiudades();
            this.getBarrios();
            this.getNacionalidades();
            this.getEstadosCiviles();
            this.getTiposContribuyentes();
            this.getTiposDocContribuyentes();
            this.getSexos(); 
            this._contribuyenteService.getContribuyenteByRmc(rmc)
            .subscribe((contribuyente) =>
            {
                // Set the selected product
                this.selectedContribuyente = contribuyente;
                console.log(this.selectedContribuyente.tipoDocumento)
                const barrioSeleccionado = this.tiposDocContribuyentes.find(barrio => barrio.id === this.selectedContribuyente.tipoDocumento);
                if (barrioSeleccionado) {
                    console.log('documento encontrada:', barrioSeleccionado);
                } else {
                    console.log('No se encontró el documento');
                }

                this.selectedContribuyenteFormv2.reset({
                    rmc: contribuyente.rmc,
                    ci: contribuyente.ci,
                    nombreContribuyente: contribuyente.nombreContribuyente,
                    razonSocialContribuyente: contribuyente.razonSocialContribuyente,
                    apellidoContribuyente: contribuyente.apellidoContribuyente,
                    fechaNacimiento: contribuyente.fechaNacimiento ? this.formatDate(contribuyente.fechaNacimiento) : null,
                    fechaClauContribuyente: contribuyente.fechaClauContribuyente ? this.formatDate(contribuyente.fechaClauContribuyente) : null,
                    fechaInscripcionContribuyente: contribuyente.fechaInscripcionContribuyente ? this.formatDate(contribuyente.fechaInscripcionContribuyente) : null,
                    apellidoCasadoContribuyente: contribuyente.apellidoCasadoContribuyente,
                    ciFull: contribuyente.ciFull,
                    codCiudad: contribuyente.codCiudad ? (contribuyente.codCiudad) : null,
                    codBarrio: contribuyente.codBarrio ? (contribuyente.codBarrio) : null,
                    estadoCivilContribuyente: contribuyente.estadoCivilContribuyente ? contribuyente.estadoCivilContribuyente : null,
                    codNacionalidad: contribuyente.codNacionalidad ? contribuyente.codNacionalidad : null,
                    direccionContribuyente: contribuyente.direccionContribuyente,
                    lugarNacimiento: contribuyente.lugarNacimiento,
                    email: contribuyente.email,
                    observacion: contribuyente.email,
                    ruc: contribuyente.email,
                    difunto: contribuyente.difunto,
                    documento: contribuyente.documento,
                    docExtranjero: contribuyente.docExtranjero,
                    fcDifunto: contribuyente.fcDifunto,
                    grupoSanguineo: contribuyente.grupoSanguineo,
                    nacContribuyente: contribuyente.nacContribuyente,
                    migrado: contribuyente.migrado,
                    nroCasa: contribuyente.nroCasa,
                    rmcOld: contribuyente.rmcOld,
                    sexoContribuyente: contribuyente.sexoContribuyente ? contribuyente.sexoContribuyente : null,
                    tipoContribuyente: contribuyente.tipoContribuyente ? contribuyente.tipoContribuyente : null,
                    tipoDocumento: contribuyente.tipoDocumento ? contribuyente.tipoDocumento : null,
                    telefonoContribuyente: contribuyente.telefonoContribuyente,
                });

                // Mark for check
                this._changeDetectorRef.markForCheck();
                this.focusInput();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedContribuyente= null;
    }

    focusInput() {
        setTimeout(() => {
          if (this.ci) {
            this.ci.nativeElement.focus();
          }
        }, 0);
      }

      markAsTouched(control) {
        if (control) {
          control.markAsTouched();
        }
      }

    /**
     * Crear nuevo 
     */
     agregarContribuyente(): void
    {
        // Create the product
        this._contribuyenteService.createContribuyente().subscribe((newContribuyente) =>
        {
            // Go to new product
            this.selectedContribuyente = newContribuyente;

            // Fill the form
            this.selectedContribuyenteFormv2.reset({
                    rmc: newContribuyente.rmc,
                    ci: newContribuyente.ci,
                    nombreContribuyente: newContribuyente.nombreContribuyente,
                    razonSocialContribuyente: newContribuyente.razonSocialContribuyente,
                    apellidoContribuyente: newContribuyente.apellidoContribuyente,
                    fechaNacimiento: newContribuyente.fechaNacimiento ? (newContribuyente.fechaNacimiento) : null,
                    fechaClauContribuyente: newContribuyente.fechaClauContribuyente ? (newContribuyente.fechaClauContribuyente) : null,
                    fechaInscripcionContribuyente: newContribuyente.fechaInscripcionContribuyente ? (newContribuyente.fechaInscripcionContribuyente) : null,
                    apellidoCasadoContribuyente: newContribuyente.apellidoCasadoContribuyente,
                    ciFull: newContribuyente.ciFull,
                    codCiudad: newContribuyente.codCiudad ? (newContribuyente.codCiudad) : null,
                    codBarrio: newContribuyente.codBarrio ? (newContribuyente.codBarrio) : null,
                    estadoCivilContribuyente: newContribuyente.estadoCivilContribuyente ? newContribuyente.estadoCivilContribuyente : null,
                    codNacionalidad: newContribuyente.codNacionalidad ? newContribuyente.codNacionalidad : null,
                    direccionContribuyente: newContribuyente.direccionContribuyente,
                    lugarNacimiento: newContribuyente.lugarNacimiento,
                    email: newContribuyente.email,
                    observacion: newContribuyente.email,
                    ruc: newContribuyente.email,
                    difunto: newContribuyente.difunto,
                    documento: newContribuyente.documento,
                    docExtranjero: newContribuyente.docExtranjero,
                    fcDifunto: newContribuyente.fcDifunto,
                    grupoSanguineo: newContribuyente.grupoSanguineo,
                    nacContribuyente: newContribuyente.nacContribuyente,
                    migrado: newContribuyente.migrado,
                    nroCasa: newContribuyente.nroCasa,
                    rmcOld: newContribuyente.rmcOld,
                    sexoContribuyente: newContribuyente.sexoContribuyente ? newContribuyente.sexoContribuyente : null,
                    tipoContribuyente: newContribuyente.tipoContribuyente ? newContribuyente.tipoContribuyente : null,
                    tipoDocumento: newContribuyente.tipoDocumento ? newContribuyente.tipoDocumento : null,
                    telefonoContribuyente: newContribuyente.telefonoContribuyente,
            });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Update the selected product using the form data
     *   
     */
    updateSelectedContribuyente(): void
    {
        // Marcar el formulario como tocado para activar los validadores
        this.selectedContribuyenteFormv2.markAllAsTouched();

        // Verificar si el formulario es válido
        if (this.selectedContribuyenteFormv2.invalid) {
            // Mostrar un mensaje de error
            this.showFlashMessage('validacion');
            return;
        }
        // Get the product object
        const contribuyenteForm = this.selectedContribuyenteFormv2.getRawValue();
        //formatear fecha
        const fechaNacimientoFormateada = moment(contribuyenteForm.fechaNacimiento).format('DD/MM/YYYY');

        const contribuyente: ContribuyenteModel = {
           // id: contribuyenteForm.id,
            rmc: contribuyenteForm.rmc,
            apellidoContribuyente: contribuyenteForm.apellidoContribuyente,
            apellidoCasadoContribuyente: contribuyenteForm.apellidoCasadoContribuyente,
            ciFull: contribuyenteForm.ciFull,
            ci: contribuyenteForm.ci,
            difunto: contribuyenteForm.difunto,
            direccionContribuyente: contribuyenteForm.direccionContribuyente,
            docExtranjero: contribuyenteForm.docExtranjero,
            documento: contribuyenteForm.documento,
            email: contribuyenteForm.email,
            fcDifunto: contribuyenteForm.fcDifunto,
            fechaClauContribuyente: contribuyenteForm.fechaClauContribuyente,
            fechaInscripcionContribuyente: contribuyenteForm.fechaInscripcionContribuyente,
            fechaNacimiento: contribuyenteForm.fechaNacimiento,
            grupoSanguineo:  contribuyenteForm.grupoSanguineo,  
            lugarNacimiento: contribuyenteForm.lugarNacimiento,    
            migrado: contribuyenteForm.migrado,
            nacContribuyente: contribuyenteForm.nacContribuyente,
            nombreContribuyente: contribuyenteForm.nombreContribuyente,
            razonSocialContribuyente: contribuyenteForm.razonSocialContribuyente,
            nroCasa: contribuyenteForm.nroCasa,
            observacion: contribuyenteForm.observacion,
            rmcOld: contribuyenteForm.rmcOld,
            ruc: contribuyenteForm.ruc,
            telefonoContribuyente: contribuyenteForm.telefonoContribuyente,
            sexoContribuyente: contribuyenteForm.sexoContribuyente,
            tipoContribuyente: contribuyenteForm.tipoContribuyente,
            tipoDocumento: contribuyenteForm.tipoDocumento,
            codBarrio: contribuyenteForm.codBarrio,
            codCiudad: contribuyenteForm.codCiudad,
            codNacionalidad: contribuyenteForm.codNacionalidad,   
            estadoCivilContribuyente: contribuyenteForm.estadoCivilContribuyente,
        };
        console.log(contribuyente);

        // Update on the server
        this._contribuyenteService.updateContribuyente(contribuyenteForm.rmc, contribuyente).subscribe(() =>
        {
            // Show a success message
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


    getCiudades(): void{
        this._contribuyenteService.getCiudadesV2()
        .subscribe((ciudades) =>
        {
            // Set the selected product
            this.ciudades = ciudades;
           // console.log(this.ciudades)
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getBarrios(): void{
        this._contribuyenteService.getBarriosV2()
        .subscribe((barrios) =>
        {
            // Set the selected product
            this.barriosV2 = barrios;
            
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getEstadosCiviles(): void{
        this._contribuyenteService.getEstadosCivilesV2()
        .subscribe((estadosCiviles) =>
        {
            // Set the selected product
            this.estadosCiviles = estadosCiviles;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getNacionalidades(): void{
        this._contribuyenteService.getNacionalidadesV2()
        .subscribe((nacionalidades) =>
        {
            // Set the selected product
            this.nacionalidades = nacionalidades;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getTiposContribuyentes(): void{
        this._contribuyenteService.getTiposContribuyentesV2()
        .subscribe((variable) =>
        {
            // Set the selected product
            this.tiposContribuyentes = variable;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getTiposDocContribuyentes(): void{
        this._contribuyenteService.getTiposDocContribuyentesV2()
        .subscribe((variable) =>
        {
            // Set the selected product
            this.tiposDocContribuyentes = variable;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getSexos(): void{
        this._contribuyenteService.getSexosV2()
        .subscribe((variable) =>
        {
            // Set the selected product
            this.sexos = variable;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }
/*
    getGeneros(): void{
        this._dominioService.getGeneros()
        .subscribe((generos) =>
        {
            // Set the selected product
            this.generos = generos;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

   

    getCategorias(): void{
        this._dominioService.getCategorias()
        .subscribe((categoriasContribuyentes) =>
        {
            // Set the selected product
            this.categoriasContribuyentes = categoriasContribuyentes;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getEstados(): void{
        this._dominioService.getEstados()
        .subscribe((estados) =>
        {
            // Set the selected product
            this.estados = estados;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }*/
}

