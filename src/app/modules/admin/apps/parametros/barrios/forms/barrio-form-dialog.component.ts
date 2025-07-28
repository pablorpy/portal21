import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CiudadModel } from '../../ciudades/ciudades.types';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CiudadesService } from '../../ciudades/ciudades.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs/internal/Observable';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { take } from 'rxjs';
import { BarriosService } from '../barrios.service';
import { BarrioModel } from '../barrios.types';

@Component(
  {
  selector: 'app-barrio-form-dialog',
  templateUrl: './barrio-form-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule
  ]
})
export class BarrioFormDialogComponent {
  form: FormGroup;
  usuarioActualId: string = '';
  ciudades$: Observable<CiudadModel[]>;

  constructor(
    private _formBuilder: FormBuilder,
    private _dialogRef: MatDialogRef<BarrioFormDialogComponent>,
      private _barriosService: BarriosService,
      private _ciudadesService: CiudadesService,
      private _userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { barrio: BarrioModel }
  ) {
    this.form = this._formBuilder.group({
      nombre: [data.barrio?.nombre ?? '', Validators.required],
      ciudad: [data.barrio?.ciudad ?? null, Validators.required],
      
    });
     this._userService.user$
                .pipe(take(1)) // Nos suscribimos solo una vez
                .subscribe((user: User) => {
                    this.usuarioActualId = user.id;
                });
    this.ciudades$ = this._ciudadesService.ciudades$;
    this._ciudadesService.listarCiudades().subscribe({
    next: (ciudades) => {
              console.log(' Ciudades cargados para el select:', ciudades);
          },
          error: (error) => {
              console.error('Error al cargar Ciudades:', error);
          }
      });

  }

guardar(): void {
    if (!this.usuarioActualId) {
        console.error('El ID de usuario aún no está disponible.');
        return;
    }

    const ahora = this.obtenerFechaActual();

    if (this.data?.barrio?.id) {
        // Actualización
        const barrio: BarrioModel = {
            ...this.form.value,
            id: this.data.barrio.id,
            usuarioAlta: this.data.barrio.usuarioAlta,
            fechaAlta: this.data.barrio.fechaAlta,
            usuarioModificacion: { id: this.usuarioActualId },
            fechaModificacion: ahora
        };

       this._barriosService.updateBarrio(barrio.id, barrio).subscribe({
          next: (updated) => {
              console.log(' Barrio actualizado:', updated);
              this._dialogRef.close(updated);
          },
          complete: () => {
              console.log(' Actualización completada (sin emitir)');
              this._dialogRef.close(barrio);
          },
          error: (err) => {
              console.error('❌ Error al actualizar barrio:', err);
          }
      });





    } else {
        // Creación
        const barrio: BarrioModel = {
            ...this.form.value,
            usuarioAlta: { id: this.usuarioActualId },
            fechaAlta: ahora
        };

        this._barriosService.crearBarrio(barrio).subscribe((barrioCreado) => {
            this._dialogRef.close(barrioCreado);
        });
    }
    //console.log('Form válido:', this.form.valid);
    //console.log('Valor del form:', this.form.value);

}


  cancelar() {
    this._dialogRef.close(null);
  }

      private obtenerFechaActual(): string {
        const fecha = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${fecha.getFullYear()} ` +
               `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
    }
}
