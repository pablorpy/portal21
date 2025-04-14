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
import { ContribuyenteModel, ContribuyentePagination } from '../../contribuyentes.types';
import { OpcionModel } from '../../../parametros/dominios/dominios.types';
import { ContribuyentesService } from '../../contribuyentes.service';
import { DominiosService } from '../../../parametros/dominios/dominios.service';
import { MatMomentDateModule, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';

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
    templateUrl: './contribuyentes-lista.component.html',
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
            { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
          ]
})
export class ContribuyentesListaComponent implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild('cedulaIdentidad', { static: false }) cedulaIdentidad!: ElementRef;

    contribuyentes$: Observable<ContribuyenteModel[]>;

    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: ContribuyentePagination;
    selectedContribuyente: ContribuyenteModel | null = null;
    selectedContribuyenteForm: UntypedFormGroup;
    nacionalidades: OpcionModel[];
    estadosCiviles: OpcionModel[];
    tiposContribuyentes: OpcionModel[];
    ciudades: OpcionModel[];
    barrios: OpcionModel[];
    estados: OpcionModel[];
    categoriasContribuyentes: OpcionModel[];
    generos: OpcionModel[];

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
        private _contribuyenteService: ContribuyentesService,
        private _dominioService: DominiosService,
        private _matDialog: MatDialog
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
        this.selectedContribuyenteForm = this._formBuilder.group({
            id               : [{value:'', disabled:true}],
            rmc           : ['', [Validators.required]],
            nombre      : ['', [Validators.required]],
            apellido           : ['', [Validators.required]],
            direccion           : ['', [Validators.required]],
            nacionalidad           : ['', [Validators.required]],
            estadoCivil           : ['', [Validators.required]],
            tipoContribuyente       : ['', [Validators.required]],
            ciudad       : ['', [Validators.required]],
            barrio       : ['', [Validators.required]],
            estado       : ['', [Validators.required]],
            categoriaContribuyente       : ['', [Validators.required]],
            genero       : ['', [Validators.required]],
            cedulaIdentidad       : ['', [Validators.required]],
            fechaNacimiento       : ['', [Validators.required]],
            celular       : ['', [Validators.required]],
            telefono       : ['', [Validators.required]],
            correoElectronico       : ['', [Validators.required]],
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
                    return this._contribuyenteService.getContribuyentes(0, 10, 'id', 'asc', query);
                }),
                map(() =>
                {
                    this.isLoading = false;
                }),
            )
            .subscribe();
            //this._dominioService.getNacionalidades();
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

            this.getNacionalidades();
            this.getCiudades();
            this.getBarrios();
            this.getEstadosCiviles();
            this.getGeneros();
            this.getTiposContribuyentes();
            this.getCategorias();
            this.getEstados();
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

    /**
     * Toggle product details
     *
     * @param id
     */
    toggleDetails(id: string): void
    {
        // If the product is already selected...
        if ( this.selectedContribuyente && this.selectedContribuyente.id === id )
        {
            // Close the details
            this.closeDetails();
            return;
        }

        // Get the product by id
        this.getNacionalidades();
        this.getCiudades();
        this.getBarrios();
        this.getEstadosCiviles();
        this.getGeneros();
        this.getTiposContribuyentes();
        this.getCategorias();
        this.getEstados();
  
       // this._dominioService.getDominioById(dominioId)
            this._contribuyenteService.getContribuyenteById(id)
            .subscribe((contribuyente) =>
            {
                // Set the selected product
                this.selectedContribuyente = contribuyente;
               // alert(contribuyente.nacionalidad.descripcion);
                // Fill the form
                // this.selectedDominioForm.patchValue(dominio);
                this.selectedContribuyenteForm.reset({
                    id: contribuyente.id,
                    rmc: contribuyente.rmc,
                    nombre: contribuyente.nombre,
                    apellido: contribuyente.apellido,
                    direccion: contribuyente.direccion,
                    nacionalidad: contribuyente.nacionalidad ? contribuyente.nacionalidad.id : null,
                    estadoCivil: contribuyente.estadoCivil ? contribuyente.estadoCivil.id : null,
                    tipoContribuyente: contribuyente.tipoContribuyente ? contribuyente.tipoContribuyente.id : null,
                    ciudad: contribuyente.ciudad ? contribuyente.ciudad.id : null,
                    barrio: contribuyente.barrio ? contribuyente.barrio.id : null,
                    estado: contribuyente.estado ? contribuyente.estado.id : null,
                    categoriaContribuyente: contribuyente.categoriaContribuyente ? contribuyente.categoriaContribuyente.id : null,
                    genero: contribuyente.genero ? contribuyente.genero.id : null,
                    cedulaIdentidad: contribuyente.cedulaIdentidad,
                    celular: contribuyente.celular,
                    telefono: contribuyente.telefono,
                    correoElectronico: contribuyente.correoElectronico,
                    fechaNacimiento: this.formatDateString(contribuyente.fechaNacimiento),
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
          if (this.cedulaIdentidad) {
            this.cedulaIdentidad.nativeElement.focus();
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
            this.selectedContribuyenteForm.reset({
                    id: newContribuyente.id,
                    rmc: newContribuyente.rmc,
                    nombre: newContribuyente.nombre,
                    apellido: newContribuyente.apellido,
                    direccion: newContribuyente.direccion,
                    nacionalidad: newContribuyente.nacionalidad ? newContribuyente.nacionalidad.id : null,
                    estadoCivil: newContribuyente.estadoCivil ? newContribuyente.estadoCivil.id : null,
                    tipoContribuyente: newContribuyente.tipoContribuyente ? newContribuyente.tipoContribuyente.id : null,
                    ciudad: newContribuyente.ciudad ? newContribuyente.ciudad.id : null,
                    barrio: newContribuyente.barrio ? newContribuyente.barrio.id : null,
                    estado: newContribuyente.estado ? newContribuyente.estado.id : null,
                    categoriaContribuyente: newContribuyente.categoriaContribuyente ? newContribuyente.categoriaContribuyente.id : null,
                    genero: newContribuyente.genero ? newContribuyente.genero.id : null,
                    cedulaIdentidad: newContribuyente.cedulaIdentidad,
                    celular: newContribuyente.celular,
                    telefono: newContribuyente.telefono,
                    correoElectronico: newContribuyente.correoElectronico,
                    fechaNacimiento: newContribuyente.fechaNacimiento
            });

            // Mark for check
            this._changeDetectorRef.markForCheck();
            this.focusInput();
           // this.selectedContribuyenteForm.getRawValue().codigo.nativeElement.focus();
        });
    }

    /**
     * Update the selected product using the form data
     *   
     */
    updateSelectedContribuyente(): void
    {
        // Marcar el formulario como tocado para activar los validadores
       /* this.selectedContribuyenteForm.markAllAsTouched();

        // Verificar si el formulario es válido
        if (this.selectedContribuyenteForm.invalid) {
            // Mostrar un mensaje de error
            this.showFlashMessage('validacion');
            return;
        }*/
        // Get the product object
        const contribuyenteForm = this.selectedContribuyenteForm.getRawValue();
        //formatear fecha
        const fechaNacimientoFormateada = moment(contribuyenteForm.fechaNacimiento).format('DD/MM/YYYY');

        const contribuyente: ContribuyenteModel = {
            id: contribuyenteForm.id,
            rmc: contribuyenteForm.rmc,
            nombre: contribuyenteForm.nombre,
            apellido: contribuyenteForm.apellido,
            direccion: contribuyenteForm.direccion,
            nacionalidad: contribuyenteForm.nacionalidad ? { id: contribuyenteForm.nacionalidad } : null,
            estadoCivil: contribuyenteForm.estadoCivil ? { id: contribuyenteForm.estadoCivil } : null,
            tipoContribuyente: contribuyenteForm.tipoContribuyente ? { id: contribuyenteForm.tipoContribuyente } : null,
            ciudad: contribuyenteForm.ciudad ? { id: contribuyenteForm.ciudad } : null,
            barrio: contribuyenteForm.barrio ? { id: contribuyenteForm.barrio } : null,
            estado: contribuyenteForm.estado ? { id: contribuyenteForm.estado } : null,
            categoriaContribuyente: contribuyenteForm.categoriaContribuyente ? { id: contribuyenteForm.categoriaContribuyente } : null,
            genero: contribuyenteForm.genero ? { id: contribuyenteForm.genero } : null,
            cedulaIdentidad: contribuyenteForm.cedulaIdentidad,
            telefono: contribuyenteForm.telefono,
            celular: contribuyenteForm.celular,
            fechaNacimiento: contribuyenteForm.fechaNacimiento !== null ? fechaNacimientoFormateada : null,
            correoElectronico: contribuyenteForm.correoElectronico            
        };
        

        // Update on the server
        this._contribuyenteService.updateContribuyente(contribuyenteForm.id, contribuyente).subscribe(() =>
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

    getNacionalidades(): void{
        this._dominioService.getNacionalidades()
        .subscribe((nacionalidades) =>
        {
            // Set the selected product
            this.nacionalidades = nacionalidades;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getCiudades(): void{
        this._dominioService.getCiudades()
        .subscribe((ciudades) =>
        {
            // Set the selected product
            this.ciudades = ciudades;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getBarrios(): void{
        this._dominioService.getBarrios()
        .subscribe((barrios) =>
        {
            // Set the selected product
            this.barrios = barrios;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

    getEstadosCiviles(): void{
        this._dominioService.getEstadosCiviles()
        .subscribe((estadosCiviles) =>
        {
            // Set the selected product
            this.estadosCiviles = estadosCiviles;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }

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

    getTiposContribuyentes(): void{
        this._dominioService.getTiposContribuyentes()
        .subscribe((tiposContribuyentes) =>
        {
            // Set the selected product
            this.tiposContribuyentes = tiposContribuyentes;

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
    }
}

