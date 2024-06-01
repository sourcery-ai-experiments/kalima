# Copyright (c) 2024, e2next and contributors
# For license information, please see license.txt
from frappe.utils.password import update_password
import frappe
from frappe.model.document import Document


class Student(Document):
	def save(doc):
		# user = frappe.get_doc("User", doc.user)
		if(doc.password != None):
			if(doc.password == doc.confirm_password):
				update_password(doc.user, doc.password)
				frappe.db.commit()
			else:
				frappe.throw("Passwords do not match")

