import { createRouter, createWebHistory } from 'vue-router'
import RoundedCornerView from '../views/RoundedCornerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'rounded-corner',
      component: RoundedCornerView,
    },
    {
      path: '/crop',
      name: 'crop',
      component: () => import('../views/CropView.vue'),
    },
    {
      path: '/height-crop',
      name: 'height-crop',
      component: () => import('../views/HeightCropView.vue'),
    },
    {
      path: '/convert',
      name: 'convert',
      component: () => import('../views/ConvertView.vue'),
    },
    {
      path: '/compress',
      name: 'compress',
      component: () => import('../views/CompressView.vue'),
    },
    {
      path: '/favicon',
      name: 'favicon',
      component: () => import('../views/FaviconView.vue'),
    },
  ],
})

export default router
