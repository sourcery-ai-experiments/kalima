import frappe
import json
from datetime import datetime, timedelta

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
def get_student_results(student_name):
    print(student_name)

    # Define the SQL query
    query = """
        SELECT ser.*
        FROM `tabStudent Exam Result` ser
        WHERE ser.student = %s;
    """
    records = frappe.db.sql(query, (student_name,), as_dict=True)
    print(records)
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



# def fines():
#     pass
#     # get Lend Book records from Lend Book Doctype, 
#     # get the date it was created, and get the field named "borrowing_days"
#     # if day difference from now and the creation time is higher than borrowing_days then :
#     # - create  new "Fines" document, Assign the same book,user
#     # based on the User Type of The Lend Book document, get user_type, 
#     # usert_type options are Undergraduate Student,Master Student,Phd Student,Employee,Teacher,Special
#     # get a setting docuument named Borrowing Limitations
#     # based on the user_type, assign the due date of the new Fine document for example the user type is Undergraduate Student, 
#     # get the undergraduate_student field value of the Setting document, (in days) and set the due date to days from now until the gotten number of days from the settings
    
    
    

def fines():
    # Fetch all Lend Book records
    lend_books = frappe.get_all("Lend Book", fields=["name", "creation", "borrowing_days", "book", "user", "user_type"])
    print("lend_books")
    print(lend_books)
    
    for lend_book in lend_books:
        creation_date = lend_book.get('creation')
        borrowing_days = lend_book.get('borrowing_days') + lend_book.get('extra_period')
        current_date = datetime.now()
        
        # Calculate the difference in days between the current date and the creation date
        day_difference = (current_date - creation_date).d 
        print("day_difference")
        print(day_difference)
        
        # if day_difference > borrowing_days:
        if day_difference <= int(borrowing_days):
            user_type = lend_book.get('user_type')
            
            # Fetch Borrowing Limitations settings
            borrowing_limitations = frappe.get_single("Borrowing Limitations")
            
            # Get the number of days for the due date based on the user type
            if user_type == "Undergraduate Student":
                due_days = borrowing_limitations.undergraduate_student
            elif user_type == "Master Student":
                due_days = borrowing_limitations.master_student
            elif user_type == "Phd Student":
                due_days = borrowing_limitations.phd_student
            elif user_type == "Employee":
                due_days = borrowing_limitations.employee
            elif user_type == "Teacher":
                due_days = borrowing_limitations.teacher
            elif user_type == "Special":
                due_days = borrowing_limitations.special
            else:
                due_days = 0 # Default to 0 if user type is not recognized
            
            due_date = current_date + timedelta(days=due_days)
            
            # Create a new Fine document
            fine_doc = frappe.get_doc({
                "doctype": "Fines",
                "book": lend_book.get('book'),
                "user": lend_book.get('user'),
                "status":"Unpaid",
                "amount":lend_book.get('fine_amount'),
                "due_date": due_date
            })
            fine_doc.insert()
            frappe.db.commit()