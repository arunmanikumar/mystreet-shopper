import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AdminRoute } from './AdminRoute'
import { CustomerRoute } from './CustomerRoute'
import { CartPage } from '../pages/CartPage'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { ProductsPage } from '../pages/ProductsPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RegisterPage } from '../pages/RegisterPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { MyOrdersPage } from '../pages/MyOrdersPage'
import { OrderDetailsPage } from '../pages/OrderDetailsPage'
import { AdminProductsPage } from '../pages/AdminProductsPage'
import { AdminProductCreatePage } from '../pages/AdminProductCreatePage'
import { AdminProductEditPage } from '../pages/AdminProductEditPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { Navigate } from 'react-router-dom'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        element: (
          <CustomerRoute />
        ),
        children: [
          {
            index: true,
            element: <HomePage />,
          },
        ],
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'products',
        element: <CustomerRoute />,
        children: [
          {
            index: true,
            element: <ProductsPage />,
          },
        ],
      },
      {
        path: 'products/:id',
        element: <CustomerRoute />,
        children: [
          {
            index: true,
            element: <ProductDetailsPage />,
          },
        ],
      },
      {
        path: 'cart',
        element: <CustomerRoute />,
        children: [
          {
            index: true,
            element: <CartPage />,
          },
        ],
      },
      {
        path: 'checkout',
        element: <CustomerRoute />,
        children: [
          {
            element: <ProtectedRoute />,
            children: [
              {
                index: true,
                element: <CheckoutPage />,
              },
            ],
          },
        ],
      },
      {
        path: 'orders',
        element: <CustomerRoute />,
        children: [
          {
            element: <ProtectedRoute />,
            children: [
              {
                index: true,
                element: <MyOrdersPage />,
              },
            ],
          },
        ],
      },
      {
        path: 'orders/:id',
        element: <CustomerRoute />,
        children: [
          {
            element: <ProtectedRoute />,
            children: [
              {
                index: true,
                element: <OrderDetailsPage />,
              },
            ],
          },
        ],
      },
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: <Navigate to="/admin/products" replace />,
          },
        ],
      },
      {
        path: 'admin/products',
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: <AdminProductsPage />,
          },
          {
            path: 'new',
            element: <AdminProductCreatePage />,
          },
          {
            path: ':id/edit',
            element: <AdminProductEditPage />,
          },
        ],
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])