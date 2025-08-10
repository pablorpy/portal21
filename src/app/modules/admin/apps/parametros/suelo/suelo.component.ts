import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { SueloModel, GenericPagination } from './suelo.types';
import { UntypedFormControl, UntypedFormGroup, UntypedFormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Observable, Subject, takeUntil, debounceTime, switchMap, map, merge } from 'rxjs';
import { SueloService } from './suelo.service';
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
import { SueloModalComponent } from './suelo-modal.component';

@Component({
  selector: 'app-suelo',
  standalone: true,
  imports: [],
  templateUrl: './suelo.component.html',
  styleUrl: './suelo.component.scss'
})
export class SueloComponent implements OnInit, AfterViewInit , OnDestroy {


      @ViewChild(MatPaginator) private _paginator: MatPaginator;
      @ViewChild(MatSort) private _sort: MatSort;
  
      //suelos$: Observable<SueloModel[]>;
  
      isLoading: boolean = false;
      searchInputControl: UntypedFormControl = new UntypedFormControl();
      pagination: GenericPagination;
      selectedSuelo: SueloModel | null = null;
      selectedSueloForm: UntypedFormGroup;

  
      flashMessage: 'success' | 'error' | null = null;
  
      private _unsubscribeAll: Subject<any> = new Subject<any>();
  suelo$: any;


     /**
       * Constructor
       */
      constructor(
          private _changeDetectorRef: ChangeDetectorRef,
          private _fuseConfirmationService: FuseConfirmationService,
          private _formBuilder: UntypedFormBuilder,
          private _sueloService: SueloService,
          private _dialog: MatDialog,
      )
      {
      }

        ngOnInit(): void
              {
                  // Create the selected product form
                  this.selectedSueloForm = this._formBuilder.group({
                      id               : [''],
                      codigo           : ['', [Validators.required]],
                      nombre      : ['', [Validators.required]],
                      estado           : [true],
                      dominioPadre     : [''],
                  });
          
                  // Obtener la paginación
                  this._sueloService.pagination$
                      .pipe(takeUntil(this._unsubscribeAll))
                      .subscribe((pagination: GenericPagination) =>
                      {
                          // Update the pagination
                          this.pagination = pagination;
          
                          // Mark for check
                          this._changeDetectorRef.markForCheck();
                      });
                  
                  // Obtener los dominios
                  this.suelo$ = this._sueloService.suelos$;
          
                  // Subscribe to search input field value changes
                  this.searchInputControl.valueChanges
                      .pipe(
                          takeUntil(this._unsubscribeAll),
                          debounceTime(300),
                          switchMap((query) =>
                          {
                              this.closeDetails();
                              this.isLoading = true;
                              return this._sueloService.getSuelos(0, 10, 'nombre', 'asc', query);
                          }),
                          map(() =>
                          {
                              this.isLoading = false;
                          }),
                      )
                      .subscribe();
                      this.suelo$.pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
                      //console.log('Departamentoscargados:', data);
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
                      return this._sueloService.getSuelos(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
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
        this.selectedSuelo = null;
    }

    openModal(departamento?: SueloModel): void {
    const dialogRef = this._dialog.open(SueloModalComponent, {
        width: '400px',
        data: departamento ? { ...departamento } : null
    });

    this._sueloService.getSuelos().subscribe();

    dialogRef.afterClosed().subscribe((result) => {
        if (result) {
            this._sueloService.getSuelos().subscribe(); // Recarga los datos actualizados
        }
    });
}

deleteDepartamento(id: string): void {
    const confirmation = this._fuseConfirmationService.open({
        title  : 'Eliminar departamento',
        message: '¿Estás seguro de que deseas eliminar este departamento?',
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
            this._sueloService.deleteSuelo(id).subscribe({
                next: () => {
                    // 🔁 Refrescar con los mismos parámetros actuales
                    this._sueloService.getSuelos(
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