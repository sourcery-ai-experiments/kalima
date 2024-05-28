# Copyright (c) 2024, e2next and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import json

class GroupClass(Document):
    pass


@frappe.whitelist()
def fetch_students(selected_modules, department):
    if not selected_modules or not department:
        frappe.throw("Please select at least one module and ensure department is selected.")

    selected_modules = frappe.parse_json(selected_modules)

    if not selected_modules:
        frappe.throw("No modules selected.")

    # Prepare the SQL query to fetch students who do not have any of the selected modules
    placeholders = ','.join(['%s'] * len(selected_modules))
    query = f"""
        SELECT student.name, student.full_name_in_arabic
        FROM `tabStudent` AS student
        WHERE student.final_selected_course = %s
        AND student.name NOT IN (
            SELECT enrolled.parent
            FROM `tabStudent Enrolled Modules` AS enrolled
            WHERE enrolled.module IN ({placeholders})
        )
    """

    # Combine department and selected modules as query parameters
    query_params = [department] + selected_modules

    # Execute the query
    students = frappe.db.sql(query, query_params, as_dict=True)

    return students

@frappe.whitelist()
def create_classes(group_class_doc,group_class_modules,students):
	group_class_modules = json.loads(group_class_modules)
	for module in group_class_modules:
		# Convert the group_class_doc to a dictionary
		group_class_doc = json.loads(group_class_doc)
		students = json.loads(students)
  
		create_class(group_class_doc["group_title"],module,group_class_doc["year"],group_class_doc["stage"],group_class_doc["semester"],group_class_doc["department"],students)

def create_class(group_title,module,year,stage,semester,department,students):

	new_class = frappe.get_doc({"doctype":"Classes", 
								"title": group_title + " - " + module, 
								"stage":stage,
								"semester": semester,
								"module": module, 
								"year": year, 
								"department": department,
								})
	for std in students:
		new_class.append("student_list", {"student": std})

	new_class.save()