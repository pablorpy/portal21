import { AsyncPipe, CurrencyPipe, NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FuseMasonryComponent } from '@fuse/components/masonry';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Note } from '../estado-cuenta-box.types';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ContribuyenteModel } from '../../contribuyentes.types';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { DominiosService } from '../../../parametros/dominios/dominios.service';
import { OpcionModel } from '../../../parametros/dominios/dominios.types';
import { InmuebleModel } from '../../../inmuebles/list/inmuebles-types';
import { InmueblesService } from '../../../inmuebles/list/inmuebles.service';
import { InmuebleCuentaComponent } from '../inmueble-cuenta/inmueble-cuenta.component';

@Component({
    selector       : 'estado-cuenta-list',
    templateUrl    : './list.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [MatSidenavModule, MatSelectModule, MatRippleModule, NgClass, MatIconModule, NgIf, NgFor, 
                        MatButtonModule, MatFormFieldModule, MatInputModule, FuseMasonryComponent, AsyncPipe, 
                        MatProgressBarModule, FormsModule, ReactiveFormsModule, MatSortModule, NgTemplateOutlet, 
                        MatPaginatorModule, MatSlideToggleModule, MatOptionModule, MatCheckboxModule, CurrencyPipe]
})
export class EstadoCuentaListComponent implements OnInit, OnDestroy
{
    /* labels$: Observable<Label[]>;
    notes$: Observable<Note[]>; */
    conceptosIngresos$: Observable<OpcionModel[]>;
    tiposDocumentos: OpcionModel[];
    defaultTipoDoc: number;

    inmuebles$: Observable<InmuebleModel[]>;
    
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    masonryColumns: number = 4;
    filter$: BehaviorSubject<string> = new BehaviorSubject('conceptos');
    searchQuery$: BehaviorSubject<string> = new BehaviorSubject(null);
    selectedContribuyente: ContribuyenteModel | null = null;
    filtroEstadoCuentaContribForm: UntypedFormGroup;
    nacionalidades: OpcionModel[];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _matDialog: MatDialog,
        //private _notesService: NotesService,
        private _formBuilder: UntypedFormBuilder,
        private _dominioService: DominiosService,
        private _inmuebleService: InmueblesService,
    )
    {
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the filter status
     */
    get filterStatus(): string
    {
        return this.filter$.value;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.filtroEstadoCuentaContribForm = this._formBuilder.group({
            id               : [{value:'', disabled:true}, [Validators.required]],
            tipoDocumento           : ['', [Validators.required]],
            nombre      : ['', [Validators.required]],
            apellido           : ['', [Validators.required]],
        });

        // Request the data from the server
        //this._notesService.getLabels().subscribe();
        //this._notesService.getNotes().subscribe();
        this.conceptosIngresos$ = this._dominioService.getOpcionesByDominio('CONINGRGRAL');
        this.getTiposDocumentos();
        // Get labels
        //this.labels$ = this._notesService.labels$;
        this.inmuebles$ = this._inmuebleService.inmuebles$;
        // Get notes
        /* this.notes$ = combineLatest([this._notesService.notes$, this.filter$, this.searchQuery$]).pipe(
            distinctUntilChanged(),
            map(([notes, filter, searchQuery]) =>
            {
                if ( !notes || !notes.length )
                {
                    return;
                }

                // Store the filtered notes
                let filteredNotes = notes;

                // Filter by query
                if ( searchQuery )
                {
                    searchQuery = searchQuery.trim().toLowerCase();
                    filteredNotes = filteredNotes.filter(note => note.title.toLowerCase().includes(searchQuery) || note.content.toLowerCase().includes(searchQuery));
                }

                // Show all
                if ( filter === 'notes' )
                {
                    // Do nothing
                }

                // Show archive
                const isArchive = filter === 'archived';
                filteredNotes = filteredNotes.filter(note => note.archived === isArchive);

                // Filter by label
                if ( filter.startsWith('label:') )
                {
                    const labelId = filter.split(':')[1];
                    filteredNotes = filteredNotes.filter(note => !!note.labels.find(item => item.id === labelId));
                }

                return filteredNotes;
            }),
        ); */

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
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

/*    getConceptosGralesIngresos(): void
    {
        // Get the product by id
        this._dominioService.getOpcionesByDominio('CONINGRGRAL')
        .subscribe((datos) =>
        {
            // Set the selected product
            this.conceptosIngresos = datos;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
    }*/

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
     * Add a new note
     */
    addNewNote(): void
    {
        /*this._matDialog.open(NotesDetailsComponent, {
            autoFocus: false,
            data     : {
                note: {},
            },
        });*/
    }

    /**
     * Open the edit labels dialog
     */
    openEditLabelsDialog(): void
    {
        //this._matDialog.open(NotesLabelsComponent, {autoFocus: false});
    }

    /**
     * Open the note dialog
     */
    openNoteDialog(note: Note): void
    {
        /*this._matDialog.open(NotesDetailsComponent, {
            autoFocus: false,
            data     : {
                note: cloneDeep(note),
            },
        });*/
    }

    /**
     * Filter by archived
     */
    filterByArchived(): void
    {
        this.filter$.next('archived');
    }

    /**
     * Filtrar por concepto
     *
     * @param conceptoId
     */
    filterByConcepto(conceptoId: string): void
    {
        const filterValue = `concepto:${conceptoId}`;
        this.filter$.next(filterValue);
    }

    /**
     * Filter by query
     *
     * @param query
     */
    filterByQuery(query: string): void
    {
       // this.searchQuery$.next(query);
    }

    /**
     * Reset filter
     */
    resetFilter(): void
    {
        this.filter$.next('todos');
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

    consultarEstadoCuenta(searchQuery: string): any{
        this._inmuebleService.getInmueblesByNroCiContribuyente(searchQuery).subscribe();
        console.log(this.inmuebles$);
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
}
