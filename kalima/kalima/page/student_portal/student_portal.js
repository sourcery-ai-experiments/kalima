var selected_class;
var selectedTeacher;
var current_class;// = await frappe.db.get_doc("Class", selected_class,fields=["student_list"]);
var naming_maps = {};

frappe.pages['student-portal'].on_page_load = async function(wrapper) {
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

    await teacher_field(page);
    await content_manager();
}

async function teacher_field(page) {
    const teacherSelector = frappe.ui.form.make_control({
        parent: page.wrapper.find('#teacher-holder'),
        df: {
            fieldtype: "Link",
            options: "Student",
            fieldname: "employee",
            label: __("Student"),
            placeholder: __("Student"),
            // default: "HR-EMP-00001",

            reqd: 1,
            // change: async () => {
            //     selectedTeacher = teacherSelector.get_value();
            //     await class_field(page, selectedTeacher);
            // }
        }
    });
    teacherSelector.set_value("HR-EMP-00001");
    teacherSelector.refresh();
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
            var cnt = frappe.render_template(templateName, {}, contentColumn);
            contentColumn.innerHTML = cnt;

            // if (templateName != 'student-list' && templateName != 'dissolution') {
            //     createFormDialogNew(templateName);
            // }

            // if (templateName === 'sessions-list') {
            //     const columns = [
            //         { label: 'Title', fieldname: 'title' },
            //         { label: 'Issue Date', fieldname: 'issue_date' },
            //         { label: 'Expiration Date', fieldname: 'expiration_date' }
            //     ];
            //     await populateTable('Class Session', contentColumn, columns);
            // } else if (templateName == "continuous-exam-list") {
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
