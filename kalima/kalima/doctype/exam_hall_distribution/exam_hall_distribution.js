frappe.ui.form.on("Exam Hall Distribution", {
    refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(__('Generate Distribution'), function () {
                frappe.call({
                    method: 'kalima.kalima.doctype.exam_hall_distribution.exam_hall_distribution.generate_distro_html',
                    args: {
                        selfname: frm.doc.name
                    },
                    callback: function(r) {
                        if (r.message) {
                            console.log(r.message.html);
                            frm.set_value('distribution', r.message.html);
                            frm.refresh_field('distribution');
                            frm.fields_dict.distribution.$wrapper.html(r.message.html);

                            // Clear existing student_distro table
                            frm.clear_table("student_distro");

                            // Add new student_distro entries
                            r.message.student_distro.forEach(function (distro) {
                                let row = frm.add_child("student_distro");
                                row.student = distro.student;
                                row.column_data = distro.column_data;
                                row.row_data = distro.row_data;
                            });

                            frm.refresh_field("student_distro");
                        }
                    }
                });
            }).addClass('bg-success').css({
                "color": "white",
            });
        }
    },
});
