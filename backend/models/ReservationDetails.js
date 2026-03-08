export default class ReservationDetails {
  constructor(
    id,
    event_id,
    user_id,
    guest_name,
    guest_email,
    guest_phone,
    approval_status,
    notes,
    created_at,
    updated_at
  ) {
    this.id = id;
    this.event_id = event_id;
    this.user_id = user_id;
    this.guest_name = guest_name;
    this.guest_email = guest_email;
    this.guest_phone = guest_phone;
    this.approval_status = approval_status;
    this.notes = notes;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}