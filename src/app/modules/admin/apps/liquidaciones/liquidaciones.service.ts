import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { LiquidacionModel, LiquidacionPagination } from './liquidaciones-types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { DetalleDetalleModel, DetalleModel } from '../detalles/detalles.types';
import { TemplateHandler } from '@ngneat/transloco/lib/template-handler';

@Injectable({providedIn: 'root'})
export class LiquidacionesService
{
    // Private
    private _liquidaciones       : BehaviorSubject<LiquidacionModel[] | null> = new BehaviorSubject(null);
    private _liquidacion        : BehaviorSubject<LiquidacionModel | null> = new BehaviorSubject(null);
    private _pagination     : BehaviorSubject<LiquidacionPagination| null> = new BehaviorSubject(null);
    private _authService = inject(AuthService);
    private _detalles       : BehaviorSubject<DetalleModel[] | null> = new BehaviorSubject(null);
    private _detallesDetalles       : BehaviorSubject<DetalleDetalleModel[] | null> = new BehaviorSubject(null);
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get detalles$(): Observable<DetalleModel[]> {
        return this._detalles.asObservable();
    }

    get liquidaciones$(): Observable<LiquidacionModel[]> {
        return this._liquidaciones.asObservable();
    }

    get liquidacion$(): Observable<LiquidacionModel> {
        return this._liquidacion.asObservable();
    }

    get pagination$(): Observable<LiquidacionPagination> {
        return this._pagination.asObservable();
    }

    get detallesDetalles$(): Observable<DetalleDetalleModel[]> {
        return this._detallesDetalles.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    getDetalleByIdd(id: string): Observable<DetalleModel[]>    {
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/detalles/cabecera/" + id)
            .pipe(tap((detalle) => {
                this._detalles.next(detalle.data);
            }),
        );
    }

    getDetalleDetalleById(id: string): Observable<DetalleModel[]>    {
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/detalles/detalles/proforma-detalle/" + id)
            .pipe(tap((detalle) => {
                this._detallesDetalles.next(detalle.data);
            }),
        );
    }

    getDetalle(id: string): Observable<DetalleModel[]> {
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/detalles/cabecera/" + id)
            .pipe(
                map(response => response.data as DetalleModel[]),
                tap(detalle => this._detalles.next(detalle))
            );
    }

    /**
     * Obtener Dominios
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     * 
     */
   
    getLiquidaciones(page: number = 0, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' | '' = 'asc', search: string = ''): Observable<any> {
        // Se obtiene el token de autorización desde el servicio de autenticación
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
        
        // Se verifica si el parámetro de búsqueda está vacío o solo contiene espacios
        if (!search || search.trim() === '') {
            // Si no hay búsqueda, se hace una petición GET al endpoint correspondiente para obtener liquidaciones paginadas    ----- 
            return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/paginado-liquidacion-reimpresion", {
                params: {
                    page: '' + page, // Número de página
                    size: '' + size, // Tamaño de la página (número de resultados por página)
                    sort, // Campo por el cual se ordenan los resultados
                    order, // Orden de la clasificación ('asc' o 'desc')
                    search, // Cadena de búsqueda (vacía en este caso)
                },
                headers // Se envían los headers con el token de autorización
            }).pipe(tap((response) => {
                // Se actualizan los observables _pagination y _liquidaciones con la respuesta
                this._pagination.next(response.pagination);
                this._liquidaciones.next(response.data);
            }));
        } else {
            // Si hay una cadena de búsqueda, se modifica la URL para incluirla en la petición
            return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/paginado-liquidacion-reimpresion", {
                params: {
                    page: '' + page,
                    size: '' + size,
                    sort,
                    order,
                    search, // Se sigue enviando el parámetro de búsqueda
                },
                headers
            }).pipe(tap((response) => {
                // Actualización de los observables como en el caso anterior
                this._pagination.next(response.pagination);
                this._liquidaciones.next(response.data);
            }));
        }
    }
    

    /**
     * Get dominio by id
     */
   /* getLiquidacionById(id: string): Observable<LiquidacionModel[]>
    {
        return this._httpClient.get<LiquidacionModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/detalles/cabecera/" + id)
            .pipe(tap((liquidacion) => {
                this._liquidaciones.next(liquidacion);
            }),
        );
    }

    formatDateStringBarras(inputDate: string): string {
        // Dividir la fecha en partes (año, mes, día)
        const parts = inputDate.split('-');
        
        // Crear una nueva fecha con las partes en el orden correcto
        const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        
        return formattedDate;
    }*/

    getLiquidacionesSinPaginado(id: string): Observable<LiquidacionModel[]> {
        return this._httpClient.get<LiquidacionModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/liquidador/nro-ci-contribuyente/" + id)
            .pipe(
                tap((valor) => {
                    this._liquidaciones.next(valor);
                }),
            );
    }

}
