import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { QuillEditorComponent } from 'ngx-quill';
import { MatSelectModule } from '@angular/material/select';
import { ProformaModel } from '../../../proformas/proformas.types';
import { formatNumber } from '@angular/common';

import { registerLocaleData } from '@angular/common';
import localePy from '@angular/common/locales/es-PY';
import { InmuebleFinanciacionModel } from '../estado-cuenta-box.types';
registerLocaleData(localePy, 'py');

@Component({
  selector: 'app-financiamiento-inm',
  templateUrl: './financiamiento-inm.component.html',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports      : [CurrencyPipe, MatButtonModule, MatIconModule, FormsModule, NgFor, MatSelectModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, NgIf, QuillEditorComponent],
})
export class FinanciamientoInmComponent implements OnInit
{
    composeForm: UntypedFormGroup;
    copyFields: { cc: boolean; bcc: boolean } = {
        cc : false,
        bcc: false,
    };
    quillModules: any = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{align: []}, {list: 'ordered'}, {list: 'bullet'}],
            ['clean'],
        ],
    };

    finanImpuestoInmForm: UntypedFormGroup;
    cuotas: Array<number>;
    montoCuota: number | null = null;
    importeEntrega: number | null = null;
    finan :InmuebleFinanciacionModel | null = null;
    
    /**
     * Constructor
    */
   constructor(
     public matDialogRef: MatDialogRef<FinanciamientoInmComponent>,
        private _formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public montoTotalAPagar: number
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
       // Create the form
       
       this.finanImpuestoInmForm = this._formBuilder.group({
         importeEntrega           : ['', [Validators.required]],
         cantidadCuotas           : ['', [Validators.required]],
         importeCuota             : ['', [Validators.required]],
         montoTotalAPagar         : ['', [Validators.required]],
         observaciones           : ['']
        });
        this.finanImpuestoInmForm.patchValue({
          montoTotalAPagar : this.montoTotalAPagar
        });
        this.generarCantidadMaxCuotas();
      }
      
      // -----------------------------------------------------------------------------------------------------
      // @ Public methods
      // -----------------------------------------------------------------------------------------------------
      
  
      get _montoTotalAPagar() : string{
        return formatNumber(this.montoTotalAPagar,"es-PY", "1.2-3");
      }
      /**
     * Show the copy field with the given field name
      *
      * @param name
      */
     showCopyField(name: string): void
     {
       // Return if the name is not one of the available names
       /*if ( name !== 'cc' && name !== 'bcc' )
       {
            return;
        }*/

        // Show the field
        this.copyFields[name] = true;

        this.calcularCuota( this.montoTotalAPagar, 
            this.parseFormattedCurrency(this.finanImpuestoInmForm.get("importeEntrega").value), 
                            this.finanImpuestoInmForm.get("cantidadCuotas").value);
    }

    getCantCuotasSeleccionadas() : number{
      return this.finanImpuestoInmForm.get("cantidadCuotas").value;
    }
    getImporteEntrega() : number{
      return this.parseFormattedCurrency(this.finanImpuestoInmForm.get("importeEntrega").value);
    }

    getCalcularVencimiento(meses: number): string {
      // Obtener la fecha actual
      const fechaActual = new Date();

      // Crear una nueva fecha sumando los meses especificados
      const fechaVencimiento = new Date(fechaActual);
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + meses);

      // Formatear la fecha en el patrón dd/MM/yyyy
      const dia = fechaVencimiento.getDate().toString().padStart(2, '0');
      const mes = (fechaVencimiento.getMonth() + 1).toString().padStart(2, '0');
      const anio = fechaVencimiento.getFullYear();

      return `${dia}/${mes}/${anio}`;
    }

    formatCurrency(value: string): string {
      // Convertir el valor a número y formatearlo con separadores de miles
      const numberValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
      if (isNaN(numberValue)) return value;
      return numberValue.toLocaleString('es-PY', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    parseFormattedCurrency(value: string): number {
      // Eliminar cualquier carácter que no sea un número, punto o guión y convertir a número
      const numberValue = parseInt(value.replace(/[^0-9-]+/g, ''));
      if (isNaN(numberValue)) {
        throw new Error("El valor formateado no es válido para convertir a número.");
      }
      return numberValue;
    }

    onImporteEntregaChange(): void {
      const value = this.finanImpuestoInmForm.get("importeEntrega").value || '';
      this.finanImpuestoInmForm.patchValue({
        importeEntrega : this.formatCurrency(value)
      }); ;
      //this.showCopyField('cc');
    }
    
    /**
     * Save and close
     */
    saveAndClose(): void
    {
        // Save the message as a draft
        //this.saveAsDraft();

        // Close the dialog
        this.matDialogRef.close(this);
    }

    guardarFinanciamiento() : void {
      
      //finan.
    }

    /**
     * Discard the message
     */
    discard(): void
    {
    }

    /**
     * Save the message as a draft
     */
    saveAsDraft(): void
    {
    }

    /**
     * Send the message
     */
    send(): void
    {
    }

    cerrarDialog():void{
      this.matDialogRef.close(this);
    }

    generarCantidadMaxCuotas(): void {
      // Obtener el mes actual (enero es 0, diciembre es 11)
      const currentMonth = new Date().getMonth();
    
      // Cantidad máxima de cuotas disponibles
      const maxCuotas = 12 - currentMonth;
    
      // Generar un array con los valores posibles
      this.cuotas = Array.from({ length: maxCuotas }, (_, index) => index + 1);
    
    }

    calcularMontoCuotas(totalAPagar: number, importeEntrega: number, cantidadCuotas: number): number {
      if (cantidadCuotas <= 1) {
        throw new Error("La cantidad de cuotas debe ser mayor a 1 para calcular el monto de las cuotas restantes.");
      }
    
      // Calcular saldo a financiar
      const saldo = totalAPagar - importeEntrega;
    
      // Dividir el saldo entre el número de cuotas restantes
      const montoPorCuota = saldo / (cantidadCuotas - 1);
    
      return montoPorCuota;
    }

    calcularCuota(totalAPagar: number, importeEntrega: number, cantidadCuotas: number): void {
      try {
        this.montoCuota = this.calcularMontoCuotas(totalAPagar, importeEntrega, cantidadCuotas);
      } catch (error) {
        console.error(error.message);
        this.montoCuota = 0;
      }
    }
}