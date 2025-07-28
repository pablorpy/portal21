import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DepartamentosService } from './departamentos.service';
import { DepartamentoModel } from './departamentos.types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { take } from 'rxjs';

@Component({
    selector: 'departamento-modal',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatButtonModule,
    ],
    template: `
        <h1 mat-dialog-title>{{ data ? 'Editar Departamento' : 'Nuevo Departamento' }}</h1>
        <div mat-dialog-content>
            <form [formGroup]="form">
                <mat-form-field appearance="fill" class="w-full">
                    <mat-label>Nombre</mat-label>
                    <input matInput formControlName="nombre" />
                </mat-form-field>
            </form>
        </div>
        <div mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Cancelar</button>
            <button mat-raised-button color="primary" (click)="guardar()" [disabled]="form.invalid">
                Guardar
            </button>
        </div>
    `
})
export class DepartamentoModalComponent {
    form: UntypedFormGroup;
    usuarioActualId: string = '';

    constructor(
        private _fb: UntypedFormBuilder,
        private _departamentoService: DepartamentosService,
        private _userService: UserService,
        public dialogRef: MatDialogRef<DepartamentoModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DepartamentoModel | null
    ) {
        // Inicializar el formulario
        this.form = this._fb.group({
            //id: [data?.id ?? '0'],
            id: [data?.id ?? null],
            nombre: [data?.nombre ?? '', Validators.required],
        });

        // Obtener el usuario actual
        this._userService.user$
            .pipe(take(1)) // Nos suscribimos solo una vez
            .subscribe((user: User) => {
                this.usuarioActualId = user.id;
            });
    }

guardar(): void {
    if (!this.usuarioActualId) {
        console.error('El ID de usuario aún no está disponible.');
        return;
    }

    const ahora = this.obtenerFechaActual();

    if (this.data) {
        // Actualización
        const departamento = {
            ...this.form.value,
            usuarioAlta: this.data.usuarioAlta,     
            fechaAlta: this.data.fechaAlta,        
            usuarioModificacion: { id: this.usuarioActualId },
            fechaModificacion: ahora
        };

        this._departamentoService.updateDepartamento(departamento.id, departamento).subscribe(() => {
            this.dialogRef.close(true);
        });
    } else {
        // Creación
        const departamento = {
            ...this.form.value,
            usuarioAlta: { id: this.usuarioActualId },
            fechaAlta: ahora
        };

        this._departamentoService.createDepartamento(departamento).subscribe(() => {
            this.dialogRef.close(true);
        });
    }
}


    private obtenerFechaActual(): string {
        const fecha = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(fecha.getDate())}/${pad(fecha.getMonth() + 1)}/${fecha.getFullYear()} ` +
               `${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
    }
}
