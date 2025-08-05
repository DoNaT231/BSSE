import Header from "../../components/Header"
import { Link } from "react-router-dom"
import './AktAndAfsz.css'
export default function AktAndAfsz(){
    return(
        <div>
            <Header/>
            <div className="documents">
            <h1>Adatkezelési Tájékoztató – BSSE Weboldal</h1>
            <p>A regisztráció során az alábbi adatokat kérjük el Öntől:</p>
            <ul>
                <li>Felhasználónév</li>
                <li>E-mail cím</li>
                <li>Jelszó (titkosított formában kerül tárolásra)</li>
            </ul>
            <h2>Mire használjuk az adatokat?</h2>
            <ul>
                <li>E-mail cím: kizárólag arra használjuk, hogy visszaigazolást küldjünk a foglalás sikerességéről, valamint – opcionálisan – pályahasználati értesítőt is kaphat, ha ezt Ön külön kéri.</li>
                <li>Jelszó: biztonságos, hashelt (visszafejthetetlen) formában tároljuk, azt semmilyen körülmények között nem osztjuk meg.</li>
                <li>Felhasználónév: azonosítás céljára használjuk a foglalási rendszerben.</li>
            </ul>
            <h2>Mit nem csinálunk?</h2>
            <ul>
                <li>Nem küldünk hírlevelet vagy reklámot.</li>
                <li>Nem adjuk el vagy adjuk tovább harmadik félnek az Ön adatait.</li>
                <li>Nem kérünk több adatot, mint ami feltétlenül szükséges a foglalási rendszer működéséhez.</li>
            </ul>
            <h2>Adatmegőrzés</h2>
            <p>Az adatokat kizárólag a szolgáltatás működtetéséhez szükséges ideig tároljuk. Ön bármikor kérheti a fiókja és adatai törlését.</p>
            <h2>Kapcsolat</h2>
            <p>Ha kérdése van, vegye fel velünk a kapcsolatot az alábbi e-mail címen: almadistrandroplabda@gmail.com</p>
            <h1>Általános Felhasználási Szabályzat (ÁSZF) – BSSE Weboldal</h1>
            <h2>Szolgáltató adatai</h2>
            <ul>
                <li>Szolgáltató neve: Bognár Balázs</li>
                <li>Székhely: 8220, Balatonalmádi, Szilva köz 3 1/1</li>
                <li>E-mail: almadistrandroplabda@gmail.com</li>
                <li>Weboldal: https://balatonsse.hu</li>
            </ul>
            <p>A weboldalon keresztül elérhető pályafoglalási szolgáltatás ingyenesen használható, kereskedelmi tevékenységet nem szolgál.</p>
            <p>A weboldal jelenleg magánszemély által működtetett, a Balatoni Strandsport Egyesület megalakulását követően az üzemeltetési jogokat átadjuk az egyesületnek, amelyről az impresszum frissítésével tájékoztatjuk a felhasználókat.</p>
            <h2>A Szolgáltatás leírása</h2>
            <p>A weboldalon keresztül a felhasználók strandröplabda pályára tudnak időpontot foglalni. A foglalás során a rendszer regisztrációt igényel, mely során e-mail cím, felhasználónév és jelszó megadása szükséges.</p>
            <h2>Regisztráció és felhasználói fiók</h2>
            <ul>
                <li>A regisztrációval a felhasználó elfogadja az ÁSZF-et és az adatkezelési tájékoztatót.</li>
                <li>A megadott adatok valódiságáért a felhasználó felel.</li>
                <li>A jelszavakat biztonságosan, hashelt formában tároljuk.</li>
            </ul>
            <h2>Foglalási feltételek</h2>
            <ul>
                <li>A foglalás csak érvényes e-mail cím megadása után lehetséges.</li>
                <li>Minden sikeres foglalásról a rendszer visszaigazoló e-mailt küld.</li>
                <li>A pálya használata a megadott időpontban lehetséges. Késés esetén a foglalás érvényét vesztheti.</li>
            </ul>
            <h2>Felhasználói kötelezettségek</h2>
            <ul>
                <li>A foglalást csak rendeltetésszerű célra lehet használni.</li>
                <li>Tilos mások nevében foglalni vagy visszaélni a rendszer hibáival.</li>
                <li>A pályát kulturáltan, rendeltetésszerűen kell használni.</li>
            </ul>
            <h2>A szolgáltatás módosítása</h2>
            <p>A szolgáltató fenntartja a jogot arra, hogy a szolgáltatás feltételeit bármikor módosítsa. A módosításokat a felhasználók a weboldalon keresztül megismerhetik.</p>
            <h2>Felelősség korlátozása</h2>
            <p>A szolgáltató nem vállal felelősséget:</p>
            <ul>
                <li>technikai problémákért, rendszerleállásért;</li>
                <li>a felhasználók által megadott hibás adatokból eredő következményekért;</li>
                <li>harmadik fél által okozott károkért.</li>
            </ul>
            <h2>Kapcsolatfelvétel</h2>
            <p>Bármilyen kérdés vagy probléma esetén az alábbi elérhetőségen veheted fel velünk a kapcsolatot: almadistrandroplabda@gmail.com</p>
        </div>
        </div>
    )
}