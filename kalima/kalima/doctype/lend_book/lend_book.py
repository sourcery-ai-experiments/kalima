
from frappe.model.document import Document
from kalima.utils.utils import fines

class LendBook(Document):
    # pass
	def before_save(doc):
		fines()

