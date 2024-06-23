
from frappe.model.document import Document
import frappe
from frappe.model.docstatus import DocStatus


class StudentsFees(Document):
	def on_submit(doc):
		students= doc.students_fees
  
		for std in students:
			student_customer = frappe.db.get_value("Student",std.student,"customer")
			new_invoice = frappe.get_doc({
				"doctype":"Sales Invoice",
				"company":doc.company,
				"cost_center":doc.cost_center,
				"customer":student_customer,
				"custom_student_fee":doc.name,
			})
   
			new_invoice.append("items",{
			"item_code": doc.item,
            "qty": 1,
            "income_account": doc.income_account,
            "company": doc.company,
            "cost_center": doc.cost_center,
            "rate": doc.fee_amount,
			})
   
			new_invoice.insert()
			new_invoice.submit()
   
   
	def on_cancel(doc):
		all_docs = frappe.db.get_list('Sales Invoice',
			filters={
				"docstatus": DocStatus.submitted()
				,"custom_student_fee":doc.name,
			},
			fields=['name'],
		)
		for d in all_docs:
			docu = frappe.get_doc("Sales Invoice",d.name)
			docu.cancel()
			