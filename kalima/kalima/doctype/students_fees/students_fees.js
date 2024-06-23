

frappe.ui.form.on("Students Fees", {
    refresh(frm) {
        frm.set_query("item", () => ({
            "filters": {
                "is_stock_item":0,
            }
        }));
        frm.add_custom_button(__('Fetch Student'), async function () {
            var students = await frappe.db.get_list('Student', {
                filters: [
                    ['year', '=', frm.doc.year],
                    ['stage', '=', frm.doc.stage],
                    ['semester', '=', frm.doc.semester],
                    ['study_system', '=', frm.doc.study_system],
                    ['fee_category', '=', frm.doc.fee_category],
                ],
                fields: ['name', 'full_name_in_arabic', 'discount'],
                // start: 10,
                // page_length: 20,
                // as_list: True
            });
            var temp_list = [];

            for (let element of students) {
                var discount_value = await frappe.db.get_value("Constant", element.discount, 'amount');
                temp_list.push({
                    student: element.name,
                    study_type: frm.doc.study_system,
                    discount_type: element.discount,
                    amount: frm.doc.fee_amount,
                    amount_after_discount: frm.doc.fee_amount - discount_value.message.amount,
                });
            }
            frm.set_value('students_fees', temp_list);
            frm.refresh_field('students_fees');
            var total_amount = 0;
            frm.doc.students_fees.forEach(element => {

                total_amount += element.amount_after_discount;
            });

            frm.set_value('total_amount', total_amount);
            frm.refresh_field('total_amount');

        }).addClass('bg-success', 'text-white').css({
            "color": "white",
        });

    },
});

