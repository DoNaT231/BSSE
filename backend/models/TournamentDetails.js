import { max } from "date-fns";

export default class TournamentDetails{
    constructor(
        id,
        event_id,
        organizer_name,
        organizer_email,
        registration_deadline,
        max_teams,
        team_size,
        entry_fee,
        notes,
        created_at,
        updated_at
    ){
        this.id = id;
        this.event_id = event_id;
        this.organizer_name = organizer_name
        this.organizer_email = organizer_email
        this.registration_deadline = registration_deadline
        this.max_teams = max_teams;
        this.team_size = team_size;
        this.entry_fee = entry_fee;
        this.notes = notes;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}