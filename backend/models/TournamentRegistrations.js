export default class TournamentRegistrations {
    constructor(id, tournament_id, email, tel_number, players, created_at){
        this.id = id;
        this.tournament_id = tournament_id;
        this.email = email;
        this.tel_number = tel_number;
        this.players = players;
        this.created_at = created_at;
    }
}