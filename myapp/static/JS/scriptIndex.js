
// Get the mode toggle button
const modeToggle = document.querySelector('.mode');

// Add event listener to toggle dark/light mode
modeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        // Save the user's preference in localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // Check for saved user preference on page load
const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

// for hero-section 

    const animatedBackground = document.querySelector('.animated-background');

    function createCircle() {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        circle.style.left = `${Math.random() * 100}%`;
        circle.style.top = `${Math.random() * 100}%`;
        circle.style.animationDuration = `${Math.random() * 10 + 5}s`;
        circle.style.width = `${Math.random() * 20 + 10}px`;
        circle.style.height = circle.style.width;
        animatedBackground.appendChild(circle);
    }

    // Generate 50 circles
    for (let i = 0; i < 50; i++) {
        createCircle();
    }
