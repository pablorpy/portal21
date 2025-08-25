import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TipoDocumentoService } from './tipo-documento.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { take } from 'rxjs';
import { TipoDocumentoModel } from './tipo-documentos.types';

@Component({
    selector: 'tipoDocumento-modal',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatButtonModule,
    ],
    template: `
        <h1 mat-dialog-title>{{ data ? 'Editar TipoDocumento' : 'Nuevo TipoDocumento' }}</h1>
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
export class TipoDocumentoModalComponent {
    form: UntypedFormGroup;
    usuarioActualId: string = '';

    constructor(
        private _fb: UntypedFormBuilder,
        private _tipoDocumentoService: TipoDocumentoService,
        private _userService: UserService,
        public dialogRef: MatDialogRef<TipoDocumentoModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: TipoDocumentoModel
    ) {
        // Inicializar el formulario
        this.form = this._fb.group({
            //id: [data?.id ?? '0'],
            id: [data?.id ?? null],
            nombre: [data?.descripcion ?? '', Validators.required],
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
        const tipoDocumento = {
            ...this.form.value,
            usuarioAlta: this.data.usuarioAlta,     
            fechaAlta: this.data.fechaAlta,        
            usuarioModificacion: { id: this.usuarioActualId },
            fechaModificacion: ahora
        };

        this._tipoDocumentoService.updateTipoDocumento(tipoDocumento.id, tipoDocumento).subscribe(() => {
            this.dialogRef.close(true);
        });
    } else {
        // Creación
        const tipoDocumento = {
            ...this.form.value,
            usuarioAlta: { id: this.usuarioActualId },
            fechaAlta: ahora
        };

        this._tipoDocumentoService.createTipoDocumento(tipoDocumento).subscribe(() => {
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
