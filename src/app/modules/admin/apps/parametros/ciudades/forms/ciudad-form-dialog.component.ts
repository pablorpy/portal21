import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CiudadModel } from '../ciudades.types';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CiudadesService } from '../ciudades.service';
import { CommonModule } from '@angular/common';
import { DepartamentosService } from '../../departamentos/departamentos.service';
import { Observable } from 'rxjs/internal/Observable';
import { DepartamentoModel } from '../../departamentos/departamentos.types';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { take } from 'rxjs';

@Component(
  {
  selector: 'app-ciudad-form-dialog',
  templateUrl: './ciudad-form-dialog.component.html',
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
export class CiudadFormDialogComponent {
  form: FormGroup;
  usuarioActualId: string = '';
  departamentos$: Observable<DepartamentoModel[]>;

  constructor(
    private _formBuilder: FormBuilder,
    private _dialogRef: MatDialogRef<CiudadFormDialogComponent>,
      private _ciudadesService: CiudadesService,
      private _departamentosService: DepartamentosService,
      private _userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: { ciudad: CiudadModel }
  ) {
    this.form = this._formBuilder.group({
      nombre: [data.ciudad?.nombre ?? '', Validators.required],
      departamento: [data.ciudad?.departamento ?? null, Validators.required],
      
    });
     this._userService.user$
                .pipe(take(1)) // Nos suscribimos solo una vez
                .subscribe((user: User) => {
                    this.usuarioActualId = user.id;
                });
    this.departamentos$ = this._departamentosService.departamentos$;
    this._departamentosService.listarDepartamentos().subscribe({
    next: (departamentos) => {
              console.log(' Departamentos cargados para el select:', departamentos);
          },
          error: (error) => {
              console.error('Error al cargar departamentos:', error);
          }
      });

  }

guardar(): void {
    if (!this.usuarioActualId) {
        console.error('El ID de usuario aún no está disponible.');
        return;
    }

    const ahora = this.obtenerFechaActual();

    if (this.data?.ciudad?.id) {
        // Actualización
        const ciudad: CiudadModel = {
            ...this.form.value,
            id: this.data.ciudad.id,
            usuarioAlta: this.data.ciudad.usuarioAlta,
            fechaAlta: this.data.ciudad.fechaAlta,
            usuarioModificacion: { id: this.usuarioActualId },
            fechaModificacion: ahora
        };

       this._ciudadesService.updateCiudad(ciudad.id, ciudad).subscribe({
          next: (updated) => {
              console.log('✅ Ciudad actualizada:', updated);
              this._dialogRef.close(updated);
          },
          complete: () => {
              console.log('✅ Actualización completada (sin emitir)');
              // Este close es seguro, se ejecutará si no hubo `next`
              this._dialogRef.close(ciudad);
          },
          error: (err) => {
              console.error('❌ Error al actualizar ciudad:', err);
          }
      });





    } else {
        // Creación
        const ciudad: CiudadModel = {
            ...this.form.value,
            usuarioAlta: { id: this.usuarioActualId },
            fechaAlta: ahora
        };

        this._ciudadesService.crearCiudad(ciudad).subscribe((ciudadCreada) => {
            this._dialogRef.close(ciudadCreada);
        });
    }
    console.log('Form válido:', this.form.valid);
console.log('Valor del form:', this.form.value);

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
