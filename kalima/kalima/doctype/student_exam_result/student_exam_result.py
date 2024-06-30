# Copyright (c) 2024, e2next and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class StudentExamResult(Document):
	def on_submit(doc):
		doc = frappe.get_doc({
			'doctype': 'Student Result Log',
   
			'type': 'Student Exam Result',
			
			'prototype': doc.prototype,
			'student': doc.student,
			'module': doc.module,
			'teacher': doc.teacher,
			
			'exam_max_result': doc.exam_max_result,
			'result':doc.result,
			'status': doc.status,
			'cheating': doc.cheating,
			'present': doc.present,
		})
		doc.insert()
		doc.submit()

