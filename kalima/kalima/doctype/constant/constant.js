// Copyright (c) 2024, e2next and contributors
// For license information, please see license.txt

frappe.ui.form.on("Constant", {
	type(frm) {
        if(frm.doc.type === "Percentage")
            {
                frm.set_value("amount",null);
                frm.refresh_field("amount");

            }else{
                frm.set_value("percentage",null);
                frm.refresh_field("percentage");

            }


	},
});
