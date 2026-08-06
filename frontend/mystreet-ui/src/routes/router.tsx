import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AdminRoute } from './AdminRoute'
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
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { AdminProductsPage } from '../pages/AdminProductsPage'
import { AdminProductCreatePage } from '../pages/AdminProductCreatePage'
import { AdminProductEditPage } from '../pages/AdminProductEditPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <HomePage />
        ),
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
        element: <ProductsPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailsPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'checkout',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <CheckoutPage />,
          },
        ],
      },
      {
        path: 'orders',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <MyOrdersPage />,
          },
        ],
      },
      {
        path: 'orders/:id',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <OrderDetailsPage />,
          },
        ],
      },
      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: (
              <PlaceholderPage
                title="Admin"
                description="Administrative workflows will be grouped under this route."
              />
            ),
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
    ],
  },
])