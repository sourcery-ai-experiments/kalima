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

    # Convert selected_modules to a tuple for SQL query
    selected_modules_tuple = tuple(selected_modules)

    # SQL to get all prerequisites for the selected modules
    prerequisites_query = """
        SELECT DISTINCT module
        FROM `tabPrerequisites Modules`
        WHERE parent IN %s
    """

    prerequisites = frappe.db.sql(prerequisites_query, (selected_modules_tuple,), as_dict=True)
    prerequisites_modules = [row['module'] for row in prerequisites]

    # Prepare the base SQL query to fetch students
    base_query = """
        SELECT student.name, student.full_name_in_arabic
        FROM `tabStudent` AS student
        WHERE student.final_selected_course = %s
    """
    query_params = [department]

    if prerequisites_modules:
        # Convert prerequisites_modules to a tuple for SQL query
        prerequisites_modules_tuple = tuple(prerequisites_modules)

        # Extend the query to include the prerequisite filter considering "Completed" status
        base_query += """
            AND student.name IN (
                SELECT enrolled.parent
                FROM `tabStudent Enrolled Modules` AS enrolled
                WHERE enrolled.module IN %s
                AND enrolled.status = 'Completed'
                GROUP BY enrolled.parent
                HAVING COUNT(DISTINCT enrolled.module) = %s
            )
        """
        query_params.extend([prerequisites_modules_tuple, len(prerequisites_modules)])

    # Execute the query
    students = frappe.db.sql(base_query, query_params, as_dict=True)

    return students

@frappe.whitelist()
def create_classes(group_title,year,stage,semester,department,group_class_modules,students):
    group_class_modules = json.loads(str(group_class_modules))
    for module in group_class_modules:
        # Convert the group_class_doc to a dictionary
        # group_class_doc = json.loads(str(group_class_doc))
        students = json.loads(str(students))

        create_class(group_title,
                     module,
                     year,
                     stage,
                     semester,
                     department,
                     students)

    return "Classes created successfully."

def create_class(group_title,module,year,stage,semester,department,students):

	new_class = frappe.get_doc({"doctype":"Class", 
								"title": group_title + " - " + module, 
								"stage":stage,
								"semester": semester,
								"module": module, 
								"year": year, 
								"department": department,
								})
	for std in students:
		new_class.append("student_list", {"student": std})
  
		stud = frappe.get_doc("Student",std)
		stud.append("enrolled_modules",{
			"module":module,
			"status":"Ongoing",
		})
		stud.save()

	new_class.save()