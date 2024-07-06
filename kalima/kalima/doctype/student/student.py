# Copyright (c) 2024, e2next and contributors
# For license information, please see license.txt
from frappe.utils.password import update_password
import frappe
from frappe.model.document import Document


class Student(Document):
    
	def after_insert(doc):
		print(doc.customer)
		print(doc.user)
		if((doc.customer == None or doc.customer == "") and (doc.user == None or doc.user == "")):
			# Generate email address
			email_prefix = doc.english_student_full_name.replace(" ", "").lower()
			custom_email_domain = "Kalima.com"
			email = f"{email_prefix}@{custom_email_domain}"

			# Create a new user
			user_doc = frappe.get_doc(
				{
					"doctype": "User",
					"email": (
						email
						if (doc.email == None or doc.email == "")
						else doc.email
					),
					"first_name": doc.first_name,
					"last_name": doc.last_name,
					"roles": [{"role": "Student"}],
				}
			)
			user_doc.save()

			customer = frappe.get_doc(
				{
					"doctype": "Customer",
					"customer_name": doc.full_name_in_arabic,
					"customer_type": "Individual",
					"customer_group": "Individual",
					"territory": "All Territories",
					"portal_users": [{"user": user_doc.name}],
				}
			)
			customer.insert()
   
			doc.customer = customer.name
			doc.user = user_doc.name
			doc.save()

					
    
	def before_save(doc):
		if(len(doc.ministry_exam_results) > 0):
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

