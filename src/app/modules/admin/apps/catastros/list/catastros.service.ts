import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { BehaviorSubject, catchError, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { CategoriaCuenta } from '../../contribuyente/contribuyentes.types';
import { CatastroModel, CatastroPagination, ConstruccionModel, DimensionModel, SuperficieModel } from './catastros-types';
import { OperadoresWhere } from '../../parametros/dominios/dominios.types';

@Injectable({providedIn: 'root'})
export class CatastrosService
{
    //ATRIBUTOS PARA MANEJAR EL FILTRO DE CATASTROS DEL CONTRIBUYENTE (CAMPO Y VALOR FILTRO)
    //EN LA VENTANA DE CARGA DE PROFORMAS...
    private filtrosBusqContribuyentes = new BehaviorSubject({"campoFiltro":{"id": 0, "codigo": ""}, "valorFiltro" : '0'});
    filtrosBusqContribuyentes$ = this.filtrosBusqContribuyentes.asObservable();

    //propiedades para la gestion de cuentas
    selectedCatastroChanged: BehaviorSubject<any> = new BehaviorSubject(null);

    // Private
    private _catastros       : BehaviorSubject<CatastroModel[] | null> = new BehaviorSubject(null);
    private _catastro        : BehaviorSubject<CatastroModel | null> = new BehaviorSubject(null);
    private _superficie        : BehaviorSubject<SuperficieModel | null> = new BehaviorSubject(null);
    private _superficies        : BehaviorSubject<SuperficieModel[] | null> = new BehaviorSubject(null);
    private _dimension        : BehaviorSubject<DimensionModel | null> = new BehaviorSubject(null);
    private _dimensiones        : BehaviorSubject<DimensionModel[] | null> = new BehaviorSubject(null);
    private _construccion       : BehaviorSubject<ConstruccionModel | null> = new BehaviorSubject(null);
    private _pagination      : BehaviorSubject<CatastroPagination| null> = new BehaviorSubject(null);
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

      get catastros$(): Observable<CatastroModel[]> {
        return this._catastros.asObservable();
    }

    /**
     * Getter para cargando inmuebles
     */
     get catastro$(): Observable<CatastroModel> {
        return this._catastro.asObservable();
    }

    get pagination$(): Observable<CatastroPagination> {
        return this._pagination.asObservable();
    }

    get superficie$(): Observable<SuperficieModel> {
        return this._superficie.asObservable();
    }

    get superficies$(): Observable<SuperficieModel[]> {
        return this._superficies.asObservable();
    }

    get dimension$(): Observable<DimensionModel> {
        return this._dimension.asObservable();
    }

    get dimensiones$(): Observable<DimensionModel[]> {
        return this._dimensiones.asObservable();
    }

    get construccion$(): Observable<ConstruccionModel> {
        return this._construccion.asObservable();
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
    getCatastros(page: number = 0, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' | '' = 'asc', search: string = '', searchField: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log('token: ' + this._authService.accessToken);
        let operador : OperadoresWhere;
        if (searchField != ''){
            switch (searchField) {
                case 'rmc':
                    operador = OperadoresWhere.EQUAL;
                    console.log(operador);
                    break;
                default:
                    operador = OperadoresWhere.LIKE;
                    break;
            }
        }
        let url =AuthUtils.MUNISYS_BACKEND_URL_V2 + ("/catastros/paginado" + (searchField != '' ? ("/" + searchField + "/"+ operador) : ''));
        return this._httpClient.get<any>(url, {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            },headers })
            .pipe(tap((response) => {
                this._pagination.next(response.pagination);
                this._catastros.next(response.data);
            }),
        );
    }


    /**
     * Get inmueble by id
     */
    getCatastroById(id: string): Observable<CatastroModel>
    {
        return this._httpClient.get<CatastroModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros/" + id)
            .pipe(tap((inmueble) => {
                this._catastro.next(inmueble);
            }),
        );
    }

    getSuperficieByCtaCte(cuentaCorriente: string): Observable<SuperficieModel>
    {
        return this._httpClient.get<SuperficieModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros-superficie/by-cta-cte/" + cuentaCorriente)
            .pipe(tap((valor) => {
                this._superficie.next(valor);
            }),
        );
    }

    getSuperficieByCtaCte_array(cuentaCorriente: string): Observable<SuperficieModel[]>
    {
        return this._httpClient.get<SuperficieModel[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros-superficie/by-cta-cte/" + cuentaCorriente)
            .pipe(tap((valor) => {
                this._superficies.next(valor);
            }),
        );
    }

    getDimensionByCtaCte_array(cuentaCorriente: string): Observable<DimensionModel[]>
    {
        return this._httpClient.get<DimensionModel[]>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/dimensiones/by-cta-cte/" + cuentaCorriente)
            .pipe(tap((valor) => {
                this._dimensiones.next(valor);
            }),
        );
    }

    getDimensionByCtaCte_normal(cuentaCorriente: string): Observable<DimensionModel>
    {
        return this._httpClient.get<DimensionModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/dimensiones/by-cta-cte/" + cuentaCorriente)
            .pipe(tap((valor) => {
                this._dimension.next(valor);
            }),
        );
    }

    getConstruccionByCtaCte(cuentaCorriente: string): Observable<ConstruccionModel>
    {
        return this._httpClient.get<ConstruccionModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/construcciones/by-cta-cte/" + cuentaCorriente)
            .pipe(tap((valor) => {
                this._construccion.next(valor);
            }),
        );
    }

   /* insertCatastro(catastro: CatastroModel): Observable<CatastroModel> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        return this._httpClient.post<CatastroModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros/detalles", catastro, {headers})
          .pipe(
            catchError(error => {
              console.error('Error al insertar el catastro:', error);
              return of(null); // Devuelve null o un valor por defecto en caso de error
            })
          );
      }*/

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
  /*  getInmueblesPaginadoByNroCiContribuyente(nroCi: string = '', page: number = 0, size: number = 10, sort: string = 'id', order: 'asc' | 'desc' | '' = 'asc'):
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
    }*/

        /**
     * Get inmuebles by nro de ci del contribuyente
     */
   /* getInmueblesByNroCiContribuyente(nroCi: string): Observable<InmuebleModel[]>
    {
        return this._httpClient.get<InmuebleModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/inmuebles/nro-ci-contribuyente/" + nroCi)
            .pipe(tap((inmuebles) => {
                this._inmuebles.next(inmuebles);
            }),
        );
    }*/

   /* getCuentasInmuebleByIdInmueble(inm: InmuebleModel): Observable<InmuebleCuentaModel[]>
    {
        var x = this._httpClient.get<InmuebleCuentaModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/cuentas-inmueble/inmueble/" + inm.id)
            .pipe(tap((cuentasInmueble) => {
                //this._inmueble.next(inm);
                this._cuentasInmueble.next(cuentasInmueble);
            }),
        );
        return x;
    }*/

    /**
     * Crear 
     */
    createCatastro(): Observable<CatastroModel> {
        // Crear un objeto nuevo de tipo CatastroModel con valores de prueba
        const newCatastro: CatastroModel = {
            id: '',
            ctaCte: '',                // Valor de prueba para ctaCte
            direccionCatastro: '',  // Valor de prueba para direccionCatastro
            observacion: '',  // Valor de prueba para observacion
            actividad: null,               // Valor de prueba para actividad
            anioBasura: null,                    // Valor de prueba para anioBasura
            loteCatastro: null,                    // Valor de prueba para loteCatastro
            codigoBasura: '',               // Valor de prueba para codigoBasura
            superficie: null,                     // Valor de prueba para superficie
            manzanaCatastro: null,                  // Valor de prueba para manzanaCatastro
            pisoCatastro: null,                     // Valor de prueba para pisoCatastro
            unidadCatastro: null,                   // Valor de prueba para unidadCatastro
            zonaCatastro: 24,                     // Valor de prueba para zonaCatastro
            departamento: '01',      // Valor de prueba para departamento
            exoneradoCatastro: '',             // Valor de prueba para exoneradoCatastro
            fechaPago: null,             // Valor de prueba para fechaPago
            fechaBasura: null,           // Valor de prueba para fechaBasura
            loteamientoLote: null,                  // Valor de prueba para loteamientoLote
            loteamientoManzana: null,               // Valor de prueba para loteamientoManzana
            loteamientoZona: 24,                  // Valor de prueba para loteamientoZona
            matricula: '0',             // Valor de prueba para matricula
            nroCasa: 0,                        // Valor de prueba para nroCasa
            numFinca: 0,                       // Valor de prueba para numFinca
            padron: '',                 // Valor de prueba para padron
            reciboBasura: 0,                   // Valor de prueba para reciboBasura
            reciboCatastro: 0,                 // Valor de prueba para reciboCatastro
            rmc: null,                            // Valor de prueba para rmc
            serie: null,                       // Valor de prueba para serie
            serieCatastro: 'A',               // Valor de prueba para serieCatastro
            subZona: 0,                          // Valor de prueba para subZona
            subZona1: 0,                         // Valor de prueba para subZona1
            supeficieHectareas: null,             // Valor de prueba para supeficieHectareas
            superficieProductivo: null,           // Valor de prueba para superficieProductivo
            ultimoAnioPagado: null,              // Valor de prueba para ultimoAnioPagado
            vieneDeLaCtaCte: null,               // Valor de prueba para vieneDeLaCtaCte
        };
        return this.catastros$.pipe(
            take(1),
            map(catastros => {
                // Agregar el nuevo catastro a la lista de catastros
                this._catastros.next([newCatastro, ...catastros]);
    
                // Devolver el nuevo catastro
                return newCatastro;
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
     * @param catastro
     */
    updateCatastro(catastro: CatastroModel): Observable<CatastroModel>
    {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        //console.log("token_update: " + headers.Authorization);
        return this.catastros$.pipe(
            take(1),
            switchMap(catastros => this._httpClient.put<CatastroModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros/detalles/" + catastro.id, catastro, {headers} )
            .pipe(
                map((updatedCatastro) => {
                    // Find the index of the updated product
                    const index = catastros.findIndex(item => item.id === catastro.id);

                    // Update the product
                    catastros[index] = updatedCatastro;

                    // Update the products
                    this._catastros.next(catastros);

                    // Return the updated product
                    return updatedCatastro;
                }),
                switchMap(updatedCatastro => this.catastro$.pipe(
                    take(1),
                    filter(item => item && item.id === catastro.id),
                    tap(() => {
                        // Update the product if it's selected
                        this._catastro.next(updatedCatastro);

                        // Return the updated product
                        return updatedCatastro;
                    }),
                )),
            )),
        );
    }

     /**
     * insert 
     *
     * @param id
     * @param catastro
     */
    /*updateCatastro_2(id: string, catastro: CatastroModel): Observable<CatastroModel>
    {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        // Si el id es vacío o null, realizar un insert (POST)
        if (!id || id.trim() === '') {
            // Realizar un insert (POST)
            return this.catastros$.pipe(
                take(1),
                switchMap(catastros =>
                    this._httpClient.post<CatastroModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros/detalles", catastro, { headers })
                        .pipe(
                            map((newCatastro) => {
                                // Buscar si ya existe una línea vacía en la lista de catastros
                                const emptyIndex = catastros.findIndex(item => !item.id || item.id.trim() === '');
        
                                if (emptyIndex !== -1) {
                                    // Si encontramos una línea vacía, la actualizamos con el nuevo catastro
                                    catastros[emptyIndex] = newCatastro;
                                } else {
                                    // Si no existe línea vacía, agregar el nuevo catastro a la lista
                                    catastros = [newCatastro, ...catastros];
                                }
        
                                // Actualizar la lista de catastros
                                this._catastros.next(catastros);
        
                                // Actualizar el catastro seleccionado
                                this._catastro.next(newCatastro);
        
                                // Devolver el nuevo catastro
                                return newCatastro;
                            })
                        )
                )
            );
        }
        
    }*/

        updateCatastro_2(id: string, catastro: CatastroModel, showMessageCallback: (message: string) => void): Observable<CatastroModel> {
            const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
            
            if (!id || id.trim() === '') {
                return this.catastros$.pipe(
                    take(1),
                    switchMap(catastros =>
                        this._httpClient.post<CatastroModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros/detalles", catastro, { headers })
                            .pipe(
                                map((newCatastro) => {
                                    const emptyIndex = catastros.findIndex(item => !item.id || item.id.trim() === '');
        
                                    if (emptyIndex !== -1) {
                                        catastros[emptyIndex] = newCatastro;
                                    } else {
                                        catastros = [newCatastro, ...catastros];
                                    }
        
                                    this._catastros.next(catastros);
                                    this._catastro.next(newCatastro);
                                    
                                    // Si la respuesta es exitosa, llamamos al callback con el mensaje de éxito
                                    showMessageCallback('success');  // Mensaje de éxito
                                    return newCatastro;
                                }),
                                catchError(error => {
                                    // En caso de error, mostramos un mensaje de error adecuado
                                    //console.error('Error al actualizar o insertar catastro:', error);
        
                                    let errorMessage = 'Error desconocido';  // Mensaje predeterminado
        
                                    // Comprobamos el código de estado y asignamos un mensaje de error adecuado
                                    if (error.status === 412) {
                                        errorMessage = 'ya existe';
                                    } else if (error.status === 404) {
                                        errorMessage = 'no encontrado.';
                                    } else if (error.status === 500) {
                                        errorMessage = 'error interno';
                                    } else {
                                        errorMessage = `error desconocido`;
                                    }
                                    console.log(error.status);
                                    // Llamamos al callback con el mensaje de error
                                    showMessageCallback(errorMessage);  // Mensaje de error descriptivo
                                    return of(null);
                                })
                            )
                    )
                );
            }
        }
        
        

    insertarCatastro(catastro: CatastroModel): Observable<CatastroModel | { errorCode: number }> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
      
        return this.catastros$.pipe(
          take(1),
          switchMap(catastros =>
            this._httpClient.post<CatastroModel>(AuthUtils.MUNISYS_BACKEND_URL_V2 + "/catastros/detalles", catastro, { headers })
              .pipe(
                map((newCatastro) => {
                  // Insertar el nuevo catastro en el arreglo local
                  catastros.push(newCatastro); // Agregarlo al arreglo local
                  
                  // Actualizar el listado de catastros locales
                  this._catastros.next(catastros);
      
                  // Retornar el nuevo catastro insertado
                  return newCatastro;
                }),
                switchMap(newCatastro => {
                  if (catastro.id === null) {
                    // Si id_cat es null, solo actualizamos el estado de catastro$
                    return this.catastro$.pipe(
                      take(1),
                      tap(() => {
                        this._catastro.next(newCatastro); // Actualizamos el catastro seleccionado
                        return newCatastro;
                      })
                    );
                  }
                  //return 
                  //return new Observable<CatastroModel>(); // Devolver un observable vacío si no es necesario actualizar catastro$
                }),
                catchError((error: HttpErrorResponse) => {
                  // Capturamos el error y lo devolvemos
                  if (error.status === 412) {
                    return of({ errorCode: 412 });  // Devuelve el código de error
                  } else {
                    return of({ errorCode: error.status }); // Devuelve el código de otro error
                  }
                })
              )
          )
        );
      }
      
      changeFiltrosBusqContribuyentes(data: any) {
        this.filtrosBusqContribuyentes.next(data);
      }    
    
}
