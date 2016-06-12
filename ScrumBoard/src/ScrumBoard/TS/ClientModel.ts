module ClientModel {

    import SEntity = ServerModel.Entity

    export interface IEntity {
        Id: KnockoutObservable<number>;
        ClientId: number;
    }

    export abstract class Entity implements IEntity {
        constructor() {
            Entity.entityDb[this.ClientId.toString()] = this;
        }

        AlbumId = ko.observable<number>();
        CommentListId = ko.observable<number>();
        InsertDate = ko.observable<number>(Date as any);
        UpdateDate = ko.observable<number>(Date as any);

        private static clientIdCounter = 0;
        private static entityDb = {};

        ClientId = Entity.clientIdCounter++;

        protected ServerApi = ServerApi.GetApi(this);

        DeleteOnServer(): JQueryPromise<SEntity> {
            return this.ServerApi.Delete(this.Id()).done(() => { this.removeFromContext(); });
        };

        SaveToServer(): JQueryPromise<SEntity> {
            if (this.Id() === undefined)
                return this.ServerApi.Create(this.ConvertToServerEntity())
                    .done(data => {
                        this.savedStates=[];
                        this.LoadFromServerEntity(data);
                        this.addToContext();
                    });
            return this.ServerApi.Update(this.ConvertToServerEntity())
                .done((data) => {
                    this.savedStates=[];
                    this.LoadFromServerEntity(data);
                });;
        }

        private LoadNavigationProperties(): void {
            for (let propName in this.GetObservableNames()) {
                const prop = <KnockoutObservable<any>>this[propName];
                //if (prop.)
            }
        }

        private addToContext() {
            if (this.Context().indexOf(this) !== -1)
                return;
            this.Context().push(this);
        }

        private removeFromContext() {
            this.Context().remove(this);
        }
        
        LoadFromServerEntity(serverEntity: SEntity): this {
            if (serverEntity.ProcessOnServer === false)
                return this;
            for (let prop of this.GetObservableNames()) {
                const sVal = serverEntity[prop];
                if (sVal !== undefined && sVal !== null) {
                    if (sVal instanceof Array) {
                        for (let obj of sVal) {
                            const entity = Entity.entityDb[obj.ClientId.toString()];
                            if (entity !== undefined)
                                entity.LoadFromServerEntity(obj);
                        }
                    } else {
                        const cVal = this[prop]();
                        if (cVal instanceof Entity)
                            cVal.LoadFromServerEntity(sVal);
                        else
                            this[prop](sVal);
                    }
                }
            }
            return this;
        }

        ConvertToServerEntity(idOnly: boolean = false): SEntity {
            if (idOnly) {
                return { Id: this.Id(), ProcessOnServer: false };
            }
            const isUpdate = this.Id() !== undefined;
            const serverEntity = { ClientId: this.ClientId };
            const entity = this;
            for (let propName of this.GetObservableNames()) {
                const prop = entity[propName];
                const val = prop();
                if (val !== undefined) {
                    if (val instanceof Array) {
                        const arr = new Array();
                        for (let elem of val as Entity[]) {
                            if (elem.Id() === undefined ||
                                isUpdate && prop.UpdateTransferMode === TransferMode.Include ||
                                !isUpdate && prop.AddTransferMode === TransferMode.Include)
                                arr.push(elem.ConvertToServerEntity());
                        }
                        serverEntity[propName] = arr;
                    } else
                        serverEntity[propName] = val instanceof Entity
                            ? (val.Id() === undefined ||
                                isUpdate && prop.UpdateTransferMode === TransferMode.Include ||
                                !isUpdate && prop.AddTransferMode === TransferMode.Include
                                ? val.ConvertToServerEntity()
                                : undefined)
                            : val;
                }
            }
            return serverEntity as any;
        }

        CopyTo(entity: this) {
            entity.Id(this.Id());
        }

        private savedStates=new Array();

        SaveState= (alreadySavedEntities = new Array<Entity>()) => {
            const savedState = new Object();
            if (alreadySavedEntities.indexOf(this) !== -1)
                return;
            alreadySavedEntities.push(this);
            for (let prop of this.GetObservableNames()) {
                let val = ko.unwrap(this[prop]);
                if (val instanceof Array) {
                    val = val.slice(0);
                    for (let elem of val) {
                        if (elem instanceof Entity)
                            elem.SaveState(alreadySavedEntities);
                    }
                } else if (val instanceof Entity)
                    val.SaveState(alreadySavedEntities);
                savedState[prop] = val;
            }
            this.savedStates.push(savedState);
        }

        protected GetObservableNames(): string[] {
            const out = new Array<string>();
            const entity = this;
            for (let prop in entity)
                if (entity.hasOwnProperty(prop))
                    if (ko.isWriteableObservable(entity[prop]) && !entity[prop].Block)
                        out.push(prop);
            return out;
        }

        RevertState = (ignoreError: boolean = false, alreadyRevertedEntities = new Array<Entity>()) => {
            if (alreadyRevertedEntities.indexOf(this) !== -1)
                return;
            alreadyRevertedEntities.push(this);
            if (this.savedStates.length=== 0)
                if (ignoreError)
                    return;
                else
                    throw "No saved state";
            for (let prop of this.GetObservableNames()) {
                const val = this.savedStates[0][prop];
                //this.savedState[prop] = val;
                this[prop](val);
                if (val instanceof Entity)
                    val.RevertState(ignoreError, alreadyRevertedEntities);
                else if (val instanceof Array)
                    for (let elem of val) {
                        if (elem instanceof Entity)
                            elem.RevertState(ignoreError, alreadyRevertedEntities);
                    }
            }
            this.savedStates.shift();
        }

        Id = ko.observable<number>();

        abstract Context(): KnockoutObservableArray<this>;
    }

    export class Person extends Entity {
        LastName = ko.observable<string>();
        FirstName = ko.observable<string>();
        FullName = ko.computed(() => this.FirstName() + " " + this.LastName());

        Context() {
            return mapViewModel.Persons as any;
        }

    }

}