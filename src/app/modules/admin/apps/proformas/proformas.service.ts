import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { DominioModel, OpcionModel, DominioPagination } from 'app/modules/admin/apps/parametros/dominios/dominios.types';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { AuthService } from 'app/core/auth/auth.service';
import { ProformaModel, ProformaPagination } from './proformas.types';
import { ProformaDetalleModel } from '../contribuyente/estado-cuenta/estado-cuenta-box.types';
import { ContribuyenteModel } from '../contribuyente/contribuyentes.types';
import { DominiosService } from '../parametros/dominios/dominios.service';

@Injectable({providedIn: 'root'})
export class ProformasService
{
    //ATRIBUTOS PARA MANEJAR EL FILTRO DE LAS CUENTAS DEL CONTRIBUYENTE (TIPO Y NRO DOC)
    //EN LA VENTANA DE CARGA DE PROFORMAS...
    private filtroCuentasContribuyente = new BehaviorSubject({"tipoDocumento":{"id": 0}, "nroDocumento" : '0'});
    filtroCuentasContribuyente$ = this.filtroCuentasContribuyente.asObservable();
    private conceptoIngresoActual = new BehaviorSubject('');
    conceptoIngresoActual$ = this.conceptoIngresoActual.asObservable();
    private _contribuyenteProformaActual : ContribuyenteModel;
    // FIN DE CAMPOS DE FILTRO...

    private _proformaCarga    : BehaviorSubject<ProformaModel | null> = new BehaviorSubject(null);
    private _proformaCargaDetalles : ProformaDetalleModel[];
    // Private
    private _proformas       : BehaviorSubject<ProformaModel[] | null> = new BehaviorSubject(null);
    private _proforma        : BehaviorSubject<ProformaModel | null> = new BehaviorSubject(null);
    private _pagination      : BehaviorSubject<ProformaPagination | null> = new BehaviorSubject(null);
    //private _dominiosPadre   : BehaviorSubject<DominioModel[] | null> = new BehaviorSubject(null);

    private _opcionesDelDominio : BehaviorSubject<OpcionModel[] | null> = new BehaviorSubject(null);
    private _opcionPadre        : BehaviorSubject<OpcionModel | null> = new BehaviorSubject(null);
    private _authService = inject(AuthService);
    private _dominioService = inject(DominiosService);
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
    private _montoTotalAPagar = new BehaviorSubject(0);
    private _montoTotalSinDescuento = new BehaviorSubject(0);
    private _montoDescuento = new BehaviorSubject(0);
    private _porcentajeDescuento = new BehaviorSubject(0);
    montoTotalAPagar$ = this._montoTotalAPagar.asObservable();
    montoTotalSinDescuento$ = this._montoTotalSinDescuento.asObservable();
    porcentajeDescuento$ = this._porcentajeDescuento.asObservable();
    montoDescuento$ = this._montoDescuento.asObservable();
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
        this._proformaCargaDetalles = new Array<ProformaDetalleModel>();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get contribuyenteProformaActual(): ContribuyenteModel{
        return this._contribuyenteProformaActual;
    }

    set contribuyenteProformaActual(contri: ContribuyenteModel){
        this._contribuyenteProformaActual = contri;
    }

    get proformaCargaDetalles(): ProformaDetalleModel[] {
        return this._proformaCargaDetalles;
    }
    
    get proformaCarga$(): Observable<ProformaModel> {
        return this._proformaCarga.asObservable();
    }

    get proformas$(): Observable<ProformaModel[]> {
        return this._proformas.asObservable();
    }

    get proforma$(): Observable<ProformaModel> {
        return this._proforma.asObservable();
    }

    get pagination$(): Observable<ProformaPagination> {
        return this._pagination.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    changeFiltroCuentasContribuyente(data: any) {
        this.filtroCuentasContribuyente.next(data);
      }
    setConceptoIngresoActual(data: any) {
        this.conceptoIngresoActual.next(data);
    }
    setMontoTotalAPagar(data: any) {
        this._montoTotalAPagar.next(data);
    }
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
    getProformas(page: number = 0, size: number = 10, sort: string = 'nombreApellido', order: 'asc' | 'desc' | '' = 'asc', search: string = ''):
        Observable<any> {
        const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
        console.log('token: ' + this._authService.accessToken);
        return this._httpClient.get<any>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/paginado-cajeros", {
            params: {
                page: '' + page,
                size: '' + size,
                sort,
                order,
                search,
            },headers })
            .pipe(tap((response) => {
                this._pagination.next(response.pagination);
                this._proformas.next(response.data);
            }),
        );
    }

    createProformaDetalleTemp(newProformaDetalle: ProformaDetalleModel): number
    {
        this._proformaCargaDetalles.push(newProformaDetalle);
        return this.calcularMontoTotalAPagar();
        /*return this.proformaCargaDetalles$.pipe(
            take(1),
            map(profDetalles => {
              // Agregar el nuevo dominio a la lista
              this._proformaCargaDetalles.next([newProformaDetalle, ...profDetalles]);
                console.log('this._proformaCargaDetalles');
                console.log(this._proformaCargaDetalles);
              return newProformaDetalle;
            })
          );*/
    }
    calcularMontoTotalAPagar() : number {
        let montoTotalAPagar : number = 0;
        let montoTotalDescuento : number = 0;
        let montoTotalSinDescuento : number = 0;
        this.proformaCargaDetalles.forEach(x => {
            montoTotalAPagar += x.montoAPagar;
            montoTotalDescuento += x.montoDescuento;
            montoTotalSinDescuento += x.montoCuentaSinDescuento;
        });
        this._montoTotalSinDescuento.next(montoTotalSinDescuento);
        this._montoTotalAPagar.next(montoTotalAPagar);
        this._montoDescuento.next(montoTotalDescuento);
        return montoTotalAPagar;
    }
    /**
     * Get dominio by id
     */
 /*   getDominioById(id: string): Observable<DominioModel>
    {
        return this._httpClient.get<DominioModel>(AuthUtils.MUNISYS_BACKEND_URL + "/dominios/" + id)
            .pipe(tap((dominio) => {
                this._dominio.next(dominio);
            }),
        );
    }
*/

        createProforma(): Observable<ProformaModel>
        {
            let totalAPagar : number = 0;
            this.montoTotalAPagar$.subscribe(res => {
                totalAPagar = res;
            });
            
            const newProforma: ProformaModel = {
                id: '',
                contribuyente: this._contribuyenteProformaActual,
                totalAPagar: totalAPagar,
                estado: this._dominioService.getOpcionByCodDominioAndCodOpcion('ESTPROFOR', 'PEN'),
                montoDescuento : null,
                porcentajeDescuento : null,
                totalSinDescuento: null,
                autorizante: null,
                fechaAutorizacion: null,
                fechaHoraCreacion: null,
                fechaHoraUltModif: null,
                nombreApellido: this._contribuyenteProformaActual.nombre + ' ' + this._contribuyenteProformaActual.apellido,
                observacion: null,
                ruc: null,
                usuarioCreacion: null,
                usuarioUltModif: null,
                detalles: this._proformaCargaDetalles
            };
            const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken }
            //console.log("token_update: " + headers.Authorization);
            console.log("VAMOS A INSERTAR LA PROFORMA:  >>" + newProforma);
            console.log(newProforma);
            return this._httpClient.post<ProformaModel>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas", newProforma, {headers} )
            /*let detalle : ProformaDetalleModel = {
                id: '',
                categoria: undefined,
                cuentaInmueble: undefined,
                montoAPagar: 0,
                montoDescuento: 0,
                porcentajeDescuento: 0
            }*/
            
            /*return null;/* this.contribuyentes$.pipe(
                take(1),
                map(contribuyentes => {
                  // Agregar el nuevo dominio a la lista
                  this._contribuyentes.next([newContribuyente, ...contribuyentes]);
    
                  // Devolver el nuevo dominio
                  return newContribuyente;
                })
              );*/
        }

        getProformasSinPaginado(id: string): Observable<ProformaModel[]> {
            return this._httpClient.get<ProformaModel[]>(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/cajero/nro-ci-contribuyente/" + id)
                .pipe(
                    tap((valor) => {
                        this._proformas.next(valor);
                    }),
                );
        }
    
        liquidarProforma(proformaCabecera: ProformaModel): Observable<number> {
            const headers = { 'Authorization': 'Bearer ' + this._authService.accessToken };
            return this._httpClient.post(AuthUtils.MUNISYS_BACKEND_URL + "/proformas/liquidar", proformaCabecera, { headers, observe: 'response' })
                .pipe(
                map(response => response.status)  // Mapea la respuesta para obtener solo el estado HTTP
                );
        }
    
}
