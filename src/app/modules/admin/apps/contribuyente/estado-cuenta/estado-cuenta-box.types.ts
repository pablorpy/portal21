import { InmuebleCuentaModel } from "../../inmuebles/list/inmuebles-types";
import { OpcionModel } from "../../parametros/dominios/dominios.types";
import { ContribuyenteModel } from "../contribuyentes.types";

export interface Task
{
    id?: string;
    content?: string;
    completed?: string;
}

export interface Label
{
    id?: string;
    title?: string;
}

export interface Note
{
    id?: string;
    title?: string;
    content?: string;
    tasks?: Task[];
    image?: string | null;
    labels?: Label[];
    archived?: boolean;
    createdAt?: string;
    updatedAt?: string | null;
}

export interface EstadoCuentaFolder
{
    id: string;
    title: string;
    slug: string;
    icon: string;
    count?: number;
}

export interface ProformaDetalleModel
{
    id: string;
    categoria: OpcionModel;
    cuentaInmueble: InmuebleCuentaModel;
    montoAPagar: number;
    montoDescuento: number;
    porcentajeDescuento: number;
    montoCuentaSinDescuento: number;
}

export interface InmuebleFinanciacionModel
{
    id: string;
    contribuyente: ContribuyenteModel;
	rmcDeudor: number;
	cantidadCuotas: number;
	importePagar: number;
	importeDescuento: number;
	importeEntrega: number;
	saldo: number;
	porcentajeInteres: number;
	nroExpediente?: number;
	fechaHoraExpediente?: Date;
    nroResolucion?: number;
	fechaResolucion?: Date;
	observacion?: string;
	estado?: OpcionModel;
    inmueblesCuentasFraccionadas?: InmuebleCuentaModel[];
}
 

