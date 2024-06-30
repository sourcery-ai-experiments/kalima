# Copyright (c) 2024, e2next and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ClassContinuousExam(Document):
	def after_insert(doc):
		for std in doc.continuous_exam_result:
			new_doc = frappe.get_doc({
				'doctype': 'Student Result Log',
	
				'type': 'Class Continuous Exam',
    
				'student': std.student_name,

				'title': doc.title,
				'score': doc.score,
				'continuous_exam_type': doc.type,
				'midterm': doc.midterm,
				'date': doc.date,
				'cexams': doc.c_exams,
        		'class': getattr(doc, 'class', None), 
				'marked_on': doc.marked_on,
				'percentage': doc.percentage,
    
				'student_code': std.student_code,
				'present': 1 if std.is_absent == 0 else 0,

				'department': std.department,
				'net_score': std.net_score,
				'continuous_score': std.score,
				'description': std.description,

			})
	
		
		new_doc.insert()
		new_doc.submit()

