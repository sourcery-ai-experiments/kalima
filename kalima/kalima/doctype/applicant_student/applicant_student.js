// Copyright (c) 2024, e2next and contributors
// For license information, please see license.txt

frappe.ui.form.on("Applicant Student", {
    refresh(frm) {

    },
    validate(frm) {
        if (frm.doc.prefered_departments.length > 4) {
            frappe.throw(__('You can Only Select 4 departments'))
        }
    },
});
