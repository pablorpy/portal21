import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { ContribuyenteModel, ContribuyentePagination } from 'app/modules/admin/apps/contribuyente/contribuyentes.types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { DominiosService } from '../parametros/dominios/dominios.service';

@Injectable({providedIn: 'root'})
export class ContribuyentesService
{
    // Private
    private _contribuyentes       : BehaviorSubject<ContribuyenteModel[] | null> = new BehaviorSubject(null);
    private _contribuyente        : BehaviorSubject<ContribuyenteModel | null> = new BehaviorSubject(null);
    private _pagination     : BehaviorSubject<ContribuyentePagination | null> = new BehaviorSubject(null);
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

    get contribuyentes$(): Observable<ContribuyenteModel[]> {
        return this._contribuyentes.asObservable();
    }

    get contribuyente$(): Observable<ContribuyenteModel> {
        return this._contribuyente.asObservable();
    }

    get pagination$(): Observable<ContribuyentePagination> {
        return this._pagination.asObservable();
    }

    /*get dominiosPadre$(): Observable<DominioModel[]> {
        return this._dominiosPadre.asObservable();
    }

    get opcionesDelDominio$(): Observable<OpcionModel[]> {
        return this._opcionesDelDominio.asObservable();
    }

    get opcionPadre$(): Observable<OpcionModel> {
        return this._opcionPadre.asObservable();
    }*/

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
    getContribuyentes(page: number = 0, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
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
    }

    getContribuyentesSinPaginado(): Observable<ContribuyenteModel[]> {
        return this._httpClient.get<ContribuyenteModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/contribuyentes")
            .pipe(
                tap((contribuyentes) => {
                    this._contribuyentes.next(contribuyentes);
                }),
            );
    }

   /* getDominiosPadres(): Observable<DominioModel[]> {
        return this._httpClient.get<DominioModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/dominios")
            .pipe(
                tap((dominios) => {
                    this._dominiosPadre.next(dominios);
                }),
            );
    }*/


    /**
     * Get dominio by id
     */
    getContribuyenteById(id: string): Observable<ContribuyenteModel>
    {
        return this._httpClient.get<ContribuyenteModel>(AuthUtils.MUNISYS_BACKEND_URL + "/contribuyentes/" + id)
            .pipe(tap((contribuyente) => {
                this._contribuyente.next(contribuyente);
            }),
        );
    }

    /**
     * Crear producto
     *   id: string;
    rmc?: string;
    nombre?: string;
    apellido?: string | null;
    direccion?: string;
    nacionalidad?: OpcionModel;
    estadoCivil?: OpcionModel;
    tipoContribuyente?: OpcionModel;
    ciudad?: OpcionModel;
    barrio?: OpcionModel;
    estado?: OpcionModel;
    categoriaContribuyente?: OpcionModel;
    genero?: OpcionModel;
    cedulaIdentidad?: string;
    telefono?: string;
    celular?: string;
    fechaNacimiento?: string;
    correoElectronico?: string;
     */
    createContribuyente(): Observable<ContribuyenteModel>
    {
        const newContribuyente: ContribuyenteModel = {
            id: '',
            rmc: '123',
            nombre: 'isaac',
            apellido: 'alegre',
            direccion: 'san ignacion',
            nacionalidad: null,
            estadoCivil: null,
            tipoContribuyente: null,
            ciudad: null,
            barrio: null,
            estado: null,
            categoriaContribuyente: null,
            genero: null,
            cedulaIdentidad: '4039678',
            telefono: '0971749051',
            celular: '0971749051',
            fechaNacimiento: '',
            correoElectronico: 'isasi@gmail.com'
        };
        //DominiosService.get
        return this.contribuyentes$.pipe(
            take(1),
            map(contribuyentes => {
              // Agregar el nuevo dominio a la lista
              this._contribuyentes.next([newContribuyente, ...contribuyentes]);

              // Devolver el nuevo dominio
              return newContribuyente;
            })
          );
    }

    /**
     * Update product
     *
     * @param id
     * @param contribuyente
     */
     updateContribuyente(id: string, contribuyente: ContribuyenteModel): Observable<ContribuyenteModel>
    {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this.contribuyentes$.pipe(
            take(1),
            switchMap(contribuyentes => this._httpClient.put<ContribuyenteModel>(AuthUtils.MUNISYS_BACKEND_URL + "/contribuyentes", contribuyente, {headers} )
            .pipe(
                map((updatedContribuyente) => {
                    // Find the index of the updated product
                    const index = contribuyentes.findIndex(item => item.id === id);

                    // Update the product
                    contribuyentes[index] = updatedContribuyente;

                    // Update the products
                    this._contribuyentes.next(contribuyentes);

                    // Return the updated product
                    return updatedContribuyente;
                }),
                switchMap(updatedContribuyente => this.contribuyente$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {
                        // Update the product if it's selected
                        this._contribuyente.next(updatedContribuyente);

                        // Return the updated product
                        return updatedContribuyente;
                    }),
                )),
            )),
        );
    }

    /**
     * Delete the product
     *
     * @param id
     */
    /*deleteContribuyente(id: string): Observable<boolean>
    {
        return this.contribuyentes$.pipe(
            take(1),
            switchMap(contribuyentes=> this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/contribuyentes/" + id).pipe(
                map((isDeleted: boolean) =>
                {
                    // Find the index of the deleted product
                    const index = contribuyentes.findIndex(item => item.id === id);

                    // Delete the product
                    contribuyentes.splice(index, 1);

                    // Update the products
                    this._contribuyentes.next(contribuyentes);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }*/


}
