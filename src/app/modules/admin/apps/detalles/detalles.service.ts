import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { DetalleDetalleModel, DetalleModel, DetallePagination } from './detalles.types';

@Injectable({providedIn: 'root'})
export class DetallesService
{
    // Private
    private _detalles       : BehaviorSubject<DetalleModel[] | null> = new BehaviorSubject(null);
    private _detallesDetalles       : BehaviorSubject<DetalleDetalleModel[] | null> = new BehaviorSubject(null);
    private _detalle       : BehaviorSubject<DetalleModel | null> = new BehaviorSubject(null);
    private _pagination     : BehaviorSubject<DetallePagination | null> = new BehaviorSubject(null);
    private _authService = inject(AuthService);
    private _detallesArray       : BehaviorSubject<DetalleModel[] | null> = new BehaviorSubject(null);

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

    get detallesArray$(): Observable<DetalleModel[]> {
        return this._detallesArray.asObservable();
    }

    get detallesDetalles$(): Observable<DetalleDetalleModel[]> {
        return this._detallesDetalles.asObservable();
    }

    get detalle$(): Observable<DetalleModel> {
        return this._detalle.asObservable();
    }

    get pagination$(): Observable<DetallePagination> {
        return this._pagination.asObservable();
    }

    setDetalle(detalle: DetalleModel[]): void {
        this._detallesArray.next(detalle); // Actualizar el BehaviorSubject
        //console.log(this._detallesArray);
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Obtener Dominios
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
  /*  getDetalles(page: number = 0, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        console.log('token: ' + this._authService.accessToken);
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/contribuyentes/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            },headers })
            .pipe(tap((response) => {
                this._pagination.next(response.pagination);
                this._contribuyentes.next(response.data);
            }),
            
        );
    }*/

    getDetallesSinPaginado(): Observable<DetalleModel[]> {
        return this._httpClient.get<DetalleModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/detalles")
            .pipe(
                tap((detalles) => {
                    this._detalles.next(detalles);
                }),
            );
    }

    /**
     * Get dominio by id
     */
    getDetalleById(id: string): Observable<DetalleModel>    {
        return this._httpClient.get<DetalleModel>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/detalles/cabecera/" + id)
            .pipe(tap((detalle) => {
                this._detalle.next(detalle);
            }),
        );
    }

    getDetalleByIdArray(id: string): Observable<DetalleModel[]>    {
        return this._httpClient.get<DetalleModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/detalles/cabecera/" + id)
            .pipe(tap((detalle) => {
                this._detallesArray.next(detalle);
            }),
        );
    }

    getDetallesId_(id: number): Observable<DetalleDetalleModel[]> {
        console.log("entra en getDetallesId_" + id);
        return this._httpClient.get<DetalleDetalleModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/detalles/detalles/proforma-detalle/" + id)
            .pipe(tap((detallesDet) => {
                this._detallesDetalles.next(detallesDet);
            }),
        );
    }

    getDetallesDetalles(): Observable<DetalleDetalleModel[]> {
        return this._httpClient.get<DetalleDetalleModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/detalles/detalles")
            .pipe(tap((detallesDet) => {
                this._detallesDetalles.next(detallesDet);
            }),
        );
    }
    

}
