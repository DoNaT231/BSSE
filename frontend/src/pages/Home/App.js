import './App.css';
import Header from '../../components/Header.js';
import InfiniteGallery from '../../components/InfiniteGallery.js';
import WaveDivider from '../../components/WaveDevider.js';
import { Link } from 'react-router-dom';
import LocationMap from '../../components/Map.js';
import WeeklyTimeGrid from "../../components/WeeklyTimeGrid";
import { useEffect } from 'react';
import { useAuth } from '../../AuthContext.js';
import { useNavigate } from 'react-router-dom';

function App(isLogged) {
   const navigate = useNavigate();
  const { isAdmin, loggedIn , logout} = useAuth();


  return (
    <div className="App">
      <Header/>
      <section className='landing-page'>
        <div>
          <h1>BSSE</h1>
          <Link to='/palyafoglalas'><button onClick={()=>navigate('/palyafoglalas')}>Pálya foglalás</button></Link>
        </div>
      </section>
      <WaveDivider/>
      <section className='about-us'>
        <h1>Üdvözlünk a Balatoni Strandsport Egyesület (BSSE) hivatalos oldalán! </h1>
          <h2>Egyesületünk célja, hogy a strandsportok szerelmeseinek minőségi, közösségi és élménydús sportolási lehetőséget biztosítsunk a Balaton partján.</h2> 
        <div className='text-container'>
          <div className='text-container-halfs'>
            <p>A BSSE 2025-ben alakult lelkes sportkedvelők kezdeményezésére, azzal a vízióval, hogy a nyári szezonban rendszeres sportprogramokat, bajnokságokat és barátságos mérkőzéseket szervezzünk Balatonalmádiban. Pályáink közvetlenül a strand mellett helyezkednek el, így a játék élménye összefonódik a balatoni nyár hangulatával.</p>
          </div>
          <div className='text-container-halfs'>
            <p>Legyen szó hobbi-, vagy versenysportról, nálunk mindenki megtalálhatja a helyét – a pályáink online ingyenesen foglalhatók, így könnyedén biztosíthatod a helyed barátaiddal vagy csapatoddal. Gyere, és sportolj velünk – élvezd a nyarat, a homokot és a csapatjáték örömét!</p>
          </div>
        </div>
      </section>
      <section className='gallery'>
        <InfiniteGallery/>
      </section>
      <section className='calendar-section'>
        <h1>Pályafoglalás</h1>
        <WeeklyTimeGrid />
      </section>
      <section class="sponsor-section">
        <h2>Szponzorációs lehetőségek a BSSE-nél</h2>
        <p class="intro">
          A Balatoni Strandsport Egyesület várja azon partnerek jelentkezését, akik szeretnének jelen lenni a Balaton északi partjának egyik leglátogatottabb strandján. Legyen szó helyi vállalkozásról vagy országos márkáról, nálunk lehetőség van valódi közösségépítő jelenlétre.
        </p>

        <div class="sponsor-cards">
          <div class="sponsor-card">
            <h3>🎤 Bemondásos hirdetés</h3>
            <p>A versenyek alatt rendszeres hangosbemondásokkal hívjuk fel a figyelmet partnereinkre, promóciós üzenetekkel és márkamegjelöléssel.</p>
          </div>
          <div class="sponsor-card">
            <h3>🏆 Névadási lehetőség</h3>
            <p>Legyen egy eseményünk, vagy akár maga az egyesület a Te márkád nevét viselő projekt – erősítsd megítélésedet és ismertségedet hosszú távon!</p>
          </div>
          <div class="sponsor-card">
            <h3>📢 Hirdetési felület</h3>
            <p>Roll-up, molinó, beachflag – kiemelt, vizuálisan jól látható helyeken jelenhetsz meg sporteseményeinken és szociális média felületeinken.</p>
          </div>
          <div class="sponsor-card">
            <h3>🌊 Megjelenés a strandon</h3>
            <p>A Balatonalmádi Wesselényi strand az északi part egyik leglátogatottabb pontja. Szponzoraink számára célzott és figyelemfelkeltő helyszíni jelenlétet biztosítunk.</p>
          </div>
        </div>

        <div class="sponsor-contact">
          <h4>Érdekel a lehetőség?</h4>
          <p>📧 <a href="mailto:almadistrandroplabda@gmail.com?subject=Tárgy&body=Szöveg">almadistrandroplabda@gmail.com</a></p>
          <p>📞 +36 70 280 3145</p>
          <p>Szívesen egyeztetünk személyesen vagy e-mailben – kérj ajánlatot még ma!</p>
        </div>
      </section>
      <footer>
        <div className='footer-info'>
          <div className='footer-info-upper'>
            <div className='footer-info-provider'>
            <h2>A weboldal üzemeltetője:</h2>
            <ul>
                <li>Szolgáltató neve: Bognár Balázs</li>
                <li>Székhely: 8220, Balatonalmádi, Szilva köz 3 1/1</li>
                <li>E-mail: almadistrandroplabda@gmail.com</li>
                <li>Telefonszám: +36 70 280 3145</li>
            </ul>
          </div>
          <div className='footer-info-docs'>
            <h2>Dokumentumok</h2>
            <Link to="/adatkezelesitajekoztatoesaszf">Adatkezelési Tájékoztató és ASZF</Link>
            <Link to="/smashspt">Smash pályahasználati tájékoztató</Link>
          </div>
          </div>
          <div className='footer-info-lower'>
            <p>A weboldalon keresztül elérhető pályafoglalási szolgáltatás magánszemélyként ingyenesen használható, kereskedelmi tevékenységet nem szolgál, ha cég szeretne foglalni, kérjük érdeklődjön az <a href='https://balatonalmadi.hu/kapcsolat/elerhetoseg'>önkormányzatnál</a>!</p>
            <p>A weboldal jelenleg magánszemély által működtetett, a Balatoni Strandsport Egyesület megalakulását követően az üzemeltetési jogokat átadjuk az egyesületnek, amelyről az impresszum frissítésével tájékoztatjuk a felhasználókat.</p>
          </div>
        </div>
        <div className='map-container'>
          <LocationMap/>
        </div>
      </footer>
    </div>
  );
}

export default App;
