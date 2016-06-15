/// <reference path="../typings/globals/knockout/index.d.ts" />
class DbSet<T extends Entity> {
    constructor() { }

    private observable = ko.observableArray<T>();
    Observable = () => this.observable();

    Attach(entity: T): void {
        this.observable.push(entity);
    }

    Dettach(entity: T): void {
        this.observable.remove(entity);
    }
}