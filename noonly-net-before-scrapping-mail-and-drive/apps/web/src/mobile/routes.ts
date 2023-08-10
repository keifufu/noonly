import { RouteDefinition } from '@solidjs/router'
import { lazy } from 'solid-js'

const routes: RouteDefinition[] = [
  {
    path: '/',
    component: lazy(() => import('./pages/Mail'))
  },
  {
    path: '/test',
    component: lazy(() => import('./pages/Test'))
  }
]

export default routes