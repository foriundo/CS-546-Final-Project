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
    const reviewForm = document.querySelector( 'form[action*="/reviews"]');

    if (reviewForm) {
        const reviewError = document.getElementById('review-error');
        reviewForm.addEventListener('submit', (event) => {
            const rating = parseInt(reviewForm.querySelector('[name="rating"]').value);
            const comment = reviewForm.querySelector('[name="comment"]').value.trim();

            if (!rating || rating < 1 || rating > 5) {
                event.preventDefault();
                reviewError.textContent = 'Nice try, but rating must be a number between 1 and 5.';
                return;
            }
            if (!comment) {
                event.preventDefault();
                reviewError.textContent = 'Nice try, but you need to add an actual comment.';
                return;
            }
            reviewError.textContent = '';
        });
    }
});