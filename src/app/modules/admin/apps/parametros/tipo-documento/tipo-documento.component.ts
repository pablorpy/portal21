import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { TipoDocumentoModel, GenericPagination } from './tipo-documentos.types';
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Observable, Subject, takeUntil, debounceTime, switchMap, map, merge } from 'rxjs';
import { TipoDocumentoService } from './tipo-documento.service';
import { NgIf, NgFor, NgTemplateOutlet, NgClass, AsyncPipe, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { TipoDocumentoModalComponent } from './tipo-documento-modal.component';


@Component({
  selector: 'app-tipo-documento',
  standalone: true,
  imports        : [NgIf, MatDialogModule,MatTableModule,MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
  templateUrl: './tipo-documento.component.html',
  styleUrl: './tipo-documento.component.scss'
})
export class TipoDocumentoComponent implements OnInit, AfterViewInit, OnDestroy{


      @ViewChild(MatPaginator) private _paginator: MatPaginator;
      @ViewChild(MatSort) private _sort: MatSort;
  
      tipoDocumentos$: Observable<TipoDocumentoModel[]>;
  
      isLoading: boolean = false;
      searchInputControl: UntypedFormControl = new UntypedFormControl();
      pagination: GenericPagination;
      selectedTipoDocumento: TipoDocumentoModel | null = null;
      selectedTipoDocumentoForm: UntypedFormGroup;

  
      flashMessage: 'success' | 'error' | null = null;
  
      private _unsubscribeAll: Subject<any> = new Subject<any>();


     /**
       * Constructor
       */
      constructor(
          private _changeDetectorRef: ChangeDetectorRef,
          private _fuseConfirmationService: FuseConfirmationService,
          private _formBuilder: UntypedFormBuilder,
          private _tipoDocumentoService: TipoDocumentoService,
          private _dialog: MatDialog,
      )
      {
      }

        ngOnInit(): void
              {
                  // Create the selected product form
                  this.selectedTipoDocumentoForm = this._formBuilder.group({
                      id               : [''],
                      codigo           : ['', [Validators.required]],
                      nombre      : ['', [Validators.required]],
                      estado           : [true],
                      dominioPadre     : [''],
                  });
          
                  // Obtener la paginación
                  this._tipoDocumentoService.pagination$
                      .pipe(takeUntil(this._unsubscribeAll))
                      .subscribe((pagination: GenericPagination) =>
                      {
                          // Update the pagination
                          this.pagination = pagination;
          
                          // Mark for check
                          this._changeDetectorRef.markForCheck();
                      });
                  
                  // Obtener los dominios
                  this.tipoDocumentos$ = this._tipoDocumentoService.tipoDocumentos$;
          
                  // Subscribe to search input field value changes
                  this.searchInputControl.valueChanges
                      .pipe(
                          takeUntil(this._unsubscribeAll),
                          debounceTime(300),
                          switchMap((query) =>
                          {
                              this.closeDetails();
                              this.isLoading = true;
                              return this._tipoDocumentoService.getTipoDocumentos(0, 10, 'nombre', 'asc', query);
                          }),
                          map(() =>
                          {
                              this.isLoading = false;
                          }),
                      )
                      .subscribe();
                      this.tipoDocumentos$.pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
                      //console.log('Tipo Documento cargados:', data);
                      });
  
              }

                  displayedColumns: string[] = ['id', 'nombre', 'acciones'];
  
  
       /**
       * After view init
       */
      ngAfterViewInit(): void
      {
          if ( this._sort && this._paginator )
          {
              // Set the initial sort
              this._sort.sort({
                  id          : 'nombre',
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
                      return this._tipoDocumentoService.getTipoDocumentos(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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

         /**
     * Close the details
     */
    closeDetails(): void
    {
        this.selectedTipoDocumento = null;
    }

    openModal(tipoDocumento?: TipoDocumentoModel): void {
    const dialogRef = this._dialog.open(TipoDocumentoModalComponent, {
        width: '400px',
        data: tipoDocumento ? { ...tipoDocumento } : null
    });

    this._tipoDocumentoService.getTipoDocumentos().subscribe();

    dialogRef.afterClosed().subscribe((result) => {
        if (result) {
            this._tipoDocumentoService.getTipoDocumentos().subscribe(); // Recarga los datos actualizados
        }
    });
}

deleteTipoDocumento(id: string): void {
    const confirmation = this._fuseConfirmationService.open({
        title  : 'Eliminar tipo documento',
        message: '¿Estás seguro de que deseas eliminar este tipo documento?',
        actions: {
            confirm: {
                label: 'Eliminar'
            },
            cancel: {
                label: 'Cancelar'
            }
        }
    });

    confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {
            this._tipoDocumentoService.deleteTipoDocumento(id).subscribe({
                next: () => {
                    // 🔁 Refrescar con los mismos parámetros actuales
                    this._tipoDocumentoService.getTipoDocumentos(
                        this._paginator.pageIndex,
                        this._paginator.pageSize,
                        this._sort.active,
                        this._sort.direction
                    ).subscribe(() => {
                        this.flashMessage = 'success';
                        this._changeDetectorRef.markForCheck();
                    });
                },
                error: () => {
                    this.flashMessage = 'error';
                    this._changeDetectorRef.markForCheck();
                }
            });
        }
    });
}






}
