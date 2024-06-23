import frappe
from frappe.model.document import Document
from frappe import _
from datetime import datetime, date, time

class ExamHallDistribution(Document):
    def before_save(self):
        self.validate_time_overlap()

    def validate_time_overlap(self):
        # Get all existing records with the same classroom
        existing_records = frappe.get_all('Exam Hall Distribution',
                                          filters={'classroom': self.classroom},
                                          fields=['name', 'from_date', 'to_date', 'from_time', 'to_time'])

        for record in existing_records:
            # Skip the current record
            if record.name == self.name:
                continue

            # Fetch the current and record days from the child table
            current_days = {d.day for d in self.days}
            rcd = frappe.get_doc('Exam Hall Distribution', record.name)
            record_days = {d.day for d in rcd.days}
            print("record_days")
            print(current_days)
            print(record_days)
            
            # Check if there is an intersection of days
            if current_days & record_days:
                # Convert string dates to datetime.date objects
                current_from_date = datetime.strptime(str(self.from_date), '%Y-%m-%d').date()
                current_to_date = datetime.strptime(str(self.to_date), '%Y-%m-%d').date()
                record_from_date = datetime.strptime(str(record['from_date']), '%Y-%m-%d').date()
                record_to_date = datetime.strptime(str(record['to_date']), '%Y-%m-%d').date()

                # Convert string times to datetime.time objects
                current_from_time = datetime.strptime(str(self.from_time), '%H:%M:%S').time()
                current_to_time = datetime.strptime(str(self.to_time), '%H:%M:%S').time()
                record_from_time = datetime.strptime(str(record['from_time']), '%H:%M:%S').time()
                record_to_time = datetime.strptime(str(record['to_time']), '%H:%M:%S').time()

                # Combine dates with times
                current_from_datetime = datetime.combine(current_from_date, current_from_time)
                current_to_datetime = datetime.combine(current_to_date, current_to_time)
                record_from_datetime = datetime.combine(record_from_date, record_from_time)
                record_to_datetime = datetime.combine(record_to_date, record_to_time)

                # Check if the date ranges overlap
                if (current_from_datetime <= record_to_datetime and current_to_datetime >= record_from_datetime):
                    frappe.throw(_("Time overlap with existing record {0}").format(record.name))