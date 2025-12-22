import { lazy } from 'react'

export const AnalyticsPage = lazy(() => import('../pages/Analytics/AnalyticsPage'))
export const TreasureListPage = lazy(
  () => import('../pages/Treasures/TreasureListPage'),
)
export const TreasureDetailPage = lazy(
  () => import('../pages/Treasures/TreasureDetailPage'),
)
export const UsersListPage = lazy(() => import('../pages/Users/UsersListPage'))
export const UserDetailPage = lazy(() => import('../pages/Users/UserDetailPage'))
export const CategoryListPage = lazy(() => import('../pages/Categories/CategoryListPage'))
export const ContentsListPage = lazy(() => import('../pages/Contents/ContentsListPage'))
export const TransactionsPage = lazy(() => import('../pages/Transactions/TransactionsPage'))
export const LoginPage = lazy(() => import('../pages/Auth/LoginPage'))
export const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
