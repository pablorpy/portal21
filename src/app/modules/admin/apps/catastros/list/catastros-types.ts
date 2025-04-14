import { ContribuyenteModel } from "../../contribuyente/contribuyentes.types";
import { OpcionModel } from "../../parametros/dominios/dominios.types";

export const categoriaConstrucciones  = [
	{ id: 'CA', descripcion: 'ADMINISTRATIVO'  },
	{ id: 'CE', descripcion: 'EDUCACIONAL' },
	{ id: 'CO', descripcion: 'COMERCIO' },
	{ id: 'CS', descripcion: 'SALUD' },
	{ id: 'CT', descripcion: 'COMUNITARIO'  },
	{ id: 'DE', descripcion: 'DEPOSITO' },
	{ id: 'ED', descripcion: 'EDUCATIVO' },
	{ id: 'ES', descripcion: 'ESTACIONAMIENTO AUTOVEHICULO' },
	{ id: 'ET', descripcion: 'ESTATAL'  },
	{ id: 'FA', descripcion: 'FABRICA' },
	{ id: 'GA', descripcion: 'GALPON' },
	{ id: 'IN', descripcion: 'INDUSTRIAL' },
	{ id: 'MI', descripcion: 'MIXTO'  },
	{ id: 'NE', descripcion: 'COMERCIAL' },
	{ id: 'NN', descripcion: 'NO IDENTIFICADO' },
	{ id: 'RT', descripcion: 'RECREATIVO' },
	{ id: 'SI', descripcion: 'SILO' },
	{ id: 'SP', descripcion: 'SERVICIO PUBLICO' },
	{ id: 'SV', descripcion: 'SERVICIO'  },
	{ id: 'TA', descripcion: 'TAMBO' },
	{ id: 'TI', descripcion: 'TINGLADO' },
	{ id: 'VI', descripcion: 'VIVIENDA' }
  ];

  export const tipoConstrucciones = [
	{ id: 'AA', descripcion: 'A - ANTIGUA' },
	{ id: 'AN', descripcion: 'A - NUEVA' },
	{ id: 'BA', descripcion: 'B - ANTIGUA' },
	{ id: 'BN', descripcion: 'B - NUEVA' },
	{ id: 'CA', descripcion: 'C - ANTIGUA' },
	{ id: 'CN', descripcion: 'C - NUEVA' },
	{ id: 'DO', descripcion: 'D - A VERIFICAR' },
	{ id: 'DA', descripcion: 'D - ANTIGUA' },
	{ id: 'DN', descripcion: 'D - NUEVA' },
	{ id: 'EA', descripcion: 'E - ANTIGUA' },
	{ id: 'EN', descripcion: 'E - NUEVA' },
	{ id: 'FA', descripcion: 'ESTACIONAMIENTO F - ANTIGUA' },
	{ id: 'FN', descripcion: 'ESTACIONAMIENTO F - NUEVA' },
	{ id: 'NN', descripcion: 'NO IDENTIFICADO' },
	{ id: 'RA', descripcion: 'R - ANTIGUA' },
	{ id: 'RN', descripcion: 'R - NUEVA' },
	{ id: 'GA', descripcion: 'TINGLADO,GALPON G - ANTIGUA' },
	{ id: 'GN', descripcion: 'TINGLADO,GALPON G - NUEVA' },
	{ id: 'HA', descripcion: 'TINGLADO,GALPON H - ANTIGUA' },
	{ id: 'HN', descripcion: 'TINGLADO,GALPON H - NUEVA' },
  ];
  
  export const orientaciones = [
	{ id: '1', descripcion: 'Norte' },
	{ id: '2', descripcion: 'Sur' },
	{ id: '3', descripcion: 'Este' },
	{ id: '4', descripcion: 'Oeste' },
	{ id: '5', descripcion: 'Norte-Este' },
	{ id: '6', descripcion: 'Norte-Oeste' },
	{ id: '7', descripcion: 'Sur-Este' },
	{ id: '8', descripcion: 'Sur-Oeste' }
  ];
  export const calles = [
	{ id: '1', descripcion: 'RUTA INTERNACIONAL' },
	{ id: '10', descripcion: 'HORMIGON ARMADO' },
	{ id: '11', descripcion: 'ADOQUINADO DE GRANITO' },
	{ id: '12', descripcion: 'ADOQUINADO DE CEMENTO' },
	{ id: '13', descripcion: 'LINDERO' },
	{ id: '2', descripcion: 'ASFALTADO' },
	{ id: '4', descripcion: 'EMPEDRADO' },
	{ id: '5', descripcion: 'RIPIO' },
	{ id: '6', descripcion: 'TIERRA' },
	{ id: '8', descripcion: 'NH' },
  ];
  export const callesPrincipales = [
	{ id: 'S', descripcion: 'SI' },
	{ id: 'N', descripcion: 'NO' }
  ];
  export const frentes = [
	{ id: 'S', descripcion: 'SI' },
	{ id: 'N', descripcion: 'NO' }
  ];
  export const categoriasZonas  = [
	{ id: '00', descripcion: 'A VERIFICAR'  },
	{ id: '1', descripcion: 'ZONA URBANA' },
	{ id: '2', descripcion: 'ZONA SUBURBANA' },
	{ id: '3', descripcion: 'ZONA PERIFERICA' }
  ];
export interface CatastroModel
{
    id?: string;
    ctaCte?: string;
    direccionCatastro?: string;
    observacion?: string;
    actividad?: string;
	anioBasura?: number;
	loteCatastro?: number;
    codigoBasura?: string;
    superficie?: number;
	manzanaCatastro?: number;
	pisoCatastro?: number;
	unidadCatastro?: number;
	zonaCatastro?: number;
    departamento?: string;
    estado?: string;
	exoneradoCatastro?: string;
	fechaPago?: string;
	fechaBasura?: string;
	loteamientoLote?: number;
    loteamientoManzana?: number;
	loteamientoZona?: number;
    matricula?: string;
	nroCasa?: number;
    numFinca?: number;
	padron?: string;
	reciboBasura?: number;
	reciboCatastro?: number;
	rmc?: number;
    serie?: string;
	serieCatastro?: string;
	subZona?: number;
	subZona1?: number;
	suelo?: string;
	supeficieHectareas?: number;
    superficieProductivo?: number;
	tenencia?: string;
	tipoCuenta?: string;
	ultimoAnioPagado?: number;
	urbanaRural?: string;
	vieneDeLaCtaCte?: string;

	dimensiones?: DimensionModel[];
	superficies?: SuperficieModel[];
	construcciones?: ConstruccionModel[];
	contribuyente?: ContribuyenteModel;
}

export interface CatastroPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface SuperficieModel
{
    id?: number;
	borrado?: string;
    ctaCte?: string;
    posicion?: number;
    subZona?: number;
	superficieHa?: number;
	superficieM2?: number;
}

export interface DimensionModel
{
    dimension?: number;
	areaDimension?: number;
	borrado?: string;
	calle?: string;
	callePrincipal?: string;
	categoriaZona?: string;
	ctaCte?: string;
	desdeAnio?: number;
	frentes?: string;
	observacion?: string;
	orientacion?: string;
	posicion?: number;
	tramoCalle?: number;
	utm1x?: string;
	utm1y?: string;
	utm2x?: string;
	utm2y?: string;
}

export interface ConstruccionModel{
    nroFilaConstruccion?: number;
	anioConstruccion?: number;
	area?: number;
	borrado?: string;
	categoriaConstruccion?: string;
	ctaCte?: string;
	obs?: string;
	tipoConstruccion?: string;
}

