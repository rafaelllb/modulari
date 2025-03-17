/**
 * Discovery Page Script
 * Handles the user preference discovery flow 
 */
import dataService from './data-service.js';
import toastService from './toast-service.js';

// Questions for the discovery process
const questions = [
    {
        id: 'purpose',
        title: 'Qual é o seu objetivo com este imóvel?',
        type: 'single',
        choices: [
            { id: 'live', label: 'Morar', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80' },
            { id: 'invest', label: 'Investir', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80' },
            { id: 'both', label: 'Ambos', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80' }
        ]
    },
    {
        id: 'lifestyle',
        title: 'Como você imagina seu dia a dia ideal?',
        type: 'single',
        choices: [
            { id: 'quiet', label: 'Tranquilo e reservado', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80' },
            { id: 'active', label: 'Movimentado e social', image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80' },
            { id: 'balanced', label: 'Equilibrado', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80' }
        ]
    },
    {
        id: 'priorities',
        title: 'O que é mais importante para você em um imóvel?',
        type: 'multiple',
        choices: [
            { id: 'space', label: 'Espaço amplo', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80' },
            { id: 'location', label: 'Localização', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80' },
            { id: 'privacy', label: 'Privacidade', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80' },
            { id: 'amenities', label: 'Comodidades', image: 'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?w=800&q=80' }
        ]
    },
    {
        id: 'surrounding',
        title: 'O que você gostaria de ter por perto?',
        type: 'multiple',
        choices: [
            { id: 'nature', label: 'Natureza', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80' },
            { id: 'services', label: 'Serviços', image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80' },
            { id: 'leisure', label: 'Lazer', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
            { id: 'transport', label: 'Transporte', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80' }
        ]
    }
];

// State
let currentQuestion = 0;
const answers = {};

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    showLoading();
    try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
        renderQuestion();
    } catch (error) {
        console.error('Error initializing discovery:', error);
        showError('Não foi possível carregar as questões');
    }
});

/**
 * Show loading indicator
 */
function showLoading() {
    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div class="choices-grid">
        ${Array(4).fill().map(() => `
            <div class="choice-card loading"></div>
        `).join('')}
        </div>
    `;
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const container = document.getElementById('question-container');
    container.innerHTML = `
        <div class="empty-state">
        <h3>Erro ao carregar questão</h3>
        <p>${message}</p>
        <button onclick="location.reload()" class="button button-primary mt-4">
            Tentar novamente
        </button>
        </div>
    `;
}

/**
 * Render the current question
 */
function renderQuestion() {
    const question = questions[currentQuestion];
    const container = document.getElementById('question-container');
    const progress = document.getElementById('progress');
    
    // Update progress bar
    progress.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;

    container.innerHTML = `
        <h2 class="question-title">${question.title}</h2>
        <div class="choices-grid">
            ${question.choices.map(choice => `
                <div class="choice-card" data-id="${choice.id}" onclick="selectChoice('${choice.id}')">
                    <img src="${choice.image}" alt="${choice.label}" class="choice-image">
                    <div class="choice-label">${choice.label}</div>
                </div>
            `).join('')}
        </div>
        <div class="navigation-buttons">
            ${currentQuestion > 0 ? `
                <button class="button button-secondary" onclick="previousQuestion()">Voltar</button>
            ` : '<div></div>'}
            <button class="button button-primary" 
                    onclick="nextQuestion()" 
                    id="next-button"
                    ${question.type === 'single' ? 'disabled' : ''}>
                ${currentQuestion === questions.length - 1 ? 'Concluir' : 'Próximo'}
            </button>
        </div>
    `;

    // Restore previous selections if they exist
    restorePreviousSelections(question);
}

/**
 * Restore previous selections for the current question
 * @param {Object} question - Current question object
 */
function restorePreviousSelections(question) {
    if (answers[question.id]) {
        const selectedAnswers = Array.isArray(answers[question.id]) 
            ? answers[question.id] 
            : [answers[question.id]];
            
        selectedAnswers.forEach(answerId => {
            const element = document.querySelector(`[data-id="${answerId}"]`);
            if (element) element.classList.add('selected');
        });
        
        // Enable next button if there are selections
        if (selectedAnswers.length > 0) {
            document.getElementById('next-button').disabled = false;
        }
    }
}

/**
 * Handle choice selection
 * @param {string} choiceId - ID of the selected choice
 */
window.selectChoice = function(choiceId) {
    const question = questions[currentQuestion];
    const choiceElement = document.querySelector(`[data-id="${choiceId}"]`);
    
    if (question.type === 'single') {
        // Remove previous selection
        document.querySelectorAll('.choice-card').forEach(card => {
            card.classList.remove('selected');
        });
        choiceElement.classList.add('selected');
        answers[question.id] = choiceId;
        document.getElementById('next-button').disabled = false;
    } else {
        choiceElement.classList.toggle('selected');
        // Update multiple answers
        answers[question.id] = Array.from(document.querySelectorAll('.choice-card.selected'))
            .map(card => card.dataset.id);
    }
};

/**
 * Go to previous question
 */
window.previousQuestion = function() {
    if (currentQuestion > 0) {
        currentQuestion--;
        renderQuestion();
    }
};

/**
 * Go to next question or finish the process
 */
window.nextQuestion = function() {
    const question = questions[currentQuestion];
    
    // Validate if there's a selection for single-choice questions
    if (question.type === 'single' && !answers[question.id]) {
        toastService.warning('Por favor, selecione uma opção');
        return;
    }
    
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        // Save preferences and create profile
        saveProfile();
        window.location.href = 'property-cards.html';
    }
};

/**
 * Save user profile based on answers
 */
function saveProfile() {
    const lifestyle = dataService.getSelectedLifestyle();
    
    // Save preferences
    dataService.savePreferences(answers);
    
    // Generate profile name based on preferences
    const purpose = answers.purpose === 'live' ? 'Moradia' : 
                   answers.purpose === 'invest' ? 'Investimento' : 'Misto';
    const location = lifestyle === 'beach' ? 'Praia' : 
                    lifestyle === 'city' ? 'Cidade' : 'Campo';
    
    const profileName = `${purpose} - ${location}`;
    
    // Create new profile
    const newProfile = {
        name: profileName,
        lifestyle,
        preferences: answers
    };
    
    // Add new profile to storage
    const createdProfile = dataService.createSearchProfile(newProfile);
    
    // Set as active profile
    dataService.setActiveProfile(createdProfile.id);
    
    toastService.success('Perfil criado com sucesso!');
}

// Export functions to global scope
window.previousQuestion = previousQuestion;
window.nextQuestion = nextQuestion;
window.selectChoice = selectChoice;