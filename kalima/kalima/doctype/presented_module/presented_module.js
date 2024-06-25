frappe.ui.form.on('Presented Module', {
    // Trigger the calculations when the form is loaded or refreshed
    refresh: function(frm) {
        calculate_total_hours(frm);
    },
    
    // Trigger calculations when any field related to hours changes
    number_of_weeks: function(frm) {
        calculate_total_hours(frm);
    },
    hours_per_week: function(frm) {
        calculate_total_hours(frm);
    },
    number_of_weeks_online: function(frm) {
        calculate_total_hours(frm);
    },
    hours_per_week_online: function(frm) {
        calculate_total_hours(frm);
    },
    number_of_weeks_circles: function(frm) {
        calculate_total_hours(frm);
    },
    hours_per_week_circles: function(frm) {
        calculate_total_hours(frm);
    },
    number_of_weeks_training: function(frm) {
        calculate_total_hours(frm);
    },
    hours_per_week_training: function(frm) {
        calculate_total_hours(frm);
    },
    number_of_weeks_practical: function(frm) {
        calculate_total_hours(frm);
    },
    hours_per_week_practical: function(frm) {
        calculate_total_hours(frm);
    },
    number_of_weeks_laboratory: function(frm) {
        calculate_total_hours(frm);
    },
    hours_per_week_laboratory: function(frm) {
        calculate_total_hours(frm);
    }
});

// Function to calculate and update total hours for each section
function calculate_total_hours(frm) {
    // In Class Hours
    let in_class_total = frm.doc.number_of_weeks * frm.doc.hours_per_week || 0;
    frm.set_value('total_hours', in_class_total);
    
    // Online Hours
    let online_total = frm.doc.number_of_weeks_online * frm.doc.hours_per_week_online || 0;
    frm.set_value('total_hours_online', online_total);
    
    // Study Circles
    let circles_total = frm.doc.number_of_weeks_circles * frm.doc.hours_per_week_circles || 0;
    frm.set_value('total_hours_circles', circles_total);
    
    // Training Hours
    let training_total = frm.doc.number_of_weeks_training * frm.doc.hours_per_week_training || 0;
    frm.set_value('total_hours_training', training_total);
    
    // Practical Hours
    let practical_total = frm.doc.number_of_weeks_practical * frm.doc.hours_per_week_practical || 0;
    frm.set_value('total_hours_practical', practical_total);
    
    // Laboratory Hours
    let laboratory_total = frm.doc.number_of_weeks_laboratory * frm.doc.hours_per_week_laboratory || 0;
    frm.set_value('total_hours_laboratory', laboratory_total);
}
