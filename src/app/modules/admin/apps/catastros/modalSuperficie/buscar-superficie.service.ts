import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { SuperficieModel, SuperficiePagination } from './buscar-superficie.types';

@Injectable({providedIn: 'root'})
export class SuperficieService
{
    // Private
    private _superficies      : BehaviorSubject<SuperficieModel[] | null> = new BehaviorSubject(null);
    private _superficie       : BehaviorSubject<SuperficieModel | null> = new BehaviorSubject(null);
    private _pagination     : BehaviorSubject<SuperficiePagination | null> = new BehaviorSubject(null);
    private _authService = inject(AuthService);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get superficies$(): Observable<SuperficieModel[]> {
        return this._superficies.asObservable();
    }

    get superficie$(): Observable<SuperficieModel> {
        return this._superficie.asObservable();
    }

    get pagination$(): Observable<SuperficiePagination> {
        return this._pagination.asObservable();
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
     * 
     */
    getSuperficies(page: number = 0, size: number = 10, sort: string = 'dimension', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros-superficie/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search
            },headers })
            .pipe(tap((response) => {
                this._pagination.next(response.pagination);
                this._superficies.next(response.data);
            }),
        );
    }

    getSuperficie(id: number): Observable<SuperficieModel>
    {
        return this._httpClient.get<SuperficieModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros-superficie/" + id)
            .pipe(tap((valor) => {
                this._superficie.next(valor);
            }),
        );
    }

    getSuperficiesByCtaCteArray(cuentaCorriente: string): Observable<SuperficieModel[]>
    {
        return this._httpClient.get<SuperficieModel[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros-superficie/by-cta-cte/" + cuentaCorriente)
            .pipe(tap((valor) => {
                this._superficies.next(valor);
            }),
        );
    }

   /* getSuperficieByCtaCte(cuentaCorriente: string): Observable<SuperficieModel>
    {
        return this._httpClient.get<SuperficieModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/dimensiones/by-cta-cte/" + cuentaCorriente)
            .pipe(tap((valor) => {
                this._dimension.next(valor);
            }),
        );
    }*/

    /**
     * Crear registro
     */
    createSuperficie(): Observable<SuperficieModel>
    {
        const newSuperficie: SuperficieModel = {
            id: null,
            borrado: 'N',
            ctaCte: '',
            posicion: 1,
            subZona: 0,
            superficieHa: 0,
            superficieM2: 0
        };

        return this.superficies$.pipe(
            take(1),
            map(superficies => {
              // Agregar el nuevo registro a la lista
              this._superficies.next([newSuperficie, ...superficies]);

              // Devolver el nuevo registro
              return newSuperficie;
            })
          );
    }

    /**
     * Update product
     *
     * @param id
     * @param superficie
     */
     updateSuperficie(valor: number, superficie: SuperficieModel): Observable<SuperficieModel>
    {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log("token_update: " + headers.Authorization);
        return this.superficies$.pipe(
            take(1),
            switchMap(superficies => this._httpClient.put<SuperficieModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros-superficie", superficie, {headers} )
            .pipe(
                map((updatedSuperficie) => {
                    // Find the index of the updated product
                    const index = superficies.findIndex(item => item.id === valor);

                    // Update the product
                    superficies[index] = updatedSuperficie;

                    // Update the products
                    this._superficies.next(superficies);

                    // Return the updated product
                    return updatedSuperficie;
                }),
                switchMap(updatedSuperficie => this.superficie$.pipe(
                    take(1),
                    filter(item => item && item.id === valor),
                    tap(() => {
                        // Update the product if it's selected
                        this._superficie.next(updatedSuperficie);

                        // Return the updated product
                        return updatedSuperficie;
                    }),
                )),
            )),
        );
    }

    /**
     * Delete the product
     *
     * @param id
     
    deleteDominio(id: string): Observable<boolean>
    {
        return this.dominios$.pipe(
            take(1),
            switchMap(dominios => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/dominios/" + id).pipe(
                map((isDeleted: boolean) =>
                {
                    // Find the index of the deleted product
                    const index = dominios.findIndex(item => item.id === id);

                    // Delete the product
                    dominios.splice(index, 1);

                    // Update the products
                    this._dominios.next(dominios);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }*/
}
