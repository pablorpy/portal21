import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DatePipe, DecimalPipe, NgClass, NgFor, NgIf, NgPlural, NgPluralCase, CurrencyPipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseScrollResetDirective } from '@fuse/directives/scroll-reset';
import { FuseFindByKeyPipe } from '@fuse/pipes/find-by-key/find-by-key.pipe';
import { Subject, takeUntil } from 'rxjs';
import { InmuebleCuentaModel, InmuebleModel } from '../../../inmuebles/list/inmuebles-types';
import { CategoriaCuenta } from '../../contribuyentes.types';
import { OpcionModel } from '../../../menues/menues.types';
import { labelColorDefs } from '../estado-cuenta-box.constants';
import { InmueblesService } from '../../../inmuebles/list/inmuebles.service';
import { DominiosService } from '../../../parametros/dominios/dominios.service';
import { SettingsComponent } from "../../../../../../layout/common/settings/settings.component";
import { ProformaComponent } from "../proforma/proforma.component";
import { ProformasService } from '../../../proformas/proformas.service';
import { ProformaDetalleModel } from '../estado-cuenta-box.types';

import { registerLocaleData } from '@angular/common';
import localePy from '@angular/common/locales/es-PY';
registerLocaleData(localePy, 'py');

@Component({
  selector: 'estado-cuenta-box-details',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [NgIf, MatButtonModule, RouterLink, MatIconModule, MatMenuModule, NgFor, MatRippleModule, MatCheckboxModule, NgClass, FuseScrollResetDirective, NgPlural, NgPluralCase, MatFormFieldModule, MatInputModule, FuseFindByKeyPipe, DecimalPipe, DatePipe, SettingsComponent, ProformaComponent, CurrencyPipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class EstadoCuentaBoxDetailsComponent implements OnInit, OnDestroy
{
    @ViewChild('infoDetailsPanelOrigin') private _infoDetailsPanelOrigin: MatButton;
    @ViewChild('infoDetailsPanel') private _infoDetailsPanel: TemplateRef<any>;

    conceptosIngresos: OpcionModel[];
    labelColors: any;
    //labels: MailLabel[];
    inmueble: InmuebleModel;
    cuentasInmueble : InmuebleCuentaModel[];
    proformaDetalles : ProformaDetalleModel[];
    replyFormActive: boolean = false;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    @ViewChild('ref') ref;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _elementRef: ElementRef,
        private _inmuebleService: InmueblesService,
        private _proformaService: ProformasService,
        private _dominioService: DominiosService,
        private _overlay: Overlay,
        private _router: Router,
        private _viewContainerRef: ViewContainerRef,
      //  public proformaComponent: ProformaComponent,
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
        // Get the label colors
        this.labelColors = labelColorDefs;

        // Folders
       this._dominioService.getOpcionesByDominio('CONINGRGRAL')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((conceptosIngresoFromDB: OpcionModel[]) =>
            {
                this.conceptosIngresos = conceptosIngresoFromDB;

            });

         // Obtenemos el Inmueble
         /*this._inmuebleService.inmueble$
         .pipe(takeUntil(this._unsubscribeAll))
         .subscribe((inm: InmuebleModel) =>
         {
             this.inmueble = inm;
         });*/

         this._inmuebleService.inmueble$
         .pipe(takeUntil(this._unsubscribeAll))
         .subscribe((inm: InmuebleModel) =>
         {
             this.inmueble = inm;
             this._inmuebleService.getCuentasInmuebleByIdInmueble(inm).subscribe((ctas: InmuebleCuentaModel[]) =>
                {
                    this.cuentasInmueble = ctas;
                    
                });
         });
         //this.cuentasInmueble$ = this._inmuebleService.cuentasInmueble$;

        // Selected mail changed
        this._inmuebleService.selectedInmuebleChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() =>
            {
                // De-activate the reply form
                this.replyFormActive = false;
            });
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
     * Get the current folder
     */
    getCurrentFolder(): any
    {
        return this._activatedRoute.snapshot.paramMap.get('folder');
    }

    /**
     * Move to folder
     *
     * @param folderSlug
     */
/*    moveToFolder(folderCodigo: string): void
    {
        // Find the folder details
        const folder = this.conceptosIngresos.find(item => item.codigo === folderCodigo);

        // Update the mail object
        //this.mail.folder = folder.id;

        // Update the mail on the server
        this._inmuebleService.updateMail(this.mail.id, {folder: this.mail.folder}).subscribe();

        // Navigate to the parent
        this._router.navigate(['./'], {relativeTo: this._activatedRoute.parent});
    }
*/
    /**
     * Toggle label
     *
     * @param label
     */
/*    toggleLabel(label: MailLabel): void
    {
        let deleted = false;

        // Update the mail object
        if ( this.mail.labels.includes(label.id) )
        {
            // Set the deleted
            deleted = true;

            // Delete the label
            this.mail.labels.splice(this.mail.labels.indexOf(label.id), 1);
        }
        else
        {
            // Add the label
            this.mail.labels.push(label.id);
        }

        // Update the mail on the server
        this._mailboxService.updateMail(this.mail.id, {labels: this.mail.labels}).subscribe();

        // If the label was deleted...
        if ( deleted )
        {
            // If the current activated route has a label parameter and it equals to the one we are removing...
            if ( this._activatedRoute.snapshot.paramMap.get('label') && this._activatedRoute.snapshot.paramMap.get('label') === label.slug )
            {
                // Navigate to the parent
                this._router.navigate(['./'], {relativeTo: this._activatedRoute.parent});
            }
        }
    }
*/
    /**
     * Toggle important
     */
/*    toggleImportant(): void
    {
        // Update the mail object
        this.mail.important = !this.mail.important;

        // Update the mail on the server
        this._mailboxService.updateMail(this.mail.id, {important: this.mail.important}).subscribe();

        // If the important was removed...
        if ( !this.mail.important )
        {
            // If the current activated route has a filter parameter and it equals to the 'important'...
            if ( this._activatedRoute.snapshot.paramMap.get('filter') && this._activatedRoute.snapshot.paramMap.get('filter') === 'important' )
            {
                // Navigate to the parent
                this._router.navigate(['./'], {relativeTo: this._activatedRoute.parent});
            }
        }
    }
*/
    /**
     * Toggle star
     */
/*    toggleStar(): void
    {
        // Update the mail object
        this.mail.starred = !this.mail.starred;

        // Update the mail on the server
        this._mailboxService.updateMail(this.mail.id, {starred: this.mail.starred}).subscribe();

        // If the star was removed...
        if ( !this.mail.starred )
        {
            // If the current activated route has a filter parameter and it equals to the 'starred'...
            if ( this._activatedRoute.snapshot.paramMap.get('filter') && this._activatedRoute.snapshot.paramMap.get('filter') === 'starred' )
            {
                // Navigate to the parent
                this._router.navigate(['./'], {relativeTo: this._activatedRoute.parent});
            }
        }
    }
*/
    /**
     * Toggle unread
     *
     * @param unread
     */
/*    toggleUnread(unread: boolean): void
    {
        // Update the mail object
        this.mail.unread = unread;

        // Update the mail on the server
        this._mailboxService.updateMail(this.mail.id, {unread: this.mail.unread}).subscribe();
    }
*/
    /**
     * Reply
     */
/*    reply(): void
    {
        // Activate the reply form
        this.replyFormActive = true;

        // Scroll to the bottom of the details pane
        setTimeout(() =>
        {
            this._elementRef.nativeElement.scrollTop = this._elementRef.nativeElement.scrollHeight;
        });
    }
*/
    /**
     * Reply all
     */
/*    replyAll(): void
    {
        // Activate the reply form
        this.replyFormActive = true;

        // Scroll to the bottom of the details pane
        setTimeout(() =>
        {
            this._elementRef.nativeElement.scrollTop = this._elementRef.nativeElement.scrollHeight;
        });
    }
*/
    /**
     * Forward
     */
/*    forward(): void
    {
        // Activate the reply form
        this.replyFormActive = true;

        // Scroll to the bottom of the details pane
        setTimeout(() =>
        {
            this._elementRef.nativeElement.scrollTop = this._elementRef.nativeElement.scrollHeight;
        });
    }
*/
    /**
     * Discard
     */
/*    discard(): void
    {
        // Deactivate the reply form
        this.replyFormActive = false;
    }
*/
    /**
     * Send
     */
/*    send(): void
    {
        // Deactivate the reply form
        this.replyFormActive = false;
    }
*/
    /**
     * Open info details panel
     */
    openInfoDetailsPanel(): void
    {
        console.log("ESTOY EN openInfoDetailsPanel()");
        // Create the overlay
        this._overlayRef = this._overlay.create({
            backdropClass   : '',
            hasBackdrop     : true,
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._infoDetailsPanelOrigin._elementRef.nativeElement)
                .withFlexibleDimensions(true)
                .withViewportMargin(16)
                .withLockedPosition(true)
                .withPositions([
                    {
                        originX : 'start',
                        originY : 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                    {
                        originX : 'start',
                        originY : 'top',
                        overlayX: 'start',
                        overlayY: 'bottom',
                    },
                    {
                        originX : 'end',
                        originY : 'bottom',
                        overlayX: 'end',
                        overlayY: 'top',
                    },
                    {
                        originX : 'end',
                        originY : 'top',
                        overlayX: 'end',
                        overlayY: 'bottom',
                    },
                ]),
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(this._infoDetailsPanel, this._viewContainerRef);

        // Attach the portal to the overlay
        this._overlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._overlayRef.backdropClick().subscribe(() =>
        {
            // If overlay exists and attached...
            if ( this._overlayRef && this._overlayRef.hasAttached() )
            {
                // Detach it
                this._overlayRef.detach();
            }

            // If template portal exists and attached...
            if ( templatePortal && templatePortal.isAttached )
            {
                // Detach it
                templatePortal.detach();
            }
        });
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

    agregarCuentaInmAProforma(cuenta: InmuebleCuentaModel){

        //this.proformaComponent.
        if (this.ref._checked){
            /*this._proformaService.proformaCargaDetalles.forEach((pro, index)=>{
                if (pro.categoria.codigo == 'INM' && pro.cuentaInmueble.id == cuenta.id){
                    this._proformaService.proformaCargaDetalles.splice(index, 1);
                }
            }); */

            let categ = this._dominioService.getOpcionByCodDominioAndCodOpcion('CONINGRGRAL', 'INM');
            console.log(categ);
            let proformaDetalle : ProformaDetalleModel = {
                id: '0',
                categoria : categ,
                cuentaInmueble : cuenta,
                montoDescuento : 0,
                montoAPagar : cuenta.totalPagar,
                porcentajeDescuento : 0,
                montoCuentaSinDescuento: cuenta.totalPagar
            };
            console.log("HASTA ACA ANTES DE CREAR EL DETALLE");
            this._proformaService.createProformaDetalleTemp(proformaDetalle);
        }else{
            console.log('ENTRAMOS EN EL ELSE');
             this._proformaService.proformaCargaDetalles.forEach((pro, index)=>{
                if (pro.categoria.codigo == 'INM' && pro.cuentaInmueble.id == cuenta.id){
                    this._proformaService.proformaCargaDetalles.splice(index, 1);
                }
            }); 
        }
    
    }
}

