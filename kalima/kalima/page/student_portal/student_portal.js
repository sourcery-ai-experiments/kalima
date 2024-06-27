var selected_student = "Abdullah Alshehab";
var selectedTeacher;
var current_class;// = await frappe.db.get_doc("Class", selected_class,fields=["student_list"]);
var naming_maps = {};

frappe.pages['student-portal'].on_page_load = async function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Student Portal',
        single_column: true
    });
    var main_template = frappe.render_template('student_portal', {
        teacher_name: "test"
    }, page.main);
    var $container = $(wrapper).find('.layout-main-section');
    $container.html(main_template);

    await get_current_user_student();
    await content_manager();
}

async function content_manager(dont_click = false) {
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
            var templateName = "basic";//this.textContent.replace(/\s+/g, '-').toLowerCase(); // Convert button text to lowercase and replace spaces with dashes
            var template = this.textContent.replace(/\s+/g, '-').toLowerCase(); // Convert button text to lowercase and replace spaces with dashes
            var cnt = frappe.render_template(templateName, {}, contentColumn);
            contentColumn.innerHTML = cnt;

            // if (templateName != 'student-list' && templateName != 'dissolution') {
            //     createFormDialogNew(templateName);
            // }
            // console.log("ggggg");

            if (template === 'attendance') {
                const columns = [
                    { label: 'Date', fieldname: 'date' },
                    { label: 'Module', fieldname: 'module' },
                    { label: 'Status', fieldname: 'status' },
                    { label: 'Leave', fieldname: 'leave' }
                ];
                await atteendance(contentColumn, columns);
                // await populateTable('Student Attendance Entry', contentColumn, columns);
            }
            // else if (templateName == "continuous-exam-list") {
            //     const columns = [
            //         { label: 'Title', fieldname: 'title' },
            //         { label: 'Type', fieldname: 'type' },
            //         { label: 'Date', fieldname: 'date' }
            //     ];
            //     await populateTable('Class Continuous Exam', contentColumn, columns);
            // } else if (templateName == "assignment-list") {
            //     const columns = [
            //         { label: 'Title', fieldname: 'title' },
            //         { label: 'From Date', fieldname: 'from_date' },
            //         { label: 'Percentage', fieldname: 'percentage' },
            //         { label: 'Total in final Score', fieldname: 'total_in_final_score' }
            //     ];
            //     await populateTable('Assignments and Tasks', contentColumn, columns);
            // } else if (templateName == "exam-schedule") {
            //     const columns = [
            //         { label: 'Date', fieldname: 'date' },
            //         { label: 'Time', fieldname: 'time' },
            //     ];
            //     await populateTable('Exam Schedule', contentColumn, columns);
            // } else if (templateName == "attendance-entry") {
            //     const columns = [
            //         { label: 'Date', fieldname: 'date' },
            //         { label: 'Presented Module', fieldname: 'module' }
            //     ];
            //     await populateTable('Student Attendance Entry', contentColumn, columns);
            // } else if (templateName == "time-table") {
            //     const columns = [
            //         { label: 'Day', fieldname: 'day' },
            //         { label: 'Start', fieldname: 'start' },
            //         { label: 'Finish', fieldname: 'finish' }
            //     ];
            //     await populateTable('Class Timetable', contentColumn, columns);
            // } else if (templateName == "student-list") {
            //     populateStudents(contentColumn);
            // }


        });
    });

    if (!dont_click) {
        document.querySelectorAll('.first-button').forEach(btn => {
            btn.click();
        });
    }
}


async function get_current_user_student() {
    let response = await frappe.call({
        method: 'kalima.utils.utils.get_current_user_student',
    });
    console.log("response.message");
    console.log(response.message);

    if (response.message) {
        selected_student = response.message.name;
    }
}

async function atteendance(container, columns) {
    // Fetch data from Frappe
    var data = await frappe.call({
        method: 'kalima.utils.utils.get_student_attendance',
        args: {
            student_name: selected_student
        },
        callback: function (r) {
            if (r.message) {
                console.log(r.message);
            }
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


    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // Populate table rows
    data.message.forEach((row, index) => {
        console.log("row");
        console.log(row["leave"]);
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
            if (col.fieldname != "leave") {
                td.textContent = row[col.fieldname] || '';
            } else {
                if (td.textContent == 0)
                    td.textContent = "No";
                else
                    td.textContent = "No";

            }
            tr.appendChild(td);
        });


        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}