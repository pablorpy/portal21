import { NgIf, NgFor, NgTemplateOutlet, NgClass, AsyncPipe, CurrencyPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { Observable, Subject, debounceTime, map, merge, switchMap, takeUntil } from 'rxjs';
import { TimbradoModel, TimbradoPagination } from './timbrados-types';
import { OpcionModel } from '../../parametros/dominios/dominios.types';
import { RegistroModel } from '../../registros/registros-types';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { DominiosService } from '../../parametros/dominios/dominios.service';
import { RegistrosService } from '../../registros/registros.service';
import { TimbradosService } from './timbrados.service';

@Component({
    selector: 'timbrado-list',
    templateUrl: './timbrado.component.html',
    styleUrls: ['./timbrado.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations,
    standalone: true,
    imports: [NgIf, MatProgressBarModule, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
})
export class TimbradoComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    timbrados$: Observable<TimbradoModel[]>;
    isLoading: boolean = false;
    searchInputControl: UntypedFormControl = new UntypedFormControl();
    pagination: TimbradoPagination;
    selectedTimbrado: TimbradoModel | null = null;
    selectedTimbradoForm: UntypedFormGroup;
    estados: OpcionModel[];
    tiposComprobantes: OpcionModel[];
    flashMessage: 'success' | 'error' | null = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    buttonLabel: string = 'Insertar';

    public mask = {
        guide: true,
        showMask: true,
        mask: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]
    };

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _formBuilder: UntypedFormBuilder,
        private _timbradoService: TimbradosService,
        private _dominioService: DominiosService,
        private _matDialog: MatDialog,
        private _registroService: RegistrosService
    ) { }

    ngAfterViewInit(): void {
        if (this._sort && this._paginator) {
            this._sort.sort({
                id: 'id',
                start: 'asc',
                disableClear: true,
            });

            this._changeDetectorRef.markForCheck();

            this._sort.sortChange
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(() => {
                    this._paginator.pageIndex = 0;
                    this.closeDetails();
                });

            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.closeDetails();
                    this.isLoading = true;
                    return this._timbradoService.getTimbrados(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
                }),
                map(() => {
                    this.isLoading = false;
                }),
            ).subscribe();

            this.getTiposComprobantes();
            this.getEstadosGenericos();
        }
    }

    closeDetails(): void {
        this.selectedTimbrado = null;
    }

    formatDateStringBarras(inputDate: string): string {
        // Dividir la fecha en partes (año, mes, día)
        const parts = inputDate.split('-');

        // Crear una nueva fecha con las partes en el orden correcto
        const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

        return formattedDate;
    }

    formatDateString(inputDate: string): string {
        // Dividir la fecha en partes (año, mes, día)
        const parts = inputDate.split('/');

        // Crear una nueva fecha con las partes en el orden correcto
        const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

        return formattedDate;
    }

    toggleDetails(timbradoId: string): void {
        if (this.selectedTimbrado && this.selectedTimbrado.id === timbradoId) {
            this.closeDetails();
            return;
        }

        this.buttonLabel = 'Actualizar';
        this._timbradoService.getTimbradoById(timbradoId)
            .subscribe((timbrado) => {
                this.selectedTimbrado = timbrado;

                // Verificar y formatear fechas para el campo datetime-local
                const formattedInicio = timbrado.fechaInicio ? this.formatDateString(timbrado.fechaInicio) : null;
                const formattedVencimiento = timbrado.fechaVencimiento ? this.formatDateString(timbrado.fechaVencimiento) : null;

                // Utilizar patchValue para actualizar solo los campos necesarios
                this.selectedTimbradoForm.patchValue({
                    id: timbrado.id,
                    nroTimbrado: timbrado.nroTimbrado,
                    nroEstablecimiento: timbrado.nroEstablecimiento,
                    puntoExpedicion: timbrado.puntoExpedicion,
                    tipoComprobante: timbrado.tipoComprobante ? timbrado.tipoComprobante.id : null,
                    estado: timbrado.estado ? timbrado.estado.id : null,
                    fechaInicio: formattedInicio,
                    fechaVencimiento: formattedVencimiento,
                    cantidad: timbrado.cantidad,
                    factDesde: timbrado.factDesde,
                    factHasta: timbrado.factHasta,
                });

                this._changeDetectorRef.markForCheck();
            });
    }




    updateSelectedTimbrado(): void {
        const timbradoFormValue = this.selectedTimbradoForm.getRawValue();
        const timbrado: TimbradoModel = {
            id: timbradoFormValue.id,
            nroTimbrado: timbradoFormValue.nroTimbrado,
            nroEstablecimiento: timbradoFormValue.nroEstablecimiento,
            puntoExpedicion: timbradoFormValue.puntoExpedicion,
            tipoComprobante: timbradoFormValue.tipoComprobante && timbradoFormValue.tipoComprobante != 0 ? { id: timbradoFormValue.tipoComprobante } : null,
            estado: timbradoFormValue.estado && timbradoFormValue.estado != 0 ? { id: timbradoFormValue.estado } : null,
            cantidad: timbradoFormValue.cantidad,
            factDesde: timbradoFormValue.factDesde,
            factHasta: timbradoFormValue.factHasta,
            fechaInicio: timbradoFormValue.fechaInicio !== null ? this.formatDateStringBarras(timbradoFormValue.fechaInicio) : null,
            fechaVencimiento: timbradoFormValue.fechaVencimiento !== null ? this.formatDateStringBarras(timbradoFormValue.fechaVencimiento) : null
        };

        this._timbradoService.updateTimbrado(timbrado.id, timbrado).subscribe(() => {
            this.showFlashMessage('success');
        });
    }





    showFlashMessage(type: 'success' | 'error'): void {
        this.flashMessage = type;
        this._changeDetectorRef.markForCheck();
        setTimeout(() => {
            this.flashMessage = null;
            this._changeDetectorRef.markForCheck();
        }, 3000);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next;
        this._unsubscribeAll.complete();
    }

    agregarTimbrado(): void {
        if (!this.existeUnTimbradoSinId()){
            this._timbradoService.createTimbrado().subscribe((newTimbrado) => {
                newTimbrado.tipoComprobante = {"id":0};
                newTimbrado.estado = {"id":0};
                this.selectedTimbrado = newTimbrado;
                this.buttonLabel = 'Insertar';
                console.log(newTimbrado.fechaInicio);
                this.selectedTimbradoForm.reset({
                    id: newTimbrado.id,
                    nroTimbrado: newTimbrado.nroTimbrado,
                    nroEstablecimiento: newTimbrado.nroEstablecimiento,
                    puntoExpedicion: newTimbrado.puntoExpedicion,
                    tipoComprobante: newTimbrado.tipoComprobante ? newTimbrado.tipoComprobante  : null,
                    fechaInicio: newTimbrado.fechaInicio,
                    fechaVencimiento: newTimbrado.fechaVencimiento,
                    cantidad: newTimbrado.cantidad,
                    factDesde: newTimbrado.factDesde,
                    factHasta: newTimbrado.factHasta,
                    estado: newTimbrado.estado ? newTimbrado.estado : null
                });
                this._changeDetectorRef.markForCheck();
            });
        }
    }

    ngOnInit(): void {
        this.selectedTimbradoForm = this._formBuilder.group({
            id: ['', [Validators.required]],
            nroTimbrado: ['', [Validators.required]],
            nroEstablecimiento: ['', [Validators.required]],
            puntoExpedicion: ['', [Validators.required]],
            tipoComprobante: ['', [Validators.required]],
            fechaInicio: ['', [Validators.required]],
            fechaVencimiento: ['', [Validators.required]],
            cantidad: ['', [Validators.required]],
            factDesde: ['', [Validators.required]],
            factHasta: ['', [Validators.required]],
            estado: ['', [Validators.required]],
        });

        // Lógica para cargar los tipos de comprobantes y estados
        this.getTiposComprobantes();
        this.getEstadosGenericos();

        // Suscripción para escuchar cambios en la paginación de los timbrados
        this._timbradoService.pagination$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagination: TimbradoPagination) => {
                this.pagination = pagination;
                this._changeDetectorRef.markForCheck();
            });

        // Suscripción para cargar los timbrados y manejar la búsqueda
        this.timbrados$ = this._timbradoService.timbrados$;

        this.searchInputControl.valueChanges
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(300),
                switchMap((query) => {
                    this.isLoading = true;
                    return this._timbradoService.getTimbrados(0, 10, 'id', 'asc', query);
                }),
                map(() => {
                    this.isLoading = false;
                }),
            )
            .subscribe();
    }

    getEstadosGenericos(): void {
        this._dominioService.getEstados()
            .subscribe((estadosGen) => {
                this.estados = estadosGen;
                this._changeDetectorRef.markForCheck();
            });
    }

    getTiposComprobantes(): void {
        this._dominioService.getTiposComprobantes()
            .subscribe((tiposFromService) => {
                this.tiposComprobantes = tiposFromService;
                this._changeDetectorRef.markForCheck();
            });
    }
    existeUnTimbradoSinId() : boolean{
        let tieneId : boolean = false;
        this.timbrados$.subscribe(tim => {
            tieneId = tim[0].id != null && tim[0].id != '';
          });
    
        return !tieneId;
    }
}

