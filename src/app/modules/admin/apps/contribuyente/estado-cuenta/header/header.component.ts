import { NgClass, NgIf, NgFor, AsyncPipe, NgTemplateOutlet, CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule, MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { FuseMasonryComponent } from '@fuse/components/masonry';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Observable, BehaviorSubject, Subject, takeUntil, take, first } from 'rxjs';
import { InmuebleModel } from '../../../inmuebles/list/inmuebles-types';
import { InmueblesService } from '../../../inmuebles/list/inmuebles.service';
import { DominiosService } from '../../../parametros/dominios/dominios.service';
import { OpcionModel } from '../../../menues/menues.types';
import { ContribuyenteModel } from '../../contribuyentes.types';
import { ProformasService } from '../../../proformas/proformas.service';
import { FuseVerticalNavigationComponent } from '@fuse/components/navigation/vertical/vertical.component';
import { FuseNavigationItem } from '@fuse/components/navigation/navigation.types';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'estado-cuenta-box-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone     : true,
  imports        : [MatSidenavModule, MatSelectModule, MatRippleModule, NgClass, MatIconModule, NgIf, NgFor, 
                      MatButtonModule, MatFormFieldModule, MatInputModule, FuseMasonryComponent, AsyncPipe, 
                      MatProgressBarModule, FormsModule, ReactiveFormsModule, MatSortModule, NgTemplateOutlet, 
                      MatPaginatorModule, MatSlideToggleModule, MatOptionModule, MatCheckboxModule, CurrencyPipe,
                      FuseVerticalNavigationComponent]
})
export class HeaderComponent implements OnInit, OnDestroy
{
    /* labels$: Observable<Label[]>;
    notes$: Observable<Note[]>; */
    //conceptosIngresos$: Observable<OpcionModel[]>;
    conceptosIngresos: OpcionModel[];
    tiposDocumentos: OpcionModel[];
    defaultTipoDoc: number;
    tipoDocumento : OpcionModel;
    nroDocumento : string;
    inmuebles$: Observable<InmuebleModel[]>;
    
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = false;
    masonryColumns: number = 4;
    filter$: BehaviorSubject<string> = new BehaviorSubject('conceptos');
    searchQuery$: BehaviorSubject<string> = new BehaviorSubject(null);
    selectedContribuyente: ContribuyenteModel | null = null;
    filtroEstadoCuentaContribForm: UntypedFormGroup;
    nacionalidades: OpcionModel[];
    menuData: FuseNavigationItem[] = [];
    private _otherMenuData: FuseNavigationItem[] = [];
    private _conceptosIngresoMenuData: FuseNavigationItem[] = [];
    
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    conceptoIngresoActual: string;

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
        private _proformaService: ProformasService,
        private _formBuilder: UntypedFormBuilder,
        private _dominioService: DominiosService,
        private _inmuebleService: InmueblesService,
        private _fuseNavigationService: FuseNavigationService,
        private router: Router,
        private _activatedRoute: ActivatedRoute
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
        this.getTiposDocumentos();
        this.filtroEstadoCuentaContribForm = this._formBuilder.group({
            tipoDocumento           : ['', [Validators.required]],
            nroDocumento           : ['', [Validators.required]],
            nombre      : ['', [Validators.required]],
            apellido           : ['', [Validators.required]],
        });
        this._proformaService.filtroCuentasContribuyente$.subscribe(res => {
            this.tipoDocumento = res.tipoDocumento;
            this.nroDocumento = res.nroDocumento;
        });
        this._proformaService.conceptoIngresoActual$.subscribe(res => {
            this.conceptoIngresoActual = res;
        });
        
        // Request the data from the server
        //this._notesService.getLabels().subscribe();
        //this._notesService.getNotes().subscribe();
        //this.conceptosIngresos$ = this._dominioService.getOpcionesByDominio('CONINGRGRAL');
        this._dominioService.getOpcionesByDominio('CONINGRGRAL')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((conceptosIngresoFromDB: OpcionModel[]) =>
            {
                this.conceptosIngresos = conceptosIngresoFromDB;

                // Generar los links de menu
                this._generarMenuLinksConceptosIngreso();
                // Update navigation badge
                this._updateNavigationBadge(conceptosIngresoFromDB);
            });
       //this.getTiposDocumentos();
        // Get labels
        //this.labels$ = this._notesService.labels$;
        this.inmuebles$ = this._inmuebleService.inmuebles$;
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}): void =>
            {
                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Set the masonry columns
                //
                // This if block structured in a way so that only the
                // biggest matching alias will be used to set the column
                // count.
                if ( matchingAliases.includes('xl') )
                {
                    this.masonryColumns = 5;
                }
                else if ( matchingAliases.includes('lg') )
                {
                    this.masonryColumns = 4;
                }
                else if ( matchingAliases.includes('md') )
                {
                    this.masonryColumns = 3;
                }
                else if ( matchingAliases.includes('sm') )
                {
                    this.masonryColumns = 2;
                }
                else
                {
                    this.masonryColumns = 1;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
            this._generateOtherMenuLinks();
    }

    getTiposDocumentos(): void
    {
        // Get the product by id
        this._dominioService.getOpcionesByDominio('TIPDOCIDENT')
        .subscribe((datos) =>
        {
            // Set the selected product
            this.tiposDocumentos = datos;
            this.defaultTipoDoc = this.tiposDocumentos.find(t => t.porDefecto).id;
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    } 

  consultarEstadoCuenta(): any{
    /* this._proformaService.changeFiltroCuentasContribuyente({
        "tipoDocumento": this.tipoDocumento, 
        "nroDocumento": this.nroDocumento
    }); */
    this._proformaService.setConceptoIngresoActual(window.location.pathname.split("/")[3]);
    console.log('this.conceptoIngresoActual en consulta estado cuenta: ' +this.conceptoIngresoActual);
    //this.filtroEstadoCuentaContribForm.get('tipoDocumento').value
    if (window.location.pathname.split("/")[3] === 'INM'){
        this._inmuebleService.getInmueblesByNroCiContribuyente(
                this.filtroEstadoCuentaContribForm.get('nroDocumento').value
            ).subscribe(res => {
                this._proformaService.contribuyenteProformaActual = res[0].contribuyente;
                console.log("this._proformaService.contribuyenteProformaActual::: " + this._proformaService.contribuyenteProformaActual.nombre);
            });
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

       /**
     * Generate menus para conceptos de ingreso
     *
    
     */
     _generarMenuLinksConceptosIngreso(): void
    {
        // Resetear los datos de menú de los conceptos de ingreso
        this._conceptosIngresoMenuData = [];

        // Iterate through the folders
        this.conceptosIngresos.forEach((conceptoIngreso) =>
        {
            //console.log(this.headerComponent.filtroEstadoCuentaContribForm.controls["tipoDocumento"]);
            // Generate menu item for the folder
            //console.log('TIPO DOCUMENTO: ' + this.headerComponent.filtroEstadoCuentaContribForm.get('tipoDocumento').value);
            const menuItem: FuseNavigationItem = {
                id   : conceptoIngreso.id + '',
                title: conceptoIngreso.descripcion,
                type : 'basic',
                icon : conceptoIngreso.icono,
                link : '/apps/estado-cuenta/'+ conceptoIngreso.codigo + '/' + 
                    this.filtroEstadoCuentaContribForm.get('tipoDocumento').value + '/' + 
                    this.filtroEstadoCuentaContribForm.get('nroDocumento').value + '/1',
            };

            // Si la cantidad de deudas por ese concepto de ingreso está disponible y es mayor a cero...
            /*if ( conceptoIngreso.cantidad && conceptoIngreso.cantidad > 0 )
            {
                // Agregar la cantidad y el badge (la burbujita)
                menuItem['badge'] = {
                    title: conceptoIngreso.cantidad + '',
                };
            }*/

            // Agregar el item de menu al menu data de los conceptos de ingreso
            this._conceptosIngresoMenuData.push(menuItem);
        });

        // Update the menu data
        this._updateMenuData();
    }

   

    /**
     * Generate other menus
     *
     * @private
     */
    private _generateOtherMenuLinks(): void
    {
        // Settings menu
        this._otherMenuData.push({
            title: 'Configuraciones',
            type : 'basic',
            icon : 'heroicons_outline:cog-8-tooth',
            link : '/apps/estado-cuenta/settings',
        });

        // Update the menu data
        this._updateMenuData();
    }

    /**
     * Update the menu data
     *
     * @private
     */
    private _updateMenuData(): void
    {
        this.menuData = [
            {
                title   : 'CONCEPTOS DE INGRESO',
                type    : 'group',
                children: [
                    ...this._conceptosIngresoMenuData,
                ],
            },
            {
                type: 'spacer',
            },
            ...this._otherMenuData,
        ];
    }

    /**
     * Update the navigation badge using the
     * unread count of the inbox folder
     *
     * @param folders
     * @private
     */
    private _updateNavigationBadge(conceptosIngreso: OpcionModel[]): void
    {
        // Obtenemos la el contenido del concepto Inmuebles
        const inmuebleFolder = this.conceptosIngresos.find(concepto => concepto.codigo === 'INM');

        // Get the component -> navigation data -> item
        const mainNavigationComponent = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>('mainNavigation');

        // If the main navigation component exists...
        if ( mainNavigationComponent )
        {
            const mainNavigation = mainNavigationComponent.navigation;
            const menuItem = this._fuseNavigationService.getItem('apps.estado.cuenta.contribuyente', mainNavigation);

            // Update the badge title of the item
           // menuItem.badge.title = '3';//conceptoIngresoInm.cantidad + '';

            // Refresh the navigation
            mainNavigationComponent.refresh();
        }
    }
}


