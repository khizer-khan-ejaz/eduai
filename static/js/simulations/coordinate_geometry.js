document.addEventListener("DOMContentLoaded", () => {
    // 1. Simulation Setup
    const canvas = document.getElementById("coordCanvas");
    const ctx = canvas.getContext("2d");
    const xSlider = document.getElementById("xSlider");
    const ySlider = document.getElementById("ySlider");
    const xValLabel = document.getElementById("xVal");
    const yValLabel = document.getElementById("yVal");
    const stepXLabel = document.getElementById("stepXText");
    const stepYLabel = document.getElementById("stepYText");

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = 20; // pixels per unit

    let point = { x: parseInt(xSlider.value), y: parseInt(ySlider.value) };

    function drawGrid() {
        ctx.clearRect(0, 0, width, height);

        // Draw Grid Lines
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#e0e0e0";
        for(let i=0; i<=width; i+=scale) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
        }

        // Draw Axes
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(width, cy); ctx.stroke();

        // Draw Point
        const px = cx + point.x * scale;
        const py = cy - point.y * scale;

        ctx.fillStyle = "#ff3b30";
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI*2);
        ctx.fill();

        // Draw dashed guides
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "#ff3b30";
        ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();
        ctx.setLineDash([]);
        
        updateLabels();
    }

    function updateLabels() {
        xValLabel.textContent = point.x;
        yValLabel.textContent = point.y;

        const xDir = point.x >= 0 ? "right" : "left";
        const yDir = point.y >= 0 ? "up" : "down";
        stepXLabel.textContent = `${Math.abs(point.x)} units ${xDir}`;
        stepYLabel.textContent = `${Math.abs(point.y)} units ${yDir}`;
    }

    function onControlUpdate() {
        point.x = parseInt(xSlider.value);
        point.y = parseInt(ySlider.value);
        drawGrid();
    }

    xSlider.addEventListener("input", onControlUpdate);
    ySlider.addEventListener("input", onControlUpdate);

    // Initial render
    drawGrid();

    // 2. Practice System Setup
    fetchQuestions();

    async function fetchQuestions() {
        try {
            const res = await fetch("/api/questions?topic=Coordinate Geometry");
            const data = await res.json();
            renderQuiz(data.questions);
        } catch (e) {
            document.getElementById("quizContainer").innerText = "Failed to load questions.";
        }
    }

    function renderQuiz(questions) {
        const container = document.getElementById("quizContainer");
        container.innerHTML = "";

        questions.forEach((q, index) => {
            const div = document.createElement("div");
            div.className = "quiz-question";
            
            let inputHTML = '';
            if (q.type === 'mcq') {
                inputHTML = `
                    <div class="quiz-options">
                        ${q.options.map(opt => `<button onclick="submitAnswer('${q.id}', '${opt}', ${index})">${opt}</button>`).join('')}
                    </div>
                `;
            } else {
                inputHTML = `
                    <div style="margin-top: 1rem; display: flex; gap: 1rem;">
                        <input type="text" id="ans_${q.id}" placeholder="Type your answer" style="padding: 0.5rem; flex: 1;">
                        <button class="action-btn" onclick="submitAnswer('${q.id}', document.getElementById('ans_${q.id}').value, ${index})">Submit Answer</button>
                    </div>
                `;
            }

            div.innerHTML = `
                <h4>Question ${index + 1}</h4>
                <p><strong>${q.text}</strong></p>
                ${inputHTML}
                <div style="margin-top: 1rem;">
                    <button class="hint-btn" onclick="document.getElementById('hint_${q.id}').style.display='block'">Show Hint</button>
                    <div id="hint_${q.id}" style="display:none; margin-top: 0.5rem; padding: 0.5rem; background: #fffbe8; border: 1px solid #ffe58f; border-radius:4px; font-size: 0.9rem;">
                        💡 ${q.hint}
                    </div>
                </div>
                <div id="feedback_${index}"></div>
            `;
            container.appendChild(div);
        });
    }

    // Expose globally for inline event handlers
    window.submitAnswer = async function(q_id, answer, index) {
        try {
            const res = await fetch("/api/submit-answer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question_id: q_id, answer })
            });
            const data = await res.json();
            
            const feedbackDiv = document.getElementById(`feedback_${index}`);
            if (data.correct) {
                feedbackDiv.innerHTML = `<div class="feedback correct">✅ ${data.feedback}</div>`;
                updateScore(1);
            } else {
                feedbackDiv.innerHTML = `<div class="feedback incorrect">❌ ${data.feedback}</div>`;
            }
        } catch (e) {
            console.error(e);
        }
    };

    function updateScore(points) {
        let score = parseInt(localStorage.getItem('mathScore') || '0');
        score += points;
        localStorage.setItem('mathScore', score.toString());
    }
});