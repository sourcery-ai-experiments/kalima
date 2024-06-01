# Copyright (c) 2024, e2next and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ApplicantStudent(Document):
	pass

@frappe.whitelist()
def admit_student(doc_name,department):
    # Get the "Applicant Student" document
    applicant_doc = frappe.get_doc("Applicant Student", doc_name)

    # Get meta information for "Student" doctype
    student_meta = frappe.get_meta("Student")

    # Create a new "Student" document
    student_doc = frappe.new_doc("Student")
    
    # Iterate through fields in the "Applicant Student" document
    for field in applicant_doc.meta.fields:
        fieldname = field.fieldname
        
        # Only set the field if it exists in the "Student" DocType
        if student_meta.has_field(fieldname):
            student_doc.set(fieldname, applicant_doc.get(fieldname))
    
    customer = frappe.get_doc({
        "doctype": "Customer",
        "customer_name": student_doc.full_name_in_arabic,
        "customer_type": "Individual",
        "customer_group": "Individual",
        "territory": "All Territories",
    })
    customer.insert()
    
    student_doc.customer = customer.name
    student_doc.final_selected_course = department
    student_doc.save()

    
    return student_doc.name
