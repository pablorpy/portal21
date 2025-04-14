import { TextFieldModule } from '@angular/cdk/text-field';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { debounceTime, map, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { InmueblesService } from '../../../inmuebles/list/inmuebles.service';
import { InmuebleModel, InmuebleCuentaModel } from '../../../inmuebles/list/inmuebles-types';

@Component({
  selector: 'app-inmueble-cuenta',
  templateUrl: './inmueble-cuenta.component.html',
  styleUrl: './inmueble-cuenta.component.scss',
  encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone     : true,
    imports        : [NgIf, MatButtonModule, MatIconModule, FormsModule, TextFieldModule, NgFor, MatCheckboxModule, NgClass, MatRippleModule, MatMenuModule, MatDialogModule, AsyncPipe],
})
export class InmuebleCuentaComponent implements OnInit, OnDestroy{
  
  inmueble$: Observable<InmuebleModel>;
  cuentaInmueble: Observable<InmuebleCuentaModel>;
  cuentasInmueble$: Observable<InmuebleCuentaModel[]>;
  cuentaChanged: Subject<InmuebleCuentaModel> = new Subject<InmuebleCuentaModel>();
  private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
       * Constructor
       */
    constructor(
      private _changeDetectorRef: ChangeDetectorRef,
      @Inject(MAT_DIALOG_DATA) private _data: { inmueble: InmuebleModel },
      private _inmuebleService: InmueblesService,
      public matDialogRef: MatDialogRef<InmuebleCuentaComponent>
    ){}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
      // Edit
        if ( this._data.inmueble.id )
        {
            // Request the data from the server
            this._inmuebleService.getInmuebleById(this._data.inmueble.id).subscribe();
            this.cuentasInmueble$ = this._inmuebleService.cuentasInmueble$;
            // Get the note
            this.inmueble$ = this._inmuebleService.inmueble$;
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

    /**
     * Agregar una cuenta a la proforma, para pagar
     *
     * @param note
     */
    agregarCuentaAProforma(cuentaInm: InmuebleCuentaModel): void
    {
        /* this._inmuebleService.createNote(note).pipe(
            map(() =>
            {
                // Get the note
                this.note$ = this._notesService.note$;
            })).subscribe(); */
    }

    /**
     * Save and close
     */
    saveAndClose(): void
    {
        // Save the message as a draft
        this.saveAsDraft();
      console.log("ENTRAMOS EN SAVE AND CLOSE")
        // Close the dialog
        this.matDialogRef.close();
    }

     /**
     * Save the message as a draft
     */
     saveAsDraft(): void
     {
     }
}


