import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { PersonaSeparacionBienModel } from './personas-separaciones-bienes.types';
import { GenericPagination } from '../persona-separacion-bien/personas-separaciones-bienes.types';

@Injectable({ providedIn: 'root' })
export class PersonaSeparacionBienService {
    //x: string]: any;
    // Private
    private _personasSeparacionesBienes: BehaviorSubject<PersonaSeparacionBienModel[] | null> = new BehaviorSubject(null);
    private _personaSeparacionBien: BehaviorSubject<PersonaSeparacionBienModel | null> = new BehaviorSubject(null);
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

    get personasSeparacionesBienes$(): Observable<PersonaSeparacionBienModel[]> {
        return this._personasSeparacionesBienes.asObservable();
    }

    get personaSeparacionBien$(): Observable<PersonaSeparacionBienModel> {
        return this._personaSeparacionBien.asObservable();
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
    getPersonasSeparacionesBienes(page: number = 0, size: number = 10, sort: string = 'descripcion', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/personas-separaciones-bienes/paginado", {
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
                this._personasSeparacionesBienes.next(response);
            }),
            );
    }




    /**
     * Get personaSeparacionBien by id
     */
    getPersonaSeparacionBienById(id: string): Observable<PersonaSeparacionBienModel> {
        return this._httpClient.get<PersonaSeparacionBienModel>(AuthUtils.MUNISYS_BACKEND_URL + "/personas-separaciones-bienes/" + id)
            .pipe(tap((personaSeparacionBien) => {
                this._personaSeparacionBien.next(personaSeparacionBien);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    crearPersonaSeparacionBien(): Observable<PersonaSeparacionBienModel> {
        const newpersonaSeparacionBien: PersonaSeparacionBienModel = {
            id: '0',
            descripcion: '',
            fechaAlta: '',
            fechaModificacion: '',
            usuarioAlta: null,
            usuarioModificacion: null,
        };

        return this.personasSeparacionesBienes$.pipe(
            take(1),
            map(lista => {
                this._personasSeparacionesBienes.next([newpersonaSeparacionBien, ...lista]);
                return newpersonaSeparacionBien;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
            updatepersonaSeparacionBien(id: string, personaSeparacionBien: PersonaSeparacionBienModel): Observable<PersonaSeparacionBienModel> {
                return this.personasSeparacionesBienes$.pipe(
                    take(1),
                    switchMap(personasSeparacionesBienes =>
                        this._httpClient.put<PersonaSeparacionBienModel>(AuthUtils.MUNISYS_BACKEND_URL + "/personas-separaciones-bienes", personaSeparacionBien).pipe(
                            map((updatedPersonaSeparacionBien) => {
                                const index = personasSeparacionesBienes.findIndex(item => item.id === id);
                                personasSeparacionesBienes[index] = updatedPersonaSeparacionBien;
                                this._personasSeparacionesBienes.next(personasSeparacionesBienes);
                                return updatedPersonaSeparacionBien;
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
 deletePersonasSeparacionesBienes(id: string): Observable<boolean> {
    const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
    console.log("Deleting separacion de bienes with id: " + id);
    return this.personasSeparacionesBienes$.pipe(
        take(1),
        switchMap(personaSeparacionBien => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/personas-separaciones-bienes/" + id).pipe(
            map(() => { // No necesitamos 'isDeleted' aquí si el backend no lo devuelve explícitamente y solo indica éxito por el 200 OK
                // Filtrar separacion de bienes eliminado del array actual y emitir el nuevo array
                const updatedPersonasSeparacionesBienes = personaSeparacionBien.filter(item => item.id !== id);
                this._personasSeparacionesBienes.next([...updatedPersonasSeparacionesBienes]); // Emitir una nueva referencia del array

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

    createpersonaSeparacionBien(personaSeparacionBien: Partial<PersonaSeparacionBienModel>): Observable<PersonaSeparacionBienModel> {
    return this._httpClient.post<PersonaSeparacionBienModel>(AuthUtils.MUNISYS_BACKEND_URL + "/personas-separaciones-bienes", personaSeparacionBien).pipe(
        tap((nuevo) => {
            this._personasSeparacionesBienes.pipe(take(1)).subscribe(lista => {
                this._personasSeparacionesBienes.next([nuevo, ...lista]);
            });
        })
    );
}


/**
 * Lista todos los personaSeparacionBiens sin paginación (para usar en selects)
 */
listarSeparacionBien(): Observable<PersonaSeparacionBienModel[]> {
    const headers = {
        'Authorization': 'Bearer ' + this._authService.accessToken
    };
    return this._httpClient.get<PersonaSeparacionBienModel[]>(AuthUtils.MUNISYS_BACKEND_URL + '/personas-separaciones-bienes', { headers }).pipe(
        tap((personasSeparacionesBienes) => {
            this._personasSeparacionesBienes.next(personasSeparacionesBienes);
        })
    );
}



 
}
