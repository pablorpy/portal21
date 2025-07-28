/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id      : 'apps',
        title   : 'Solicitud de Socio',
        subtitle: 'Datos del socio para asociación',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'apps.asociacion.datos.personales',
                title: 'Datos Personales',
                type : 'basic',
                icon : 'heroicons_outline:command-line',
                link : '/apps/asociacion/datos-personales',
            },
            {
                id   : 'apps.asociacion.manifestacion.bienes',
                title: 'Manifestación de Bienes',
                type : 'basic',
                icon : 'heroicons_outline:computer-desktop',
                link : '/apps/manifestacion-bienes',
            },
            {
                id   : 'apps.documentacion',
                title: 'Documentación',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/apps/documentacion',
            },
             {
                id   : 'parametros',
                title: 'Parametros',
                subtitle: 'Tablas de parámetros',
                type : 'group',
                icon : 'heroicons_outline:clipboard-document-check',
                children: [
                    {
                        id   : 'parametros.barrios',
                        title: 'ABM Barrios',
                        type : 'basic',
                        icon : 'heroicons_outline:clipboard-document-check',
                        link : '/parametros/barrios',
                    },
                      {
                        id   : 'parametros.ciudades',
                        title: 'ABM Ciudades',
                        type : 'basic',
                        icon : 'heroicons_outline:clipboard-document-check',
                        link : '/parametros/ciudades',
                    },
                      {
                        id   : 'parametros.departamentos',
                        title: 'ABM Departamentos',
                        type : 'basic',
                        icon : 'heroicons_outline:clipboard-document-check',
                        link : '/parametros/departamentos',
                    },
                ]
            }
        ],
    },

    /*{
        id   : 'comprobantes',
        title: 'Comprobantes',
        subtitle: 'Comprobantes',
        type : 'group',
        icon : 'heroicons_outline:chart-pie',
        children: [
            {
                id   : 'comprobantes.timbrados',
                title: 'Timbrados',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/comprobantes/timbrados',
            },
        ]
    },

    {
        id   : 'contribuyentes',
        title: 'Contribuyentes V2',
        subtitle: 'Contribuyentes V2',
        type : 'group',
        icon : 'heroicons_outline:chart-pie',
        children: [
            {
                id   : 'contribuyentesv2',
                title: 'Contribuyentes V2',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/contribuyentesv2',
            },
        ]
    },

    {
        id   : 'catastros',
        title: 'Catastros',
        subtitle: 'Catastros',
        type : 'group',
        icon : 'heroicons_outline:chart-pie',
        children: [
            {
                id   : 'catastros.catastros',
                title: 'Catastros',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/catastros/catastros',
            },
        ]
    },
    

    {
        id   : 'construcciones',
        title: 'Construcciones',
        subtitle: 'Construcciones',
        type : 'group',
        icon : 'heroicons_outline:chart-pie',
        children: [
            {
                id   : 'construcciones.construcciones',
                title: 'Construcciones',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/construcciones/construcciones',
            },
        ]
    },

    {
        id   : 'menues',
        title: 'Menues',
        subtitle: 'Definición de los ítems de Menu',
        type : 'group',
        icon : 'heroicons_outline:chart-pie',
        children: [
            {
                id   : 'menues.menues',
                title: 'Menues',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/menues/menues',
            },
        ]
    },

    {
        
        id   : 'parametros',
        title: 'Parámetros',
        subtitle: 'Tablas de parámetros',
        type : 'group',
        icon : 'heroicons_outline:chart-pie',
        children: [
            {
                id   : 'parametros.dominios',
                title: 'Dominios',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/parametros/dominios',
            },
            {
                id   : 'parametros.contribuyentes',
                title: 'Contribuyentes',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/parametros/contribuyentes',
            },
            {
                id   : 'registros.registros',
                title: 'Registros',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/parametros/registros',
            },
            {
                id   : 'inmuebles.inmuebles',
                title: 'Inmuebles',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/parametros/inmuebles',
            },
            {
                id   : 'proformas.proformas',
                title: 'Cajeros - Proformas',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/parametros/proformas',
            },
            {
                id   : 'liquidaciones.liquidaciones',
                title: 'Reimpresión - Proformas',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/parametros/liquidaciones',
            },
            {
                id   : 'autorizantes.autorizantes',
                title: 'Autorizar Descuentos',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/parametros/autorizantes',
            },
            {
                id   : 'cajeros.cajeros',
                title: 'Cajeros',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/parametros/cajeros',
            },
            {
                id   : 'aperturas.aperturas',
                title: 'Aperturas',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/parametros/aperturas',
            }
        ]
    },

    {
        id      : 'dashboards',
        title   : 'Dashboards',
        subtitle: 'Unique dashboard designs',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'dashboards.project',
                title: 'Project',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-document-check',
                link : '/dashboards/project',
            },
            {
                id   : 'dashboards.analytics',
                title: 'Analytics',
                type : 'basic',
                icon : 'heroicons_outline:chart-pie',
                link : '/dashboards/analytics',
            },
            {
                id   : 'dashboards.finance',
                title: 'Finance',
                type : 'basic',
                icon : 'heroicons_outline:banknotes',
                link : '/dashboards/finance',
            },
            {
                id   : 'dashboards.crypto',
                title: 'Crypto',
                type : 'basic',
                icon : 'heroicons_outline:currency-dollar',
                link : '/dashboards/crypto',
            },
        ],
    },
    
    {
        id      : 'pages',
        title   : 'Pages',
        subtitle: 'Custom made page designs',
        type    : 'group',
        icon    : 'heroicons_outline:document',
        children: [
            {
                id   : 'pages.activities',
                title: 'Activities',
                type : 'basic',
                icon : 'heroicons_outline:bars-3-bottom-left',
                link : '/pages/activities',
            },
        ],
    },*/
];

export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
