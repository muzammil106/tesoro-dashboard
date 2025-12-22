export const routePaths = {
  root: '/',
  login: '/login',
  analytics: '/',
  treasures: '/treasures',
  treasureDetail: (id = ':id') => `/treasures/${id}`,
  categories: '/categories',
  contents: '/contents',
  users: '/users',
  userDetail: (id = ':id') => `/users/${id}`,
  transactions: '/transactions',
}
