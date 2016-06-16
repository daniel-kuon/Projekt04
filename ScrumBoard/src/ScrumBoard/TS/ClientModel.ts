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
            this.OnSaving();
            if (this.Id() === undefined)
                return this.ServerApi.Create(this.ConvertToServerEntity())
                    .done(data => {
                        this.savedStates = [];
                        this.LoadFromServerEntity(data);
                        this.addToContext();
                    });
            return this.ServerApi.Update(this.ConvertToServerEntity())
                .done((data) => {
                    this.savedStates = [];
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
            this.OnDeleted();
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
            this.IsDirty = true;
            this.OnSaved();
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
                            if (elem.Id() === undefined)
                                arr.push(elem.ConvertToServerEntity());
                        }
                        serverEntity[propName] = arr;
                    } else {
                        if (val instanceof Entity)
                            serverEntity[propName] = val.Id() === undefined ? val.ConvertToServerEntity() : undefined;
                        else
                            serverEntity[propName] = val;
                    }
                }
            }
            return serverEntity as any;
        }

        CopyTo(entity: this) {
            entity.Id(this.Id());
        }

        private savedStates = new Array();

        SaveState = (alreadySavedEntities = new Array<Entity>()) => {
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
            if (this.savedStates.length === 0)
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

        protected IsDirty = true;

        public OnDeleted(): boolean {
            if (this.Context().indexOf(this) === -1)
                return false;
            this.Context().remove(this);
            return true;
        }
        public OnSaved(): boolean {
            if (!this.IsDirty)
                return false;
            this.IsDirty = false;
            if (this.Context().indexOf(this) === -1)
                this.Context().push(this);
            return true;
        }

        public OnSaving(): boolean {
            return true;
        }
    }

    export class Project extends Entity {
        Name = ko.observable<string>();
        Description = ko.observable<string>();
        Deadline = ko.observable<string>();
        Columns = ko.observableArray<Column>();
        ChatMessages = ko.observableArray<ChatMessage>();

        OrderedColumns = ko.computed(() => this.Columns().sort((c1, c2) => c1.Index() - c2.Index()));

        Context() {
            return mapViewModel.Projects as any;
        }

        public OnDeleted(): boolean {
            if (!super.OnDeleted())
                return false;
            for (let col of this.Columns())
                col.OnDeleted();
            if (mapViewModel.SelectedProject() === this)
                mapViewModel.SelectedProject(undefined);
            return true;
        }
        public OnSaved(): boolean {
            if (!super.OnSaved())
                return false;
            return true;
        }

        GetDummyColum() {
            for (let col of this.Columns()) {
                if (col.IsDummyColumn())
                    return col;
            }
            return undefined;
        }
    }

    export class Column extends Entity {
        Name = ko.observable<string>();
        Description = ko.observable<string>();
        Color = ko.observable<string>();
        Jobs = ko.observableArray<Job>();
        Project = ko.observable<Project>();
        ProjectId = ko.observable<number>();
        IsDummyColumn = ko.observable<boolean>();
        Index = ko.observable<number>();


        Context() {
            return mapViewModel.Columns as any;
        }

        public OnDeleted(): boolean {
            if (!super.OnDeleted())
                return false;
            this.Project().Columns.remove(this);
            for (let job of this.Jobs())
                job.OnDeleted();
            return true;
        }
        public OnSaved(): boolean {
            if (!super.OnSaved())
                return false;
            if (this.Project() === undefined)
                this.Project(mapViewModel.GetProjectById(this.ProjectId()));
            if (this.Project() !== undefined && this.Project().Columns().indexOf(this) === -1)
                this.Project().Columns.push(this);
            return true;
        }

        public OnSaving(): boolean {
            this.ProjectId(this.Project().Id());
            return false;
        }

    }

    export class Job extends Entity {
        Name = ko.observable<string>();
        Description = ko.observable<string>();
        Column = ko.observable<Column>();
        ColumnId = ko.observable<number>();
        Categories = ko.observableArray<Category>();

        Context() {
            return mapViewModel.Jobs as any;
        }

        public OnDeleted(): boolean {
            if (!super.OnDeleted())
                return false;
            this.Column().Jobs.remove(this);
            return true;
        }
        public OnSaved(): boolean {
            if (!super.OnSaved())
                return false;
            if (this.Column() === undefined) {
                this.Column(mapViewModel.GetColumnById(this.ColumnId()));
            } else if (this.Column().Id() !== this.ColumnId()) {
                this.Column().Jobs.remove(this);
                this.Column(mapViewModel.GetColumnById(this.ColumnId()));
            }
            if (this.Column() !== undefined && this.Column().Jobs.indexOf(this) === -1)
                this.Column().Jobs.push(this);
            return true;
        }

        public OnSaving(): boolean {
            if (this.Column().Id() !== this.ColumnId()) {
                //if (this.ColumnId() !== undefined)
                //    mapViewModel.GetColumnById(this.ColumnId()).Jobs.remove(this);
                this.ColumnId(this.Column().Id());
            }
            return false;
        }


        ConvertToServerEntity(idOnly: boolean = false): SEntity {
            const serverEntity = super.ConvertToServerEntity(idOnly);
            serverEntity["Categories"] = new Array<Category>();
            for (let cat of this.Categories())
                serverEntity["Categories"].push(cat.ConvertToServerEntity());
            return serverEntity as any;
        }
    }

    export class Category extends Entity {
        Name = ko.observable<string>();
        Color = ko.observable<string>();

        Context() {
            return mapViewModel.Categories as any;
        }

        public OnDeleted(): boolean {
            if (!super.OnDeleted())
                return false;
            return true;
        }
        public OnSaved(): boolean {
            if (!super.OnSaved())
                return false;
            return true;
        }
    }

    export class ChatMessage extends Entity {

        Message = ko.observable<string>();
        Project = ko.observable<Project>();
        ProjectId = ko.observable<number>();
        Name = ko.observable<string>();

        Context(): KnockoutObservableArray<this> {
            return <any>mapViewModel.ChatMessages;
        }



        OnSaved(): boolean {
            super.OnSaved();
            if (this.Project() === undefined || this.Project().Id() !== this.ProjectId()) {
                this.Project(mapViewModel.GetProjectById(this.ProjectId()));
            }
            if (this.Project() !== undefined && this.Project().ChatMessages.indexOf(this) === -1)
                this.Project().ChatMessages.push(this);
            return false;
        }

        OnSaving(): boolean {
            this.Project(mapViewModel.SelectedProject());
            this.ProjectId(this.Project().Id());
            return true;
        }
    }

}