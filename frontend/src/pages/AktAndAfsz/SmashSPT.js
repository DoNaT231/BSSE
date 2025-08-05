import Header from "../../components/Header"
import { Link } from "react-router-dom"
import './SmashSPT.css'
export default function AktAndAfsz(){
    return(
        <div>
            <Header/>
            <div class="container">
                <h1>SMASH STRANDRÖPLABDA – PÁLYAHASZNÁLATI TÁJÉKOZTATÓ</h1>
                <h2>Wesselényi Strand – Strandröplabda pályák</h2>
                <p>Üdvözlünk a Wesselényi strand röplabda pályáin! Örülünk, hogy nálunk sportolsz! Kérjük, olvasd el az alábbi házirendet, hogy mindenki biztonságban és jól érezze magát.</p>

                <h3>🏐 Házirend</h3>
                
                <h4>Szabadon használható</h4>
                <ul>
                <li>A pálya előzetes engedély nélkül is igénybe vehető.</li>
                <li>Kérünk, légy tekintettel másokra, és oszd meg a játékidőt, ha többen érkeztek.</li>
                </ul>

                <h4>Elsőbbség a foglalásnak</h4>
                <ul>
                <li>Amennyiben valamelyik idősávra ingyenes pályabérlés van bejegyezve, a pályát az adott időszakra át kell adni a foglaló félnek.</li>
                <li>Foglalni két pályára van lehetőség: <strong>Meló-Diák</strong> és <strong>Szomszédok</strong>. A <strong>Man at Work</strong> pálya mindig szabadon használható.</li>
                <li>Foglalás elérhető: 👉 <a href="https://balatonsse.hu/palyafoglalas" target="_blank">https://balatonsse.hu/palyafoglalas</a></li>
                <li>A foglalások a strand jegypénztáránál is megtekinthetők.</li>
                <li>A foglalásra mindig előző nap 18:00-ig van lehetőség.</li>
                </ul>

                <h4>A felszerelés védelme</h4>
                <ul>
                <li>A háló rángatása, az oszlopok döntögetése és a homokágy rongálása tilos.</li>
                <li>Ha hibát észlelsz, jelezd a strand személyzetének!</li>
                </ul>

                <h4>Dohányzásmentes övezet</h4>
                <ul>
                <li>A pályák területén dohányozni tilos!</li>
                </ul>

                <h4>Tisztaság és biztonság</h4>
                <ul>
                <li>Kérjük, a szemetet a kijelölt kukákba dobd!</li>
                <li>Üvegtárgyak és éles eszközök használata a homokon tilos, balesetveszély miatt.</li>
                </ul>

                <h4>Pályakarbantartás</h4>
                <ul>
                <li>Ha a nap végén lehúzod a pályát (gereblyével elegyengeted a homokot), vendégünk vagy egy következő játékra! 😊</li>
                </ul>

                <h4>Elsősegély és vészhelyzet</h4>
                <ul>
                <li>19:00-ig fordulj a strand elsősegélyszobájához.</li>
                <li>19:00 után vagy súlyosabb esetben hívd a <strong>112</strong>-t.</li>
                </ul>

                <h4>Felelősség</h4>
                <ul>
                <li>A pálya használata saját felelősségre történik.</li>
                <li>A szervezőket és üzemeltetőt nem terheli felelősség sem személyi sérülésért, sem elveszett tárgyakért.</li>
                </ul>

                <h4>Üzemeltetés</h4>
                <p>A pályák működtetésére és bárminemű változtatásra kizárólag a <strong>Balatonalmádi strandüzemeltetés</strong> jogosult.</p>

                <p class="footer">Kellemes sportolást kívánunk!</p>
            </div>
        </div>
    )
}