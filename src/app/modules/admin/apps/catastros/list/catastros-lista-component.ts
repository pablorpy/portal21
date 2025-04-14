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
import { BehaviorSubject, debounceTime, map, merge, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CatastroModel, CatastroPagination, SuperficieModel} from './catastros-types';
import { CatastrosService } from './catastros.service';
import { v2ContribuyentesService } from '../../v2/contribuyentes/v2-contribuyentes.service';
import { ContribuyenteModel } from '../../v2/contribuyentes/contribuyentes.types';
import { MatTableDataSource } from '@angular/material/table';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatHeaderRowDef, MatRowDef, MatCellDef, MatHeaderCellDef, MatTableModule } from '@angular/material/table';
import { BuscarConstruccionComponent } from '../modalConstruccion/list/buscar-construccion-component';
import { ConstruccionService } from '../modalConstruccion/buscar-construccion.service';
import { DimensionModel } from '../modalDimension/buscar-dimension.types';
import { DimensionService } from '../modalDimension/buscar-dimension.service';
import { BuscarDimensionComponent } from '../modalDimension/list/buscar-dimension-component';
import { ConstruccionModel } from '../modalConstruccion/buscar-construccion.types';
import { NewConstruccionComponent } from '../newConstruccion/list/new-construccion-component';
import { ModalContribuyenteComponent } from '../modalContribuyente/modal-contribuyente.component';
import { SuperficieService } from '../modalSuperficie/buscar-superficie.service';
import { BuscarSuperficieComponent } from '../modalSuperficie/list/buscar-superficie-component';
import { NewDimensionComponent } from '../newDimension/list/new-dimension-component';
import { NewSuperficieComponent } from '../newSuperficie/list/new-superficie-component';
import { categoriaConstrucciones, tipoConstrucciones, calles, orientaciones, callesPrincipales, frentes, categoriasZonas } from './catastros-types';
import { pad } from 'lodash';
import { OpcionModel } from '../../parametros/dominios/dominios.types';
import { DominiosService } from '../../parametros/dominios/dominios.service';


@Component({
    selector       : 'catastros-list',
    templateUrl    : './catastros-lista-component.html',
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
        MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe, MatTableModule,
        MatFormFieldModule,
        MatInputModule],
})
export class CatastrosListaComponent implements OnInit, AfterViewInit, OnDestroy
{
    /* ESTAS VARIABLES SON PARA CONEXION A POSTGRES*/ 
    filtrosBusqContrib: OpcionModel[];
    defaultFiltroBusq: string;
    campoFiltro : OpcionModel;
    valorFiltro : string;
    @ViewChild('valorFiltroBusq', { static: false }) valorFiltroBusq!: ElementRef;

    /* ESTAS SON DE MYSQL*/
    [x: string]: any;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    @ViewChild('nRegistro', { static: false }) nRegistro!: ElementRef;
    @ViewChild('padron') padron;
    @ViewChild('manzana') manzana;

    filtroBusquedaContribForm: UntypedFormGroup;

    catastros$: Observable<CatastroModel[]>;
    superficie$: Observable<SuperficieModel>;
    dimensiones$: Observable<DimensionModel[]>;
    dimension: any[] = [];
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: CatastroPagination;
    selectedCatastro: CatastroModel | null = null;
    selectedSuperficie: SuperficieModel | null = null;
    selectedCatastroForm: UntypedFormGroup;
    selectedSuperficieForm: UntypedFormGroup;
    selectedConstruccionForm: UntypedFormGroup;
    public contribuyente: ContribuyenteModel;
   // public superficie: SuperficieModel;
    public superficies$: BehaviorSubject<SuperficieModel[]> = new BehaviorSubject<SuperficieModel[]>([]);
   // private superficie$ = new BehaviorSubject<SuperficieModel>(null);
    isActualizarDisabled: boolean = true;
    //superficies: SuperficieModel[] = [];
    displayedColumns: string[] = ['id', 'ctaCte', 'posicion', 'subZona', 'superficieHa', 'superficieM2', 'borrado']
    displayedColumns_1: string[] = ['dimension','ctaCte','areaDimension','calle','callePrincipal','categoriaZona','frentes','orientacion', 'posicion','tramoCalle','observacion']
    displayedColumns_2: string[] = ['nroFilaConstruccion', 'ctaCte', 'categoriaConstruccion', 'tipoConstruccion', 'anioConstruccion', 'area', 'obs', 'borrado']
    public construccionArray: ConstruccionModel[] = [];
    public dimensionArray: DimensionModel[] = [];
    public superficieArray: SuperficieModel[] = [];
    // propiedad para el contador
    public construccionCount: number = 0;
    public dimensionCount: number = 0;  
    public superficieCount: number = 0;     
    
    categoriasEdificaciones = [
        { id: 'U', descripcion: 'Urbana' },
        { id: 'R', descripcion: 'Rural' }
      ];
    estados = [
        { id: 'D', descripcion: 'Definitivo' },
        { id: 'P', descripcion: 'Provisorio' }
      ];  
    suelos = [
        { id: '12', descripcion: 'POLITICO' },
        { id: 'BA', descripcion: 'BALDIO' },
        { id: 'CT', descripcion: 'COMUNITARIO' },
        { id: 'ED', descripcion: 'EDUCATIVO' },
        { id: 'ET', descripcion: 'ESTATAL' },
        { id: 'GA', descripcion: 'GALPON' },
        { id: 'IN', descripcion: 'INDUSTRIAL' },
        { id: 'MI', descripcion: 'MIXTO' },
        { id: 'NE', descripcion: 'COMERCIAL' },
        { id: 'RT', descripcion: 'RECREATIVO' },
        { id: 'SV', descripcion: 'SERVICIOS' },
        { id: 'TA', descripcion: 'TAMBO' },
        { id: 'VI', descripcion: 'VIVIENDA' },
      ];   
    tenencias = [
        { id: 'MC', descripcion: 'PROPIEDAD MUNICIPAL ARRENDADA' },
        { id: 'PF', descripcion: 'TIERRA FISCAL' },
        { id: 'PM', descripcion: 'PROPIEDAD MUNICIPAL' },
        { id: 'PP', descripcion: 'PROPIEDAD PARTICULAR' },
        { id: 'PR', descripcion: 'PROPIEDAD CON REGISTRO MUNICIPAL' },
        { id: 'PT', descripcion: 'PROPIEDAD TITULADA' }
      ];
    tiposCuentas  = [
        { id: 'C', descripcion: 'Cuenta Corriente' },
        { id: 'P', descripcion: 'Padrón' }
      ];
      
    flashMessage: 'success' | 'error' | 'validacion' | 'Ya existe' | 'No encontrado' | 'Error interno' | null = null;
   
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    construcciones : ConstruccionModel[];
    dimensiones : DimensionModel[];
    contribuyentes : ContribuyenteModel[];
    superficies : SuperficieModel[];

    mostrarAgregarConstruccion = false;
    mostrarAgregarDimension = false;
    mostrarAgregarSuperficie = false;

    mostrarABMConstruccion = true;
    mostrarABMDimension = true;
    mostrarABMSuperficie = true;

    mostrarBotonContribuyente = false;
    // Variable que maneja el texto del botón
    botonTexto: string = 'Agregar'; // Texto inicial
    // Variable para controlar si el botón está en estado de "Actualizar"
    esActualizar: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _catastroService: CatastrosService,
        private _contribuyenteService: v2ContribuyentesService,
        private _superficieSAervice: SuperficieService,
        private _construccionService: ConstruccionService,
        private _dimensionService: DimensionService,
        private _matDialog: MatDialog,
        private _dominioService: DominiosService
       
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    /**
     * On init
     */



    // Método para actualizar el contador
    /*updateConstruccionCount(): void {
        this.construccionCount = this.construccionArray.length;
    }*/

    getFiltrosBusqContribuyentes(): void
    {
        // Get the product by id
        this._dominioService.getOpcionesByDominio('FILTRBUSQCATASTRO')
        .subscribe((datos) =>
        {
            // Set the selected product
            this.filtrosBusqContrib = datos;
            this.defaultFiltroBusq = this.filtrosBusqContrib.find(t => t.porDefecto).codigo;
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    } 

    formatManzana() {
        //const manzanaValue = this.selectedCatastroForm.get('manzanaCatastro').value;
    
        
    }

    formatLote() {
        const zonaValue = this.selectedCatastroForm.get('zonaCatastro').value;
        let manzanaValue = this.selectedCatastroForm.get('manzanaCatastro').value;
        let loteValue = this.selectedCatastroForm.get('loteCatastro').value;
        
        // Si el valor tiene menos de 4 dígitos, completamos con ceros a la izquierda
        if (manzanaValue && manzanaValue.toString().length < 4) {
            manzanaValue = (manzanaValue.toString().padStart(4, '0'));
        }
        
        // Concatenar los valores de zona, manzana y lote
        const formattedValue = `${zonaValue}-${manzanaValue}-${loteValue}`;
        // Actualiza el valor en el formulario
        this.selectedCatastroForm.get('ctaCte').setValue(formattedValue);
    }

    formatPadron(){
        let padronValue = this.selectedCatastroForm.get('padron').value;
        // Si el valor tiene menos de 8 dígitos, completamos con ceros a la izquierda
        if (padronValue && padronValue.length < 8) {
            padronValue = (padronValue.padStart(8, '0'));
        }else{
            padronValue = 0
        }
        // Actualiza el valor en el formulario
        this.selectedCatastroForm.get('ctaCte').setValue(padronValue);
    }

   /* onPadronBlur(event): void {
        console.log('padron:: ' + event);
    }*/

    onTipoCuentaChange(event): void {
        let tipoCuenta: string;
        if(event.isUserInput && event.source.selected){
            tipoCuenta = event.source.value;
            console.log('tipoCuenta:: ' + tipoCuenta);
            // Habilitar o deshabilitar campos dependiendo de la selección de tipoCuenta
            if (tipoCuenta === 'P') {
                this.selectedCatastroForm.get('padron').enable();
                this.selectedCatastroForm.get('ctaCte').enable();
                this.selectedCatastroForm.get('zonaCatastro').disable();
                this.selectedCatastroForm.get('manzanaCatastro').disable();
                this.selectedCatastroForm.get('loteCatastro').disable();
                //vaciar campos
                this.selectedCatastroForm.get('manzanaCatastro')?.reset();
                this.selectedCatastroForm.get('loteCatastro')?.reset();
                if (!this.selectedCatastroForm.get('id')?.value) {
                    this.selectedCatastroForm.get('ctaCte')?.reset();
                }
            
                setTimeout(()=>{
                    this.padron.nativeElement.focus();
                    //this.myTextBox.setSelectionRange(2,2);
                },0);
                /*this.padron.nativeElement.value = "sddsffs";
                this.padron.nativeElement.focus();
                console.log(this.padron.nativeElement.focusInput);*/
                // this.selectedCatastroForm.get('ctaCte')?.reset();
            } else if (tipoCuenta === 'C') {
                this.selectedCatastroForm.get('ctaCte').enable();
                this.selectedCatastroForm.get('padron').disable();
                this.selectedCatastroForm.get('zonaCatastro').enable();
                this.selectedCatastroForm.get('manzanaCatastro').enable();
                this.selectedCatastroForm.get('loteCatastro').enable();
                //vaciar campos
                if (!this.selectedCatastroForm.get('id')?.value) {
                    this.selectedCatastroForm.get('ctaCte')?.reset();
                }
                // this.selectedCatastroForm.get('ctaCte')?.reset();
                this.selectedCatastroForm.get('padron').setValue(0);
                } else {
                // Si no se selecciona una opción válida, deshabilitamos todo
                this.selectedCatastroForm.get('ctaCte').enable();
                this.selectedCatastroForm.get('padron').disable();
                this.selectedCatastroForm.get('zonaCatastro').disable();
                this.selectedCatastroForm.get('manzanaCatastro').disable();
                this.selectedCatastroForm.get('loteCatastro').disable();
                }
                setTimeout(()=>{
                    this.manzana.nativeElement.focus();
                    //this.myTextBox.setSelectionRange(2,2);
                },0);
            }
    }

    ngOnInit(): void
    {
        this.getFiltrosBusqContribuyentes();
        this.filtroBusquedaContribForm = this._formBuilder.group({
            campoFiltro           : ['', [Validators.required]],
            valorFiltro           : ['', [Validators.required]],
            nombre                : ['', [Validators.required]],
            apellido              : ['', [Validators.required]],
        });
        this._catastroService.filtrosBusqContribuyentes$.subscribe(res => {
            this.campoFiltro = res.campoFiltro;
            this.valorFiltro = res.valorFiltro;
        });
        // Create the selected product form
        this.selectedCatastroForm = this._formBuilder.group({
            id                : [{value:'', disabled:true}],
            ctaCte          : [{value:'', disabled:true}, Validators.required],
            direccionCatastro      : ['', Validators.required],
            observacion      : ['', Validators.required],
            actividad      : [''],
            anioBasura      : [''],
            loteCatastro      :['', [Validators.required, Validators.minLength(2)]],
            codigoBasura      : [''],
            superficie      :[''],
            manzanaCatastro: ['', [Validators.pattern('^[0-9]{1,4}$'), Validators.required]],
            pisoCatastro      : [''],
            unidadCatastro      : [''],
            zonaCatastro      : [{ value: '', disabled: true }, Validators.required],
            departamento      : [''],
            estado      : ['', Validators.required],
            exoneradoCatastro      : [''],
            fechaPago      : [''],
            fechaBasura      : [''],
            loteamientoLote      : [''],
            loteamientoManzana      : [''],
            loteamientoZona      : [''],
            matricula      : [''],
            nroCasa      : [''],
            numFinca      : [''],
            padron: ['', [Validators.required, Validators.maxLength(8)]],
            reciboBasura      : [''],
            reciboCatastro      : [''],
            rmc      : ['',Validators.required ],
            serie      : [''],
            serieCatastro      : [''],
            subZona      : [''],
            subZona1      : [''],
            suelo      : ['', Validators.required],
            supeficieHectareas      : [''],
            superficieProductivo      : [''],
            tenencia      : ['', Validators.required],
            tipoCuenta      : ['', Validators.required],
            ultimoAnioPagado      : [''],
            urbanaRural      : ['', Validators.required],
            vieneDeLaCtaCte      : [''],
            nom      : [''],
            ape      : [''],

        });
        

        // Cuando el valor de tipoCuenta cambie, manejar la habilitación
       /* this.selectedCatastroForm.get('tipoCuenta').valueChanges.subscribe(value => {
            this.onTipoCuentaChange(value);
        });*/
        
        // Obtener la paginación
        this._catastroService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: CatastroPagination) =>
            {
                // Update the pagination
                this.pagination = pagination;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        
        // Obtener
        this.catastros$ = this._catastroService.catastros$;
        // Subscribe to   input field value changes
        this.filtroBusquedaContribForm.get('valorFiltro').valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) =>
                {
                    //console.log('QUERYYYY::: ' + this.filtroBusquedaContribForm.get('campoFiltro').value);
                    this.closeDetails();
                    this.isLoading = true;
                    return this._catastroService.getCatastros(0, 10, 'id', 'asc', query, this.filtroBusquedaContribForm.get('campoFiltro').value);
                }),
                map(() =>
                {
                    this.isLoading = false;
                }),
            )
            .subscribe();
            //this.campoFiltro.valueChanges
    }

    openContribuyenteDialog(): void
    {
        // Open the dialog
        const dialogContribuyente = this._matDialog.open(ModalContribuyenteComponent); //ContribuyentesListaComponent  //MailboxComposeComponent
    
        dialogContribuyente.afterClosed()
            .subscribe((result) =>
            {
                if (result) {
                    this.selectedContribuyente = result;
                    if (this.selectedCatastro) {
                        this.selectedCatastro.contribuyente = result;
                    }
    
                    this.selectedCatastroForm.patchValue({
                        rmc: result.rmc,
                        nom: result.nombreContribuyente,
                        ape: result.apellidoContribuyente
                    });
                    setTimeout(() => {
                        /*if (this.nRegistro) {
                          this.nRegistro.nativeElement.focus();
                        }*/
                      }, 0);
                }
            });
    }

    openABMSuperficieDialog(): void {
        const dialogSuperficie = this._matDialog.open(BuscarSuperficieComponent, {
            data:  this.selectedCatastroForm.get('ctaCte')?.value,  // Pasamos los datos de la dimension al modal
            disableClose: true,
            width: '70%', // Establece el ancho al 50% de la pantalla
            height: '90%', // Establece la altura al 50% de la pantalla
            maxWidth: '100%', // Asegura que el modal no exceda el 100% de la pantalla
            maxHeight: '100%' // Asegura que el modal no exceda el 100% de la pantalla
        });
              
        dialogSuperficie.afterClosed().subscribe(() => {
            this.loadSuperficieData(this.selectedCatastroForm.get('ctaCte')?.value)
        });
      }

     openABMDimensionDialog(): void {
       // this._dimensionService.getDimensiones(0, 10, 'ctaCte', 'asc', '24-0045-12');
        
        const dialogDimension = this._matDialog.open(BuscarDimensionComponent, {
            data:  this.selectedCatastroForm.get('ctaCte')?.value,  // Pasamos los datos de la dimension al modal
            disableClose: true,
            width: '70%', // Establece el ancho al 50% de la pantalla
            height: '90%', // Establece la altura al 50% de la pantalla
            maxWidth: '100%', // Asegura que el modal no exceda el 100% de la pantalla
            maxHeight: '100%' // Asegura que el modal no exceda el 100% de la pantalla
        });
              
        dialogDimension.afterClosed().subscribe(() => {
            this.loadDimensionData(this.selectedCatastroForm.get('ctaCte')?.value)
        });
    }
 
    openABMConstruccionDialog(): void {
         const dialogConstruccion = this._matDialog.open(BuscarConstruccionComponent, {
            data: this.selectedCatastroForm.get('ctaCte')?.value,
            disableClose: true,
            width: '70%', // Establece el ancho al 70% de la pantalla
            height: '90%', // Establece la altura al 90% de la pantalla
            maxWidth: '100%', // Asegura que el modal no exceda el 100% de la pantalla
            maxHeight: '100%' // Asegura que el modal no exceda el 100% de la pantalla
        });

        dialogConstruccion.afterClosed().subscribe(() => {
            this.loadConstruccionData(this.selectedCatastroForm.get('ctaCte')?.value)
        });
    }

    openAgregarConstruccionDialog(): void {
        // Validar que el campo ctaCte tenga valor
        if (!this.selectedCatastroForm.get('ctaCte')?.value) {
            this.showFlashMessage('validacion');
            return;  // Evitar ejecutar el resto del código si ctaCte no tiene valor
        }
        const dialogConstruccion = this._matDialog.open(NewConstruccionComponent, {
            data: { 
                ctaCte: this.selectedCatastroForm.get('ctaCte')?.value,  // Datos adicionales del formulario
                construccionArray: this.construccionArray || [] // El array que se desea modificar
            },
            disableClose: true,
            width: '70%', // Establece el ancho al 70% de la pantalla
            height: '90%', // Establece la altura al 90% de la pantalla
            maxWidth: '100%', // Asegura que el modal no exceda el 100% de la pantalla
            maxHeight: '100%' // Asegura que el modal no exceda el 100% de la pantalla
        });
    
        // Después de que se cierra el modal, recibimos el array actualizado
        dialogConstruccion.afterClosed().subscribe((updatedArray: ConstruccionModel[]) => {
            if (updatedArray) {
                // Actualizamos el array en el componente principal
                this.construccionArray = [...updatedArray];
                //contador
                this.construccionCount = this.construccionArray.length;            
                //deteccion de cambios
                this._changeDetectorRef.detectChanges(); 
            }
        });
    }

    openAgregarDimensionDialog(): void {
        // Validar que el campo ctaCte tenga valor
        if (!this.selectedCatastroForm.get('ctaCte')?.value) {
            this.showFlashMessage('validacion');
            return;  // Evitar ejecutar el resto del código si ctaCte no tiene valor
        }
        const dialogDimension = this._matDialog.open(NewDimensionComponent, {
            data: { 
                ctaCte: this.selectedCatastroForm.get('ctaCte')?.value,  // Datos adicionales del formulario
                dimensionArray: this.dimensionArray || [] // El array que se desea modificar
            },
            disableClose: true,
            width: '70%', // Establece el ancho al 70% de la pantalla
            height: '90%', // Establece la altura al 90% de la pantalla
            maxWidth: '100%', // Asegura que el modal no exceda el 100% de la pantalla
            maxHeight: '100%' // Asegura que el modal no exceda el 100% de la pantalla
        });
    
        // Después de que se cierra el modal, recibimos el array actualizado
        dialogDimension.afterClosed().subscribe((updatedArray: DimensionModel[]) => {
            if (updatedArray) {
                // Actualizamos el array en el componente principal
                this.dimensionArray = [...updatedArray];
                //contador
                this.dimensionCount = this.dimensionArray.length;            
                //deteccion de cambios
                this._changeDetectorRef.detectChanges(); 
            }
        });
    }

    openAgregarSuperficieDialog(): void {
        // Validar que el campo ctaCte tenga valor
        if (!this.selectedCatastroForm.get('ctaCte')?.value) {
            this.showFlashMessage('validacion');
            return;  // Evitar ejecutar el resto del código si ctaCte no tiene valor
        }
        const dialogSuperficie = this._matDialog.open(NewSuperficieComponent, {
            data: { 
                ctaCte: this.selectedCatastroForm.get('ctaCte')?.value,  // Datos adicionales del formulario
                superficieArray: this.superficieArray || [] // El array que se desea modificar
            },
            disableClose: true,
            width: '70%', // Establece el ancho al 70% de la pantalla
            height: '90%', // Establece la altura al 90% de la pantalla
            maxWidth: '100%', // Asegura que el modal no exceda el 100% de la pantalla
            maxHeight: '100%' // Asegura que el modal no exceda el 100% de la pantalla
        });
    
        // Después de que se cierra el modal, recibimos el array actualizado
        dialogSuperficie.afterClosed().subscribe((updatedArray: SuperficieModel[]) => {
            if (updatedArray) {
                // Actualizamos el array en el componente principal
                this.superficieArray = [...updatedArray];
                //contador
                this.superficieCount = this.superficieArray.length;            
                //deteccion de cambios
                this._changeDetectorRef.detectChanges(); 
            }
        });
    }
    
    // Este es el método para obtener la dimensión y luego actualizar la tabla
    loadDimensionData(ctaCte: string): void {
        // Ahora obtenemos la dimensión por ctaCte
        this._dimensionService
        .getDimensionByCtaCteArray(ctaCte) // Nueva llamada para obtener la dimensión
        .subscribe((dimensionData) => {
            this.dimensionesArray = dimensionData; 
            this.dimensionArray = this.dimensionesArray;
            this._changeDetectorRef.detectChanges();  // Forzamos la detección de cambios
        });
    }

    loadSuperficieData(ctaCte: string): void {
        // Ahora obtenemos la dimensión por ctaCte
        this._superficieSAervice
        .getSuperficiesByCtaCteArray(ctaCte) // Nueva llamada para obtener la dimensión
        .subscribe((superficieData) => {
            this.superficiesArray = superficieData; 
            this._changeDetectorRef.detectChanges();  // Forzamos la detección de cambios
        });
    }

    loadConstruccionData(ctaCte: string): void {
        // Ahora obtenemos la dimensión por ctaCte
        this._construccionService
        .getConstruccionByCtaCteArray(ctaCte) // Nueva llamada para obtener la dimensión
        .subscribe((construccionData) => {
            this.construccionesArray = construccionData; 
            this._changeDetectorRef.detectChanges();  // Forzamos la detección de cambios
        });
    }
    
    /*focusInput() {
        setTimeout(() => {
          if (this.nRegistro) {
            this.nRegistro.nativeElement.focus();
          }
        }, 0);
      }*/

      limpiarFiltroValor($event): void{
        console.log('limpiarFiltroValor');
        this.filtroBusquedaContribForm.get('valorFiltro').setValue('');
        setTimeout(()=>{
            this.valorFiltroBusq.nativeElement.focus();
            //this.myTextBox.setSelectionRange(2,2);
        },0);
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
                    return this._catastroService.getCatastros(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() =>
                {
                    this.isLoading = false;
                }),
            ).subscribe();
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

    formatDate(inputDate: string): string {
        // La fecha inputDate se espera que esté en formato ISO 8601 (por ejemplo, 'yyyy-MM-ddTHH:mm:ss.sssZ')
    const formattedDate = inputDate.split('T')[0];

    // Se retorna la fecha formateada en el formato 'yyyy-MM-dd'
    return formattedDate;
    }
    /**
     * Toggle product details
     *
     * @param id
     */
           toggleDetails(id: string): void {
            console.log("selectedCatastro: " + this.selectedCatastro);
            // Si ya está seleccionado el catastro, cerramos los detalles
            if (this.selectedCatastro && this.selectedCatastro.id === id) {
                this.closeDetails();
                return;
            }
            // Cambiar el estado del botón (de Agregar a Actualizar o viceversa)
            this.esActualizar = true;
            this.botonTexto = 'Actualizar';

            // Obtener el catastro por id
            this._catastroService.getCatastroById(id).subscribe((catastro) => {
                this.selectedCatastro = catastro;
                // Si existe un rmc, obtenemos el contribuyente
                if (catastro.rmc) {
                    this._contribuyenteService
                        .getContribuyenteByRmc(catastro.rmc)
                        .subscribe((contribuyenteData) => {
                            this.contribuyente = contribuyenteData;

                            // Obtener la superficie adicional por ctaCte
                            if (catastro.ctaCte) {
                                //this.superficie$ = this._catastroService.getSuperficieByCtaCte(catastro.ctaCte);
                                this._catastroService
                                    .getSuperficieByCtaCte_array(catastro.ctaCte) // Nueva llamada para obtener la dimensión
                                    .subscribe((superficieData) => {
                                    this.superficiesArray = superficieData; 
                                    this.superficieArray = this.superficiesArray;
                                        // Ahora obtenemos la dimensión por ctaCte
                                        this._catastroService
                                            .getDimensionByCtaCte_normal(catastro.ctaCte) // Nueva llamada para obtener la dimensión
                                            .subscribe((dimensionData) => {
                                                this.dimensionesArray = dimensionData; // Guardamos los datos de la dimensión
                                                this.dimensionArray = this.dimensionesArray;
                                               
                                                // Ahora obtenemos la construcción por ctaCte
                                                this._catastroService
                                                    .getConstruccionByCtaCte(catastro.ctaCte) // Nueva llamada para obtener la construcción
                                                    .subscribe((construccionData) => {
                                                        this.construccionesArray = construccionData; // Guardamos los datos de la construcción
                                                        this.construccionArray = this.construccionesArray;
                                                        // Actualizamos el formulario con los detalles de la superficie, dimensión y construcción
                                                        this.selectedCatastroForm.reset({
                                                            id: catastro.id,
                                                            ctaCte: catastro.ctaCte ? catastro.ctaCte : null,
                                                            direccionCatastro: catastro.direccionCatastro ? catastro.direccionCatastro : null,
                                                            observacion: catastro.observacion ? catastro.observacion : null,
                                                            actividad: catastro.actividad ? catastro.actividad : null,
                                                            anioBasura: catastro.anioBasura ? catastro.anioBasura : null,
                                                            loteCatastro: catastro.loteCatastro ? catastro.loteCatastro : null,
                                                            codigoBasura: catastro.codigoBasura ? catastro.codigoBasura : null,
                                                            superficie: catastro.superficie ? catastro.superficie : null,
                                                            manzanaCatastro: catastro.manzanaCatastro ? catastro.manzanaCatastro : null,
                                                            pisoCatastro: catastro.pisoCatastro ? catastro.pisoCatastro : null,
                                                            unidadCatastro: catastro.unidadCatastro ? catastro.unidadCatastro : null,
                                                            zonaCatastro: catastro.zonaCatastro ? catastro.zonaCatastro : null,
                                                            departamento: catastro.departamento ? catastro.departamento : null,
                                                            estado: catastro.estado ? catastro.estado : null,
                                                            exoneradoCatastro: catastro.exoneradoCatastro ? catastro.exoneradoCatastro : null,
                                                            fechaPago: catastro.fechaPago ? this.formatDate(catastro.fechaPago) : null,
                                                            fechaBasura: catastro.fechaBasura ? this.formatDate(catastro.fechaBasura) : null,
                                                            loteamientoLote: catastro.loteamientoLote ? catastro.loteamientoLote : null,
                                                            loteamientoManzana: catastro.loteamientoManzana ? catastro.loteamientoManzana : null,
                                                            loteamientoZona: catastro.loteamientoZona ? catastro.loteamientoZona : null,
                                                            matricula: catastro.matricula ? catastro.matricula : null,
                                                            nroCasa: catastro.nroCasa ? catastro.nroCasa : null,
                                                            numFinca: catastro.numFinca ? catastro.numFinca : null,
                                                            padron: catastro.padron ? catastro.padron : null,
                                                            reciboBasura: catastro.reciboBasura ? catastro.reciboBasura : null,
                                                            reciboCatastro: catastro.reciboCatastro ? catastro.reciboCatastro : null,
                                                            rmc: catastro.rmc ? catastro.rmc : null,
                                                            serie: catastro.serie ? catastro.serie : null,
                                                            serieCatastro: catastro.serieCatastro ? catastro.serieCatastro : null,
                                                            subZona: catastro.subZona ? catastro.subZona : null,
                                                            subZona1: catastro.subZona1 ? catastro.subZona1 : null,
                                                            suelo: catastro.suelo ? catastro.suelo : null,
                                                            supeficieHectareas: catastro.supeficieHectareas ? catastro.supeficieHectareas : null,
                                                            superficieProductivo: catastro.superficieProductivo ? catastro.superficieProductivo : null,
                                                            tenencia: catastro.tenencia ? catastro.tenencia : null,
                                                            tipoCuenta: catastro.tipoCuenta ? catastro.tipoCuenta : null,
                                                            ultimoAnioPagado: catastro.ultimoAnioPagado ? catastro.ultimoAnioPagado : null,
                                                            urbanaRural: catastro.urbanaRural ? catastro.urbanaRural : null,
                                                            vieneDeLaCtaCte: catastro.vieneDeLaCtaCte ? catastro.vieneDeLaCtaCte : null,
        
                                                            nom: this.contribuyente ? this.contribuyente.nombreContribuyente : null,
                                                            ape: this.contribuyente ? this.contribuyente.apellidoContribuyente : null,
        
                                                        });
                                                        //bloquear campos
                                                        // Deshabilitar el control 'ctaCte' después de resetear
                                                        this.selectedCatastroForm.get('tipoCuenta')?.disable();
                                                        this.selectedCatastroForm.get('ctaCte')?.disable();
                                                        this.selectedCatastroForm.get('padron')?.disable();
                                                        this.selectedCatastroForm.get('zonaCatastro')?.disable();
                                                        this.selectedCatastroForm.get('loteCatastro')?.disable();
                                                        this.selectedCatastroForm.get('manzanaCatastro')?.disable();
                                                        
                                                        this._dimensionService.getDimensiones(0, 10, 'ctaCte', 'asc', catastro.ctaCte, '=')
                                                            .subscribe((dim: DimensionModel[]) => this.dimensiones = dim);
                                                        this._construccionService.getConstrucciones(0, 10, 'ctaCte', 'asc', catastro.ctaCte, '=')
                                                            .subscribe((constr: ConstruccionModel[]) => this.construcciones = constr);    
                                                        this._contribuyenteService.getContribuyentes(0, 10, 'id', 'asc', '')
                                                            .subscribe((contr: ContribuyenteModel[]) => this.contribuyentes = contr);     
                                                        this._superficieSAervice.getSuperficies(0, 10, 'id', 'asc', catastro.ctaCte)
                                                            .subscribe((supe: SuperficieModel[]) => this.superficies = supe);  
                                                        // Marcar para detección de cambios
                                                        this._changeDetectorRef.markForCheck();
                                                    });
                                            });
                                    });
                            } else {
                                console.log("No hay cta cte");
                            }
                            // Marcar para detección de cambios
                            this._changeDetectorRef.markForCheck();
                        });
                } else {
                    // Si no se encuentra rmc, puedes manejarlo de alguna forma
                    console.log('No se encontró un contribuyente para este catastro');
                }
            });
           
        }
        
        
        

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedCatastro= null;
        this.mostrarAgregarConstruccion = false;
        this.mostrarAgregarDimension = false;
        this.mostrarAgregarSuperficie = false;
        this.mostrarABMConstruccion = true;
        this.mostrarABMDimension = true;
        this.mostrarABMSuperficie = true;
        this.mostrarBotonContribuyente = false;
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Crear nuevo 
     */
     agregarCatastro(): void
    {
        this.esActualizar = false;
        this.botonTexto = 'Agregar';
        //al dar clic en agregar, se habilita el boton buscar contribuyente
        this.isActualizarDisabled = false;

        this.dimensionArray = []
        this.superficieArray = []
        this.construccionArray = []
 
        // Create the product
        this._catastroService.createCatastro().subscribe((newCatastro) =>
        {
            // Go to new product
            this.selectedCatastro = newCatastro;

            // Fill the form
            this.selectedCatastroForm.reset({
                id: newCatastro.id,
                ctaCte: newCatastro.ctaCte,
                    direccionCatastro: newCatastro.direccionCatastro,
                    observacion: newCatastro.observacion,
                    actividad: newCatastro.actividad,
                    anioBasura: newCatastro.anioBasura,
                    loteCatastro: newCatastro.loteCatastro,
                    codigoBasura: newCatastro.codigoBasura,
                    superficie: newCatastro.superficie,
                    manzanaCatastro: newCatastro.manzanaCatastro,
	                pisoCatastro: newCatastro.pisoCatastro,
                    unidadCatastro: newCatastro.unidadCatastro,
                    zonaCatastro: newCatastro.zonaCatastro,
                    departamento: newCatastro.departamento,
                    estado: newCatastro.estado,
                    exoneradoCatastro: newCatastro.exoneradoCatastro,
                    fechaPago: newCatastro.fechaPago,
                    fechaBasura: newCatastro.fechaBasura,
                    loteamientoLote: newCatastro.loteamientoLote,
                    loteamientoManzana: newCatastro.loteamientoManzana,
                    loteamientoZona: newCatastro.loteamientoZona,
                    matricula: newCatastro.matricula,
                    nroCasa: newCatastro.nroCasa,
                    numFinca: newCatastro.numFinca,
                    padron: newCatastro.padron,
                    reciboBasura: newCatastro.reciboBasura,
                    reciboCatastro: newCatastro.reciboCatastro,
                    rmc: newCatastro.rmc,
                    serie: newCatastro.serie,
                    serieCatastro: newCatastro.serieCatastro,
                    subZona : newCatastro.subZona,
                    subZona1: newCatastro.subZona1,
                    suelo: newCatastro.suelo,
                    supeficieHectareas: newCatastro.supeficieHectareas,
                    superficieProductivo: newCatastro.superficieProductivo,
                    tenencia: newCatastro.tenencia,
                    tipoCuenta: newCatastro.tipoCuenta, 
                    ultimoAnioPagado: newCatastro.ultimoAnioPagado,
                    urbanaRural: newCatastro.urbanaRural,
                    vieneDeLaCtaCte: newCatastro.vieneDeLaCtaCte,
              
       
            });
            // Mark for check
           //this._changeDetectorRef.markForCheck();
           // this.selectedContribuyenteForm.getRawValue().codigo.nativeElement.focus();
            this.selectedCatastroForm.get('tipoCuenta')?.enable();
            this.selectedCatastroForm.get('ctaCte')?.enable();
            this.mostrarAgregarConstruccion = true;
            this.mostrarAgregarDimension = true;
            this.mostrarAgregarSuperficie = true;
            this.mostrarABMConstruccion = false;
            this.mostrarABMDimension = false;
            this.mostrarABMSuperficie = false;
            this.mostrarBotonContribuyente = true;

            //vaciar los arrays
            //ver la forma de mejorar esto
            this._construccionService
                .getConstruccionByCtaCteArray('00') // Nueva llamada para obtener la dimensión
                .subscribe((Data) => {
                    this.construccionesArray = []; 
                    this._changeDetectorRef.detectChanges();  // Forzamos la detección de cambios
                });
             //ver la forma de mejorar esto
             this._dimensionService
             .getDimensionByCtaCteArray('00') // Nueva llamada para obtener la dimensión
             .subscribe((Data) => {
                 this.dimensionesArray = []; 
                 this._changeDetectorRef.detectChanges();  // Forzamos la detección de cambios
             });
              //ver la forma de mejorar esto
            this._superficieSAervice
            .getSuperficiesByCtaCteArray('00') // Nueva llamada para obtener la dimensión
            .subscribe((Data) => {
                this.superficiesArray = []; 
                this._changeDetectorRef.detectChanges();  // Forzamos la detección de cambios
            });

            this.superficieCount = this.superficieArray.length;   
            this.dimensionCount = this.dimensionArray.length;   
            this.construccionCount = this.construccionArray.length;  

            this._changeDetectorRef.markForCheck;
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

    markAsTouched(control) {
        if (control) {
          control.markAsTouched();
          /*const fcsControl = this.selectedCatastroForm.get('ctaCte');
          fcsControl.;*/
          //this.padronElement.nativeElement.focus();
        }
        //console.log("this.selectedcatastroForm>" + this.selectedCatastroForm);
      }

    updateSelectedCatastro(): void
    {
        // Marcar el formulario como tocado para activar los validadores
        this.selectedCatastroForm.markAllAsTouched();

        // Verificar si el formulario es válido
        if (this.selectedCatastroForm.invalid) {
            // Mostrar un mensaje de error
            this.showFlashMessage('validacion');
            return;
        }

        if (this.esActualizar == false) {
            if (this.dimensionCount == 0 || this.superficieCount == 0){
                // Mostrar un mensaje de error
                this.showFlashMessage('validacion');
                return;
            }
        }

        // Get the product object
        const catastroForm = this.selectedCatastroForm.getRawValue();
        let fecha_pago = ""
        //validar fecha
        if (catastroForm.fechaPago != null) {
            // Esto cubre tanto null como undefined
            fecha_pago = this.formatDateStringBarras(catastroForm.fechaPago)
        }

        const catastro: CatastroModel = {
                    id: catastroForm.id,
                    ctaCte: catastroForm.ctaCte,
                        direccionCatastro: catastroForm.direccionCatastro,
                        observacion: catastroForm.observacion,
                        actividad: catastroForm.actividad,
                        anioBasura: catastroForm.anioBasura,
                        loteCatastro: catastroForm.loteCatastro,
                        codigoBasura: catastroForm.codigoBasura,
                        superficie: catastroForm.superficie,
                        manzanaCatastro: catastroForm.manzanaCatastro,
                        pisoCatastro: catastroForm.pisoCatastro,
                        unidadCatastro: catastroForm.unidadCatastro,
                        zonaCatastro: catastroForm.zonaCatastro,
                        departamento: catastroForm.departamento,
                        estado: catastroForm.estado,
                        exoneradoCatastro: catastroForm.exoneradoCatastro,
                        fechaPago: fecha_pago,
                        fechaBasura: catastroForm.fechaBasura,
                        loteamientoLote: catastroForm.loteamientoLote,
                        loteamientoManzana: catastroForm.loteamientoManzana,
                        loteamientoZona: catastroForm.loteamientoZona,
                        matricula: catastroForm.matricula,
                        nroCasa: catastroForm.nroCasa,
                        numFinca: catastroForm.numFinca,
                        padron: catastroForm.padron,
                        reciboBasura: catastroForm.reciboBasura,
                        reciboCatastro: catastroForm.reciboCatastro,
                        rmc: catastroForm.rmc,
                        serie: catastroForm.serie,
                        serieCatastro: catastroForm.serieCatastro,
                        subZona : catastroForm.subZona,
                        subZona1: catastroForm.subZona1,
                        suelo: catastroForm.suelo,
                        supeficieHectareas: catastroForm.supeficieHectareas,
                        superficieProductivo: catastroForm.superficieProductivo,
                        tenencia: catastroForm.tenencia,
                        tipoCuenta: catastroForm.tipoCuenta, 
                        ultimoAnioPagado: catastroForm.ultimoAnioPagado,
                        urbanaRural: catastroForm.urbanaRural,
                        vieneDeLaCtaCte: catastroForm.vieneDeLaCtaCte,

                        superficies: this.superficieArray,
                        dimensiones: this.dimensionArray,
                        construcciones: this.construccionArray,
                           
        };
        if(this.botonTexto === 'Actualizar'){
            this._catastroService.updateCatastro(catastro).subscribe(() =>
                {
                //     Show a success message
                   this.showFlashMessage('success');
                })
        }else{

                // Llamada al servicio para actualizar el catastro
                this._catastroService.updateCatastro_2(catastroForm.id, catastro, (message: string) => {
                    // Actualizar flashMessage con el mensaje recibido del servicio
                    if (message === 'success') {
                        this.flashMessage = 'success';
                    } else if (message === 'ya existe') {
                        this.flashMessage = 'Ya existe';
                    } else if (message === 'no encontrado') {
                        this.flashMessage = 'No encontrado';
                    } else if (message === 'error interno') {
                        this.flashMessage = 'Error interno';
                    } else if (message === 'validacion') {
                        this.flashMessage = 'validacion';
                    } else {
                        this.flashMessage = 'error';  // Caso genérico para otros errores
                    }
                }).subscribe(response => {
                    if (response) {
                        console.log('Catastro actualizado con éxito:', response);
                    } else {
                        console.log('Error al actualizar catastro');
                    }
                });
            
               //vaciar arrays
               //ver la forma de mejorar esto
                this._construccionService
                .getConstruccionByCtaCteArray('00') // Nueva llamada para obtener la dimensión
                .subscribe((Data) => {
                    this.construccionesArray = []; 
                    this._changeDetectorRef.detectChanges();  // Forzamos la detección de cambios
                });
                //ver la forma de mejorar esto
                this._dimensionService
                .getDimensionByCtaCteArray('00') // Nueva llamada para obtener la dimensión
                .subscribe((Data) => {
                    this.dimensionesArray = []; 
                    this._changeDetectorRef.detectChanges();  // Forzamos la detección de cambios
                });
                //ver la forma de mejorar esto
                this._superficieSAervice
                .getSuperficiesByCtaCteArray('00') // Nueva llamada para obtener la dimensión
                .subscribe((Data) => {
                    this.superficiesArray = []; 
                    this._changeDetectorRef.detectChanges();  // Forzamos la detección de cambios
                });
        }

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

    // En tu componente
    getCategoriaConstruccion(id: string): string {
        const categoriaConstruccion = categoriaConstrucciones.find(categoriaConstruccion => categoriaConstruccion.id === id);
        return categoriaConstruccion ? categoriaConstruccion.descripcion : 'Desconocido'; // Si no encuentra el id, retorna 'Desconocido'
    }
    getTipoConstruccion(id: string): string {
        const tipoConstruccion = tipoConstrucciones.find(tipoConstruccion => tipoConstruccion.id === id);
        return tipoConstruccion ? tipoConstruccion.descripcion : 'Desconocido'; // Si no encuentra el id, retorna 'Desconocido'
    }
    getCalles(id: string): string {
        const calle = calles.find(calle => calle.id === id);
        return calle ? calle.descripcion : 'Desconocido'; // Si no encuentra el id, retorna 'Desconocido'
    }
    //import { categoriaConstrucciones, tipoConstrucciones, calles, orientaciones, callesPrincipales, frentes, categoriasZonas } from './catastros-types';
    getOrientaciones(id: string): string {
        const orientacion = orientaciones.find(orientacion => orientacion.id === id);
        return orientacion ? orientacion.descripcion : 'Desconocido'; // Si no encuentra el id, retorna 'Desconocido'
    }
    getCallesPrincipales(id: string): string {
        const callePrincipal = callesPrincipales.find(callePrincipal => callePrincipal.id === id);
        return callePrincipal ? callePrincipal.descripcion : 'Desconocido'; // Si no encuentra el id, retorna 'Desconocido'
    }
    getFrentes(id: string): string {
        const frente = frentes.find(frente => frente.id === id);
        return frente ? frente.descripcion : 'Desconocido'; // Si no encuentra el id, retorna 'Desconocido'
    }
    getCategoriasZonas(id: string): string {
        const categoriaZona = categoriasZonas.find(categoriaZona => categoriaZona.id === id);
        return categoriaZona ? categoriaZona.descripcion : 'Desconocido'; // Si no encuentra el id, retorna 'Desconocido'
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
        const control = this.selectedcatastroForm.get(field);
        if (control.hasError('maxLength')) {
        const error = control.getError('maxLength');
        //return `El campo no puede tener más de 2 caracteres.`;
        return `Valor máximo: ${error.requiredLength} caracteres. (Actual: ${error.actualLength})`;
    
        }
        return '';
    }
}


