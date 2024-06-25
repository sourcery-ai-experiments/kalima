frappe.pages['student-result-entry'].on_page_load = function(wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Student Result Entry',
        single_column: true
    });

    // Create a form container
    let form = new frappe.ui.FieldGroup({
        fields: [
            {
                fieldtype: 'Link',
                fieldname: 'Prototype',
                label: 'Prototype',
                options: 'Question Prototype', // Replace 'Doctype' with the actual doctype you want to link to
                read_only: 0,
                onchange: function() {
                    let prototype = form.get_value('Prototype');
                    if (prototype) {
                        // Get the module and teacher from the selected Prototype
                        frappe.db.get_doc('Question Prototype', prototype).then(doc => {
                            form.set_value('module', doc.module);
                            form.set_value('teacher', doc.teacher);

                            // Get the stage and department from the selected module
                            frappe.db.get_doc('Presented Module', doc.module).then(module_doc => {
                                form.set_value('stage', module_doc.stage);
                                let department = module_doc.department;
                                
                                // Fetch students with the same stage and department
                                fetch_students(module_doc.stage, department);
                            });
                        });
                    }
                }
            },
            {
                fieldtype: 'Link',
                fieldname: 'module',
                label: 'Module',
                options: 'Presented Module', // Replace 'Doctype' with the actual doctype you want to link to
                read_only: 1
            },
            {
                fieldtype: 'Link',
                fieldname: 'teacher',
                label: 'Teacher',
                options: 'Employee', // Replace 'Doctype' with the actual doctype you want to link to
                read_only: 1
            },
            {
                fieldtype: 'Data',
                fieldname: 'stage',
                label: 'Stage',
                read_only: 1
            },
            {
                fieldtype: 'Data',
                fieldname: 'round',
                label: 'Round',
                read_only: 1
            },
        ],
        body: page.body
    });

    form.make();

    // Function to fetch students and display them in a table
    function fetch_students(stage, department) {
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Student',
                filters: {
                    'stage': stage,
                    'final_selected_course': department
                },
                fields: ['name', 'stage', 'final_selected_course']
            },
            callback: function(response) {
                if (response.message) {
                    let students = response.message;
                    display_students(students);
                }
            }
        });
    }

    // Function to display students in a Bootstrap table
    function display_students(students) {
        let table_html = `
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Stage</th>
                        <th>Department</th>
                        <th>Extra Column 1</th>
                        <th>Extra Column 2</th>
                    </tr>
                </thead>
                <tbody>
        `;

        students.forEach(student => {
            table_html += `
                <tr>
                    <td>${student.name}</td>
                    <td>${student.student_name}</td>
                    <td>${student.stage}</td>
                    <td>${student.department}</td>
                    <td>Extra Data 1</td>
                    <td>Extra Data 2</td>
                </tr>
            `;
        });

        table_html += `
                </tbody>
            </table>
        `;

        // Append the table to the page
        // let table_container = document.createElement('div');
        // table_container.innerHTML = table_html;
        // page.body.appendChild(table_container);

		var $container = $(wrapper).find('.layout-main-section');
		$container.html(table_html);
	
    }
}
