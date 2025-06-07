import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@renderer/views/404.vue'),
  },
  {
    path: '/landing',
    name: '总览',
    component: () => import('@renderer/views/landing-page/LandingPage.vue'),
  },
  {
    path: '/',
    name: '主页',
    component: () => import('@renderer/views/main-page/MainPage.vue'),
  },
];

export default routes;
