import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { InmuebleCuentaModel, InmuebleModel, InmueblePagination } from './inmuebles-types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { CategoriaCuenta } from '../../contribuyente/contribuyentes.types';

@Injectable({providedIn: 'root'})
export class InmueblesService
{
    //propiedades para la gestion de cuentas
    selectedInmuebleChanged: BehaviorSubject<any> = new BehaviorSubject(null);
    private _categoria: BehaviorSubject<CategoriaCuenta> = new BehaviorSubject(null);
    private _cargandoInmuebles: BehaviorSubject<boolean> = new BehaviorSubject(false);

    // Private
    private _inmuebles       : BehaviorSubject<InmuebleModel[] | null> = new BehaviorSubject(null);
    private _cuentaInmueble : BehaviorSubject<InmuebleCuentaModel | null> = new BehaviorSubject(null);
    private _cuentasInmueble : BehaviorSubject<InmuebleCuentaModel[] | null> = new BehaviorSubject(null);
    private _inmueble        : BehaviorSubject<InmuebleModel | null> = new BehaviorSubject(null);
    private _pagination      : BehaviorSubject<InmueblePagination| null> = new BehaviorSubject(null);
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

    /**
     * Getter para categoria
     */
    get categoria$(): Observable<CategoriaCuenta>
    {
        return this._categoria.asObservable();
    }

    get inmuebles$(): Observable<InmuebleModel[]> {
        return this._inmuebles.asObservable();
    }

    /**
     * Getter para cargando inmuebles
     */
    get cargandoInmuebles$(): Observable<boolean>
    {
        return this._cargandoInmuebles.asObservable();
    }

    get cuentasInmueble$(): Observable<InmuebleCuentaModel[]> {
        return this._cuentasInmueble.asObservable();
    }

    get cuentaInmueble$(): Observable<InmuebleCuentaModel> {
        return this._cuentaInmueble.asObservable();
    }

    get inmueble$(): Observable<InmuebleModel> {
        return this._inmueble.asObservable();
    }

    get pagination$(): Observable<InmueblePagination> {
        return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Obtener
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getInmuebles(page: number = 0, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log('token: ' + this._authService.accessToken);
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/inmuebles/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            },headers })
            .pipe(tap((response) => {
                this._pagination.next(response.pagination);
                this._inmuebles.next(response.data);
            }),
        );
    }


    /**
     * Get inmueble by id
     */
    getInmuebleById(id: string): Observable<InmuebleModel>
    {
        return this._httpClient.get<InmuebleModel>(AuthUtils.MUNISYS_BACKEND_URL + "/inmuebles/" + id)
            .pipe(tap((inmueble) => {
                this._inmueble.next(inmueble);
            }),
        );
    }

    /**
     * Obtener
     *
     *
     * @param page
     * @param size
     * @param sort
     * @param order
     * @param search
     */
    getInmueblesPaginadoByNroCiContribuyente(nroCi: string = '', page: number = 0, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' | '' = 'asc'):
        Observable<any> {
            console.log("getInmueblesPaginadoByNroCiContribuyente");
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log('token: ' + this._authService.accessToken);
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/inmuebles/paginado/nro-ci-contribuyente/" + nroCi, {
            params: {
                nroCi: nroCi,
                page: '' + page,
                size: '' + size,
                sort,
                order
            },headers })
            .pipe(tap((response) => {
                console.log("response.pagination: " + response.pagination);
                this._pagination.next(response.pagination);
                this._inmuebles.next(response.data);
            }),
        );
    }

        /**
     * Get inmuebles by nro de ci del contribuyente
     */
    getInmueblesByNroCiContribuyente(nroCi: string): Observable<InmuebleModel[]>
    {
        return this._httpClient.get<InmuebleModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/inmuebles/nro-ci-contribuyente/" + nroCi)
            .pipe(tap((inmuebles) => {
                this._inmuebles.next(inmuebles);
            }),
        );
    }

    getCuentasInmuebleByIdInmueble(inm: InmuebleModel): Observable<InmuebleCuentaModel[]>
    {
        var x = this._httpClient.get<InmuebleCuentaModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/cuentas-inmueble/inmueble/" + inm.id)
            .pipe(tap((cuentasInmueble) => {
                //this._inmueble.next(inm);
                this._cuentasInmueble.next(cuentasInmueble);
            }),
        );
        return x;
    }

    /**
     * Crear 
     */
    createInmueble(): Observable<InmuebleModel>
    {
        const newInmueble: InmuebleModel = {
            id: ''/*,
            fechaExpedicion: '',
            grupoSanguineo: null,
            categoria:  null,
            contribuyente:  null,
            numeroRegistro: '',
            examenVistaOido: true,
            examenTeoricoPractico: true,
            numeroPasaporte: '',
            carnetInmigracion: '',
            fechaRenovacion: null,
            fechaValidez: null,
            conceptoPago: null,
            fechaCancelacion: null,
            estadoRegistro: null*/
        };

        return this.inmuebles$.pipe(
            take(1),
            map(inmuebles => {
              // Agregar el nuevo dominio a la lista
              this._inmuebles.next([newInmueble, ...inmuebles]);

              // Devolver el nuevo dominio
              return newInmueble;
            })
          );
    }

/*     updateCuentaInmueble(cuenta: InmuebleCuentaModel): Observable<InmuebleCuentaModel>
    {
        return this.inmuebles$.pipe(
            
        );
    }
 */
    /**
     * Update 
     *
     * @param id
     * @param inmueble
     */
    updateInmueble(inmueble: InmuebleModel): Observable<InmuebleModel>
    {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log("token_update: " + headers.Authorization);
        return this.inmuebles$.pipe(
            take(1),
            switchMap(inmuebles => this._httpClient.put<InmuebleModel>(AuthUtils.MUNISYS_BACKEND_URL + "/inmuebles", inmueble, {headers} )
            .pipe(
                map((updatedInmueble) => {
                    // Find the index of the updated product
                    const index = inmuebles.findIndex(item => item.id === inmueble.id);

                    // Update the product
                    inmuebles[index] = updatedInmueble;

                    // Update the products
                    this._inmuebles.next(inmuebles);

                    // Return the updated product
                    return updatedInmueble;
                }),
                switchMap(updatedInmueble => this.inmueble$.pipe(
                    take(1),
                    filter(item => item && item.id === inmueble.id),
                    tap(() => {
                        // Update the product if it's selected
                        this._inmueble.next(updatedInmueble);

                        // Return the updated product
                        return updatedInmueble;
                    }),
                )),
            )),
        );
    }
}
