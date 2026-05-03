// main.js
// Client-side JavaScript for NYC Computer Access Finder
// TODO: add AJAX search/filter, form validation, and interactive features

document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('report-form');

    if (reportForm) {
        reportForm.addEventListener('submit', async(SubmitEvent) => {
            SubmitEvent.preventDefault();

            const centerId = document.getElementById('center-id').value;
            const issueType = document.getElementById('issue-types').value;
            const description = document.getElementById('issue').value;
            const successOrFailure = document.getElementById('report-success-failure');
            const response = await fetch(`/centers/${centerId}/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ issueType, description })
            });

            if (response.ok) {
                successOrFailure.textContent = "Report submitted successfully!"
                reportForm.reset();
            } else {
                successOrFailure.textContent = "Error: report submission failed!"
            }
        })
    }
});