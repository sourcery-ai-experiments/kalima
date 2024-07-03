// Copyright (c) 2024, e2next and contributors
// For license information, please see license.txt

frappe.ui.form.on("Activity", {
	refresh(frm) {

	},
    async activity_execution(frm) {
        frm.clear_table('requirements');

        var req = await frappe.db.get_doc("Activity Coordination",frm.doc.activity_execution);
        req.activity_requirements.forEach(element => {
            var new_row = frm.add_child('requirements', {
                'material': element.material,
                'quantitiy': element.quantitiy,
            });

            
        });
        frm.refresh_field('requirements');

    }
});
