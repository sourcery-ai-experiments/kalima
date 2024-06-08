# Copyright (c) 2024, e2next and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
import frappe


class Outgoing(Document):
	def on_submit(doc):
     
		new_incoming = frappe.get_doc({
				"doctype":"Incoming",
				"outgoing":doc.name,
				"document_number":doc.document_number,
				"receiving_date":doc.date,
				# "document_receivers":doc.document_receivers,
			})
		for rec in doc.document_receivers:
			new_incoming.append("document_receivers", rec)
		new_incoming.insert()
  
		# for rec in doc.document_receivers:
		# 	if(rec.department != None):
				
		# 		# get the leader
		# 		#create new incoming
		# 		# make notification
		# 		pass