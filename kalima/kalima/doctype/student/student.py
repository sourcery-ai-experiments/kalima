# Copyright (c) 2024, e2next and contributors
# For license information, please see license.txt
from frappe.utils.password import update_password
import frappe
from frappe.model.document import Document


class Student(Document):
	def before_save(doc):
		ttl=0
		for r in doc.ministry_exam_results:
			ttl += r.mark
   
		doc.total = ttl
		doc.final_average = ttl/len(doc.ministry_exam_results)
			

	def after_save(doc):
		# user = frappe.get_doc("User", doc.user)
		if(doc.password != None and doc.password != ""):
			if(doc.password == doc.confirm_password):
				update_password(doc.user, doc.password)
				frappe.db.commit()
			else:
				frappe.throw("Passwords do not match")

