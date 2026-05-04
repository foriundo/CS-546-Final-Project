// main.js
// Client-side JavaScript for NYC Computer Access Finder

document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('report-form');
    const favButton = document.getElementById('fav-btn');

    if (reportForm) {
        reportForm.addEventListener('submit', async(event) => {
            event.preventDefault();

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

    if (favButton) {
        favButton.addEventListener('click', async () => {
            const centerId = favButton.dataset.centerId;
            const response = await fetch(`/centers/${centerId}/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            });

            if (response.ok) {
                if (favButton.textContent.trim() === "Add to favorites") {
                    favButton.textContent = "Remove from Favorites";
                } else {
                    favButton.textContent = "Add to Favorites";
                }
            } else {
                favButton.textContent = "Add to Favorites";
            }
        });
    }
});