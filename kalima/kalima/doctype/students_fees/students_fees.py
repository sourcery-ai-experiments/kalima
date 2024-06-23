
from frappe.model.document import Document
import frappe
from frappe.model.docstatus import DocStatus
from frappe.utils import nowdate


class StudentsFees(Document):
	# def on_submit(doc):
	def create_invoices(doc):
		# doc = frappe.get_doc("Students Fees",docname)
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
   
		current_date = nowdate()
		doc.transfer_date = current_date
		doc.save()
   
   
	# def on_cancel(doc):
	def cancel_invoices(doc):
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
			
		doc.transfer_date = None
		doc.save()
   
   
   
@frappe.whitelist()
def create_invoices(docname):
    doc = frappe.get_doc("Students Fees", docname)
    doc.create_invoices()
    
    
   
@frappe.whitelist()
def cancel_invoices(docname):
    doc = frappe.get_doc("Students Fees", docname)
    doc.cancel_invoices()