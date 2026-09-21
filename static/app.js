const form = document.getElementById("spamForm");

const messageInput = document.getElementById("messageInput");
const characterCount = document.getElementById("characterCount");

const analyzeButton = document.getElementById("analyzeButton");
const buttonContent = document.getElementById("buttonContent");
const buttonLoading = document.getElementById("buttonLoading");

const clearButton = document.getElementById("clearButton");

const emptyResult = document.getElementById("emptyResult");
const predictionResult = document.getElementById("predictionResult");
const errorResult = document.getElementById("errorResult");

const predictionLabel = document.getElementById("predictionLabel");
const resultIcon = document.getElementById("resultIcon");

const confidenceValue = document.getElementById("confidenceValue");
const confidenceFill = document.getElementById("confidenceFill");

const spamProbability = document.getElementById("spamProbability");
const hamProbability = document.getElementById("hamProbability");

const recommendation = document.getElementById("recommendation");
const processedText = document.getElementById("processedText");

const errorMessage = document.getElementById("errorMessage");
const tryAgainButton = document.getElementById("tryAgainButton");

const modelStatus = document.getElementById("modelStatus");
const statusText = document.getElementById("statusText");

const exampleButtons = document.querySelectorAll(".example-button");

const toast = document.getElementById("toast");


/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

function formatPercentage(value) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "N/A";
    }

    return `${(Number(value) * 100).toFixed(1)}%`;
}


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");

    window.clearTimeout(showToast.timeout);

    showToast.timeout = window.setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


function updateCharacterCount() {

    const count = messageInput.value.length;

    characterCount.textContent = `${count} / 5000`;
}


function setLoading(isLoading) {

    analyzeButton.disabled = isLoading;

    buttonContent.classList.toggle(
        "hidden",
        isLoading
    );

    buttonLoading.classList.toggle(
        "hidden",
        !isLoading
    );
}


function showEmptyState() {

    emptyResult.classList.remove("hidden");

    predictionResult.classList.add("hidden");

    errorResult.classList.add("hidden");
}


function showErrorState(message) {

    emptyResult.classList.add("hidden");

    predictionResult.classList.add("hidden");

    errorResult.classList.remove("hidden");

    errorMessage.textContent = message;
}


/* --------------------------------------------------
   Model health
-------------------------------------------------- */

async function checkModelStatus() {

    try {

        const response = await fetch("/health");

        if (!response.ok) {
            throw new Error("Health check failed");
        }

        const data = await response.json();

        modelStatus.classList.remove(
            "online",
            "offline"
        );


        if (data.model_loaded) {

            modelStatus.classList.add("online");

            statusText.textContent = "Model ready";

        } else {

            modelStatus.classList.add("offline");

            statusText.textContent = "Model missing";
        }

    } catch (error) {

        modelStatus.classList.remove("online");

        modelStatus.classList.add("offline");

        statusText.textContent = "Server unavailable";
    }

}


/* --------------------------------------------------
   Display result
-------------------------------------------------- */

function displayPrediction(data) {

    emptyResult.classList.add("hidden");
    errorResult.classList.add("hidden");

    predictionResult.classList.remove("hidden");


    const isSpam = Boolean(data.is_spam);


    /* Label */

    predictionLabel.textContent = data.label;

    predictionLabel.classList.remove(
        "spam-label",
        "safe-label"
    );

    predictionLabel.classList.add(
        isSpam
            ? "spam-label"
            : "safe-label"
    );


    /* Icon */

    resultIcon.classList.remove(
        "spam",
        "safe"
    );

    if (isSpam) {

        resultIcon.classList.add("spam");

        resultIcon.textContent = "⚠";

    } else {

        resultIcon.classList.add("safe");

        resultIcon.textContent = "✓";
    }


    /* Confidence */

    const confidence =
        typeof data.confidence === "number"
            ? data.confidence
            : null;


    confidenceValue.textContent =
        formatPercentage(confidence);


    confidenceFill.classList.remove(
        "spam-confidence"
    );


    /*
        Reset width first so that the progress animation
        plays again on every new prediction.
    */

    confidenceFill.style.width = "0%";


    requestAnimationFrame(() => {

        requestAnimationFrame(() => {

            const percentage =
                confidence !== null
                    ? Math.max(
                        0,
                        Math.min(
                            confidence * 100,
                            100
                        )
                    )
                    : 0;


            confidenceFill.style.width =
                `${percentage}%`;
        });

    });


    if (isSpam) {
        confidenceFill.classList.add(
            "spam-confidence"
        );
    }


    /* Probabilities */

    spamProbability.textContent =
        formatPercentage(
            data.spam_probability
        );

    hamProbability.textContent =
        formatPercentage(
            data.ham_probability
        );


    /* Recommendation */

    recommendation.classList.remove(
        "spam-recommendation",
        "safe-recommendation"
    );


    if (isSpam) {

        recommendation.classList.add(
            "spam-recommendation"
        );

        recommendation.innerHTML = `
            <strong>⚠ Be cautious.</strong>
            This message shows patterns the model associates with spam.
            Avoid clicking unknown links or sharing sensitive information.
        `;

    } else {

        recommendation.classList.add(
            "safe-recommendation"
        );

        recommendation.innerHTML = `
            <strong>✓ Looks legitimate.</strong>
            The model considers this message more likely to be normal,
            but you should still be careful with unfamiliar senders and links.
        `;
    }


    /* Processed text */

    processedText.textContent =
        data.processed_text || "No processed text returned.";
}


/* --------------------------------------------------
   Prediction request
-------------------------------------------------- */

async function analyzeMessage() {

    const text = messageInput.value.trim();


    if (!text) {

        messageInput.focus();

        showToast("Enter a message first.");

        return;
    }


    setLoading(true);


    try {

        const response = await fetch("/predict", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                text: text
            })

        });


        let data;


        try {

            data = await response.json();

        } catch {

            throw new Error(
                "The server returned an invalid response."
            );
        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Unable to analyze the message."
            );
        }


        displayPrediction(data);

    } catch (error) {

        showErrorState(
            error.message ||
            "Something went wrong while analyzing the message."
        );

    } finally {

        setLoading(false);
    }

}


/* --------------------------------------------------
   Form events
-------------------------------------------------- */

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        await analyzeMessage();
    }
);


/* Ctrl / Cmd + Enter */

messageInput.addEventListener(
    "keydown",
    (event) => {

        const submitShortcut =
            (event.ctrlKey || event.metaKey) &&
            event.key === "Enter";


        if (submitShortcut) {

            event.preventDefault();

            analyzeMessage();
        }
    }
);


/* Character count */

messageInput.addEventListener(
    "input",
    updateCharacterCount
);


/* --------------------------------------------------
   Clear
-------------------------------------------------- */

clearButton.addEventListener(
    "click",
    () => {

        messageInput.value = "";

        updateCharacterCount();

        showEmptyState();

        messageInput.focus();
    }
);


/* --------------------------------------------------
   Example messages
-------------------------------------------------- */

exampleButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            const message =
                button.dataset.message || "";


            messageInput.value = message;

            updateCharacterCount();

            messageInput.focus();


            /*
                Small scroll adjustment is useful on mobile
                after clicking an example.
            */

            messageInput.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    );

});


/* --------------------------------------------------
   Try again
-------------------------------------------------- */

tryAgainButton.addEventListener(
    "click",
    () => {

        showEmptyState();

        messageInput.focus();
    }
);


/* --------------------------------------------------
   Initial setup
-------------------------------------------------- */

updateCharacterCount();

checkModelStatus();