import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BarriosV2Model, CiudadesV2Model, ContribuyenteModel, ContribuyentePagination, EstadosCivilesV2Model, NacionalidadesV2Model, SexosV2Model, TiposContribuyentesV2Model, TiposDocContribuyentesV2Model } from 'app/modules/admin/apps/v2/contribuyentes/contribuyentes.types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
//import { DominiosService } from '../parametros/dominios/dominios.service';

@Injectable({providedIn: 'root'})
export class v2ContribuyentesService
{
    // Private
    private _contribuyentes       : BehaviorSubject<ContribuyenteModel[] | null> = new BehaviorSubject(null);
    private _contribuyente        : BehaviorSubject<ContribuyenteModel | null> = new BehaviorSubject(null);
    private _pagination     : BehaviorSubject<ContribuyentePagination | null> = new BehaviorSubject(null);
    private _ciudades     : BehaviorSubject<CiudadesV2Model[] | null> = new BehaviorSubject(null);
    private _barrios     : BehaviorSubject<BarriosV2Model[] | null> = new BehaviorSubject(null);
    private _nacionalidades     : BehaviorSubject<NacionalidadesV2Model[] | null> = new BehaviorSubject(null);
    private _sexos     : BehaviorSubject<SexosV2Model[] | null> = new BehaviorSubject(null);
    private _tiposContribuyentes     : BehaviorSubject<TiposContribuyentesV2Model[] | null> = new BehaviorSubject(null);
    private _tiposDocContribuyentes     : BehaviorSubject<TiposDocContribuyentesV2Model[] | null> = new BehaviorSubject(null);
    private _estadosCiviles    : BehaviorSubject<EstadosCivilesV2Model[] | null> = new BehaviorSubject(null);
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

    /*get ciudades$(): Observable<CiudadesV2Model[]> {
        return this._ciudades.asObservable();
    }*/

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
    getContribuyentes(page: number = 0, size: number = 10, sort: string = 'rmc', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        console.log('token: ' + this._authService.accessToken);
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/contribuyentes/paginado", {
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

    /**
     * Get by rmc
     */
    getContribuyenteByRmc(rmc: number): Observable<ContribuyenteModel>
    {
        return this._httpClient.get<ContribuyenteModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/contribuyentes/" + rmc)
            .pipe(tap((contribuyente) => {
                this._contribuyente.next(contribuyente);
            }),
        );
    }

    getCiudadesV2(): Observable<CiudadesV2Model[]> {
        return this._httpClient.get<CiudadesV2Model[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/ciudades")
            .pipe(
                tap((ciudades) => {
                    this._ciudades.next(ciudades);
                }),
            );
    }

    getBarriosV2(): Observable<BarriosV2Model[]> {
        return this._httpClient.get<BarriosV2Model[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/barrios")
            .pipe(
                tap((barrios) => {
                    this._barrios.next(barrios);
                }),
            );
    }

    getNacionalidadesV2(): Observable<NacionalidadesV2Model[]> {
        return this._httpClient.get<NacionalidadesV2Model[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/nacionalidades")
            .pipe(
                tap((nacionalidades) => {
                    this._nacionalidades.next(nacionalidades);
                }),
            );
    }

    getEstadosCivilesV2(): Observable<EstadosCivilesV2Model[]> {
        return this._httpClient.get<EstadosCivilesV2Model[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/estados-civiles")
            .pipe(
                tap((estadosciviles) => {
                    this._estadosCiviles.next(estadosciviles);
                }),
            );
    }

    getSexosV2(): Observable<SexosV2Model[]> {
        return this._httpClient.get<SexosV2Model[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/sexos")
            .pipe(
                tap((variable) => {
                    this._sexos.next(variable);
                }),
            );
    }

    getTiposContribuyentesV2(): Observable<TiposContribuyentesV2Model[]> {
        return this._httpClient.get<TiposContribuyentesV2Model[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/tipos-contribuyentes")
            .pipe(
                tap((variable) => {
                    this._tiposContribuyentes.next(variable);
                }),
            );
    }

    getTiposDocContribuyentesV2(): Observable<TiposDocContribuyentesV2Model[]> {
        return this._httpClient.get<TiposDocContribuyentesV2Model[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/tipos-doc-contribuyentes")
            .pipe(
                tap((variable) => {
                    this._tiposDocContribuyentes.next(variable);
                }),
            );
    }


    /**
     * Get dominio by id
     
    getContribuyenteById(id: string): Observable<ContribuyenteModel>
    {
        return this._httpClient.get<ContribuyenteModel>(AuthUtils.MUNISYS_BACKEND_URL + "/contribuyentes/" + id)
            .pipe(tap((contribuyente) => {
                this._contribuyente.next(contribuyente);
            }),
        );
    }*/

  /*  getGruposSanguineos(): void
    {
        this._dominioService.getGruposSanguineos()
        .subscribe((gruposSanguineos) =>
        {
            // Set the selected product
            this.gruposSanguineos = gruposSanguineos;

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });*/
    

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
            //id: '',
            rmc: 50000,
            /*nombre: null,
            apellido: null,
            direccion: null,
            nacionalidad: null,
            estadoCivil: null,
            tipoContribuyente: null,
            ciudad: null,
            barrio: null,
            estado: null,
            categoriaContribuyente: null,
            genero: null,
            cedulaIdentidad: null,
            telefono: null,
            celular: null,
            fechaNacimiento: '',
            correoElectronico: null*/
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
     * @param rmc
     * @param contribuyente
     */
     updateContribuyente(rmc: number, contribuyente: ContribuyenteModel): Observable<ContribuyenteModel>
    {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this.contribuyentes$.pipe(
            take(1),
            switchMap(contribuyentes => this._httpClient.put<ContribuyenteModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/contribuyentes", contribuyente, {headers} )
            .pipe(
                map((updatedContribuyente) => {
                    // Find the index of the updated product
                    const index = contribuyentes.findIndex(item => item.rmc === rmc);

                    // Update the product
                    contribuyentes[index] = updatedContribuyente;

                    // Update the products
                    this._contribuyentes.next(contribuyentes);

                    // Return the updated product
                    return updatedContribuyente;
                }),
                switchMap(updatedContribuyente => this.contribuyente$.pipe(
                    take(1),
                    filter(item => item && item.rmc === rmc),
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
