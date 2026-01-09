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

export function saveToSessionStorage() {

    const dataToSave = {
        playerName: gameState.playerName,
        playerPassword: gameState.playerPassword,
        knowledge: gameState.knowledge,
        kps: gameState.kps,
        clickValue: gameState.clickValue
    }

    sessionStorage.setItem('clickerSave', JSON.stringify(dataToSave));

    console.log("Sauvegarde faite");
}

export function loadFromSessionStorage () {

    const dataSavedString = sessionStorage.getItem('clickerSave');

    if (dataSavedString) { 

        const dataSaved = JSON.parse(dataSavedString);


        gameState.playerName = dataSaved.playerName
        gameState.playerPassword = dataSaved.playerPassword
        gameState.knowledge = dataSaved.knowledge
        gameState.clickValue = dataSaved.clickValue
        gameState.kps = dataSaved.kps

    } else {
        console.log("Aucune sauvegarde trouvée")
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
        const url = `http://localhost:8080/api/update/${playerName}`;

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

            gameState.playerName = data.playerName;
            gameState.playerPassword = data.playerPassword;
            gameState.knowledge = data.knowledge;
            gameState.kps = data.kps;
            gameState.clickValue = data.clickValue;

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


export async function printLeaderboard() {
    const listElement = document.getElementById('leaderboard-list');
    
    try {
        const response = await fetch('http://localhost:8080/api/leaderboard');
        
        if (response.ok) {
            const leaderboardPlayers = await response.json();
            
            listElement.innerHTML = '';
            
            leaderboardPlayers.forEach((player, index) => {
                const li = document.createElement('li');

                li.innerText = `${player.playerName} : ${player.knowledge} connaissances`;

                const attackButton = document.createElement("button");
                attackButton.innerText = "Attaquer (1000 connaissances)";

                attackButton.addEventListener('click', () => {
                    sendAttack(player.playerName);
                });

                li.appendChild(attackButton);
                
                listElement.appendChild(li);
                
            
            });

        }
    } catch (err) {
        console.error("Impossible de charger le leaderboard", err);
    }
}

export async function sendAttack(target) {
    
    if(gameState.playerName == null) {
        alert("Il faut être connecté pour pouvoir attaquer")
    }else{

        const x = Math.floor(Math.random()*100);
        console.log(x);

        if (x >= 0 && x <= 9) { //L'attaquant perd 2000 connaissances (Pire scénario pour lui (10%))

            const response = await fetch(`http://localhost:8080/api/load/${gameState.playerName}`);
                    
                    if (response.ok) {
                        const targetData = await response.json(); 
    
                        
                        let newKnowledge;
                        if (targetData.knowledge >= 2000) {
                            newKnowledge = targetData.knowledge - 2000;
                        } else {
                            newKnowledge = 0;
                        }
    
                        const dataToSend = {
                            knowledge: newKnowledge,
                            kps: targetData.kps,         
                            clickValue: targetData.clickValue
                        };
    
                        const result = await updateDatabase(gameState.playerName, dataToSend);
    
                        if (result.ok){
                            alert(`Vous avez perdu 2000 de connaisssance !!!`);
                            printLeaderboard();
                        }
    
            }
        }
    
        if (x >= 10 && x <= 24) { //L'attaquant ne perd rien (Pas fou puisqu'il a dépensé de la connaissance (15%))
            alert("L'attaque a échoué, la cible s'en sort indemne")
        }
    
        if (x >= 25 && x <= 39) { //La cible perd 500 connaissances (Toujours pas fou car pas rentable(15%))
    
            const response = await fetch(`http://localhost:8080/api/load/${target}`);
                    
                    if (response.ok) {
                        const targetData = await response.json(); 
    
                        
                        let newKnowledge;
                        if (targetData.knowledge >= 500) {
                            newKnowledge = targetData.knowledge - 500;
                        } else {
                            newKnowledge = 0;
                        }
    
                        const dataToSend = {
                            knowledge: newKnowledge,
                            kps: targetData.kps,         
                            clickValue: targetData.clickValue
                        };
    
                        const result = await updateDatabase(target, dataToSend);
    
                        if (result.ok){
                            alert(`Vous avez enlevé 500 de connaissance à ${targetData.playerName}`);
                            printLeaderboard();
                        }
    
            }
        }
    
        if (x >= 40 && x <= 59) { //La cible perd 1000 connaissances (Bof(20%))
    
            const response = await fetch(`http://localhost:8080/api/load/${target}`);
                    
                    if (response.ok) {
                        const targetData = await response.json(); 
    
                        
                        let newKnowledge;
                        if (targetData.knowledge >= 1000) {
                            newKnowledge = targetData.knowledge - 1000;
                        } else {
                            newKnowledge = 0;
                        }
    
                        const dataToSend = {
                            knowledge: newKnowledge,
                            kps: targetData.kps,         
                            clickValue: targetData.clickValue
                        };
    
                        const result = await updateDatabase(target, dataToSend);
    
                        if (result.ok){
                            alert(`Vous avez enlevé 1000 de connaissance à ${targetData.playerName}`);
                            printLeaderboard();
                        }
    
            }
        }
    
        if (x >= 60 && x <= 89) { //La cible perd 2000 connaissances (Très bien(20%))
    
            const response = await fetch(`http://localhost:8080/api/load/${target}`);
                    
                    if (response.ok) {
                        const targetData = await response.json(); 
    
                        
                        let newKnowledge;
                        if (targetData.knowledge >= 2000) {
                            newKnowledge = targetData.knowledge - 2000;
                        } else {
                            newKnowledge = 0;
                        }
    
                        const dataToSend = {
                            knowledge: newKnowledge,
                            kps: targetData.kps,         
                            clickValue: targetData.clickValue
                        };
    
                        const result = await updateDatabase(target, dataToSend);
    
                        if (result.ok){
                            alert(`Vous avez enlevé 2000 de connaissance à ${targetData.playerName}`);
                            printLeaderboard();
                        }
    
            }
        }
    
        if (x >= 90 && x <= 99) { //Jackpot (10%)
    
            const response = await fetch(`http://localhost:8080/api/load/${target}`);
                    
                    if (response.ok) {
                        const targetData = await response.json(); 
    
                        
                        let newKnowledge;
                        if (targetData.knowledge >= 10000) {
                            newKnowledge = targetData.knowledge - 10000;
                        } else {
                            newKnowledge = 0;
                        }
    
                        const dataToSend = {
                            knowledge: newKnowledge,
                            kps: targetData.kps,         
                            clickValue: targetData.clickValue
                        };
    
                        const result = await updateDatabase(target, dataToSend);
    
                        if (result.ok){
                            alert(`Jackpot !!! Vous avez enlevé 10000 de connaissance à ${targetData.playerName}`);
                            printLeaderboard();
                        }
    
            }
        }

    }

    
}


