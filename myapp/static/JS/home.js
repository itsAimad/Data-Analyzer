document.addEventListener("DOMContentLoaded", function () {
    const starBackground = document.getElementById("starry-background");
    const greetingSection = document.getElementById("greeting-section");
    const mainContent = document.querySelector("main");
    const nav = document.querySelector("nav");
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");
    const fileNameSpan = document.getElementById("file-name");
    const statsContainer = document.getElementById("stats-container");
    const columnSelect = document.getElementById("column-select");
    const columnMessage = document.getElementById("column-message");
    const graphType = document.getElementById("graph-type");
    const graphInputs = document.getElementById("graph-inputs");
    const graphForm = document.getElementById("graph-form");
    const graphContainer = document.getElementById("graph-container");
    const hiddenFileInput = document.getElementById("hidden-file-input");

    let uploadedFile = null;
    let csvData = [];
    let columns = [];

    // Initially hide the navbar
    nav.classList.add('hidden');

    // Create stars
    function createStar() {
        const star = document.createElement("div");
        star.classList.add("star");
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${Math.random() * 3 + 2}s`;
        star.style.opacity = Math.random();
        starBackground.appendChild(star);

        star.addEventListener("animationend", () => {
            star.remove();
        });
    }

    // Create meteors
    function createMeteor() {
        const meteor = document.createElement("div");
        meteor.classList.add("meteor");
        meteor.style.left = `${Math.random() * 100}%`;
        meteor.style.top = `${Math.random() * 100}%`;
        meteor.style.animationDuration = `${Math.random() * 3 + 2}s`;
        meteor.style.opacity = Math.random();
        starBackground.appendChild(meteor);

        meteor.addEventListener("animationend", () => {
            meteor.remove();
        });
    }

    // Generate stars and meteors continuously
    setInterval(createStar, 1000);
    setInterval(createMeteor, 8000);

    // Greeting Animation
    setTimeout(() => {
        greetingSection.classList.add("fade-out");
        setTimeout(() => {
            greetingSection.remove();
            nav.classList.remove('hidden');
            mainContent.classList.remove("hidden");
            mainContent.classList.add("visible");
        }, 1000);
    }, 2000);

    // Dark/Light Mode Toggle
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        if (body.classList.contains("dark-mode")) {
            themeToggle.textContent = "☀️ Light Mode";
        } else {
            themeToggle.textContent = "🌙 Dark Mode";
        }
    });

    // Handle file drag and drop
    dropZone.addEventListener("dragover", function (e) {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", function () {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", function (e) {
        e.preventDefault();
        dropZone.classList.remove("dragover");

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Handle file input change
    fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Function to handle file upload
    function handleFile(file) {
        uploadedFile = file;
        fileNameSpan.textContent = file.name;

        if (file.name.toLowerCase().endsWith('.csv')) {
            dropZone.classList.remove("file-not-csv");
            dropZone.classList.add("file-uploaded");
        } else {
            dropZone.classList.remove("file-uploaded");
            dropZone.classList.add("file-not-csv");
            alert("Please upload a valid CSV file.");
            return;
        }

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        hiddenFileInput.files = dataTransfer.files;

        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            const { columns: extractedColumns, data } = parseCSV(text);
            columns = extractedColumns;
            csvData = data;

            populateColumnSelect(columns);
            populateDropdowns();
        };
        reader.readAsText(file);

        uploadFile(file);
    }

    // Function to parse CSV and extract column names and data
    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const columns = lines[0].split(',');
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length === columns.length) {
                const row = {};
                columns.forEach((col, index) => {
                    row[col] = values[index];
                });
                data.push(row);
            }
        }

        return { columns, data };
    }

    // Function to populate the <select> element with columns
    function populateColumnSelect(columns) {
        columnSelect.innerHTML = '<option value="" disabled selected>Select a column</option>';
        columns.forEach(column => {
            const option = document.createElement("option");
            option.value = column;
            option.textContent = column;
            columnSelect.appendChild(option);
        });
    }

    // Function to populate dropdowns with column names
    function populateDropdowns() {
        graphInputs.innerHTML = '';
        const selectedGraph = graphType.value;

        if (selectedGraph === 'scatter') {
            graphInputs.innerHTML = `
                <div>
                    <label for='x-input'>Select X-Axis:</label> <br>
                    <select name='x' id='x-input' required>
                        <option value="" disabled selected>Select X-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='y-input'>Select Y-Axis:</label> <br>
                    <select name='y' id='y-input' required>
                        <option value="" disabled selected>Select Y-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='color-input'>Select Color:</label> <br>
                    <select name='color' id='color-input' required>
                        <option value="" disabled selected>Select Color</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>`;
        } else if (selectedGraph === 'line') {
            graphInputs.innerHTML = `
                <div>
                    <label for='x-input'>Select X-Axis:</label> <br>
                    <select name='x' id='x-input' required>
                        <option value="" disabled selected>Select X-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='y-input'>Select Y-Axis:</label> <br>
                    <select name='y' id='y-input' required>
                        <option value="" disabled selected>Select Y-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='color-input'>Select Color:</label> <br>
                    <select name='color' id='color-input' required>
                        <option value="" disabled selected>Select Color</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='line_group'>Select Line Group:</label> <br>
                    <select name='line_group' id='line_group' required>
                        <option value="" disabled selected>Select Line Group</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='hover_name'>Select Hover Name:</label> <br>
                    <select name='hover_name' id='hover_name' required>
                        <option value="" disabled selected>Select Hover Name</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>`;
        } else if (selectedGraph == 'bar') {
            graphInputs.innerHTML = `
                    <div>
                        <label for='x-input'>Select X-Axis:</label> <br>
                        <select name='x' id='x-input' required>
                            <option value="" disabled selected>Select X-Axis</option>
                            ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for='y-input'>Select Y-Axis:</label> <br>
                        <select name='y' id='y-input' required>
                            <option value="" disabled selected>Select Y-Axis</option>
                            ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for='color-input'>Select Color:</label> <br>
                        <select name='color' id='color-input' required>
                            <option value="" disabled selected>Select Color</option>
                            ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for='pattern_shape'>Select Pattern Shape:</label> <br>
                        <select name='pattern_shape' id='pattern_shape' required>
                            <option value="" disabled selected>Select Pattern Shape</option>
                            ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                        </select>
                    </div>`;
        
        } else if (selectedGraph == 'pie') {
            graphInputs.innerHTML = `
                 <div>
                        <label for='values'>Select Values:</label> <br>
                        <select name='values' id='values' required>
                            <option value="" disabled selected>Select Values</option>
                            ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for='names'>Select Names:</label> <br>
                        <select name='names' id='names' required>
                            <option value="" disabled selected>Select Names</option>
                            ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                        </select>
                    </div>`;
        
        } else if (selectedGraph === 'histogram') {
            graphInputs.innerHTML = `
                <div>
                    <label for='x-input'>Select X-Axis:</label> <br>
                    <select name='x' id='x-input' required>
                        <option value="" disabled selected>Select X-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='y-input'>Select Y-Axis:</label> <br>
                    <select name='y' id='y-input' required>
                        <option value="" disabled selected>Select Y-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='color-input'>Select Color:</label> <br>
                    <select name='color' id='color-input' required>
                        <option value="" disabled selected>Select Color</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>`;
        } else if (selectedGraph === 'box') {
            graphInputs.innerHTML = `
                <div>
                    <label for='x-input'>Select X-Axis:</label> <br>
                    <select name='x' id='x-input' required>
                        <option value="" disabled selected>Select X-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='y-input'>Select Y-Axis:</label> <br>
                    <select name='y' id='y-input' required>
                        <option value="" disabled selected>Select Y-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='color-input'>Select Color:</label> <br>
                    <select name='color' id='color-input' required>
                        <option value="" disabled selected>Select Color</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>`;
        } else if (selectedGraph === 'violin') {
            graphInputs.innerHTML = `
                <div>
                    <label for='y-input'>Select Y-Axis:</label> <br>
                    <select name='y' id='y-input' required>
                        <option value="" disabled selected>Select Y-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='x-input'>Select X-Axis:</label> <br>
                    <select name='x' id='x-input' required>
                        <option value="" disabled selected>Select X-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='color-input'>Select Color:</label> <br>
                    <select name='color' id='color-input' required>
                        <option value="" disabled selected>Select Color</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>`;
        } else if (selectedGraph === 'density_heatmap') {
            graphInputs.innerHTML = `
                <div>
                    <label for='x-input'>Select X-Axis:</label> <br>
                    <select name='x' id='x-input' required>
                        <option value="" disabled selected>Select X-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='y-input'>Select Y-Axis:</label> <br>
                    <select name='y' id='y-input' required>
                        <option value="" disabled selected>Select Y-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>`;
        } else if (selectedGraph === 'scatter3d') {
            graphInputs.innerHTML = `
                <div>
                    <label for='x-input'>Select X-Axis:</label> <br>
                    <select name='x' id='x-input' required>
                        <option value="" disabled selected>Select X-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='y-input'>Select Y-Axis:</label> <br>
                    <select name='y' id='y-input' required>
                        <option value="" disabled selected>Select Y-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='z-input'>Select Z-Axis:</label> <br>
                    <select name='z' id='z-input' required>
                        <option value="" disabled selected>Select Z-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='color-input'>Select Color:</label> <br>
                    <select name='color' id='color-input' required>
                        <option value="" disabled selected>Select Color</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='hover-input'>Select Hover Name:</label> <br>
                    <select name='hover_name' id='hover-input' required>
                        <option value="" disabled selected>Select Hover Name</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>`;
        } else if (selectedGraph === 'scatter_matrix') {
            graphInputs.innerHTML = `
                <div>
                    <label for='dimensions'>Select Dimensions:</label> <br>
                    <select name='dimensions' id='dimensions' multiple required>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='color-input'>Select Color:</label> <br>
                    <select name='color' id='color-input' required>
                        <option value="" disabled selected>Select Color</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>`;
        } else if (selectedGraph === 'ecdf') {
            graphInputs.innerHTML = `
                <div>
                    <label for='x-input'>Select X-Axis:</label> <br>
                    <select name='x' id='x-input' required>
                        <option value="" disabled selected>Select X-Axis</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for='color-input'>Select Color:</label> <br>
                    <select name='color' id='color-input' required>
                        <option value="" disabled selected>Select Color</option>
                        ${columns.map(col => `<option value="${col}">${col}</option>`).join('')}
                    </select>
                </div>`;
        }
       
    }

    // Event listener for graph type change
    graphType.addEventListener("change", function () {
        populateDropdowns();
    });

    // Handle column selection
    columnSelect.addEventListener("change", function () {
        const selectedColumn = this.value;

        // Create a FormData object to send the file and selected column
        const formData = new FormData();
        formData.append("file", uploadedFile); // Use the global uploadedFile variable
        formData.append("column", selectedColumn);
    
        // Send the AJAX request to the backend
        fetch("/calculate-statistics/", {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": getCookie("csrftoken"), // Include CSRF token
            },
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Hide the error message
                columnMessage.classList.remove("message-visible");
                columnMessage.classList.add("message-hidden");
    
                // Update the stats cards with the received data
                updateStatCards(
                    data.stats.mean,
                    data.stats.median,
                    data.stats.std,
                    data.stats.min,
                    data.stats.max,
                    data.stats.variance
                );
            } else {
                // Show the error message and shake the select element
                columnMessage.classList.remove("message-hidden");
                columnMessage.classList.add("message-visible");
                columnSelect.classList.add("shake");
    
                // Remove the shake animation after it completes
                setTimeout(() => {
                    columnSelect.classList.remove("shake");
                }, 500);
    
                // Clear the stat cards
                clearStatCards();
    
                // Log the error for debugging
                console.error("Error:", data.error);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while calculating statistics.");
        });
    });

    // Function to clear stat cards
    function clearStatCards() {
        document.getElementById("mean-card").querySelector(".stat-value").textContent = "-";
        document.getElementById("median-card").querySelector(".stat-value").textContent = "-";
        document.getElementById("std-card").querySelector(".stat-value").textContent = "-";
        document.getElementById("min-card").querySelector(".stat-value").textContent = "-";
        document.getElementById("max-card").querySelector(".stat-value").textContent = "-";
        document.getElementById("var-card").querySelector(".stat-value").textContent = "-";
    }

    // Function to update stat cards
    function updateStatCards(mean, median, std, min, max, variance) {
        document.getElementById("mean-card").querySelector(".stat-value").textContent = mean.toFixed(2);
        document.getElementById("median-card").querySelector(".stat-value").textContent = median.toFixed(2);
        document.getElementById("std-card").querySelector(".stat-value").textContent = std.toFixed(2);
        document.getElementById("min-card").querySelector(".stat-value").textContent = min.toFixed(2);
        document.getElementById("max-card").querySelector(".stat-value").textContent = max.toFixed(2);
        document.getElementById("var-card").querySelector(".stat-value").textContent = variance.toFixed(2);
    }

    // Function to upload file and fetch stats
    function uploadFile(file) {
        const formData = new FormData();
        formData.append("file", file);

        fetch("/upload/", {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                if (data.error) {
                    alert(data.error);
                } else {
                    displayStats(data);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    // Function to display stats in the HTML
    function displayStats(data) {
        const statsContainer = document.getElementById("stats-container");

        const statsHTML = `
            <h3>File Information</h3>
            <p><strong>File Name:</strong> ${data.file_info.file_name}</p>
            <p><strong>File Size:</strong> ${data.file_info.file_size}</p>
            <p><strong>Number of Rows:</strong> ${data.file_info.num_rows}</p>
            <p><strong>Number of Columns:</strong> ${data.file_info.num_columns}</p>

            <h3>Column Information</h3>
            <table>
                <thead>
                    <tr>
                        <th>Column Name</th>
                        <th>Data Type</th>
                        <th>Missing Values</th>
                        <th>Unique Values</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.column_info.map(column => `
                        <tr>
                            <td>${column.name}</td>
                            <td>${column.data_type}</td>
                            <td>${column.missing_values}</td>
                            <td>${column.unique_values}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            <h3>Data Preview</h3>
            <div class="data-preview">
                ${data.data_preview_html}
            </div>
        `;

        statsContainer.innerHTML = statsHTML;
        statsContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    graphForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const formData = new FormData(graphForm);

        fetch("/generate-graph/", {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error);
                } else {
                    renderGraph(data.graph_json);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred while generating the graph.");
            });
    });

    function renderGraph(graphJson) {
        const graphContainer = document.getElementById("graph-container");
        if (graphContainer) {
            const graphData = JSON.parse(graphJson);
            Plotly.newPlot(graphContainer, graphData.data, graphData.layout);
        } else {
            console.error("Graph container not found.");
        }
    }

    // Function to get CSRF token from cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === name + "=") {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});