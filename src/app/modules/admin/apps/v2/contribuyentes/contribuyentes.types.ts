import { observableToBeFn } from "rxjs/internal/testing/TestScheduler";
import { OpcionModel as OpcionModel } from "../../parametros/dominios/dominios.types";

export interface ContribuyenteModel
{
    //id: string;
    rmc?: number;                                               //ok
    apellidoContribuyente?: string;                             //ok    
    apellidoCasadoContribuyente?: string;                       //ok
    ciFull?: string;                                            //ok
    ci?: number;                                                //ok
    codBarrio?: BarriosV2Model;                                 //ok
    codCiudad?: CiudadesV2Model;                                //ok
    codNacionalidad?: NacionalidadesV2Model;                    //ok
    difunto?: string;                                           //ok
    direccionContribuyente?: string;                            //ok
    docExtranjero?: string;                                     //ok
    documento?: string;                                         //ok
    estadoCivilContribuyente?: EstadosCivilesV2Model;           //ok
    email?: string;                                             //ok
    fcDifunto?: string;                                         //ok
    fechaClauContribuyente?: string;                            //ok
    fechaInscripcionContribuyente?: string;                     //ok
    fechaNacimiento?: string;                                   //ok
    grupoSanguineo?: string;                                    //ok
    lugarNacimiento?: string;                                   //ok
    migrado?: string;                                           //ok
    nacContribuyente?: string;                                  //ok
    nombreContribuyente?: string;                               //ok
    razonSocialContribuyente?: string;                          //ok
    nroCasa?: number;                                           //ok
    observacion?: string;                                       //ok
    rmcOld?: number;                                            //ok
    ruc?: string;                                               //ok
    sexoContribuyente?: SexosV2Model;                           //ok
    telefonoContribuyente?: string;                             //ok
    tipoContribuyente?: TiposContribuyentesV2Model;             //ok
    tipoDocumento?: TiposDocContribuyentesV2Model;              //ok
}

export interface ContribuyentePagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface CategoriaCuenta
{
    tipo: 'folder' | 'multas' | 'devoluciones';
    nombre: string;
}

export interface CiudadesV2Model
{
    id?: string;
    nombreCiudad?: string;
}

export interface BarriosV2Model
{
    id?: number;
    nombreBarrio?: string;
}

export interface NacionalidadesV2Model
{
    id?: number;
    nombreNacionalidad?: string;
}

export interface EstadosCivilesV2Model
{
    id?: string;
    descripcion?: string;
}

export interface SexosV2Model
{
    id?: string;
    descripcion?: string;
}

export interface TiposContribuyentesV2Model
{
    id?: string;
    descripcion?: string;
}

export interface TiposDocContribuyentesV2Model
{
    id?: number;
    descripcion?: string;
}