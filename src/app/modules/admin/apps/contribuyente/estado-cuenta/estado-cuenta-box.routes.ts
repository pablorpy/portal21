import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes, UrlMatchResult, UrlSegment } from '@angular/router';
/* import { MailboxDetailsComponent } from 'app/modules/admin/apps/mailbox/details/details.component';
import { MailboxEmptyDetailsComponent } from 'app/modules/admin/apps/mailbox/empty-details/empty-details.component';
import { MailboxService } from 'app/modules/admin/apps/mailbox/mailbox.service';
import { MailboxSettingsComponent } from 'app/modules/admin/apps/mailbox/settings/settings.component'; */
import { isEqual } from 'lodash-es';
import { catchError, finalize, forkJoin, throwError } from 'rxjs';
import { EstadoCuentaBoxComponent } from './estado-cuenta-box.component';
import { EstadoCuentaBoxListComponent } from './list/list.component';
import { InmueblesService } from '../../inmuebles/list/inmuebles.service';
import { EstadoCuentaBoxDetailsComponent } from './details/details.component';
import { RegistrosService } from '../../registros/registros.service';
import { ProformasService } from '../../proformas/proformas.service';

/**
 * Mailbox custom route matcher
 *
 * @param url
 */
const estadoCuentaBoxRouteMatcher: (url: UrlSegment[]) => UrlMatchResult = (url: UrlSegment[]) =>
{
    console.log('3NTRANDO EN ESTADO CUENTA BOX ROUTE MATCHER');
    // Prepare consumed url and positional parameters
    let consumed = url;
    const posParams = {};
    console.log(url);
    // Settings
    if ( url[0].path === 'settings' )
    {
        // Do not match
        return null;
    }
    // Filter or label
   /*  else if ( url[0].path === 'filter' || url[0].path === 'label' )
    {
        posParams[url[0].path] = url[1];
        posParams['page'] = url[2];

        // Remove the id if exists
        if ( url[3] )
        {
            consumed = url.slice(0, -1);
        }
    } */
    // Folder
    else
    {
        posParams['folder'] = url[0];
        posParams['tipoDoc'] = url[1];
        posParams['nroDoc'] = url[2];
        posParams['page'] = url[3];
        console.log(posParams);
        // Remove the id if exists
        if ( url[4] )
        {
            consumed = url.slice(0, -1);
        }
    }

    return {
        consumed,
        posParams,
    };
};

/**
 * Mailbox custom guards and resolvers runner
 *
 * @param from
 * @param to
 */
const estadoCuentaBoxRunGuardsAndResolvers: (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean = (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) =>
{
    // If we are navigating from mail to mails, meaning there is an id in
    // from's deepest first child and there isn't one in the to's, we will
    // trigger the resolver

    // Get the current activated route of the 'from'
    let fromCurrentRoute = from;
    while ( fromCurrentRoute.firstChild )
    {
        fromCurrentRoute = fromCurrentRoute.firstChild;
    }

    // Get the current activated route of the 'to'
    let toCurrentRoute = to;
    while ( toCurrentRoute.firstChild )
    {
        toCurrentRoute = toCurrentRoute.firstChild;
    }

    // Trigger the resolver if the condition met
    if ( fromCurrentRoute.paramMap.get('id') && !toCurrentRoute.paramMap.get('id') )
    {
        return true;
    }

    // If the from and to params are equal, don't trigger the resolver
    const fromParams = {};
    const toParams = {};

    from.paramMap.keys.forEach((key) =>
    {
        fromParams[key] = from.paramMap.get(key);
    });

    to.paramMap.keys.forEach((key) =>
    {
        toParams[key] = to.paramMap.get(key);
    });

    if ( isEqual(fromParams, toParams) )
    {
        return false;
    }

    // Trigger the resolver on other cases
    return true;
};

/**
 * Inumebles resolver
 *
 * @param route
 * @param state
 */
const inmueblesResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
{
    if (route.paramMap.get('folder') == 'INM'){
        const inmuebleService = inject(InmueblesService);
        const proformaService = inject(ProformasService);
        proformaService.setConceptoIngresoActual(route.paramMap.get('folder'));
        const router = inject(Router);

        // Don't allow page param to go below 1
        if ( route.paramMap.get('page') && parseInt(route.paramMap.get('page'), 10) <= 0 )
        {
            // Get the parent url
            const url = state.url.split('/').slice(0, -1).join('/') + '/1';
            console.log('URL: ' + url);
            // Navigate to there
            router.navigateByUrl(url);

            // Don't allow request to go through
            return false;
        }

        // Create and build the sources array
        const sources = [];

        // If folder is set on the parameters...
        console.log('route.paramMap.get("folder"): ' + route.paramMap.get('folder'));
        if ( route.paramMap.get('folder') )
        {
            let inmueblesDelContri = inmuebleService.getInmueblesPaginadoByNroCiContribuyente(route.paramMap.get('nroDoc'));
            console.log("inmueblesDelContri: " + inmueblesDelContri);
            sources.push(inmueblesDelContri);
        // sources.push(inmuebleService.getMailsByFolder(route.paramMap.get('folder'), route.paramMap.get('page')));
        }

        // If filter is set on the parameters...
    /*  if ( route.paramMap.get('filter') )
        {
            sources.push(inmuebleService.getMailsByFilter(route.paramMap.get('filter'), route.paramMap.get('page')));
        } */

        // If label is set on the parameters...
        /* if ( route.paramMap.get('label') )
        {
            sources.push(mailboxService.getMailsByLabel(route.paramMap.get('label'), route.paramMap.get('page')));
        } */

        // Fork join all the sources
        return forkJoin(sources)
            .pipe(
                finalize(() =>
                {
                    // If there is no selected mail, reset the mail every
                    // time mail list changes. This will ensure that the
                    // mail will be reset while navigating between the
                    // folders/filters/labels, but it won't reset on page
                    // reload if we are reading a mail.

                    // Try to get the current activated route
                    let currentRoute = route;
                    while ( currentRoute.firstChild )
                    {
                        currentRoute = currentRoute.firstChild;
                    }

                    // Make sure there is no 'id' parameter on the current route
                    if ( !currentRoute.paramMap.get('id') )
                    {
                        // Reset the mail
                        //inmuebleService.resetMail().subscribe();
                    }
                }),

                // Error here means the requested page is not available
                catchError((error) =>
                {
                    // Log the error
                    console.error(error.message);

                    // Get the parent url and append the last possible page number to the parent url
                    const url = state.url.split('/').slice(0, -1).join('/') + '/' + error.pagination.lastPage;

                    // Navigate to there
                    router.navigateByUrl(url);

                    // Throw an error
                    return throwError(error);
                }),
            );
    }
};

/**
 * Inumebles resolver
 *
 * @param route
 * @param state
 */
const registrosResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    {
        if (route.paramMap.get('folder') == 'REG'){
            const proformaService = inject(ProformasService);
            proformaService.setConceptoIngresoActual(route.paramMap.get('folder'));
            const registroService = inject(RegistrosService);
            const router = inject(Router);
        
            // Don't allow page param to go below 1
            if ( route.paramMap.get('page') && parseInt(route.paramMap.get('page'), 10) <= 0 )
            {
                // Get the parent url
                const url = state.url.split('/').slice(0, -1).join('/') + '/1';
                console.log('URL: ' + url);
                // Navigate to there
                router.navigateByUrl(url);
        
                // Don't allow request to go through
                return false;
            }
        
            // Create and build the sources array
            const sources = [];
        
            // If folder is set on the parameters...
            console.log('route.paramMap.get("folder"): ' + route.paramMap.get('folder'));
            if ( route.paramMap.get('folder') )
            {
                let registrosDelContri = registroService.getRegistrosPaginadoByNroCiContribuyente(route.paramMap.get('nroDoc'));
                console.log("registrosDelContri: " + registrosDelContri);
                sources.push(registrosDelContri);
            // sources.push(inmuebleService.getMailsByFolder(route.paramMap.get('folder'), route.paramMap.get('page')));
            }
    
            // Fork join all the sources
            return forkJoin(sources)
                .pipe(
                    finalize(() =>
                    {
                        // If there is no selected mail, reset the mail every
                        // time mail list changes. This will ensure that the
                        // mail will be reset while navigating between the
                        // folders/filters/labels, but it won't reset on page
                        // reload if we are reading a mail.
        
                        // Try to get the current activated route
                        let currentRoute = route;
                        while ( currentRoute.firstChild )
                        {
                            currentRoute = currentRoute.firstChild;
                        }
        
                        // Make sure there is no 'id' parameter on the current route
                        if ( !currentRoute.paramMap.get('id') )
                        {
                            // Reset the mail
                            //inmuebleService.resetMail().subscribe();
                        }
                    }),
        
                    // Error here means the requested page is not available
                    catchError((error) =>
                    {
                        // Log the error
                        console.error(error.message);
        
                        // Get the parent url and append the last possible page number to the parent url
                        const url = state.url.split('/').slice(0, -1).join('/') + '/' + error.pagination.lastPage;
        
                        // Navigate to there
                        router.navigateByUrl(url);
        
                        // Throw an error
                        return throwError(error);
                    }),
                );
        }
    };

/**
 * Inmueble resolver
 *
 * @param route
 * @param state
 */
const inmuebleResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
{
    const inmuebleService = inject(InmueblesService);
    const router = inject(Router);

    return inmuebleService.getInmuebleById(route.paramMap.get('id'))
        .pipe(
            // Error here means the requested mail is either
            // not available on the requested page or not
            // available at all
            catchError((error) =>
            {
                // Log the error
                console.error(error);

                // Get the parent url
                const parentUrl = state.url.split('/').slice(0, -1).join('/');

                // Navigate to there
                router.navigateByUrl(parentUrl);

                // Throw an error
                return throwError(error);
            }),
        );
};

/**
 * Registro resolver
 *
 * @param route
 * @param state
 */
const registroResolver = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    {
        const registroService = inject(RegistrosService);
        const router = inject(Router);
    
        return registroService.getRegistroById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested mail is either
                // not available on the requested page or not
                // available at all
                catchError((error) =>
                {
                    // Log the error
                    console.error(error);
    
                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');
    
                    // Navigate to there
                    router.navigateByUrl(parentUrl);
    
                    // Throw an error
                    return throwError(error);
                }),
            );
    };

export default [
    {
        path      : '',
        redirectTo: 'REG/9351/0/1',
        pathMatch : 'full',
    },
    {
        path      : ':folder/:tipoDoc/:nroDoc',
        redirectTo: ':folder/:tipoDoc/:nroDoc/1',
        pathMatch : 'full',
    },
    {
        path     : '',
        component: EstadoCuentaBoxComponent,
        resolve  : {
            //conceptosIngresos: () => inject(MailboxService).getFilters()
            //inmuebles: () => inject(InmueblesService).getInmueblesByNroCiContribuyente('222'),
            /* filters: () => inject(MailboxService).getFilters(),
            labels : () => inject(MailboxService).getLabels(), */
        },
        children : [
            {
                component            : EstadoCuentaBoxListComponent,
                matcher              : estadoCuentaBoxRouteMatcher,
                runGuardsAndResolvers: estadoCuentaBoxRunGuardsAndResolvers,
                resolve              : {
                    inmuebles: inmueblesResolver,
                    registros: registrosResolver,
                },
                children             : [
                    /*{
                        path     : '',
                        pathMatch: 'full',
                        component: MailboxEmptyDetailsComponent,
                    },*/
                    {
                        path     : ':id',
                        component: EstadoCuentaBoxDetailsComponent,
                        resolve  : {
                            inmueble: inmuebleResolver,
                            registro: registroResolver,
                        },
                    }, 
                ],
            },
            /* {
                path     : 'settings',
                component: MailboxSettingsComponent,
            }, */
        ],
    },
] as Routes;
