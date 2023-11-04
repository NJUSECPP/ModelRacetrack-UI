
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Home.vue')
      }
    ]
  },
  {
    path: '/test/auto',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/AutoTest.vue')
      }
    ]
  },
  {
    path: '/test/manual',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/ManualTest.vue')
      }
    ]
  },
  {
    path: '/manage/model',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/ModelManage.vue')
      }
    ]
  },
  {
    path: '/manage/question',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/QuestionManage.vue')
      }
    ]
  },
  {
    path: '/secret',
    component: () => import('pages/Secret.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
