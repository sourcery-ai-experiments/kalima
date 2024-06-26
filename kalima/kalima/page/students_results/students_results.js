
frappe.pages['students-results'].on_page_load = function (wrapper) {
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
				fieldname: 'department',
				label: 'Department',
				options: 'Faculty Department', // Replace 'Doctype' with the actual doctype you want to link to
				read_only: 0,
			},
			{
				fieldtype: 'Link',
				fieldname: 'module',
				label: 'Module',
				options: 'Presented Module', // Replace 'Doctype' with the actual doctype you want to link to
				read_only: 0
			},
			{
				fieldtype: 'Select',
				fieldname: 'semester',
				label: 'Semester',
				options: "Fall Semester\nSprint Semester\nShort Semester\nAnnual"
			},
			{
				fieldtype: 'Button',
				fieldname: 'fetch_students',
				label: 'Fetch Students',
				click: function () {
					let stage = form.get_value('stage');
					let department = form.get_value('department');
					let semester = form.get_value('semester');
					fetch_students(stage, department, semester);
				}
			},
			{
				fieldtype: 'Column Break',
				fieldname: 'clmn',
				options: 'Presented Module',
			},
		
			{
				fieldtype: 'Select',
				fieldname: 'stage',
				label: 'Stage',
				options: "First Year\nSecond Year\nThird Year\nFourth Year\nFifth Year\nBologna"

			},
			{
				fieldtype: 'Data',
				fieldname: 'round',
				label: 'Round',
			},
			
		],
		body: page.body
	});

	form.make();

	// Function to fetch students and display them in a table
	function fetch_students(stage, department, semester) {
		console.log(stage);
		console.log(department);
		console.log(semester);

		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'Student',
				filters: {
					'stage': stage,
					'semester': semester,
					'final_selected_course': department
				},
				fields: ['name', 'stage', 'final_selected_course']
			},
			callback: function (response) {
				if (response.message) {
					let students = response.message;
					console.log(students);
					display_students(students);
				}
			}
		});
	}

	// Function to display students in a Bootstrap table
	function display_students(students) {
		// Check if a table already exists and remove it
		var $existingTable = $(wrapper).find('.student-table-container');
		if ($existingTable.length) {
			$existingTable.remove();
		}

		let table_html = `
            <div class="student-table-container">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Formative Assessment (40%)</th>
                            <th>Midterm (10%)</th>
                            <th>Final (50%)</th>
                            <th>Curve</th>
                            <th>Attended the Exam</th>
                            <th>Result</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

		students.forEach(student => {
			table_html += `
                <tr>
                    <td>${student.name}</td>
					<td><input type="number" class="form-control final-result" placeholder="Final Result" min="0" max="40" required></td>
					<td><input type="number" class="form-control final-result" placeholder="Final Result" min="0" max="10" required></td>
					<td><input type="number" class="form-control final-result" placeholder="Final Result" min="0" max="50" required></td>
					<td><input type="number" class="form-control final-result" placeholder="Final Result" min="0" max="50" required></td>
					<td>                        
                        <select class="form-control status">
                            <option value="none"></option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </td>             
					<td>                        
                        <select class="form-control status">
                            <option value="none"></option>
                            <option value="Passed">Passed</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </td>
					<td><input type="text" class="form-control final-result" placeholder="Final Result" required></td>

                </tr>
            `;
		});

		table_html += `
                    </tbody>
                </table>
                <button class="btn btn-primary submit-results">Submit Results</button>
            </div>
        `;

		var $container = $(wrapper).find('.layout-main-section');
		$container.append(table_html); // Append the table HTML instead of setting it

		// Add event listener to submit button to collect data and make frappe.call
		$container.find('.submit-results').on('click', function() {



			// let prototype = form.get_value('Prototype');
			// let module = form.get_value('module');
			// let teacher = form.get_value('teacher');
			// let student_results = [];

			// $container.find('tbody tr').each(function() {
			// 	let student_result = {
			// 		student_name: $(this).find('td:eq(0)').text(),
			// 		formative_assessment: $(this).find('td:eq(1) input').val(),
			// 		midterm: $(this).find('td:eq(2) input').val(),
			// 		final: $(this).find('td:eq(3) input').val(),
			// 		curve: $(this).find('td:eq(4) input').val(),
			// 		attended_exam: $(this).find('td:eq(5) select').val(),
			// 		result: $(this).find('td:eq(6) select').val(),
			// 		notes: $(this).find('td:eq(7) input').val(),
			// 		prototype: prototype,
			// 		module: module,
			// 		teacher: teacher
			// 	};
			// 	student_results.push(student_result);
			// });

			// // Make frappe.call to send the data
			// frappe.call({
			// 	method: 'kalima.utils.utils.submit_student_results',
			// 	args: {
			// 		student_results: student_results
			// 	},
			// 	callback: function(response) {
			// 		if (response.message) {
			// 			frappe.msgprint('Results submitted successfully');
			// 			form.clear(); // Reset the form
			// 			var $existingTable = $(wrapper).find('.student-table-container');
			// 			if ($existingTable.length) {
			// 				$existingTable.remove();
			// 			}
			// 		}
			// 	}
			// });
		});
	}
}
