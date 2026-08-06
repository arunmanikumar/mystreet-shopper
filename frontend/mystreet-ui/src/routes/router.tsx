import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../layouts/AppLayout'
import { AdminRoute } from './AdminRoute'
import { HomePage } from '../pages/HomePage'
import { LoginPage } from '../pages/LoginPage'
import { ProductDetailsPage } from '../pages/ProductDetailsPage'
import { ProductsPage } from '../pages/ProductsPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ProtectedRoute } from './ProtectedRoute'
import { RegisterPage } from '../pages/RegisterPage'
import { UnauthorizedPage } from '../pages/UnauthorizedPage'

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
        element: (
          <PlaceholderPage
            title="Cart"
            description="Cart management will live here once product selection and quantity state are wired in."
          />
        ),
      },
      {
        path: 'checkout',
        element: (
          <PlaceholderPage
            title="Checkout"
            description="Checkout forms and order submission will be added here in a later pass."
          />
        ),
      },
      {
        path: 'orders',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: (
              <PlaceholderPage
                title="Orders"
                description="Order history and tracking screens will be added here once order APIs are available."
              />
            ),
          },
        ],
      },
      {
        path: 'orders/:id',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: (
              <PlaceholderPage
                title="Order Details"
                description="This route will render the details for a single order when that feature is implemented."
              />
            ),
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
            element: (
              <PlaceholderPage
                title="Admin Products"
                description="Product management tools will be added here for administrative users."
              />
            ),
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