export default class Event {
  constructor(
    id,
    type,
    title,
    description,
    status,
    visibility,
    created_by_user_id,
    created_at,
    updated_at
  ) {
    this.id = id;
    this.type = type;
    this.title = title;
    this.description = description;
    this.status = status;
    this.visibility = visibility;
    this.created_by_user_id = created_by_user_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}