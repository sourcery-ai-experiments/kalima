// Copyright (c) 2024, e2next and contributors
// For license information, please see license.txt

frappe.ui.form.on("Student", {
	refresh(frm) {

		frm.fields_dict['ministry_exam_results'].grid.wrapper.on('change', 'input[data-fieldname="mark"]', function(e) {

            var ttl = 0;
            frm.doc.ministry_exam_results.forEach(element => {
                ttl+= element.mark;
                
            });
            frm.doc.total = ttl;
            frm.doc.average = ttl/frm.doc.ministry_exam_results.length;

			frm.set_value( 'total', ttl);
			frm.set_value( 'final_average', ttl/frm.doc.ministry_exam_results.length);

            frm.refresh_field('total');
            frm.refresh_field('final_average');
		});

	},
});
