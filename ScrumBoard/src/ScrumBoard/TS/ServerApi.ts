import Entity = ServerModel.Entity;
import WaypointConnection = ServerModel.WaypointConnection;
import WaypointTack = ServerModel.WaypointTack;
import AlbumImage = ServerModel.AlbumImage;

enum HttpMethod {
    POST,
    GET,
    PUT,
    DELETE
}



class ContextApi {

    constructor(public baseUrl: string) {

    }

    Get(): JQueryPromise<ServerModel.Context> {
        return ServerApi.CreateRequest(ServerApi.BuildRequestBody(this.baseUrl, HttpMethod.GET));
    }

}

class AlbumImageApi {

    constructor(public baseUrl: string) {

    }

    Get(): JQueryPromise<AlbumImage[]> {
        return ServerApi.CreateRequest(ServerApi.BuildRequestBody(this.baseUrl, HttpMethod.GET));
    }

}

class CrewApi {

    constructor(public baseUrl: string) {

    }

    Get(): JQueryPromise<ServerModel.Crew[]> {
        return ServerApi.CreateRequest(ServerApi.BuildRequestBody(this.baseUrl, HttpMethod.GET));
    }

}

abstract class ConnectionApi<T> {

    Get(): JQueryPromise<T[]> {
        return ServerApi.CreateRequest<T[]>(ServerApi.BuildRequestBody("", HttpMethod.GET));
    }

    Connect(id1: number, id2: number): JQueryPromise<T> {
        return ServerApi.CreateRequest<T>(ServerApi.BuildRequestBody(id1 + "/" + id2, HttpMethod.POST));
    }

    Disconnect(id1: number, id2: number): JQueryPromise<T> {
        return ServerApi.CreateRequest<T>(ServerApi.BuildRequestBody(id1 + "/" + id2, HttpMethod.DELETE));
    }

    constructor(public baseUrl: string) {

    }

}

class WaypointConnectionApi {

    Get(): JQueryPromise<WaypointConnection[]> {
        return ServerApi.CreateRequest<WaypointConnection[]>(ServerApi.BuildRequestBody(this.baseUrl, HttpMethod.GET));
    }

    Connect(id1: number, id2: number): JQueryPromise<WaypointConnection> {
        return ServerApi.CreateRequest<WaypointConnection>(ServerApi.BuildRequestBody(this.baseUrl + "/" + id1 + "/" + id2, HttpMethod.POST));
    }
    Disconnect(id: number): JQueryPromise<WaypointConnection>;
    Disconnect(id1: number, id2: number): JQueryPromise<WaypointConnection>;
    Disconnect(id1: number, id2?: number): JQueryPromise<WaypointConnection> {
        if (id2 !== undefined)
            return ServerApi.CreateRequest<WaypointConnection>(ServerApi.BuildRequestBody(this.baseUrl + "/" + id1 + "/" + id2, HttpMethod.DELETE));
        return ServerApi.CreateRequest<WaypointConnection>(ServerApi.BuildRequestBody(this.baseUrl + "/" + id1.toString(), HttpMethod.DELETE));
    }

    constructor(public baseUrl: string) {

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
            return ServerApi.CreateRequest<Entity[]>((ServerApi.BuildRequestBody(this.baseUrl, HttpMethod.GET)));
        else
            return ServerApi.CreateRequest<Entity>((ServerApi.BuildRequestBody(this.baseUrl + "/" + id.toString(), HttpMethod.GET)));
    }

    Delete(id: number): JQueryPromise<Entity> {
        return ServerApi.CreateRequest<Entity>((ServerApi.BuildRequestBody(this.baseUrl + "/" + id.toString(), HttpMethod.DELETE)));
    }

    Create(entity: Entity): JQueryPromise<Entity> {
        return ServerApi.CreateRequest<Entity>((ServerApi.BuildRequestBody(this.baseUrl, HttpMethod.POST, entity)));
    }

    Update(entity: Entity): JQueryPromise<Entity> {
        return ServerApi.CreateRequest<Entity>(ServerApi.BuildRequestBody(this.baseUrl + "/" + entity.Id.toString(), HttpMethod.PUT, entity));
    }

    static CreateRequest<T>(body: JQueryAjaxSettings): JQueryPromise<T> {
        ServerApi.conntectionCount(ServerApi.conntectionCount() + 1);
        return $.ajax(body).fail(d => {
            //alert(d);
            alert("Es gab ein Fehler beim Verarbeiten der Daten auf dem Server. Bitte überprüfe deine Eingaben und versuche er erneut.");
            console.log(d);
        }).always(() => {
            ServerApi.conntectionCount(ServerApi.conntectionCount() - 1);
        });
    }

    static Context=new ContextApi("/api/context");

    static Projects = new ServerApi("/api/Projects");

    static GetApi(type: ClientModel.Entity): ServerApi {
        if (type instanceof ClientModel.Project)
            return ServerApi.Projects;
        throw ("No suitable Api found");
    }
}