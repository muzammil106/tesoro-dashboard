import { Suspense, memo } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PageLoader } from '../components/loaders/PageLoader'
import { AuthLayout } from '../layouts/AuthLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { routePaths } from './routePaths'
import {
  AnalyticsPage,
  LoginPage,
  NotFoundPage,
  CategoryListPage,
  ContentsListPage,
  TransactionsPage,
  TreasureDetailPage,
  TreasureListPage,
  UserDetailPage,
  UsersListPage,
} from './lazyPages'

export const AppRoutes = memo(function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path={routePaths.login} element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<AnalyticsPage />} />
            <Route path={routePaths.treasures} element={<TreasureListPage />} />
            <Route path={routePaths.treasureDetail()} element={<TreasureDetailPage />} />
            <Route path={routePaths.categories} element={<CategoryListPage />} />
            <Route path={routePaths.contents} element={<ContentsListPage />} />
            <Route path={routePaths.users} element={<UsersListPage />} />
            <Route path={routePaths.userDetail()} element={<UserDetailPage />} />
            <Route path={routePaths.transactions} element={<TransactionsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
})
