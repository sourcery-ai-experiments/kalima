import frappe
import json

@frappe.whitelist()
def get_classes_for_teacher(teacher_name):
    classes = frappe.get_all("Class Teachers", filters={"teacher": teacher_name}, fields=["parent"])
    class_names = [cls["parent"] for cls in classes]
    return class_names


@frappe.whitelist()
def get_student_attendance(student_name):
    # Define the SQL query
    query = """
        SELECT sae.*,sad.*
        FROM `tabStudent Attendance Entry` sae
        JOIN `tabAttednance` sad
        ON sae.name = sad.parent
        WHERE sad.student = %s
        ORDER BY sae.date DESC
    """
    
    # Execute the SQL query
    records = frappe.db.sql(query, (student_name,), as_dict=True)
    # for r in records:
    return records


@frappe.whitelist()
def get_current_user_student():
    user = frappe.session.user
    student = frappe.get_all('Student', filters={'user': user}, fields=['name', ])
    return student[0] if student else None

@frappe.whitelist()
def submit_student_results(student_results):

    student_results = json.loads(student_results)
    for result in student_results:
        doc = frappe.get_doc({
            'doctype': 'Student Exam Result',
            
            'prototype': result["prototype"],
            'student': result["student_name"],
            'module': result["module"],
            'teacher': result["teacher"],
            
            'exam_max_result': result["exam_mark"],
            'result':result["final_result"],
            'status': result["status"],
            'cheating': 0 if result["cheating"] == "No" else 1,
            'present': 1 if result["cheating"] == "Yes" else 1,
        })
        doc.insert()
        doc.submit()
        
    return "Results submitted successfully"
