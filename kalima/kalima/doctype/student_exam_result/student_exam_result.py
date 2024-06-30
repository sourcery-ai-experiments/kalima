
import frappe
from frappe.model.document import Document


class StudentExamResult(Document):
    pass
	# def on_submit(doc):
	# 	doc = frappe.get_doc({
	# 		'doctype': 'Student Result Log',
   
	# 		'type': 'Student Exam Result',
			
	# 		'prototype': doc.prototype,
	# 		'student': doc.student,
	# 		'module': doc.module,
	# 		'teacher': doc.teacher,
			
	# 		'exam_max_result': doc.exam_max_result,
	# 		'result':doc.result,
	# 		'status': doc.status,
	# 		'cheating': doc.cheating,
	# 		'present': doc.present,
	# 	})
	# 	doc.insert()
	# 	doc.submit()

