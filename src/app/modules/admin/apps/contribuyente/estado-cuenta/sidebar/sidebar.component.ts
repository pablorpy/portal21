import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FuseNavigationItem, FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { Subject, takeUntil } from 'rxjs';
import { ProformasService } from '../../../proformas/proformas.service';
import { OpcionModel } from '../../../parametros/dominios/dominios.types';
import { DominiosService } from '../../../parametros/dominios/dominios.service';
import { InmueblesService } from '../../../inmuebles/list/inmuebles.service';
import { InmuebleCuentaComponent } from '../inmueble-cuenta/inmueble-cuenta.component';
import { InmuebleModel } from '../../../inmuebles/list/inmuebles-types';
import { cloneDeep } from 'lodash-es';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgClass, NgIf, NgFor, AsyncPipe, NgTemplateOutlet, CurrencyPipe } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule, MatOptionModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { FuseMasonryComponent } from '@fuse/components/masonry';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'estado-cuenta-box-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls    : ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports      : [MatButtonModule, MatIconModule, FuseVerticalNavigationComponent,MatFormFieldModule,MatSelectModule,
                        MatSidenavModule, MatRippleModule, NgClass, NgIf, NgFor, ReactiveFormsModule,
                        FuseMasonryComponent, AsyncPipe, MatProgressBarModule, MatSortModule, NgTemplateOutlet, 
                        MatPaginatorModule, MatSlideToggleModule, MatOptionModule, 
                        MatCheckboxModule, CurrencyPipe]
})
export class EstadoCuentaBoxSidebarComponent implements OnInit, OnDestroy {
    filtroEstadoCuentaContribForm: UntypedFormGroup;
    tiposDocumentos: OpcionModel[];
    defaultTipoDoc: number;
    /* filter$: BehaviorSubject<string> = new BehaviorSubject('conceptos');
    filters: MailFilter[];
    folders: MailFolder[];
    labels: MailLabel[]; */
    conceptosIngresos: OpcionModel[];
    tipoDocumento : OpcionModel;
    nroDocumento : string;
    //menuData: FuseNavigationItem[] = [];
  private _conceptosIngresoMenuData: FuseNavigationItem[] = [];
  
  private _filtersMenuData: FuseNavigationItem[] = [];
  private _labelsMenuData: FuseNavigationItem[] = [];
  private _otherMenuData: FuseNavigationItem[] = [];
  private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        //private _mailboxService: MailboxService,
        private _inmuebleService: InmueblesService,
        private _proformaService: ProformasService,
        private _dominioService: DominiosService,
        private _matDialog: MatDialog,
        private _fuseNavigationService: FuseNavigationService,
        private _formBuilder: UntypedFormBuilder
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
        /* this.filtroEstadoCuentaContribForm = this._formBuilder.group({
            id               : [{value:'', disabled:true}, [Validators.required]],
            tipoDocumento           : ['', [Validators.required]],
            nroDocumento           : ['', [Validators.required]],
            nombre      : ['', [Validators.required]],
            apellido           : ['', [Validators.required]],
        }); */
        this._proformaService.filtroCuentasContribuyente$.subscribe(res => {
            this.tipoDocumento = res.tipoDocumento;
            this.nroDocumento = res.nroDocumento;
        });
        // Filters
        /* this._mailboxService.filters$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((filters: MailFilter[]) =>
            {
                this.filters = filters;

                // Generate menu links
                this._generateFiltersMenuLinks();
            }); */
        // this._dominioService.getOpcionesByDominio('CONINGRGRAL');
        // Folders
        this._dominioService.getOpcionesByDominio('CONINGRGRAL')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((conceptosIngresoFromDB: OpcionModel[]) =>
            {
                this.conceptosIngresos = conceptosIngresoFromDB;

                // Generar los links de menu
                //this._generarMenuLinksConceptosIngreso();
                // Update navigation badge
                this._updateNavigationBadge(conceptosIngresoFromDB);
            });

        // Historial de Pagos
       /*  this._proformaService.proformas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((labels: OpcionModel[]) =>
            {
                this.labels = labels;

                // Generate menu links
                this._generateLabelsMenuLinks();
            }); */

        // Generate other menu links
        this._generateOtherMenuLinks();
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
     * Open compose dialog
     */
    openComposeDialog(): void
    {
        // Open the dialog
        const dialogRef = this._matDialog.open(InmuebleCuentaComponent);

        dialogRef.afterClosed()
            .subscribe((result) =>
            {
                console.log('Compose dialog was closed!');
            });
    }
    

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Generate menus para conceptos de ingreso
     *
     * @private
     */
    /*private _generarMenuLinksConceptosIngreso(): void
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
                link : '/apps/estado-cuenta/'+ conceptoIngreso.codigo + '/' + this.tipoDocumento.id + '/' + this.nroDocumento + '/1',
            };
*/
            // Si la cantidad de deudas por ese concepto de ingreso está disponible y es mayor a cero...
            /*if ( conceptoIngreso.cantidad && conceptoIngreso.cantidad > 0 )
            {
                // Agregar la cantidad y el badge (la burbujita)
                menuItem['badge'] = {
                    title: conceptoIngreso.cantidad + '',
                };
            }*/

            // Agregar el item de menu al menu data de los conceptos de ingreso
            /*this._conceptosIngresoMenuData.push(menuItem);
        });

        // Update the menu data
        this._updateMenuData();
    }*/

   

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
        //this._updateMenuData();
    }

    /**
     * Update the menu data
     *
     * @private
     */
  /*  private _updateMenuData(): void
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
    }*/

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

    consultarEstadoCuenta(searchQuery: string): any{
        this._inmuebleService.getInmueblesByNroCiContribuyente(searchQuery).subscribe();
    }

    abrirDialogoInmuebleDetalle(inm: InmuebleModel): void {
        this._inmuebleService.getCuentasInmuebleByIdInmueble(inm).subscribe();
        const dialogRef = this._matDialog.open(InmuebleCuentaComponent, {
            autoFocus: false,
            data     : {
                inmueble: cloneDeep(inm),
            },
        });
        dialogRef.afterClosed()
            .subscribe((result) =>
            {
                console.log('Compose dialog was closed!');
            });
    }

    filterByQuery(query: string): void
    {
       // this.searchQuery$.next(query);
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
}
