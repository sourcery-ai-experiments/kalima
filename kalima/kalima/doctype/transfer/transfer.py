# Copyright (c) 2024, e2next and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Transfer(Document):
	def on_submit(doc):
		std = frappe.get_doc("Student",doc.student)
		std.study_status = "Transferred from" if doc.transfer_type == "IN" else "Transferred To"
		std.further_information = doc.university
		std.save()
