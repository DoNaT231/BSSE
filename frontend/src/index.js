import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './pages/Home/App.js';
import reportWebVitals from './reportWebVitals';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import NotFoundPage from './pages/NotFoundPage.js';
import AktAndAfsz from './pages/AktAndAfsz.js';
import Booking from './pages/Booking.js';
import SmashSPT from './pages/SmashSPT.js';
import 'leaflet/dist/leaflet.css';
import AdminDashboard from './pages/Admin/AdminDashboard.js';
import { AuthProvider } from './contexts/AuthContext.js';
import TournamentSignupSection from './features/tournamentRegistration/page/TournamentSignupSection';
import Profile from './pages/Profile.js';
import ThursdayChampionshipPage from './pages/ThursdayChampionshipPage.js';
import GalleryPage from './pages/GalleryPage.js';
import PageShell from './components/PageShell.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
const apiUrl = "http://localhost:5000";
const router = createBrowserRouter([
  {
    element: <PageShell />,
    children: [
      {
        path: '/',
        element: <App />,
        errorElement: <NotFoundPage />,
      },
      {
        path: '/adatkezelesitajekoztatoesaszf',
        element: <AktAndAfsz />,
      },
      {
        path: '/palyafoglalas',
        element: <Booking />,
      },
      {
        path: '/versenyek',
        element: <TournamentSignupSection />,
      },
      {
        path: '/csutortoki-bajnoksag',
        element: <ThursdayChampionshipPage />,
      },
      {
        path: '/galeria',
        element: <GalleryPage />,
      },
      {
        path: '/smashspt',
        element: <SmashSPT />,
      },
      {
        path: '/admin',
        element: <AdminDashboard />,
      },
      {
        path: '/profil',
        element: <Profile />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
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
