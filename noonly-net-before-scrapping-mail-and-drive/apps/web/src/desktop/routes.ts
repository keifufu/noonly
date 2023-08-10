import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'

const routes: RouteDefinition[] = [
  {
    path: '/',
    component: lazy(() => import('./pages/Home'))
  },
  {
    path: '/mail',
    component: lazy(() => import('./pages/Mail'))
  }
]

export default routes