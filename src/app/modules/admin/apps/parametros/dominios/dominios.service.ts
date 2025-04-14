import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { DominioModel, OpcionModel, DominioPagination } from 'app/modules/admin/apps/parametros/dominios/dominios.types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { CatastroModel } from '../../catastros/list/catastros-types';

@Injectable({ providedIn: 'root' })
export class DominiosService {
    [x: string]: any;
    // Private
    private _dominios: BehaviorSubject<DominioModel[] | null> = new BehaviorSubject(null);
    private _dominio: BehaviorSubject<DominioModel | null> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<DominioPagination | null> = new BehaviorSubject(null);
    private _dominiosPadre: BehaviorSubject<DominioModel[] | null> = new BehaviorSubject(null);
    
    private _todasLasOpciones: OpcionModel[];
    private _opcionesDelDominio: BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _opcionPadre: BehaviorSubject<OpcionModel | null> = new BehaviorSubject(null);
    private _authService = inject(AuthService);
    private _nacionalidades   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _estadosCiviles   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _tiposContribuyentes   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _ciudades   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _barrios   : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
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
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get dominios$(): Observable<DominioModel[]> {
        return this._dominios.asObservable();
    }

    get dominio$(): Observable<DominioModel> {
        return this._dominio.asObservable();
    }

    get pagination$(): Observable<DominioPagination> {
        return this._pagination.asObservable();
    }

    get dominiosPadre$(): Observable<DominioModel[]> {
        return this._dominiosPadre.asObservable();
    }

    get opcionesDelDominio$(): Observable<OpcionModel[]> {
        return this._opcionesDelDominio.asObservable();
    }

    get opcionPadre$(): Observable<OpcionModel> {
        return this._opcionPadre.asObservable();
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
    getDominios(page: number = 0, size: number = 10, sort: string = 'descripcion', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
       // console.log('token: ' + this._authService.accessToken);
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/dominios/paginado", {
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
                this._dominios.next(response.data);
            }),
            );
    }


    getDominiosPadres(): Observable<DominioModel[]> {
        return this._httpClient.get<DominioModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/dominios")
            .pipe(
                tap((dominios) => {
                    this._dominiosPadre.next(dominios);
                }),
            );
    }

    /**
     * Get dominio by id
     */
    getDominioById(id: string): Observable<DominioModel> {
        return this._httpClient.get<DominioModel>(AuthUtils.MUNISYS_BACKEND_URL + "/dominios/" + id)
            .pipe(tap((dominio) => {
                this._dominio.next(dominio);
            }),
            );
    }

   

    /**
     * Crear producto
     */
    createDominio(): Observable<DominioModel> {
        const newDominio: DominioModel = {
            id: '0',
            codigo: '',
            descripcion: '',
            estado: 'A',
            dominioPadre: null
        };

        return this.dominios$.pipe(
            take(1),
            map(dominios => {
                // Agregar el nuevo dominio a la lista
                this._dominios.next([newDominio, ...dominios]);

                // Devolver el nuevo dominio
                return newDominio;
            })
        );
    }

    /**
     * Update product
     *
     * @param id
     * @param product
     */
    updateDominio(id: string, dominio: DominioModel): Observable<DominioModel> {
        return this.dominios$.pipe(
            take(1),
            switchMap(dominios => this._httpClient.put<DominioModel>(AuthUtils.MUNISYS_BACKEND_URL + "/dominios", dominio)
                .pipe(
                    map((updatedDominio) => {
                        // Find the index of the updated product
                        const index = dominios.findIndex(item => item.id === id);

                        // Update the product
                        dominios[index] = updatedDominio;

                        // Update the products
                        this._dominios.next(dominios);

                        // Return the updated product
                        return updatedDominio;
                    }),
                    switchMap(updatedDominio => this.dominio$.pipe(
                        take(1),
                        filter(item => item && item.id === id),
                        tap(() => {
                            // Update the product if it's selected
                            this._dominio.next(updatedDominio);

                            // Return the updated product
                            return updatedDominio;
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
    deleteDominio(id: string): Observable<boolean> {
        return this.dominios$.pipe(
            take(1),
            switchMap(dominios => this._httpClient.delete(AuthUtils.MUNISYS_BACKEND_URL + "/dominios/" + id).pipe(
                map((isDeleted: boolean) => {
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
    }

    getOpcionesByCodDominio(codDominio: string): Observable<OpcionModel[]> {
        return this._httpClient.get<OpcionModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/dominios/opciones-by-cod-dominio/" + codDominio);
        /* .pipe(
             tap((opciones) => {
                 this._dominiosPadre.next(opciones);
             }),
         );*/
    }

    getObservableOpcionByCodDominioAndCodOpcion(codDominio: string, codOpcion: string): Observable<OpcionModel> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.get<OpcionModel>(AuthUtils.MUNISYS_BACKEND_URL + "/dominios/opcion-by-codigo-dominio-y-codigo-opcion/" + codDominio + '/' + codOpcion, {headers});
    }

    getOpcionByCodDominioAndCodOpcion(codDominio: string, codOpcion: string): OpcionModel {
        return this._todasLasOpciones.find(elem => elem.dominio.codigo == codDominio && elem.codigo == codOpcion);
    }

    getOpcionesByDominio(codigoDominio: string): Observable<OpcionModel[]> {
        console.log('ENTRAMOS ACA..........OPCIONES');
        return this.getOpcionesByCodDominio(codigoDominio)
            .pipe(
                tap((data) => {
                    let opciones: BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
                    opciones.next(data);
                }),
            );
    }

    getNacionalidades(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('NACIONALID')
            .pipe(
                tap((opciones) => {
                    this._nacionalidades.next(opciones);
                }),
            );

    }

    getEstadosCiviles(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('ESTCIVIL')
            .pipe(
                tap((opciones) => {
                    this._estadosCiviles.next(opciones);
                }),
            );
    }

    getTiposContribuyentes(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('TIPOCONTRIB')
            .pipe(
                tap((opciones) => {
                    this._tiposContribuyentes.next(opciones);
                }),
            );
    }

    getCiudades(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('CIUDADES')
            .pipe(
                tap((opciones) => {
                    this._ciudades.next(opciones);
                }),
            );
    }

    getBarrios(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('BARRIOS')
            .pipe(
                tap((opciones) => {
                    this._barrios.next(opciones);
                }),
            );
    }

    getEstadosContrib(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('ESTCONTRIB')
            .pipe(
                tap((opciones) => {
                    this._estadosContrib.next(opciones);
                }),
            );
    }

    getEstados(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('ESTGEN')
            .pipe(
                tap((opciones) => {
                    this._estados.next(opciones);
                }),
            );
    }

    getTiposComprobantes(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('TIPCOMP')
            .pipe(
                tap((opciones) => {
                    this._tiposComprobs.next(opciones);
                }),
            );
    }

    getCategorias(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('CATCONTRIB')
            .pipe(
                tap((opciones) => {
                    this._categorias.next(opciones);
                }),
            );
    }

    getGruposSanguineos(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('GRUPOSANG')
            .pipe(
                tap((opciones) => {
                    this._gruposSanguineos.next(opciones);
                }),
            );
    }

    getGeneros(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('GENCONTRIB')
            .pipe(
                tap((opciones) => {
                    this._generos.next(opciones);
                }),
            );
    }

    getCategoriasRegistros(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('CATEGREGISTRO')
            .pipe(
                tap((opciones) => {
                    this._categoriasRegistros.next(opciones);
                }),
            );
    }

    getConceptosPagos(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('CONCPAGREG')
            .pipe(
                tap((opciones) => {
                    this._conceptosPagos.next(opciones);
                }),
            );
    }

    getEstadosRegistros(): Observable<OpcionModel[]> {
        return this.getOpcionesByCodDominio('ESTREGISTRO')
            .pipe(
                tap((opciones) => {
                    this._estadosRegistros.next(opciones);
                }),
            );
    }

    getCategoriasEdificaciones(): Observable<OpcionModel[]>
    {
        return this.getOpcionesByCodDominio('CATEGREGISTRO')
        .pipe(
            tap((opciones) => {
                this._categoriasEdificaciones.next(opciones);
            }),
        );
    }

    getEstadosProforma(): Observable<OpcionModel[]>
    {
        return this.getOpcionesByCodDominio('ESTPROFOR')
        .pipe(
            tap((opciones) => {
                this._estadosProforma.next(opciones);
            }),
        );
    }

    getTodasLasOpciones(): void
    {
        this._httpClient.get<OpcionModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/opciones")

        .subscribe(opciones => {
            this._todasLasOpciones = opciones;
        });
    }
}
