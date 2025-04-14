import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'guarani',
    standalone: true  // Agrega esta propiedad
})
export class GuaraniPipe implements PipeTransform {
    transform(value: number): string {
        return new Intl.NumberFormat('es-PY', {
            style: 'currency',
            currency: 'PYG',
        }).format(value);
    }
}
