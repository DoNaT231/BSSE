export default class Tournaments {
    constructor(id, title, description, category, start_at, status, created_by, created_at){
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.start_at = start_at;
        this.status = status;
        this.created_by = created_by;
        this.created_at = created_at;
    }
}