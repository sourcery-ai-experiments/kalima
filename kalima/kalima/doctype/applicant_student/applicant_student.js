// Copyright (c) 2024, e2next and contributors
// For license information, please see license.txt

frappe.ui.form.on("Applicant Student", {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(__('Admit Student'), function () {
                let d = new frappe.ui.Dialog({
                    title: 'Enter details',
                    fields: [
                        {
                            label: 'Department',
                            fieldname: 'department',
                            fieldtype: 'Link',
                            options: "Faculty Department",
                            reqd: 1,
                            get_query: function () {
                                return {
                                    filters: [
                                        ['name', 'in', frm.doc.prefered_departments.map(dept => dept.department)]
                                    ]
                                };
                            }
                        },
                        {
                            label: 'Study System',
                            fieldname: 'study_system',
                            fieldtype: 'Select',
                            options: "Morning\nEvening",
                            reqd: 1,
                        }
                    ],
                    size: 'small', // small, large, extra-large 
                    primary_action_label: 'Admit',
                    primary_action(values) {

                        var progressIndicator = frappe.show_progress('Loading..', 70, 100, 'Please wait');

                        frappe.call({
                            method: "kalima.kalima.doctype.applicant_student.applicant_student.admit_student",
                            args: {
                                doc_name: cur_frm.doc.name,
                                department: values["department"],
                                study_system: values["study_system"]
                            },
                            callback: function (response) {
                                if (response.message) {
                                    progressIndicator.hide();
                                    frappe.msgprint(__('Student document {0} created successfully.', [response.message]));
                                }
                            }
                        });
                        d.hide();
                    }
                });

                d.show();
            }).addClass('bg-success', 'text-white').css({
                "color": "white",
            });
        }
    },
    validate(frm) {
        if (frm.doc.prefered_departments.length > 4) {
            frappe.throw(__('You can Only Select 4 departments'))
        }
    },
});
