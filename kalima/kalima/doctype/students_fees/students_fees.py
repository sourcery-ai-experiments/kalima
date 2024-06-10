
from frappe.model.document import Document
import frappe


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
				"discount_amount":std.amount-std.amount_after_discount,
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
