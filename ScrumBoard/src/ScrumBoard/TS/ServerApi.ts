﻿import Entity = ServerModel.Entity;

enum HttpMethod {
    POST,
    GET,
    PUT,
    DELETE
}




class ContextApi {

    constructor(public baseUrl: string) {

    }

    protected Ticks="0";

    Get(): JQueryPromise<ServerModel.Context> {
        return ServerApi.CreateRequest(ServerApi.BuildRequestBody(this.baseUrl, HttpMethod.GET))
            .done((data, textStatus, xhr: JQueryXHR) => this.Ticks = xhr.getResponseHeader("Ticks"));
    }

    GetUpdate(): JQueryPromise<ServerModel.Context> {
        return ServerApi.CreateRequest(ServerApi.BuildRequestBody(this.baseUrl + "/since/" + this.Ticks, HttpMethod.GET))
            .done((data, textStatus, xhr: JQueryXHR) => this.Ticks = xhr.getResponseHeader("Ticks"));
    }

}

class CategoryJobApi {

    constructor(public baseUrl: string) {

    }

    Get(): JQueryPromise<ServerModel.CategoryJob[]> {
        this.Get().done();
        return ServerApi.CreateRequest(ServerApi.BuildRequestBody(this.baseUrl, HttpMethod.GET));
    }

}

class ServerApi {
    private static conntectionCount = ko.observable(0);

    private static connectionOpen = ko.computed(() => {
        return ServerApi.conntectionCount() > 0;
    });

    constructor(public baseUrl: string) {

    }

    static BuildRequestBody(url: string, method: HttpMethod, data?: any): JQueryAjaxSettings {
        return {
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            method: HttpMethod[method],
            url: url,
            data: JSON.stringify(data)
        };
    }

    Get(): JQueryPromise<Entity[]>;
    Get(id: number): JQueryPromise<Entity>;
    Get(id?: number): any {
        if (id === undefined)
            return ServerApi.CreateRequest<ClientModel.Entity[]>((ServerApi.BuildRequestBody(this.baseUrl, HttpMethod.GET)));
        else
            return ServerApi.CreateRequest<Entity>((ServerApi
                .BuildRequestBody(this.baseUrl + "/" + id.toString(), HttpMethod.GET)))
                .done((data, textStatus, xhr: JQueryXHR) => this.Ticks = xhr.getResponseHeader("Ticks"));;
    }

    GetUpdate(): JQueryPromise<Entity[]> {
        return ServerApi.CreateRequest<Entity[]>((ServerApi
            .BuildRequestBody(this.baseUrl + "/since/" + this.Ticks, HttpMethod.GET)))
            .done((data, textStatus, xhr: JQueryXHR) => this.Ticks = xhr.getResponseHeader("Ticks"));
    }

    Delete(id: number): JQueryPromise<ServerModel.Entity> {
        return ServerApi.CreateRequest<ServerModel.Entity>((ServerApi
            .BuildRequestBody(this.baseUrl + "/" + id.toString(), HttpMethod.DELETE)));
    }

    Create(entity: Entity): JQueryPromise<Entity> {
        return ServerApi.CreateRequest<Entity>((ServerApi.BuildRequestBody(this.baseUrl, HttpMethod.POST, entity)));
    }

    Update(entity: Entity): JQueryPromise<Entity> {
        return ServerApi.CreateRequest<Entity>(ServerApi
            .BuildRequestBody(this.baseUrl + "/" + entity.Id.toString(), HttpMethod.PUT, entity));
    }

    static CreateRequest<T>(body: JQueryAjaxSettings): JQueryPromise<T> {
        ServerApi.conntectionCount(ServerApi.conntectionCount() + 1);
        return $.ajax(body)
            .fail(d => {
                //alert(d);
                alert("Es gab ein Fehler beim Verarbeiten der Daten auf dem Server. Bitte überprüfe deine Eingaben und versuche er erneut.");
                console.log(d);
            })
            .always(() => {
                ServerApi.conntectionCount(ServerApi.conntectionCount() - 1);
            });
    }

    protected Ticks = "0";

    static Context = new ContextApi("/api/context");

    static Projects = new ServerApi("/api/Projects");
    static Jobs = new ServerApi("/api/Jobs");
    static Categories = new ServerApi("/api/Categories");
    static CategoryJobs = new CategoryJobApi("/api/CategoryJobs");
    static Columns = new ServerApi("/api/Columns");
    static ChatMessages = new ServerApi("/api/chat");

    static GetApi(type: ClientModel.Entity): ServerApi {
        if (type instanceof ClientModel.Project)
            return ServerApi.Projects;
        if (type instanceof ClientModel.Job)
            return ServerApi.Jobs;
        if (type instanceof ClientModel.Category)
            return ServerApi.Categories;
        if (type instanceof ClientModel.Column)
            return ServerApi.Columns;
        if (type instanceof ClientModel.ChatMessage)
            return ServerApi.ChatMessages;
        throw ("No suitable Api found");
    }
}