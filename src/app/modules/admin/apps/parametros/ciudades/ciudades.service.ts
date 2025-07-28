import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
//import { DominioModel, OpcionModel, DominioPagination } from 'app/modules/admin/apps/parametros/dominios/dominios.types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { CiudadModel, GenericPagination } from './ciudades.types';
import { DepartamentoModel } from '../departamentos/departamentos.types';

@Injectable({ providedIn: 'root' })
export class CiudadesService {
    //x: string]: any;
    // Private
    private _ciudades: BehaviorSubject<CiudadModel[] | null> = new BehaviorSubject(null);
    private _ciudad: BehaviorSubject<CiudadModel | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<GenericPagination | null> = new BehaviorSubject(null);
    private _departamentos: BehaviorSubject<DepartamentoModel[] | null> = new BehaviorSubject(null);
    /*
    private _todasLasOpciones: OpcionModel[];
    private _opcionesDelDominio: BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _opcionPadre: BehaviorSubject<OpcionModel | null> = new BehaviorSubject(null);
    */
    private _authService = inject(AuthService);
    /*
    private _nacionalidades   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _estadosCiviles   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _tiposContribuyentes   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _ciudades   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _ciudad   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _estados   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _categorias   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _generos   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _gruposSanguineos  : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _categoriasRegistros   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _conceptosPagos : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _estadosRegistros   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _categoriasEdificaciones      : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _estadosProforma     : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _conceptosIngreso     : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    */
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get ciudades$(): Observable<CiudadModel[]> {
        return this._ciudades.asObservable();
    }

    get ciudad$(): Observable<CiudadModel> {
        return this._ciudad.asObservable();
    }

    get pagination$(): Observable<GenericPagination> {
        return this._pagination.asObservable();
    }

    get departamentos$(): Observable<DepartamentoModel[]> {
        return this._departamentos.asObservable();
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
    getCiudades(page: number = 0, size: number = 10, sort: string = 'nombre', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
       // console.log('token: ' + this._authService.accessToken);
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/ciudades/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            }, headers
        })
            .pipe(tap((response) => {
                this._pagination.next(response.pagination);
                this._ciudades.next(response.data);
            }),
            );
    }




    /**
     * Get ciudad by id
     */
    getCiudadById(id: string): Observable<CiudadModel> {
        return this._httpClient.get<CiudadModel>(AuthUtils.MUNISYS_BACKEND_URL + "/ciudades/" + id)
            .pipe(tap((ciudad) => {
                this._ciudad.next(ciudad);
            }),
            );
    }

   

    /**
     * Crear ciudades
     */
   crearCiudad(ciudad: CiudadModel): Observable<CiudadModel> {
            const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };

            return this._httpClient.post<CiudadModel>(
                AuthUtils.MUNISYS_BACKEND_URL + "/ciudades",
                ciudad,
                { headers }
            ).pipe(
                tap((nuevaCiudad) => {
                    this.ciudades$.pipe(take(1)).subscribe((ciudades) => {
                        this._ciudades.next([nuevaCiudad, ...ciudades]);
                    });
                })
            );
        }


    /**
     * Update ciudades
     *
     * @param id
     * @param ciudades
     */
   updateCiudad(id: string, ciudad: CiudadModel): Observable<CiudadModel> {
    return this.ciudades$.pipe(
        take(1),
        switchMap(ciudades =>
            this._httpClient.put<CiudadModel>(AuthUtils.MUNISYS_BACKEND_URL + "/ciudades", ciudad).pipe(
                map((updateCiudad) => {
                    const index = ciudades.findIndex(item => item.id === id);
                    ciudades[index] = updateCiudad;
                    this._ciudades.next(ciudades);
                    return updateCiudad;
                }),
                switchMap(updatedCiudad => this.ciudad$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {
                        this._ciudad.next(updatedCiudad);
                    }),
                    map(() => updatedCiudad) // ✅ CORRECTO
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
    deleteCiudad(id: string): Observable<boolean> {
        return this.ciudades$.pipe(
            take(1),
            switchMap(ciudades => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/ciudades/" + id).pipe(
                map((isDeleted: boolean) => {
                    // Find the index of the deleted ciudades
                    const index = ciudades.findIndex(item => item.id === id);

                    // Delete the ciudades
                    ciudades.splice(index, 1);

                    // Update the ciudadess
                    this._ciudades.next(ciudades);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }


    listarCiudades(): Observable<CiudadModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<CiudadModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/ciudades', { headers }).pipe(
        tap((ciudades) => {
            this._ciudades.next(ciudades);
        })
    );
}
 
}
