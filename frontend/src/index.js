import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/Home/App.js';
import reportWebVitals from './reportWebVitals';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.js';
import AktAndAfsz from './pages/AktAndAfsz/AktAndAfsz.js';
import Booking from './pages/Booking/Booking.js';
import SmashSPT from './pages/AktAndAfsz/SmashSPT.js';
import 'leaflet/dist/leaflet.css';
import AdminDashboard from './pages/Admin/AdminDashboard.js';
import { AuthProvider } from './AuthContext.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
const apiUrl = "http://localhost:5000";
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage/>
  },
  {
    path: '/adatkezelesitajekoztatoesaszf',
    element: <AktAndAfsz/>
  },
  {
    path: '/foglalas',
    element: <Booking/>
  },
  {
    path: '/smashspt',
    element: <SmashSPT/>
  },
  {
    path: '/admin',
    element: <AdminDashboard/>
  }
]);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
