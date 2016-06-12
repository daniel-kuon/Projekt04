﻿var ctrlPressed = false;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    $("body").addClass("mobile");
}

interface JQuery {
    parsley: any; // Expand this bad boy later
}

function renderTime(duration: number);
function renderTime(startDate: Date, endDate: Date);
function renderTime(startDate: Date | number, endDate?: Date) {
    if (startDate instanceof Date)
        return renderTime(endDate.getTime() - startDate.getTime());
    const duration = <number>startDate;
    var time = Math.floor(duration / 60000);
    var mins = (time % 60).toString();
    if (mins.length === 1)
        mins = "0" + mins;
    time = Math.floor(time / 60);
    return time.toString() + ":" + mins;
}

function removeFromArray<T>(arr: T[], obj: T): boolean {
    const tmpArr = new Array<T>();
    for (let item of arr) {
        if (item !== obj)
            tmpArr.push(item);
    }
    if (tmpArr.length === arr.length)
        return false;
    while (arr.pop()) {
    }
    while (tmpArr.length > 0) {
        arr.push(tmpArr.shift());
    }
    return true;
}

class EditingHelper<T extends ClientModel.Entity> {

    constructor(editingModalId: string, deletingModalId: string, Factory: () => T, Dataset: KnockoutObservableArray<T>, detailModalId: string);
    constructor(editingModalId: string, deletingModalId: string, Factory: () => T, Dataset: KnockoutObservableArray<T>, detailedSidebar: Sidebar);
    constructor(editingModalId: string, deletingModalId: string, Factory: () => T, Dataset: KnockoutObservableArray<T>);
    constructor(editingModalId: string, deletingModalId: string, protected Factory: () => T, protected Dataset: KnockoutObservableArray<T>, detailModalId?: string | Sidebar) {
        this.EditingModal = $(`#${editingModalId}`);
        this.DeletingModal = $(`#${deletingModalId}`);

        if ($("form:first").length === 1)
            this.Parsley = $("form:first", this.EditingModal).parsley((<any>window).ParsleyConfig);
        this.EditingModal.on("show.bs.modal",
            () => {
                this.EditingModalOpen = true;
                if (this.Editing() === undefined)
                    this.Editing(this.Factory());
            });

        this.EditingModal.on("shown.bs.modal",
            () => {
                window.setTimeout(() => $("input, select, textarea", this.EditingModal).first().focus(), 200);
            });

        this.EditingModal.on("hidden.bs.modal",
            () => {
                if (this.Editing() !== undefined)
                    this.Editing(undefined);
                this.EditingModalOpen = false;
            });
        this.Editing.subscribe((entity) => {
            if (entity === undefined && this.EditingModalOpen) {
                this.EditingModal.modal("hide");
            } else if (!this.EditingModalOpen) {
                entity.SaveState();
                this.EditingModal.modal("show");
            }
        });
        this.Editing.subscribe(() => {
            if (this.Editing() !== undefined) {
                this.Editing().RevertState(true);
            }
        },
            this,
            "beforeChange");

        this.DeletingModal.on("show.bs.modal",
            () => {
                this.DeletingModalOpen = true;
            });

        this.DeletingModal.on("hidden.bs.modal",
            () => {
                if (this.Deleting() !== undefined)
                    this.Deleting(undefined);
                this.DeletingModalOpen = false;
            });
        this.Deleting.subscribe((entity) => {
            if (entity === undefined && this.DeletingModalOpen) {
                this.DeletingModal.modal("hide");
            } else if (!this.DeletingModalOpen) {
                this.DeletingModal.modal("show");
            }
        });

        if (detailModalId !== undefined) {
            if (detailModalId instanceof Sidebar) {
                this.DetailSidebar = detailModalId;
                this.Detail.subscribe((entity) => {
                    if (entity === undefined && this.DetailSidebar.IsActiv()) {
                        this.DetailSidebar.Hide();
                    } else if (entity !== undefined && !this.DetailSidebar.IsActiv()) {
                        this.DetailSidebar.Show();
                    }
                });
            } else {
                this.DetailModal = $(`#${detailModalId}`);
                this.Detail.subscribe((entity) => {
                    if (entity === undefined && this.DetailModalOpen) {
                        this.DetailModal.modal("hide");
                    } else if (entity !== undefined && !this.DetailModalOpen) {
                        this.DetailModal.modal("show");
                    }
                });

                this.DetailModal.on("show.bs.modal",
                    () => {
                        this.DetailModalOpen = true;
                    });

                this.DetailModal.on("hide.bs.modal",
                    () => {
                        this.DetailModalOpen = false;
                    });
            }
        }

    }

    protected EditingModal: JQuery;
    protected DeletingModal: JQuery;
    protected DetailModal: JQuery;
    protected DetailSidebar: Sidebar;
    protected EditingModalOpen = false;
    protected DeletingModalOpen = false;
    protected DetailModalOpen = false;
    protected Parsley: any;

    Detail = ko.observable<T>();
    Editing = ko.observable<T>();
    Deleting = ko.observable<T>();

    Delete = () => {
        this.Deleting()
            .DeleteOnServer()
            .done(() => {
                //this.Dataset.remove(this.Deleting());
                this.Deleting(undefined);
                if (this.Detail() !== undefined)
                    this.Detail(undefined);
                if (this.Editing() !== undefined)
                    this.Editing(undefined);
            });
    };

    Save = () => {
        if (this.Parsley !== undefined)
            this.Parsley.whenValidate()
                .done(() => {
                    var isNew = this.Editing().Id() === undefined;
                    this.Editing()
                        .SaveToServer()
                        .done(() => {
                            //if (isNew)
                            //    this.Dataset.push(this.Editing());
                            this.Editing(undefined);
                        });
                });
        else {
            var isNew = this.Editing().Id() === undefined;
            this.Editing()
                .SaveToServer()
                .done(() => {
                    //if (isNew)
                    //    this.Dataset.push(this.Editing());
                    this.Editing(undefined);
                });
        }
    };
}

class MapViewModel {
    constructor() {
        this.LoadData();
        $.get("/Account/LoggedIn").done((data) => this.IsLoggedIn(data));
    }

    IsLoggedIn = ko.observable(false);



    LoadData() {
        ServerApi.Persons
            .Get()
            .done(d => {
                for (let sEntity of d) {
                    this.Persons.push(new ClientModel.Person().LoadFromServerEntity(sEntity));
                }
                this.PersonsLoaded = true;
                this.InitializeModel();
            });
    }

    InitializeModel() {
        if (this.PersonsLoaded) {
            ko.applyBindings(mapViewModel);
            $("#loadingOverlay").remove();
        }
    }

    GetPersonById(id: number): ClientModel.Person {
        for (let entity of this.Persons()) {
            if (entity.Id() === id) return entity;
        }
        //throw "No Tack with id " + id + " found";
        return undefined;
    }

    PersonsLoaded = false;

    Persons = ko.observableArray<ClientModel.Person>();

    TackHelper = new EditingHelper("editingTackModal", "deletingTackModal", () => new ClientModel.Person(), this.Persons);
}

var leftSidebar = new Sidebar($("#leftSidebar"));
var rightSidebar = new Sidebar($("#rightSidebar"));
var bottomSidebar = new Sidebar($("#bottomSidebar"));

var mapViewModel = new MapViewModel();

$(".modal").on("hidden.bs.modal", function () {
    $(this).removeClass("fv-modal-stack");
    $("body").data("fv_open_modals", $("body").data("fv_open_modals") - 1);
});


$(".modal").on("shown.bs.modal", function () {

    // keep track of the number of open modals

    if (typeof ($("body").data("fv_open_modals")) == "undefined") {
        $("body").data("fv_open_modals", 0);
    }


    // if the z-index of this modal has been set, ignore.

    if ($(this).hasClass("fv-modal-stack")) {
        return;
    }

    $(this).addClass("fv-modal-stack");

    $("body").data("fv_open_modals", $("body").data("fv_open_modals") + 1);

    $(this).css("z-index", 1040 + (10 * $("body").data("fv_open_modals")));

    $(".modal-backdrop").not(".fv-modal-stack")
        .css("z-index", 1039 + (10 * $("body").data("fv_open_modals")));


    $(".modal-backdrop").not("fv-modal-stack")
        .addClass("fv-modal-stack");

});

interface KnockoutBindingHandlers {
    daterange?: KnockoutBindingHandler;
}

ko.bindingHandlers.daterange = {
    init(element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) {
        let value = valueAccessor()();
        if (value === undefined)
            valueAccessor()(new Date().toJSON());
        value = valueAccessor()();
        (<any>$(element))
            .daterangepicker({
                "singleDatePicker": true,
                "showDropdowns": true,
                "timePicker": true,
                "timePicker24Hour": true,
                "timePickerIncrement": 15,
                "locale": {
                    "format": "DD.MM.YYYY HH:mm",
                    "separator": " - ",
                    "applyLabel": "Speichern",
                    "cancelLabel": "Abbrechen",
                    "fromLabel": "Von",
                    "toLabel": "Bis",
                    "customRangeLabel": "Custom",
                    "weekLabel": "W",
                    "daysOfWeek": [
                        "S0",
                        "Mo",
                        "Di",
                        "Mi",
                        "Do",
                        "Fr",
                        "Sa"
                    ],
                    "monthNames": [
                        "Januar",
                        "Februar",
                        "März",
                        "April",
                        "Mai",
                        "Juni",
                        "Juli",
                        "August",
                        "September",
                        "Oktober",
                        "November",
                        "Dezember"
                    ],
                    "firstDay": 1
                },
                "alwaysShowCalendars": true,
                "startDate": value,
                "endDate": value
            }, (start) => {
                valueAccessor()(start._d.toJSON());
            });
    },
    update(element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) {
        $(element).data("daterangepicker").setStartDate(moment(valueAccessor()()));
    }
};


(<any>window).Parsley.on("form:validate", form => {
    if (form.submitEvent === undefined)
        return false;
});

(<any>window).Parsley.on("form:submit", form => false);