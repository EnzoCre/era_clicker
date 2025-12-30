import { gameState, upgrades } from './state.js';
import { ERAS } from './constants.js';
import { calculateCost, formatNumber } from './utils.js';
import { updateUI, addVisualToCanvas, renderVisualCanvas } from './ui.js';
import md5 from 'https://esm.sh/md5';

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

export function showInfos() {
    console.log("playerName = ",gameState.playerName);
    console.log("playerPassword = ",gameState.playerPassword);
    console.log("Knowledge = ",gameState.knowledge);
    console.log("kps = ",gameState.kps);
    console.log("clickValue = ",gameState.clickValue);
}

export function setPlayerName(playerName) {
    gameState.playerName = playerName;
}

window.addKnowledge = addKnowledge;
window.showInfos = showInfos;
window.setPlayerName = setPlayerName;



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
                console.log("PIERRE SHINY DÉCOUVERT !");
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
                console.log("MAMMOUTH SHINY DÉCOUVERT !");
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
                console.log("CUEILLEUR SHINY DÉCOUVERT !");
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
        knowledge: gameState.knowledge,
        kps: gameState.kps,
        clickValue: gameState.clickValue
    };

    const pseudo = gameState.playerName;

    if (pseudo == null) alert("Veuillez vous connecter/creer un compte");
    else{

        const result = await updateDatabase(pseudo,dataToSend);

        if (result.ok)
        {
            alert("Sauvegarde réussie");
        }

    }
    
}

async function updateDatabase(playerName,dataToSend)
{
    try{
        const url = `http://localhost:8080/api/save/${playerName}`;

        const response = await fetch(url, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend) 
            });

            return response;
        } catch (err) {
            console.error("Impossible de contacter le serveur", err);
        }
}

export async function loadGame() {
    const inputField = document.getElementById("username-input");
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

export async function register() {

    
    const inputFieldPseudo = document.getElementById("newUser");
    const inputFieldPassword = document.getElementById("newPass");
    const pseudo = inputFieldPseudo.value.trim();
    const password = inputFieldPassword.value.trim();
    const hashPassword = md5(password);


        
    const response = await fetch(`http://localhost:8080/api/load/${pseudo}`);

    if (response.ok) {
   
        alert("Ce nom d'utilisateur est déjà pris");

    } else if (response.status == 404){

        gameState.playerName = pseudo;
        gameState.playerPassword = hashPassword;

        const dataToSend = {
        playerName: pseudo,
        playerPassword: hashPassword,
        knowledge: gameState.knowledge,
        kps: gameState.kps,
        clickValue: gameState.clickValue
        };

        try {
            const response = await fetch("http://localhost:8080/api/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataToSend)
            });
            if (response.ok) {
                alert("Compte créé");
            } else {
                console.error("Erreur serveur...");
            }
        } catch (err) {
            console.error("Impossible de contacter le serveur", err);
        }

        console.log("Compte créé");
    
    }



    

}

export async function login() {

    const inputFieldPseudo = document.getElementById("user");
    const inputFieldPassword = document.getElementById("pass");
    const pseudo = inputFieldPseudo.value.trim();
    const password = inputFieldPassword.value.trim();
    const hashPassword = md5(password);

    try {
        
        const response = await fetch(`http://localhost:8080/api/load/${pseudo}`);

        if (response.ok) {

            const data = await response.json();

            if (data.playerPassword == hashPassword) {
                
                gameState.playerName = data.playerName;
                gameState.playerPassword = data.playerPassword;
                gameState.knowledge = data.knowledge;
                gameState.kps = data.kps;
                gameState.clickValue = data.clickValue;


                alert(`Bon retour parmi nous, ${pseudo} !`);
            }
            else {
                alert("Mauvais mot de passe")
            }

        } else {
            alert("Aucune sauvegarde trouvée pour ce pseudo.");
        }

    } catch (err) {
        console.error("Erreur de connexion :", err);
        alert("Impossible de contacter le serveur.");
    }

}

