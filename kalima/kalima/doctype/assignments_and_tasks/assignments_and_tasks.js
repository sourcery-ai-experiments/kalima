frappe.ui.form.on("Assignments and Tasks", {
	refresh: function(frm) {
		// This function is called when the form is refreshed
		frm.fields_dict['assignment_marks'].grid.wrapper.on('change', 'input[data-fieldname="score"]', function(e) {
			// Get the current row
			let $row = $(this).closest('.grid-row');
			let row = frm.fields_dict['assignment_marks'].grid.grid_rows[$row.index()].doc;

			// Calculate the net score
			let net_score = calculateNetScore(frm,row);

			// Set the net score in the row
			frappe.model.set_value(row.doctype, row.name, 'net_score', net_score);
		});
	}
});

// Function to calculate the net score
function calculateNetScore(frm,row) {
	return (row.score / frm.doc.marked_on) * frm.doc.percentage;
}
