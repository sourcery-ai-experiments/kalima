frappe.ui.form.on("Dormitory", {
    async hostel(frm) {
        if (frm.doc.hostel) {
            var hostel = await frappe.db.get_doc("Hostel", frm.doc.hostel);

            // frappe.model.clear_table('rooms');
            let options = [];

            hostel.rooms_list.forEach(element => {
                options.push(element.title);
            });
            frm.set_df_property("room", 'options', options.join('\n'));
            frm.refresh_field("room");
        }
    }
});


