# Copyright (c) 2024, e2next and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class AssignmentsandTasks(Document):
	def on_submit(doc):
		for std in doc.assignment_marks:
			new_doc = frappe.get_doc({
				'doctype': 'Student Result Log',
				'type': 'Assignment',
				'student': std.student,
				'title': doc.title,
				'score': std.score,
				'net_score': std.net_score,
				'date': doc.to_date,
        		'class': getattr(doc, 'class', None), 
				'marked_on': doc.marked_on,
				'percentage': doc.percentage,
			})
			
			new_doc.insert()
			new_doc.submit()

