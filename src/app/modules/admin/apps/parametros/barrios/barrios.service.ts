import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
//import { DominioModel, OpcionModel, DominioPagination } from 'app/modules/admin/apps/parametros/dominios/dominios.types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { BarrioModel, GenericPagination } from './barrios.types';
import { CiudadModel } from '../ciudades/ciudades.types';

@Injectable({ providedIn: 'root' })
export class BarriosService {
    //x: string]: any;
    // Private
    private _barrios: BehaviorSubject<BarrioModel[] | null> = new BehaviorSubject(null);
    private _barrio: BehaviorSubject<BarrioModel | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<GenericPagination | null> = new BehaviorSubject(null);
    private _ciudades: BehaviorSubject<CiudadModel[] | null> = new BehaviorSubject(null);
    private _authService = inject(AuthService);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get barrios$(): Observable<BarrioModel[]> {
        return this._barrios.asObservable();
    }

    get barrio$(): Observable<BarrioModel> {
        return this._barrio.asObservable();
    }

    get pagination$(): Observable<GenericPagination> {
        return this._pagination.asObservable();
    }

    get ciudades$(): Observable<CiudadModel[]> {
        return this._ciudades.asObservable();
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
    getBarrios(page: number = 0, size: number = 10, sort: string = 'nombre', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
       // console.log('token: ' + this._authService.accessToken);
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/barrios/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            }, headers
        })
            .pipe(tap((response) => {
                console.log('response: ', response);
                this._pagination.next(response.pagination);
                this._barrios.next(response.data);
            }),
            );
    }




    /**
     * Get ciudad by id
     */
    getBarrioById(id: string): Observable<BarrioModel> {
        return this._httpClient.get<BarrioModel>(AuthUtils.MUNISYS_BACKEND_URL + "/barrios/" + id)
            .pipe(tap((barrio) => {
                this._barrio.next(barrio);
            }),
            );
    }

   

    /**
     * Crear ciudades
     */
   crearBarrio(barrio: BarrioModel): Observable<BarrioModel> {
            const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };

            return this._httpClient.post<BarrioModel>(
                AuthUtils.MUNISYS_BACKEND_URL + "/barrios",
                barrio,
                { headers }
            ).pipe(
                tap((nuevoBarrio) => {
                    this.barrios$.pipe(take(1)).subscribe((barrios) => {
                        this._barrios.next([nuevoBarrio, ...barrios]);
                    });
                })
            );
        }


    /**
     * Update ciudades
     *
     * @param id
     * @param barrios
     */
   updateBarrio(id: string, barrio: BarrioModel): Observable<BarrioModel> {
    return this.barrios$.pipe(
        take(1),
        switchMap(barrios =>
            this._httpClient.put<BarrioModel>(AuthUtils.MUNISYS_BACKEND_URL + "/barrios", barrio).pipe(
                map((updateBarrio) => {
                    const index = barrios.findIndex(item => item.id === id);
                    barrios[index] = updateBarrio;
                    this._barrios.next(barrios);
                    return updateBarrio;
                }),
                switchMap(updatedBarrio => this.barrio$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {
                        this._barrio.next(updatedBarrio);
                    }),
                    map(() => updatedBarrio) 
                )),
            )
        )
    );
}


    /**
     * Delete the ciudades
     *
     * @param id
     */
    deleteBarrio(id: string): Observable<boolean> {
        return this.barrios$.pipe(
            take(1),
            switchMap(barrios => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/barrios/" + id).pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted ciudades
                    const index = barrios.findIndex(item => item.id === id);

                    // Delete the ciudades
                    barrios.splice(index, 1);

                    // Update the ciudadess
                    this._barrios.next(barrios);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }


    listarBarrios(): Observable<BarrioModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<BarrioModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/barrios', { headers }).pipe(
        tap((barrios) => {
            this._barrios.next(barrios);
        })
    );
}
 
}
