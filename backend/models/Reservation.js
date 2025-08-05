export default class Reservation {
  constructor(id, user_id, user_name, user_email, court_id, start_time, status, reservation_date) {
    this.id = id;
    this.user_id = user_id;
    this.user_name = user_name;
    this.user_email = user_email;
    this.court_id = court_id;
    this.start_time = start_time;
    this.status = status;
    this.reservation_date = reservation_date;
  }
}
