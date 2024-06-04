var selected_class;
var selectedTeacher;
var current_class;// = await frappe.db.get_doc("Class", selected_class,fields=["student_list"]);
var naming_maps = {};


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
    await content_manager();
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
    teacherSelector.set_value("HR-EMP-00001");
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
                // console.log("Classes for the teacher:", response.message);

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
                            current_class = await frappe.db.get_doc("Class", selected_class, fields = ["student_list"]);
                            // console.log(current_class);
                        }
                    }
                });
                classSelector.set_value("CE 1");

                classSelector.refresh();
            } else {
                console.log("No classes found for the teacher.");
            }
        }
    });
}

async function content_manager(dont_click=false) {
    var contentColumn = document.querySelector("#content");
    document.querySelectorAll('.btn-secondary').forEach(button => {
        button.addEventListener('click', async function () {
            document.querySelectorAll('.btn-secondary').forEach(btn => {
                btn.classList.remove('btn-info');
                btn.classList.remove('active');
            });
            this.classList.add('btn-info');
            this.classList.add('active');

            contentColumn.innerHTML = ''; // Clear the content column
            var templateName = this.textContent.replace(/\s+/g, '-').toLowerCase(); // Convert button text to lowercase and replace spaces with dashes
            var cnt = frappe.render_template(templateName, {}, contentColumn);
            contentColumn.innerHTML = cnt;

            if (templateName != 'student-list' && templateName != 'dissolution') {
                createFormDialogNew(templateName);
            }

            if (templateName === 'sessions-list') {
                const columns = [
                    { label: 'Title', fieldname: 'title' },
                    { label: 'Issue Date', fieldname: 'issue_date' },
                    { label: 'Expiration Date', fieldname: 'expiration_date' }
                ];
                await populateTable('Class Session', contentColumn, columns);
            } else if (templateName == "continuous-exam-list") {
                const columns = [
                    { label: 'Title', fieldname: 'title' },
                    { label: 'Type', fieldname: 'type' },
                    { label: 'Date', fieldname: 'date' }
                ];
                await populateTable('Class Continuous Exam', contentColumn, columns);
            } else if (templateName == "assignment-list") {
                const columns = [
                    { label: 'Title', fieldname: 'title' },
                    { label: 'From Date', fieldname: 'from_date' },
                    { label: 'Percentage', fieldname: 'percentage' },
                    { label: 'Total in final Score', fieldname: 'total_in_final_score' }
                ];
                await populateTable('Assignments and Tasks', contentColumn, columns);
            } else if (templateName == "exam-schedule") {
                const columns = [
                    { label: 'Date', fieldname: 'date' },
                    { label: 'Time', fieldname: 'time' },
                ];
                await populateTable('Exam Schedule', contentColumn, columns);
            } else if (templateName == "attendance-entry") {
                const columns = [
                    { label: 'Date', fieldname: 'date' },
                    { label: 'Presented Module', fieldname: 'module' }
                ];
                await populateTable('Student Attendance Entry', contentColumn, columns);
            } else if (templateName == "time-table") {
                const columns = [
                    { label: 'Day', fieldname: 'day' },
                    { label: 'Start', fieldname: 'start' },
                    { label: 'Finish', fieldname: 'finish' }
                ];
                await populateTable('Class Timetable', contentColumn, columns);
            } else if (templateName == "student-list") {
                populateStudents(contentColumn);
            }


        });
    });

    if(!dont_click){
    document.querySelectorAll('.first-button').forEach(btn => {
        btn.click();
    });}
}


async function populateTable(doctype, container, columns) {
    // Fetch data from Frappe
    const data = await frappe.call({
        method: 'frappe.client.get_list',
        args: {
            doctype: doctype,
            fields: ['name', ...columns.map(col => col.fieldname)],
            limit_page_length: 15
        }
    });

    // Create table elements
    const table = document.createElement('table');
    table.classList.add('table', 'border', 'rounded', 'table-hover');

    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = "#";
    tr.appendChild(th);

    // Create table header
    columns.forEach(col => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = col.label;
        tr.appendChild(th);
    });

    // Add "Edit" column header
    const editTh = document.createElement('th');
    editTh.scope = 'col';
    editTh.textContent = 'Edit';
    tr.appendChild(editTh);

    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // Populate table rows
    data.message.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.classList.add('clickable-row');

        tr.addEventListener('click', () => {
            frappe.open_in_new_tab = true;
            frappe.set_route(`/app/${toKebabCase(doctype)}/${row.name}`);
        });

        const th = document.createElement('th');
        th.scope = 'row';
        th.textContent = index + 1;
        tr.appendChild(th);

        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = row[col.fieldname] || '';
            tr.appendChild(td);
        });

        // Add "Edit" column
        const editTd = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.classList.add('btn', 'btn-primary', 'btn-sm');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            // Add your edit functionality here
            console.log(`Editing row ${index + 1}`);
        });
        editTd.appendChild(editButton);
        tr.appendChild(editTd);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

async function populateStudents(container) {
    // Create table elements
    const table = document.createElement('table');
    table.classList.add('table', 'border', 'rounded', 'table-hover');

    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = "#";
    tr.appendChild(th);

    // Create table header
    const columns = [
        { fieldname: 'student', label: 'Student' },
        // { fieldname: 'parent', label: 'Class' },
    ];

    columns.forEach(col => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = col.label;
        tr.appendChild(th);
    });

    // // Add "Edit" column header
    // const editTh = document.createElement('th');
    // editTh.scope = 'col';
    // editTh.textContent = 'Edit';
    // tr.appendChild(editTh);

    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // Populate table rows
    current_class.student_list.forEach((student, index) => {
        const tr = document.createElement('tr');
        tr.classList.add('clickable-row');


        const th = document.createElement('th');
        th.scope = 'row';
        th.textContent = index + 1;
        tr.appendChild(th);

        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = student[col.fieldname] || '';
            tr.appendChild(td);
        });

        // Add "Edit" column
        // const editTd = document.createElement('td');
        // const editButton = document.createElement('button');
        // editButton.classList.add('btn', 'btn-primary', 'btn-sm');
        // editButton.textContent = 'Edit';
        // editButton.addEventListener('click', () => {
        //     // Add your edit functionality here
        //     console.log(`Editing student ${student.student}`);
        // });
        // editTd.appendChild(editButton);
        // tr.appendChild(editTd);

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

function createFormDialogNew(templateName) {

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
                    label: "Date",
                    reqd: 1
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
            // current_class.student_list.forEach(element => {
            //     fields.push({
            //         fieldname: element.name,
            //         fieldtype: "Check",
            //         label: element.student,
            //     });
            //     naming_maps[element.name] = element.student;
            // });

            let student_count = current_class.student_list.length;
            let column_count = Math.ceil(student_count / 3);

            current_class.student_list.forEach((element, index) => {
                let column_break = index % column_count === 0 ? {
                    fieldname: `column_break_${index}`,
                    fieldtype: "Column Break"
                } : null;

                if (column_break) {
                    fields.push(column_break);
                }

                fields.push({
                    fieldname: element.name,
                    fieldtype: "Check",
                    label: element.student
                });

                naming_maps[element.name] = element.student;
            });

            // Add the last column break
            if (student_count % column_count !== 0) {
                fields.push({
                    fieldname: `column_break_${Math.floor(student_count / column_count)}`,
                    fieldtype: "Column Break"
                });
            }


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
            async primary_action(values) {
                // console.log(values);
                if (templateName == "attendance-entry") {
                    values["attednance"] = [];
                    var idx = 1;
                    for (const [key, value] of Object.entries(naming_maps)) {
                        if (values[key] == 1) {
                            values["attednance"].push({
                                "idx": idx,
                                "__islocal": true,
                                "student": value, // Access the name directly
                                "status": "Present",
                            });
                            idx++;
                        }
                    }
                }
                // return;
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
                            var contentColumn = document.querySelector("#content");
                            refresh(templateName,contentColumn)
                            d.hide();
                        } else {
                            frappe.msgprint('An error occurred while creating the record.');
                        }
                    }
                });
                // d.hide();

                // await content_manager(true);

            }
        });

        d.show();
    });
}


function toKebabCase(str) {
    return str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
}

async function refresh(templateName,contentColumn){

    contentColumn.innerHTML = ''; // Clear the content column
    var cnt = frappe.render_template(templateName, {}, contentColumn);
    contentColumn.innerHTML = cnt;

    if (templateName != 'student-list' && templateName != 'dissolution') {
        createFormDialogNew(templateName);
    }

    if (templateName === 'sessions-list') {
        const columns = [
            { label: 'Title', fieldname: 'title' },
            { label: 'Issue Date', fieldname: 'issue_date' },
            { label: 'Expiration Date', fieldname: 'expiration_date' }
        ];
        await populateTable('Class Session', contentColumn, columns);
    } else if (templateName == "continuous-exam-list") {
        const columns = [
            { label: 'Title', fieldname: 'title' },
            { label: 'Type', fieldname: 'type' },
            { label: 'Date', fieldname: 'date' }
        ];
        await populateTable('Class Continuous Exam', contentColumn, columns);
    } else if (templateName == "assignment-list") {
        const columns = [
            { label: 'Title', fieldname: 'title' },
            { label: 'From Date', fieldname: 'from_date' },
            { label: 'Percentage', fieldname: 'percentage' },
            { label: 'Total in final Score', fieldname: 'total_in_final_score' }
        ];
        await populateTable('Assignments and Tasks', contentColumn, columns);
    } else if (templateName == "exam-schedule") {
        const columns = [
            { label: 'Date', fieldname: 'date' },
            { label: 'Time', fieldname: 'time' },
        ];
        await populateTable('Exam Schedule', contentColumn, columns);
    } else if (templateName == "attendance-entry") {
        const columns = [
            { label: 'Date', fieldname: 'date' },
            { label: 'Presented Module', fieldname: 'module' }
        ];
        await populateTable('Student Attendance Entry', contentColumn, columns);
    } else if (templateName == "time-table") {
        const columns = [
            { label: 'Day', fieldname: 'day' },
            { label: 'Start', fieldname: 'start' },
            { label: 'Finish', fieldname: 'finish' }
        ];
        await populateTable('Class Timetable', contentColumn, columns);
    } else if (templateName == "student-list") {
        populateStudents(contentColumn);
    }

}