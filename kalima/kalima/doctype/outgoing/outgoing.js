
frappe.ui.form.on("Outgoing", {
    async refresh(frm) {
        if (!frm.is_new()) {
            frm.add_custom_button(__('Fetch Receivers'), async function () {
                if (frm.doc.receivers_type == "Students") {
                    await getEntitiesAndShowDialog("Student", ["name"], "name", "receive_student", "student");
                } else if (frm.doc.receivers_type == "Teachers") {
                    await getEntitiesAndShowDialog("Employee", ["name", "employee_name"], "employee_name", "receive_teachers", "teacher");
                } else if (frm.doc.receivers_type == "Departments") {
                    
                    var all_students = await frappe.db.get_list("Faculty Department", {
                        fields: ['name', 'arabic_title']
                    });
                    console.log(all_students);

                    var fields = [];
                    let student_count = all_students.length;
                    let column_count = Math.ceil(student_count / 3);

                    all_students.forEach((element, index) => {
                        let column_break = index % column_count === 0 ? {
                            fieldname: `column_break_${index}`,
                            fieldtype: "Column Break"
                        } : null;

                        if (column_break) {
                            fields.push(column_break);
                        }

                        fields.push({
                            fieldname: element.name,
                            fieldtype: "Check",
                            label: element.arabic_title
                        });
                    });

                    let d = new frappe.ui.Dialog({
                        title: 'Select Students',
                        fields: fields,
                        size: 'large', // small, large, extra-large
                        primary_action_label: 'Add',
                        primary_action(values) {
                            let selected_students = [];
                            let new_child = [];

                            all_students.forEach((student) => {
                                if (values[student.name]) {
                                    selected_students.push(student.name);
                                }
                            });

                            selected_students.forEach((employee_name) => {
                                new_child.push({
                                    department: employee_name
                                });
                            });

                            frm.set_value("departments", new_child);
                            frm.refresh_field('departments');
                            d.hide();
                        }
                    });
                    d.show();
                    // await getEntitiesAndShowDialog("Faculty Department", ["name"], "name", "departments", "departmnet");
                }


                async function getEntitiesAndShowDialog(doctype, fieldsList, labelField, targetField, sub_field) {
                    var all_entities = await frappe.db.get_list(doctype, { fields: fieldsList });

                    console.log(all_entities);

                    var fields = [];
                    let entity_count = all_entities.length;
                    let column_count = Math.ceil(entity_count / 3);

                    all_entities.forEach((element, index) => {
                        let column_break = index % column_count === 0 ? {
                            fieldname: `column_break_${index}`,
                            fieldtype: "Column Break"
                        } : null;

                        if (column_break) {
                            fields.push(column_break);
                        }

                        fields.push({
                            fieldname: element.name,
                            fieldtype: "Check",
                            label: element[labelField]
                        });
                    });

                    let d = new frappe.ui.Dialog({
                        title: `Select ${doctype}`,
                        fields: fields,
                        size: 'large', // small, large, extra-large
                        primary_action_label: 'Add',
                        primary_action(values) {
                            let selected_entities = [];
                            let new_child = [];

                            all_entities.forEach((entity) => {
                                if (values[entity.name]) {
                                    selected_entities.push(entity.name);
                                }
                            });
                            console.log("selected_entities");
                            console.log(selected_entities);
                            selected_entities.forEach((entity_name) => {
                                let child = {};
                                child[sub_field] = entity_name;
                                new_child.push(child);
                            });
                            console.log("new_child");
                            console.log(new_child);
                            // Combine the previous table with the new child entries
                            let combined_data = frm.doc[targetField] || [];
                            combined_data = combined_data.concat(new_child);

                            frm.set_value(targetField, combined_data); 
                            frm.refresh_field(targetField);
                            d.hide();
                        }
                    });

                    d.show();
                }

            }).addClass('bg-success', 'text-white').css({
                "color": "white",
            });
        }

    },
});


// let d = new frappe.ui.Dialog({
//     title: 'Enter details',
//     fields: [
//         {
//             label: 'Department',
//             fieldname: 'department',
//             fieldtype: 'Link',
//             options: "Faculty Department",
//             reqd: 1,
//             get_query: function () {
//                 return {
//                     filters: [
//                         ['name', 'in', frm.doc.prefered_departments.map(dept => dept.department)]
//                     ]
//                 };
//             }
//         }
//     ],
//     size: 'small', // small, large, extra-large
//     primary_action_label: 'Admit',
//     primary_action(values) {

//         frappe.call({
//             method: "kalima.kalima.doctype.applicant_student.applicant_student.admit_student",
//             args: {
//                 doc_name: cur_frm.doc.name,
//                 department: values["department"]
//             },
//             callback: function (response) {
//                 if (response.message) {
//                     frappe.msgprint(__('Student document {0} created successfully.', [response.message]));
//                 }
//             }
//         });
//         d.hide();
//     }
// });

// d.show();