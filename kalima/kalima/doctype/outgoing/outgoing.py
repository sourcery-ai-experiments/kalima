# Copyright (c) 2024, e2next and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe


class Outgoing(Document):
	def on_submit(doc):
	# def save(doc):
		users = []
		if(doc.receivers_type == "Students"):
			for s in doc.receive_student:
				user = frappe.db.get_value("Student", s.student, "user")
				if(user != "" and user!=None):
					users.append(user)
		elif(doc.receive_teachers == "Teachers"):
			for t in doc.receive_student:
				user = frappe.db.get_value("Employee", t.teacher, "user_id")
				if(user != "" and user!=None):
					users.append(user)
		elif(doc.departments == "Departments"):
			pass

		print(users)
		new_incoming = frappe.get_doc({
				"doctype":"Incoming",
				"outgoing":doc.name,
				"receiving_date":doc.date,
				# "document_receivers":doc.document_receivers,
			})
		for rec in users:
			new_incoming.append("document_receivers", {"user":rec})
  
		new_incoming.insert()
