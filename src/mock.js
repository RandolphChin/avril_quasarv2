// src/mock.js
export const mockRoutes = [
  /* 
  {
    path: '/page1',
    title: 'Page 1',
    icon: 'home',
    name: 'PageOne',
    component: () => import('pages/Page1.vue'), // 确保你有这个页面组件
    meta: { title: 'Page 1' },
    children: []  // 必须有 children 属性，默认可以为 []
  },
  {
    path: '/page3',
    title: 'Page 3',
    icon: 'school',
    name: 'PageThree',
    meta: { title: 'Page 3' },
    children: [
      {
        path: 'son2',
        name: 'SonTwo',
        title: 'Son 2',
        component: () => import('pages/SonPage.vue'),
        meta: { title: 'Son 2' }, // 添加 meta 字段
        children : []  // 叶子节点返回个空的
      }
    ]
  },
  {
    path: '/page2',
    title: 'Page 2',
    icon: 'school',
    name: 'PageTwo',
    component: () => import('pages/Page2.vue'), // 确保你有这个页面组件
    meta: { title: 'Page 2' },
    children: []
  },
   */
  {
    path: '/montrachet',
    title: 'Montrachet列表',
    icon: 'list',
    name: 'MontrachetList',
    component: () => import('pages/MontrachetList.vue'), // 需要创建此页面组件
    meta: { title: 'Montrachet列表' },
    children: []  // 必须有 children 属性，默认可以为 []
  },
  {
    path: '/inventory',
    title: '库存列表',
    icon: 'inventory',
    name: 'InventoryList',
    component: () => import('pages/InventoryList.vue'), // 需要创建此页面组件
    meta: { title: '库存列表' },
    children: []
  }
  // 添加更多的mock路由
];
