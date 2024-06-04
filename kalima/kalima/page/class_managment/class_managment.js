var selected_class;
var selectedTeacher;
var current_class;// = await frappe.db.get_doc("Class", selected_class,fields=["student_list"]);


frappe.pages['class-managment'].on_page_load = async function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Class Managment',
        single_column: true
    });
    var main_template = frappe.render_template('class_managment', {
        teacher_name: "test"
    }, page.main);
    var $container = $(wrapper).find('.layout-main-section');
    $container.html(main_template);

    await teacher_field(page);
    await content_manager(page);
}

async function teacher_field(page) {
    const teacherSelector = frappe.ui.form.make_control({
        parent: page.wrapper.find('#teacher-holder'),
        df: {
            fieldtype: "Link",
            options: "Employee",
            fieldname: "employee",
            label: __("Select Teacher"),
            placeholder: __("Teacher"),
            default: "HR-EMP-00001",

            reqd: 1,
            change: async () => {
                selectedTeacher = teacherSelector.get_value();
                await class_field(page, selectedTeacher);
            }
        }
    });
    teacherSelector.refresh();
}

async function class_field(page, teacher) {
    await frappe.call({
        method: "kalima.utils.utils.get_classes_for_teacher",
        args: {
            teacher_name: teacher
        },
        callback: function (response) {
            if (response.message) {
                console.log("Classes for the teacher:", response.message);

                // Clear existing class selector if it exists
                page.wrapper.find('#class-holder').empty();

                const classSelector = frappe.ui.form.make_control({
                    parent: page.wrapper.find('#class-holder'),
                    df: {
                        fieldtype: "Link",
                        options: "Class",
                        fieldname: "class",
                        label: __("Select Class"),
                        default: "CE 1",
                        placeholder: __("Class"),
                        get_query(doc, cdt, cdn) {
                            return {
                                filters: [
                                    ['name', 'in', response.message],
                                ]
                            };
                        },
                        reqd: 1,
                        change: async () => {
                            selected_class = classSelector.get_value();
                            current_class = await frappe.db.get_doc("Class", selected_class,fields=["student_list"]);
                        }
                    }
                });
                classSelector.refresh();
            } else {
                console.log("No classes found for the teacher.");
            }
        }
    });
}

async function content_manager(page) {

    //contents
    var contentColumn = document.querySelector("#content");
    document.querySelectorAll('.btn-secondary').forEach(button => {
        button.addEventListener('click', function () {

            // Remove 'btn-info' and 'active' classes from all buttons
            document.querySelectorAll('.btn-secondary').forEach(btn => {
                btn.classList.remove('btn-info');
                btn.classList.remove('active');
            });
            // Add 'btn-info' and 'active' classes to the clicked button
            this.classList.add('btn-info');
            this.classList.add('active');

            // Clear the content column
            contentColumn.innerHTML = '';

            // Load the corresponding template based on the clicked button
            var templateName = this.textContent.replace(/\s+/g, '-').toLowerCase(); // Convert button text to lowercase and replace spaces with dashes
            var cnt = frappe.render_template(templateName, {}, contentColumn);
            contentColumn.innerHTML = cnt;

            // if (templateName == "sessions-list")
            createFormDialogNew(templateName);

            // Call the function to create the form
            // createCustomForm();
        });


    });

    document.querySelectorAll('.first-button').forEach(btn => {
        btn.click();
    });
}

function createFormDialog() {

    const parent = $('#main-div');
    if (parent.length === 0) {
        console.error("Parent element not found");
        return;
    }
    const button = $('<button class="btn btn-success border hover">Create New</button>').appendTo(parent);
    button.click(function () {


        var session_list_fields = [
            {
                label: 'Class',
                fieldname: 'class',
                fieldtype: 'Link',
                options: 'Class',
                default: selected_class,
                reqd: 1,
                read_only: 1
            },
            {
                label: 'Title',
                fieldname: 'title',
                fieldtype: 'Data'
            },

            {
                fieldname: 'column_break_inyc',
                fieldtype: 'Column Break'
            },
            {
                label: 'Issue Date',
                fieldname: 'issue_date',
                fieldtype: 'Date'
            },
            {
                label: 'Expiration Date',
                fieldname: 'expiration_date',
                fieldtype: 'Date'
            },
            {
                fieldname: 'section_break_inyc',
                fieldtype: 'Section Break'
            },
            {
                label: 'Description',
                fieldname: 'description',
                fieldtype: 'Text Editor'
            },
            {
                label: 'Session Files',
                fieldname: 'session_files',
                fieldtype: 'Table',
                cannot_add_rows: false,
                in_place_edit: false,
                // data: [{ field1: 'Row1.1', field2: 'Row1.2' }, { field1: 'Row2.1', field2: 'Row2.2' }],
                fields: [
                    { fieldname: 'file', fieldtype: 'Attach', in_list_view: 1, label: 'File' },
                    { fieldname: 'description', fieldtype: 'Data', in_list_view: 1, label: 'Description' }
                ]
            },
        ];


        let d = new frappe.ui.Dialog({
            title: 'Enter details',
            fields: session_list_fields,
            size: 'large', // small, large, extra-large
            primary_action_label: 'Submit',
            primary_action(values) {
                console.log(values);

                frappe.call({
                    method: 'frappe.client.insert',
                    args: {
                        doc: {
                            doctype: 'Class Session',
                            class: values.class,
                            title: values.title,
                            issue_date: values.issue_date,
                            expiration_date: values.expiration_date,
                            session_files: values.session_files,
                            description: values.description
                        }
                    },
                    callback: function (response) {
                        if (!response.exc) {
                            frappe.msgprint('Record created successfully!');
                            d.hide();
                        } else {
                            frappe.msgprint('An error occurred while creating the record.');
                        }
                    }
                });
                // d.hide();
            }
        });

        d.show();
    });
}

function createFormDialogNew(templateName) {
    console.log(selected_class);

    const parent = $('#main-div');
    if (parent.length === 0) {
        console.error("Parent element not found");
        return;
    }
    const button = $('<button class="btn btn-success border hover">Create New</button>').appendTo(parent);
    button.click(async function () {
        var fields = [];
        if (templateName == "sessions-list") {
            fields = [
                {
                    label: 'Class',
                    fieldname: 'class',
                    fieldtype: 'Link',
                    options: 'Class',
                    default: selected_class,
                    reqd: 1,
                    read_only: 1
                },
                {
                    label: 'Title',
                    fieldname: 'title',
                    fieldtype: 'Data'
                },

                {
                    fieldname: 'column_break_inyc',
                    fieldtype: 'Column Break'
                },
                {
                    label: 'Issue Date',
                    fieldname: 'issue_date',
                    fieldtype: 'Date'
                },
                {
                    label: 'Expiration Date',
                    fieldname: 'expiration_date',
                    fieldtype: 'Date'
                },
                {
                    fieldname: 'section_break_inyc',
                    fieldtype: 'Section Break'
                },
                {
                    label: 'Description',
                    fieldname: 'description',
                    fieldtype: 'Text Editor'
                },
                {
                    label: 'Session Files',
                    fieldname: 'session_files',
                    fieldtype: 'Table',
                    cannot_add_rows: false,
                    in_place_edit: false,
                    // data: [{ field1: 'Row1.1', field2: 'Row1.2' }, { field1: 'Row2.1', field2: 'Row2.2' }],
                    fields: [
                        { fieldname: 'file', fieldtype: 'Attach', in_list_view: 1, label: 'File' },
                        { fieldname: 'description', fieldtype: 'Data', in_list_view: 1, label: 'Description' }
                    ]
                },
            ];
        } else if (templateName == "continuous-exam-list") {
            fields = [
                {
                    fieldname: "class",
                    fieldtype: "Link",
                    label: "Class",
                    default: selected_class, read_only: 1,
                    options: "Class"
                },
                {
                    fieldname: "title",
                    fieldtype: "Data",
                    label: "Title"
                },
                {
                    fieldname: "type",
                    fieldtype: "Select",
                    label: "Type",
                    options: "Normal Exam\nAttendance\nProject\nSeminar\nQuiz"
                }, {
                    fieldname: "column_break_bltp",
                    fieldtype: "Column Break"
                },

                {
                    fieldname: "date",
                    fieldtype: "Date",
                    label: "Date"
                }, {
                    fieldname: "percentage",
                    fieldtype: "Percent",
                    label: "Percentage"
                },

                {
                    fieldname: "marked_on",
                    fieldtype: "Int",
                    label: "Marked On"
                },
                {
                    fieldname: "section_break_gahv",
                    fieldtype: "Section Break"
                },
                {
                    label: 'Continuous Exam Result',
                    fieldname: 'continuous_exam_result',
                    fieldtype: 'Table',
                    cannot_add_rows: false,
                    in_place_edit: false,
                    fields: [
                        { fieldname: 'student_code', fieldtype: 'Data', in_list_view: 1, label: 'Student Code' },
                        { fieldname: 'student_name', fieldtype: 'Link', options: 'Student', in_list_view: 1, label: 'Student Name' },
                        { fieldname: 'department', fieldtype: 'Link', options: 'Faculty Department', in_list_view: 1, label: 'Department' },
                        { fieldname: 'score', fieldtype: 'Float', in_list_view: 1, label: 'Score' },
                        { fieldname: 'is_absent', fieldtype: 'Check', in_list_view: 1, label: 'Is Absent' },
                        { fieldname: 'Description', fieldtype: 'Data', in_list_view: 1, label: 'Description' },

                    ]
                },
            ];
        } else if (templateName == "assignment-list") {
            fields = [

                {
                    fieldname: "class",
                    fieldtype: "Link",
                    label: "Class",
                    default: selected_class, read_only: 1,
                    options: "Class"
                },
                {
                    fieldname: "title",
                    fieldtype: "Data",
                    label: "Title"
                }, {
                    fieldname: "percentage",
                    fieldtype: "Percent",
                    label: "Percentage"
                }, {
                    fieldname: "column_break_bltp",
                    fieldtype: "Column Break"
                },

                {
                    fieldname: "from_date",
                    fieldtype: "Date",
                    label: "From Date"
                }, {
                    fieldname: "to_date",
                    fieldtype: "Date",
                    label: "To Date"
                },
                {
                    fieldname: "total_in_final_score",
                    fieldtype: "Float",
                    label: "Total in final Score"
                },
                {
                    fieldname: "section_break_gahv",
                    fieldtype: "Section Break"
                }, {
                    fieldname: "description",
                    fieldtype: "Text Editor",
                    label: "Description"
                },
                {
                    label: 'Assignment Files',
                    fieldname: 'assignment_files',
                    fieldtype: 'Table',
                    cannot_add_rows: false,
                    in_place_edit: false,
                    fields: [
                        { fieldname: 'file', fieldtype: 'Attach', in_list_view: 1, label: 'File' },
                        { fieldname: 'description', fieldtype: 'Data', in_list_view: 1, label: 'Description' },

                    ]
                },

            ];
        } else if (templateName == "exam-schedule") {
            fields = [

                {
                    fieldname: "class",
                    fieldtype: "Link",
                    label: "Class",
                    default: selected_class, read_only: 1,
                    // read_only: 1,
                    options: "Class"
                },
                {
                    fieldname: "date",
                    fieldtype: "Date",
                    label: "Date"
                }, {
                    fieldname: "time",
                    fieldtype: "Time",
                    label: "Time"
                },

            ];
        } else if (templateName == "attendance-entry") {
            // var current_class = await frappe.db.get_doc("Class", selected_class,fields=["student_list"]);

            console.log("current_class");
            console.log(current_class);


            // {
            //     "name": "CE 1",
            //     "student_list": [
            //         {
            //             "name": "fb0967c46e",
            //             "owner": "Administrator",
            //             "creation": "2024-06-02 14:22:50.121633",
            //             "modified": "2024-06-04 10:40:11.390315",
            //             "modified_by": "Administrator",
            //             "docstatus": 0,
            //             "idx": 1,
            //             "student": "Abdullah Alshehab",
            //             "parent": "CE 1",
            //             "parentfield": "student_list",
            //             "parenttype": "Class",
            //             "doctype": "Class Students"
            //         },
            //         {
            //             "name": "20b3bf15fc",
            //             "owner": "Administrator",
            //             "creation": "2024-06-02 14:22:50.121633",
            //             "modified": "2024-06-04 10:40:11.390315",
            //             "modified_by": "Administrator",
            //             "docstatus": 0,
            //             "idx": 2,
            //             "student": "احمد حامد محمود حمدان",
            //             "parent": "CE 1",
            //             "parentfield": "student_list",
            //             "parenttype": "Class",
            //             "doctype": "Class Students"
            //         },
            //         {
            //             "name": "899970c156",
            //             "owner": "Administrator",
            //             "creation": "2024-06-02 14:22:50.121633",
            //             "modified": "2024-06-04 10:40:11.390315",
            //             "modified_by": "Administrator",
            //             "docstatus": 0,
            //             "idx": 3,
            //             "student": "حامد حامد حامد حامد",
            //             "parent": "CE 1",
            //             "parentfield": "student_list",
            //             "parenttype": "Class",
            //             "doctype": "Class Students"
            //         },
            //         {
            //             "name": "9e02c5a585",
            //             "owner": "Administrator",
            //             "creation": "2024-06-02 14:22:50.121633",
            //             "modified": "2024-06-04 10:40:11.390315",
            //             "modified_by": "Administrator",
            //             "docstatus": 0,
            //             "idx": 4,
            //             "student": "a b c d",
            //             "parent": "CE 1",
            //             "parentfield": "student_list",
            //             "parenttype": "Class",
            //             "doctype": "Class Students"
            //         }
            //     ]
            // }
            fields = [
                {
                    fieldname: "class",
                    fieldtype: "Link",
                    label: "Class",
                    default: selected_class,
                    read_only: 1,
                    options: "Class"
                }, {
                    fieldname: "teacher",
                    fieldtype: "Link",
                    label: "Teacher",
                    default: selectedTeacher, read_only: 1,
                    options: "Employee"
                },
                {
                    fieldname: "year",
                    fieldtype: "Link",
                    in_list_view: 1,
                    label: "Year",
                    options: "Educational Year",
                    reqd: 1
                },
                {
                    fieldname: "department",
                    fieldtype: "Link",
                    in_list_view: 1,
                    label: "Department",
                    options: "Faculty Department",
                    reqd: 1
                },
                {
                    fieldname: "column_break_wvoi",
                    fieldtype: "Column Break"
                },
                {
                    fieldname: "module",
                    fieldtype: "Link",
                    label: "Presented Module",
                    options: "Presented Module"
                },
                {
                    fieldname: "date",
                    fieldtype: "Date",
                    label: "Date"
                },
                {
                    fieldname: "semester",
                    fieldtype: "Select",
                    label: "Semester",
                    options: "Fall Semester\nSprint Semester\nShort Semester\nAnnual"
                }, {
                    fieldname: "stage",
                    fieldtype: "Select",
                    label: "Stage",
                    options: "First Year\nSecond Year\nThird Year\nFourth Year\nFifth Year\nBologna"
                },
                {
                    fieldname: "section_break_fsrg",
                    fieldtype: "Section Break"
                },
                // {
                //     label: 'Attednance',
                //     fieldname: 'attednance',
                //     fieldtype: 'Table',
                //     cannot_add_rows: false,
                //     in_place_edit: false,
                //     fields: [
                //         { fieldname: 'student', fieldtype: 'Link', options: 'Student', in_list_view: 1, label: 'Student' },
                //         { fieldname: 'status', fieldtype: 'Select', options: "Absent\nDelayed\nPresent", in_list_view: 1, label: 'Status' },
                //         { fieldname: 'leave', fieldtype: 'Check', in_list_view: 1, label: 'leave' },
                //     ]
                // },
            ];
            var student_counter = 1;
            console.log("123 fields 321");
            console.log(fields);
            current_class.student_list.forEach(element => {
                fields.push({
                    fieldname: element.name,
                    fieldType: "Check", 
                    label: element.student,
                  });
                  student_counter++;
            });
            console.log("fields");
            console.log(fields);

        } else if (templateName == "time-table") {
            fields = [
                {
                    fieldname: "class",
                    fieldtype: "Link",
                    default: selected_class, read_only: 1,

                    label: "Class",
                    options: "Class"
                }, {
                    fieldname: "teacher",
                    fieldtype: "Link",
                    default: selectedTeacher, read_only: 1,

                    label: "Teacher",
                    options: "Employee"
                },
                {
                    fieldname: "day",
                    fieldtype: "Data",
                    label: "Day",
                }, {
                    fieldname: "column_break_wvoi",
                    fieldtype: "Column Break"
                },
                {
                    fieldname: "start",
                    fieldtype: "Time",
                    label: "Start"
                },
                {
                    fieldname: "finish",
                    fieldtype: "Time",
                    label: "Finish"
                }, {
                    fieldname: "section_break_fsrg",
                    fieldtype: "Section Break"
                },
                {
                    fieldname: "description",
                    fieldtype: "Small Text",
                    label: "Description"
                },
            ];
        }

        let d = new frappe.ui.Dialog({
            title: 'Enter details',
            fields: fields,
            size: 'large', // small, large, extra-large
            primary_action_label: 'Submit',
            primary_action(values) {
                console.log(values);
                if (templateName == "sessions-list") {
                    var creation_fields = {
                        doctype: 'Class Session',
                        class: values.class,
                        title: values.title,
                        issue_date: values.issue_date,
                        expiration_date: values.expiration_date,
                        session_files: values.session_files,
                        description: values.description
                    }
                } else if (templateName == "continuous-exam-list") {
                    var creation_fields = {
                        doctype: 'Class Continuous Exam',
                        class: values.class,
                        title: values.title,
                        type: values.type,
                        date: values.date,
                        score: values.score,
                        continuous_exam_result: values.continuous_exam_result,
                        percentage: values.percentage
                    }
                } else if (templateName == "assignment-list") {
                    var creation_fields = {
                        doctype: 'Assignments and Tasks',
                        class: values.class,
                        title: values.title,
                        from_date: values.from_date,
                        to_date: values.to_date,
                        description: values.description,
                        total_in_final_score: values.total_in_final_score,
                        assignment_files: values.assignment_files,
                        percentage: values.percentage
                    }
                } else if (templateName == "exam-schedule") {
                    var creation_fields = {
                        doctype: 'Exam Schedule',
                        date: values.date,
                        class: values.class,
                        time: values.time,
                    }
                } else if (templateName == "attendance-entry") {
                    var creation_fields = {
                        doctype: 'Student Attendance Entry',
                        year: values.year,
                        class: values.class,
                        semester: values.semester,
                        department: values.department,
                        module: values.module,
                        date: values.date,
                        teacher: values.teacher,
                        attednance: values.attednance,
                    }
                } else if (templateName == "time-table") {
                    var creation_fields = {
                        doctype: 'Class Timetable',
                        class: values.class,
                        day: values.day,
                        start: values.start,
                        finish: values.finish,
                        teacher: values.teacher,
                        description: values.description,
                    }
                }
                frappe.call({
                    method: 'frappe.client.insert',
                    args: {
                        doc: creation_fields
                    },
                    callback: function (response) {
                        if (!response.exc) {
                            frappe.msgprint('Record created successfully!');
                            d.hide();
                        } else {
                            frappe.msgprint('An error occurred while creating the record.');
                        }
                    }
                });
                // d.hide();
            }
        });

        d.show();
    });
}



function handleSubmit() {
    const formData = {
        first_name: $(`[data-fieldname="first_name"]`).val(),
        email: $(`[data-fieldname="email"]`).val(),
        birth_date: $(`[data-fieldname="birth_date"]`).val()
    };
    console.log(`Form Data:`, formData);
}