import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { RegistroModel, RegistroPagination } from './registros-types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({providedIn: 'root'})
export class RegistrosService
{
    // Private
    private _registros       : BehaviorSubject<RegistroModel[] | null> = new BehaviorSubject(null);
    private _registro        : BehaviorSubject<RegistroModel | null> = new BehaviorSubject(null);
    private _pagination     : BehaviorSubject<RegistroPagination| null> = new BehaviorSubject(null);
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

    get registros$(): Observable<RegistroModel[]> {
        return this._registros.asObservable();
    }

    get registro$(): Observable<RegistroModel> {
        return this._registro.asObservable();
    }

    get pagination$(): Observable<RegistroPagination> {
        return this._pagination.asObservable();
    }
/*
    get dominiosPadre$(): Observable<DominioModel[]> {
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
    getRegistros(page: number = 0, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log('token: ' + this._authService.accessToken);
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/registros/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            },headers })
            .pipe(tap((response) => {
                this._pagination.next(response.pagination);
                this._registros.next(response.data);
            }),
        );
    }

    getRegistrosPaginadoByNroCiContribuyente(nroCi: string = '', page: number = 0, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' | '' = 'asc'):
    Observable<any> {

    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
    //console.log('token: ' + this._authService.accessToken);
    return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/registros/paginado/nro-ci-contribuyente/" + nroCi, {
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
            this._registros.next(response.data);
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
    getRegistroById(id: string): Observable<RegistroModel>
    {
        return this._httpClient.get<RegistroModel>(AuthUtils.MUNISYS_BACKEND_URL + "/registros/" + id)
            .pipe(tap((registro) => {
                this._registro.next(registro);
            }),
        );
    }

    formatDateStringBarras(inputDate: string): string {
        // Dividir la fecha en partes (año, mes, día)
        const parts = inputDate.split('-');
        
        // Crear una nueva fecha con las partes en el orden correcto
        const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        
        return formattedDate;
    }

    /**
     * Crear registro
     */
    createRegistro(): Observable<RegistroModel>
    {
        const newRegistro: RegistroModel = {
            id: '',
            fechaExpedicion: null,
            grupoSanguineo: null,
            categoria:  null,
            contribuyente:  null,
            numeroRegistro: null,
            examenVistaOido: true,
            examenTeoricoPractico: true,
            numeroPasaporte: '',
            carnetInmigracion: '',
            fechaRenovacion: null,
            fechaValidez: null,
            conceptoPago: null,
            fechaCancelacion: null,
            estadoRegistro: null
        };

        return this.registros$.pipe(
            take(1),
            map(registros => {
              // Agregar el nuevo dominio a la lista
              this._registros.next([newRegistro, ...registros]);

              // Devolver el nuevo dominio
              return newRegistro;
            })
          );
    }

    /**
     * Update product
     *
     * @param id
     * @param registro
     */
     updateRegistro(id: string, registro: RegistroModel): Observable<RegistroModel>
    {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log("token_update: " + headers.Authorization);
        return this.registros$.pipe(
            take(1),
            switchMap(registros => this._httpClient.put<RegistroModel>(AuthUtils.MUNISYS_BACKEND_URL + "/registros", registro, {headers} )
            .pipe(
                map((updatedRegistro) => {
                    // Find the index of the updated product
                    const index = registros.findIndex(item => item.id === id);

                    // Update the product
                    registros[index] = updatedRegistro;

                    // Update the products
                    this._registros.next(registros);

                    // Return the updated product
                    return updatedRegistro;
                }),
                switchMap(updatedRegistro => this.registro$.pipe(
                    take(1),
                    filter(item => item && item.id === id),
                    tap(() => {
                        // Update the product if it's selected
                        this._registro.next(updatedRegistro);

                        // Return the updated product
                        return updatedRegistro;
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
