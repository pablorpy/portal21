import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { PersonaContribuyenteModel } from './profesiones-estados-peps.types';
import { GenericPagination } from '../tipo-documento/tipo-documentos.types';




@Injectable({ providedIn: 'root' })
export class PersonaContribuyenteService {
    //x: string]: any;
    // Private
    private _personasContribuyentes: BehaviorSubject<PersonaContribuyenteModel[] | null> = new BehaviorSubject(null);
    private _personaContribuyente: BehaviorSubject<PersonaContribuyenteModel | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<GenericPagination | null> = new BehaviorSubject(null);
    private _authService = inject(AuthService);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get personasContribuyentes$(): Observable<PersonaContribuyenteModel[]> {
        return this._personasContribuyentes.asObservable();
    }

    get personaContribuyente$(): Observable<PersonaContribuyenteModel> {
        return this._personaContribuyente.asObservable();
    }

    get pagination$(): Observable<GenericPagination> {
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
     */
    getPersonasContribuyentes(page: number = 0, size: number = 10, sort: string = 'descripcion', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/personas-contribuyentes/paginado", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            }, headers
        })
            .pipe(tap((response) => {
                //this._pagination.next(response);
                this._personasContribuyentes.next(response);
            }),
            );
    }




    /**
     * Get personaContribuyente by id
     */
    getTipoDocmentoById(id: string): Observable<PersonaContribuyenteModel> {
        return this._httpClient.get<PersonaContribuyenteModel>(AuthUtils.MUNISYS_BACKEND_URL + "/personas-contribuyentes/" + id)
            .pipe(tap((personaContribuyente) => {
                this._personaContribuyente.next(personaContribuyente);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    crearPersonaContribuyente(): Observable<PersonaContribuyenteModel> {
        const newPersonasContribuyente: PersonaContribuyenteModel = {
            id: '0',
            descripcion: '',
            fechaAlta: '',
            fechaModificacion: '',
            usuarioAlta: null,
            usuarioModificacion: null,
        };

        return this.personasContribuyentes$.pipe(
            take(1),
            map(lista => {
                this._personasContribuyentes.next([newPersonasContribuyente, ...lista]);
                return newPersonasContribuyente;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
            updatePersonasContribuyente(id: string, personaContribuyente: PersonaContribuyenteModel): Observable<PersonaContribuyenteModel> {
                return this.personasContribuyentes$.pipe(
                    take(1),
                    switchMap(personasContribuyentes =>
                        this._httpClient.put<PersonaContribuyenteModel>(AuthUtils.MUNISYS_BACKEND_URL + "/personas-contribuyentes", personaContribuyente).pipe(
                            map((updatedPersonaContribuyente) => {
                                const index = personasContribuyentes.findIndex(item => item.id === id);
                                personasContribuyentes[index] = updatedPersonaContribuyente;
                                this._personasContribuyentes.next(personasContribuyentes);
                                return updatedPersonaContribuyente;
                            })
                        )
                    )
                );
            }



    /**
     * Delete the product
     *
     * @param id
     */
 deletePersonasContribuyente(id: string): Observable<boolean> {
    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
    console.log("Deleting tipo documento with id: " + id);
    return this.personasContribuyentes$.pipe(
        take(1),
        switchMap(personaContribuyente => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/personas-contribuyentes/" + id).pipe(
            map(() => { // No necesitamos 'isDeleted' aquí si el backend no lo devuelve explícitamente y solo indica éxito por el 200 OK
                // Filtrar el tipo documento eliminado del array actual y emitir el nuevo array
                const updatedPersonasContribuyentes = personaContribuyente.filter(item => item.id !== id);
                this._personasContribuyentes.next([...updatedPersonasContribuyentes]); // Emitir una nueva referencia del array

                // Si tu backend devuelve un booleano, puedes mantener 'isDeleted'
                // Para este ejemplo, asumimos que un 200 OK significa éxito
                return true; // Indicamos éxito
            }),
            // Manejo de errores opcional si el backend devuelve un error en la eliminación
            // catchError(error => {
            //     console.error('Error al eliminar el tipo documento:', error);
            //     return throwError(() => new Error('Error al eliminar el tipo documento'));
            // })
        )),
    );
}

    createPersonasContribuyente(personaContribuyente: Partial<PersonaContribuyenteModel>): Observable<PersonaContribuyenteModel> {
    return this._httpClient.post<PersonaContribuyenteModel>(AuthUtils.MUNISYS_BACKEND_URL + "/personas-contribuyentes", personaContribuyente).pipe(
        tap((nuevo) => {
            this._personasContribuyentes.pipe(take(1)).subscribe(lista => {
                this._personasContribuyentes.next([nuevo, ...lista]);
            });
        })
    );
}


/**
 * Lista todos los personaContribuyentes sin paginación (para usar en selects)
 */
listarTipoDocuentos(): Observable<PersonaContribuyenteModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<PersonaContribuyenteModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/personas-contribuyentes', { headers }).pipe(
        tap((personasContribuyentes) => {
            this._personasContribuyentes.next(personasContribuyentes);
        })
    );
}



 
}
