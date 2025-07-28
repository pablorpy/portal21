import { NgIf, NgFor, NgTemplateOutlet, NgClass, AsyncPipe, CurrencyPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { CiudadesService } from './ciudades.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Observable, Subject, takeUntil, debounceTime, switchMap, map, merge } from 'rxjs';
import { CiudadModel, GenericPagination } from './ciudades.types';
import { CiudadFormDialogComponent } from './forms/ciudad-form-dialog.component';
import { tap } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';



@Component({
  selector: 'parametros-ciudades',
  standalone: true,
  templateUrl: './ciudades.component.html',
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
        imports        : [NgIf, MatDialogModule,MatTableModule,MatProgressBarModule, MatFormFieldModule, MatIconModule, MatInputModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatSortModule, NgFor, NgTemplateOutlet, MatPaginatorModule, NgClass, MatSlideToggleModule, MatSelectModule, MatOptionModule, MatCheckboxModule, MatRippleModule, AsyncPipe, CurrencyPipe],
    
})
export class CiudadesComponent  implements OnInit, AfterViewInit, OnDestroy{

     @ViewChild(MatPaginator) private _paginator: MatPaginator;
      @ViewChild(MatSort) private _sort: MatSort;
  
      ciudades$: Observable<CiudadModel[]>;
      dataSource: MatTableDataSource<CiudadModel> = new MatTableDataSource<CiudadModel>();

  
      isLoading: boolean = false;
      searchInputControl: UntypedFormControl = new UntypedFormControl();
      pagination: GenericPagination;
      selectedCiudad: CiudadModel | null = null;
      selectedCiudadForm: UntypedFormGroup;
      dominiosPadre: CiudadModel[];
      displayedColumns: string[] = [ 'nombre','departamento', 'acciones'];
  
      flashMessage: 'success' | 'error' | null = null;
  
      private _unsubscribeAll: Subject<any> = new Subject<any>();
  
      /**
       * Constructor
       */
      constructor(
          private _changeDetectorRef: ChangeDetectorRef,
          private _fuseConfirmationService: FuseConfirmationService,
          private _formBuilder: UntypedFormBuilder,
          private _ciudadService: CiudadesService,
          private _dialog: MatDialog,
      )
      {
      }
  
        ngOnInit(): void
              {
                  // Create the selected product form
                  this.selectedCiudadForm = this._formBuilder.group({
                      id               : [''],
                      codigo           : ['', [Validators.required]],
                      nombre           : ['', [Validators.required]],
                      estado           : [true],
                      dominioPadre     : [''],
                  });
          
                  // Obtener la paginación
                  this._ciudadService.pagination$
                      .pipe(takeUntil(this._unsubscribeAll))
                      .subscribe((pagination: GenericPagination) =>
                      {
                          this.pagination = pagination;
                          this._changeDetectorRef.markForCheck();
                      });
                  
                  // Obtener los dominios
                  this.ciudades$ = this._ciudadService.ciudades$;
                  
          
                  // Subscribe to search input field value changes
                  this.searchInputControl.valueChanges
                      .pipe(
                          takeUntil(this._unsubscribeAll),
                          debounceTime(300),
                          switchMap((query) =>
                          {
                              this.closeDetails();
                              this.isLoading = true;
                              return this._ciudadService.getCiudades(0, 10, 'nombre', 'asc', query);
                          }),
                          map(() =>
                          {
                              this.isLoading = false;
                          }),
                      )
                      .subscribe();
                                            this._ciudadService.ciudades$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((ciudades) => {
                                this.dataSource.data = ciudades;
                                this._changeDetectorRef.markForCheck();
                            });

  
              }
  
  
       /**
       * After view init
       */
      ngAfterViewInit(): void
      {
          if ( this._sort && this._paginator )
          {
              this._sort.sort({
                  id          : 'nombre',
                  start       : 'asc',
                  disableClear: true,
              });
              this._changeDetectorRef.markForCheck();
              this._sort.sortChange
                  .pipe(takeUntil(this._unsubscribeAll))
                  .subscribe(() =>
                  {
                      this._paginator.pageIndex = 0;
                      this.closeDetails();
                  });
              merge(this._sort.sortChange, this._paginator.page).pipe(
                  switchMap(() =>
                  {
                      this.closeDetails();
                      this.isLoading = true;
                      return this._ciudadService.getCiudades(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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
          this.selectedCiudad = null;
      }
  
    agregarCiudad(): void {
            const dialogRef = this._dialog.open(CiudadFormDialogComponent, {
                width: '500px',
                data: { ciudad: {} as CiudadModel },
                disableClose: true,
                autoFocus: false
            });

            dialogRef.afterClosed().subscribe((nuevaCiudad: CiudadModel) => {
                if (nuevaCiudad) {
                    this.recargarLista();
                    this.flashMessage = 'success';
                    this._changeDetectorRef.markForCheck();
                }
            });
            }

  
  editarCiudad(ciudad: CiudadModel): void {
      const dialogRef = this._dialog.open(CiudadFormDialogComponent, {
          width: '400px',
          data: { ciudad },
          autoFocus: false
      });
  
      dialogRef.afterClosed().subscribe((result: CiudadModel) => {
                if (result) {
                    this.recargarLista();
                    this.flashMessage = 'success';
                    this._changeDetectorRef.markForCheck();
                }
            });


  }
  
  
eliminarCiudad(id: string): void {
    const confirmation = this._fuseConfirmationService.open({
        title  : 'Eliminar Ciudad',
        message: '¿Estás seguro de que deseas eliminar esta Ciudad?',
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
            this._ciudadService.deleteCiudad(id).subscribe({
                next: () => {
                    // 🔁 Refrescar con los mismos parámetros actuales
                    this._ciudadService.getCiudades(
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
  
  private recargarLista(): void {
    this.isLoading = true;
    this._ciudadService.getCiudades(
        this._paginator?.pageIndex ?? 0,
        this._paginator?.pageSize ?? 10,
        this._sort?.active ?? 'nombre',
        this._sort?.direction ?? 'asc',
        this.searchInputControl.value || ''
    ).pipe(
        tap(() => {
            this.isLoading = false;
            this._changeDetectorRef.markForCheck();
        })
    ).subscribe();
}





}
