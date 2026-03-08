export default class TournamentRegistration {
  constructor(
    id,
    tournament_id,
    user_id,
    team_name,
    players,
    tel_number,
    contact_email,
    registration_status,
    created_at
  ) {
    this.id = id;
    this.tournament_id = tournament_id;
    this.user_id = user_id;
    this.team_name = team_name;
    this.players = players;
    this.tel_number = tel_number;
    this.contact_email = contact_email;
    this.registration_status = registration_status;
    this.created_at = created_at;
  }
}