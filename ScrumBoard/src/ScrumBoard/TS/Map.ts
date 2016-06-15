var ctrlPressed = false;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    $("body").addClass("mobile");
}

interface JQuery {
    parsley: any; // Expand this bad boy later
}

(<any>window).tinymceOptions = {
    default: {
        theme: 'modern',
        language_url: '/lib/tinymce-i18n/langs/de.js',
        plugins: [
            'advlist autolink lists link image charmap hr anchor pagebreak',
            'searchreplace wordcount visualblocks visualchars code',
            'insertdatetime media nonbreaking save table contextmenu directionality',
            'emoticons template paste textcolor colorpicker textpattern imagetools'
        ],
        toolbar1:
        'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
        toolbar2: 'media | forecolor backcolor emoticons',
        image_advtab: true,
        statusbar: false
    }
};

(<any>window).ParsleyConfig = {
    errorClass: 'has-error',
    successClass: 'has-success',
    showErrors: false,
    classHandler: function (ParsleyField) {
        return ParsleyField.$element.parents('.form-group');
    },
    errorsContainer: function (ParsleyField) {
        return ParsleyField.$element.parents('.form-group');
    },
    errorsWrapper: '<span class="help-block">',
    errorTemplate: '<div></div>',
    excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden], button'
};

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
                $('.popover.in').each(function () {
                    $(this.previousSibling).popover('hide');
                });
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
                $('.popover.in').each(function () {
                    $(this.previousSibling).popover('hide');
                });
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
                        $('.popover.in').each(function () {
                            $(this.previousSibling).popover('hide');
                        });
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
        //$.get("/Account/LoggedIn").done((data) => this.IsLoggedIn(data));
    }

    IsLoggedIn = ko.observable(false);



    LoadData() {
        ServerApi.Context
            .Get()
            .done(d => {
                for (let sEntity of d.Projects) {
                    new ClientModel.Project().LoadFromServerEntity(sEntity);
                }
                this.ProjectsLoaded = true;
                for (let sEntity of d.Jobs) {
                    new ClientModel.Job().LoadFromServerEntity(sEntity);
                }
                this.JobsLoaded = true;
                for (let sEntity of d.Columns) {
                    new ClientModel.Column().LoadFromServerEntity(sEntity);
                }
                this.ColumnsLoaded = true;
                for (let sEntity of d.Categories) {
                    new ClientModel.Category().LoadFromServerEntity(sEntity);
                }
                this.CategoriesLoaded = true;
                for (let sEntity of d.CategoryJobs) {
                    this.CategoryJobs.push(sEntity);
                }
                this.CategoryJobsLoaded = true;
                this.InitializeModel();
            });
    }

    InitializeModel() {
        if (this.ProjectsLoaded && this.CategoriesLoaded && this.JobsLoaded && this.CategoryJobsLoaded && this.ColumnsLoaded) {
            for (let col of this.Columns()) {
                if (col.Project() === undefined) {
                    col.Project(this.GetProjectById(col.ProjectId()));
                    col.Project().Columns.push(col);
                }
            }
            for (let job of this.Jobs()) {
                if (job.Column() === undefined) {
                    job.Column(this.GetColumnById(job.ColumnId()));
                    job.Column().Jobs.push(job);
                }
            }
            for (let catJob of this.CategoryJobs()) {
                this.GetJobById(catJob.JobId).Categories.push(this.GetCategoryById(catJob.CategoryId));
            }
            ko.applyBindings(mapViewModel);
            $("#loadingOverlay").remove();
        }
    }

    GetProjectById(id: number): ClientModel.Project {
        for (let entity of this.Projects()) {
            if (entity.Id() === id) return entity;
        }
        return undefined;
    }

    GetColumnById(id: number): ClientModel.Column {
        for (let entity of this.Columns()) {
            if (entity.Id() === id) return entity;
        }
        return undefined;
    }

    GetJobById(id: number): ClientModel.Job {
        for (let entity of this.Jobs()) {
            if (entity.Id() === id) return entity;
        }
        return undefined;
    }

    GetCategoryById(id: number): ClientModel.Category {
        for (let entity of this.Categories()) {
            if (entity.Id() === id) return entity;
        }
        return undefined;
    }

    ProjectsLoaded = false;
    CategoriesLoaded = false;
    JobsLoaded = false;
    CategoryJobsLoaded = false;
    ColumnsLoaded = false;

    Projects = ko.observableArray<ClientModel.Project>();
    Jobs = ko.observableArray<ClientModel.Job>();
    Categories = ko.observableArray<ClientModel.Category>();
    CategoryJobs = ko.observableArray<ServerModel.CategoryJob>();
    Columns = ko.observableArray<ClientModel.Column>();

    CategoryHelper = new EditingHelper("editingCategoryModal", "deletingCategoryModal", () => new ClientModel.Category(), this.Categories, "detailCategoryModal");
    JobHelper = new EditingHelper("editingJobModal", "deletingJobModal", this.CreateJob, this.Jobs, "detailJobModal");
    ColumnHelper = new EditingHelper("editingColumnModal", "deletingColumnModal", this.CreateColumn, this.Columns, "detailColumnModal");
    ProjectHelper = new EditingHelper("editingProjectModal", "deletingProjectModal", this.CreateProject, this.Projects, "detailProjectModal");

    private CreateProject(): ClientModel.Project {
        const project = new ClientModel.Project();
        const dummyCol = new ClientModel.Column();
        dummyCol.IsDummyColumn(true);
        dummyCol.Name("Backlog");
        project.Columns.push(dummyCol);
        return project;
    }

    private CreateColumn(): ClientModel.Column {
        const col = new ClientModel.Column();
        col.Project(mapViewModel.SelectedProject());
        return col;
    }

    private CreateJob(): ClientModel.Job {
        const job = new ClientModel.Job();
        job.Column(mapViewModel.SelectedProject().GetDummyColum());
        return job;
    }

    PersonsToSelect = ko.computed(() => {
        return (<any[]>this.Categories().sort((p1,p2)=>p1.Name() > p2.Name()?1:-1)).concat([{ FullName: "Neue Person...", IsDummy: true }]);
    });

    ProcessPersonSelectOptions = (option: HTMLOptionElement, item) => {
        if (item !== undefined && item !== null && item.IsDummy === true) {
            option.value = "filled";
            const context = ko.contextFor(option);
            const select = $(option).parent();
            if (select.data("new-change-handler") === undefined)
                select.data("new-change-handler",
                    select.change(() => {
                        if ($(option).is(":selected")) {
                            const person = new ClientModel.Category();
                            this.CategoryHelper.Editing(person);
                            const subscription = this.CategoryHelper.Editing.subscribe(() => {
                                if (person.Id() !== undefined) {
                                    this.Categories.push(person);
                                    context.$data.Person(person);
                                } else {
                                    context.$data.Person(undefined);
                                }
                                subscription.dispose();
                            });
                        }
                    }));
        }
    }

    SelectedProject = ko.observable<ClientModel.Project>();


}

//var leftSidebar = new Sidebar($("#leftSidebar"));
//var rightSidebar = new Sidebar($("#rightSidebar"));
//var bottomSidebar = new Sidebar($("#bottomSidebar"));

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

function GetPopoverTitle(elem): string {
    const entity = ko.dataFor(elem);
    if (entity instanceof ClientModel.Column) {
        return entity.Description();
    }
    if (entity instanceof ClientModel.Job) {
        return entity.Description();
    }
    return "";
}

function GetPopoverContent(elem): JQuery {
    const entity = ko.dataFor(elem);
    if (entity instanceof ClientModel.Column) {
        const controls = $("#columnPopoverControlContainer").clone();
        if (entity.IsDummyColumn())
            $(".delete", controls).remove();
        else
            $(".delete", controls).click(() => { mapViewModel.ColumnHelper.Deleting(entity); });
        $(".edit", controls).click(() => { mapViewModel.ColumnHelper.Editing(entity); });
        return controls;
    }
    if (entity instanceof ClientModel.Job) {
        const controls = $("#jobPopoverControlContainer").clone();
        $(".delete", controls).click(() => { mapViewModel.JobHelper.Deleting(entity); });
        $(".edit", controls).click(() => { mapViewModel.JobHelper.Editing(entity); });
        return controls;
    }
    return undefined;
}


(<any>$(document)).arrive(".hasPopover", function () {
    $(this)
        .popover({
            content: GetPopoverContent(this),
            title: GetPopoverTitle(this),
            html: true,
            placement: "auto bottom"
        });
});

$('html').on('mouseup', function (e) {
    if (!$(e.target).closest('.popover').length) {
        $('.popover').each(function () {
            $(this.previousSibling).popover('hide');
        });
    }
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


interface KnockoutBindingHandlers {
    color: KnockoutBindingHandler;

}

interface IColorpickerOptions {
    format: string;
    color: string;
    container: string | JQuery;
    component: string | JQuery;
    input: string | JQuery;
    horizontal: boolean;
    inline: boolean;
    sliders: Object;
    slidersHorz: Object;
    template: string;
    align: string;
    customClass: string;
    colorSelectors: Object;
}

interface JQuery {
    colorpicker:(options?:IColorpickerOptions)=>void;
}

ko.bindingHandlers.color = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        const options:IColorpickerOptions = allBindingsAccessor().colorOptions || {};
        $(element).colorpicker(options);
        const widget = $(element).data("colorpicker");
        //$(element).data("colorpicker").setColor(ko.utils.unwrapObservable(valueAccessor()));

        ko.utils.registerEventHandler(element, "changeColor", function (event) {
            valueAccessor()(widget.getValue());
        });
    },
    update: function (element, valueAccessor) {
        $(element).data("colorpicker").setValue(ko.utils.unwrapObservable(valueAccessor()));
    }
};
