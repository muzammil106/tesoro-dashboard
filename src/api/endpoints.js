export const endpoints = {
  // Base URL is expected to be .../api (see `src/api/http.js`)
  auth: {
    signup: '/auth/signup',
    login: '/auth/login',
    forgotPassword: '/auth/forgot-password',
    verifyOtp: '/auth/verify-otp',
    resetPassword: '/auth/reset-password',
    refresh: '/auth/refresh',
  },

  treasures: {
    create: '/treasures/create',
    detail: '/treasures/detail',
    all: '/treasures/all',
    update: '/treasures/update',
    delete: '/treasures/delete',
    collect: '/treasures/collect',
    collectedByUser: '/treasures/collected/user',

    // Backwards-compat alias (some older code calls it “list”)
    list: '/treasures/all',
  },

  categories: {
    create: '/categories/create',
    details: '/categories/details',
    all: '/categories/all',
    update: '/categories/update',
    delete: '/categories/delete',
  },

  users: {
    me: '/users/me',

    // Postman: /api/users/all?page=1&limit=15&search=...&isPremium=true|false
    all: '/users/all',

    // Postman: /api/users/update (body: userId, profileImage?, name?, currentPassword?, newPassword?)
    update: '/users/update',

    // Postman: /api/users/delete (body: userId, password)
    delete: '/users/delete',

    // Backwards-compat aliases used by older UI code
    list: '/users/all',
  },

  tips: {
    create: '/tips/create',
    given: '/tips/given',
    received: '/tips/received',
    all: '/tips/all',
  },

  revenuecat: {
    webhooks: '/revenuecat/webhooks',
  },

  ratings: {
    create: '/ratings/create',
  },

  contents: {
    create: '/contents/create',
    update: '/contents/update',
    detail: '/contents/detail',
    all: '/contents/all',
    delete: '/contents/delete',
  },

  // Existing dashboard endpoints (not present in the provided Postman snippet)
  transactions: {
    list: '/transactions',
    revenueSummary: '/transactions/summary',
  },
  analytics: {
    overview: '/analytics/overview',
  },
}
