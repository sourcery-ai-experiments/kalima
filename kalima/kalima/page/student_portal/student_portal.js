var selected_student ;
var selectedTeacher;
var current_class;
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
            var templateName = "basic";
            var template = this.textContent.replace(/\s+/g, '-').toLowerCase();
            var cnt = frappe.render_template(templateName, {}, contentColumn);
            contentColumn.innerHTML = cnt;

            if (template === 'attendance') {
                const columns = [
                    { label: 'Date', fieldname: 'date' },
                    { label: 'Module', fieldname: 'module' },
                    { label: 'Status', fieldname: 'status' },
                    { label: 'Leave', fieldname: 'leave' }
                ];
                await attendance(contentColumn, columns);
            }
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
    if (response.message) {
        selected_student = response.message.name;
    }
}

async function attendance(container, columns) {
    var data = await frappe.call({
        method: 'kalima.utils.utils.get_student_attendance',
        args: {
            student_name: selected_student
        }
    });

    const groupedData = groupBy(data.message, 'module');
    for (const [module, records] of Object.entries(groupedData)) {
        const moduleContainer = document.createElement('div');
        moduleContainer.innerHTML = `<h3>${module}</h3>`;
        container.appendChild(moduleContainer);
        moduleContainer.appendChild(createTable(records, columns));
    }
}

function groupBy(array, key) {
    return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
        return result;
    }, {});
}

function createTable(records, columns) {
    const table = document.createElement('table');
    table.classList.add('table', 'border', 'rounded', 'table-hover');

    const thead = document.createElement('thead');
    const tr = document.createElement('tr');

    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = "#";
    tr.appendChild(th);

    columns.forEach(col => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = col.label;
        tr.appendChild(th);
    });

    thead.appendChild(tr);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    records.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.classList.add('clickable-row');

        tr.addEventListener('click', () => {
            frappe.open_in_new_tab = true;
            frappe.set_route(`/app/student-attendance-entry/${row.name}`);
        });

        const th = document.createElement('th');
        th.scope = 'row';
        th.textContent = index + 1;
        tr.appendChild(th);

        columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = row[col.fieldname] || '';
            if (col.fieldname === 'leave') {
                td.textContent = row[col.fieldname] ? "Yes" : "No";
            }
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    return table;
}
