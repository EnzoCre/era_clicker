import { gameState, upgrades } from './state.js';
import { ERAS } from './constants.js';
import { calculateCost, formatNumber } from './utils.js';
import { updateUI, addVisualToCanvas, renderVisualCanvas } from './ui.js';

// Ajoute de la connaissance
export function addKnowledge(amount) {
    if (typeof amount === 'number') {
        gameState.knowledge += amount;
        console.log(`Ajouté ${formatNumber(amount)} connaissance(s). Total: ${formatNumber(gameState.knowledge)}`);
        updateUI(); 
    } else {
        console.warn("Erreur : addKnowledge a reçu une valeur invalide", amount);
    }
}
window.addKnowledge = addKnowledge;

// Clic Principal
export function handleMainClick() {
    // Le bouton utilise la valeur actuelle du clic définie dans le gameState
    addKnowledge(gameState.clickValue);
}

export function handleBuyUpgrade(event) {
    const upgradeButton = event.target.closest('.upgrade-button');
    if (!upgradeButton) return; 

    const upgradeId = upgradeButton.dataset.id;
    const upgrade = upgrades[upgradeId];
    const currentCost = calculateCost(upgrade);

    if (gameState.knowledge >= currentCost) {
        gameState.knowledge -= currentCost;
        upgrade.owned++;
        
        let valueToAdd = upgrade.value;
        let visualSource = upgrade.icon;
        let isImage = false; 

        if (upgradeId === 'sharp_stone') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("✨ PIERRE SHINY DÉCOUVERT ! ✨");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_stone/Pierre/Pierre_Shiny.png';
            } else {
                visualSource = 'images/era_stone/Pierre/Pierre.png';
            }
        }

        if (upgradeId === 'mammouth') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("✨ MAMMOUTH SHINY DÉCOUVERT ! ✨");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_stone/Mamouth/Mamouth_Shiny.png';
            } else {
                visualSource = 'images/era_stone/Mamouth/Mamouth.png';
            }
        }

        if (upgradeId === 'forager') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("✨ CUEILLEUR SHINY DÉCOUVERT ! ✨");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_stone/Ceuilleur/Ceuilleur_Shiny.png';
            } else {
                visualSource = 'images/era_stone/Ceuilleur/Ceuilleur.png';
            }
        }

        if (upgrade.type === 'click') {
            gameState.clickValue += valueToAdd;
        } else if (upgrade.type === 'auto') {
            gameState.kps += valueToAdd;
        }

        addVisualToCanvas(upgrade, visualSource, isImage);
        updateUI();
    } else {
        upgradeButton.classList.add('shake');
        setTimeout(() => upgradeButton.classList.remove('shake'), 500);
    }
}

export function navigateToEra(eraId) {
    if (!ERAS[eraId]) return;
    gameState.currentEra = eraId;
    updateUI();
    renderVisualCanvas();
}

export function handlePrevEra() {
    const currentEra = ERAS[gameState.currentEra];
    if (currentEra.previousEra) navigateToEra(currentEra.previousEra);
}

export function handleNextEra() {
    const currentEra = ERAS[gameState.currentEra];
    if (currentEra.nextEra && gameState.currentEra !== gameState.maxEraReached) {
        navigateToEra(currentEra.nextEra);
    }
}

export function handleAdvanceEra() {
    const currentEraData = ERAS[gameState.currentEra];
    if (gameState.currentEra === gameState.maxEraReached && currentEraData.nextEra && gameState.knowledge >= currentEraData.nextEraCost) {
        gameState.knowledge -= currentEraData.nextEraCost;
        gameState.currentEra = currentEraData.nextEra;
        gameState.maxEraReached = currentEraData.nextEra;
        renderVisualCanvas(); 
        updateUI();
    }
}

export function gameLoop() {
    if (gameState.kps > 0) {
        gameState.knowledge += gameState.kps;
        updateUI();
    }
}

export async function saveGame() {
    const dataToSend = {
        playerName: "Florian",
        knowledge: gameState.knowledge,
        kps: gameState.kps,
        clickValue: gameState.clickValue
    };

    try {
        const response = await fetch('http://localhost:8080/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
        if (response.ok) {
            alert("Sauvegarde réussie !");
        } else {
            console.error("Erreur serveur...");
        }
    } catch (err) {
        console.error("Impossible de contacter le serveur", err);
    }
}

export async function loadGame() {
    const inputField = document.getElementById('username-input');
    const pseudo = inputField.value.trim();

    try {
        
        const response = await fetch(`http://localhost:8080/api/load/${pseudo}`);

        if (response.ok) {
            
            const data = await response.json();
            console.log("Données reçues :", data);

            if (data.knowledge !== undefined) gameState.knowledge = data.knowledge;
            if (data.kps !== undefined) gameState.kps = data.kps;
            if (data.clickValue !== undefined) gameState.clickValue = data.clickValue;
            
            if (data.currentEra) gameState.currentEra = data.currentEra;
            if (data.maxEraReached) gameState.maxEraReached = data.maxEraReached;

            updateUI(); 

            alert(`Bon retour parmi nous, ${pseudo} !`);

        } else {
            alert("Aucune sauvegarde trouvée pour ce pseudo.");
        }

    } catch (err) {
        console.error("Erreur de connexion :", err);
        alert("Impossible de contacter le serveur.");
    }
}