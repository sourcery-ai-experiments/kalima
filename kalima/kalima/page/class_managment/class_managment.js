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
                        placeholder: __("Class"),
                        get_query(doc, cdt, cdn) {
                            return {
                                filters: [
                                    ['name', 'in', response.message],
                                ]
                            };
                        },
                        reqd: 1
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

		});


	});

	document.querySelectorAll('.first-button').forEach(btn => {
		btn.click();
	});
}