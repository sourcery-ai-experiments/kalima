import frappe

@frappe.whitelist()
def get_classes_for_teacher(teacher_name):
    classes = frappe.get_all("Class Teachers", filters={"teacher": teacher_name}, fields=["parent"])
    class_names = [cls["parent"] for cls in classes]
    return class_names
