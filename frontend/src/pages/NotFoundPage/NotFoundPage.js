import { Link } from "react-router-dom"
export default function NotFoundPage(){
    return(
        <div>
            <h1>Nincs ilyen oldal :(</h1>
            <Link to='/'>Vissza</Link>
        </div>
    )
}