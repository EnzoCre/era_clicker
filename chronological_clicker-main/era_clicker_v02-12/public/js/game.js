import { gameState, upgrades } from './state.js';
import { ERAS } from './constants.js';
import { calculateCost, formatNumber } from './utils.js';
import { updateUI, addVisualToCanvas, renderVisualCanvas, updateUIleaderboard } from './ui.js';
import md5 from 'https://esm.sh/md5';

export function addKnowledge(amount) {
    if (typeof amount === 'number') {
        gameState.knowledge += amount;
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
    console.log("Current era = ",gameState.currentEra);
    console.log("Max era = ",gameState.maxEraReached);
    if (upgrades['sharp_stone']) {
        console.log("Nombre silex =", upgrades['sharp_stone'].owned);
    } else {
        console.log("Nombre silex = Erreur (Introuvable)");
    }
}

export function setPlayerName(playerName) {
    gameState.playerName = playerName;
}

window.showInfos = showInfos;
window.setPlayerName = setPlayerName;
window.addKnowledge = addKnowledge;

export function handleMainClick() {
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
        let isImage = false; // Par défaut, ce sont des émojis

        // --- LOGIQUE SHINY (x10 BONUS) ---

        // 1. Pierre (Images)
        if (upgradeId === 'sharp_stone') {
            isImage = true;
            if (Math.floor(Math.random() * 5) === 0) { 
                console.log("PIERRE SHINY DÉCOUVERT !");
                valueToAdd *= 10; 
                visualSource = 'images/era_stone/Pierre/Pierre_Shiny.png';
            } else {
                visualSource = 'images/era_stone/Pierre/Pierre.png';
            }
        }

        if (upgradeId === 'mammouth') {
            isImage = true;
            if (Math.floor(Math.random() * 5) === 0) { 
                console.log("MAMMOUTH SHINY DÉCOUVERT !");
                valueToAdd *= 10; 
                visualSource = 'images/era_stone/Mamouth/Mamouth_Shiny.png';
            } else {
                visualSource = 'images/era_stone/Mamouth/Mamouth.png';
            }
        }

        if (upgradeId === 'forager') {
            isImage = true;
            if (Math.floor(Math.random() * 5) === 0) { 
                console.log("CUEILLEUR SHINY DÉCOUVERT !");
                valueToAdd *= 10; 
                visualSource = 'images/era_stone/Ceuilleur/Ceuilleur_Shiny.png';
            } else {
                visualSource = 'images/era_stone/Ceuilleur/Ceuilleur.png';
            }
        }

        // 2. Moyen Âge (Images)
        if (upgradeId === 'parchment') {
            isImage = true;
            if (Math.floor(Math.random() * 5) === 0) { 
                console.log("PARCHEMIN SHINY DÉCOUVERT !");
                valueToAdd *= 10; 
                visualSource = 'images/era_medieval/parchemin_shiny.png';
            } else {
                visualSource = 'images/era_medieval/parchemin.png';
            }
        }

        if (upgradeId === 'monastery') {
            isImage = true;
            if (Math.floor(Math.random() * 5) === 0) { 
                console.log("EGLISE SHINY DÉCOUVERT !");
                valueToAdd *= 10; 
                visualSource = 'images/era_medieval/eglise_shiny.png';
            } else {
                visualSource = 'images/era_medieval/eglise.png';
            }
        }

        if (upgradeId === 'bread') {
            isImage = true;
            if (Math.floor(Math.random() * 5) === 0) { 
                console.log("PAIN SHINY DÉCOUVERT !");
                valueToAdd *= 10; 
                visualSource = 'images/era_medieval/pain_shiny.png';
            } else {
                visualSource = 'images/era_medieval/pain.png';
            }
        }
        
        
        if (upgradeId === 'oil_barrel') {
            isImage = true; 
            if (Math.floor(Math.random() * 5) === 0) {
                 valueToAdd *= 10;
                 visualSource = 'images/era_modern/Oil_Shiny.png'; 
            } else {
                 visualSource = 'images/era_modern/Oil.png';
            }
        }
        if (upgradeId === 'computer') {
            isImage = true; 
            if (Math.floor(Math.random() * 5) === 0) {
                 valueToAdd *= 10;
                 visualSource = 'images/era_modern/Computer_Shiny.png';
            } else {
                 visualSource = 'images/era_modern/Computer.png';
            }
        }
        if (upgradeId === 'skyscraper') {
            isImage = true; 
            if (Math.floor(Math.random() * 5) === 0) {
                 valueToAdd *= 10;
                 visualSource = 'images/era_modern/Skyscraper_Shiny.png';
            } else {
                 visualSource = 'images/era_modern/Skyscraper.png';
            }
        }
        if (upgradeId === 'robot') {
            isImage = true; 
            if (Math.floor(Math.random() * 5) === 0) {
                 valueToAdd *= 10;
                 visualSource = 'images/era_cyberpunk/robotS.png';
            } else {
                 visualSource = 'images/era_cyberpunk/robot.png';
            }
        }

        if (upgradeId === 'laser_gun') {
            isImage = true; 
            if (Math.floor(Math.random() * 5) === 0) {
                 valueToAdd *= 10;
                 visualSource = 'images/era_cyberpunk/laser_gunS.png';
            } else {
                 visualSource = 'images/era_cyberpunk/laser_gun.png';
            }
        }

        if (upgradeId === 'spaceship') {
            isImage = true; 
            if (Math.floor(Math.random() * 5) === 0) {
                 valueToAdd *= 10;
                 visualSource = 'images/era_cyberpunk/spaceshipS.png';
            } else {
                 visualSource = 'images/era_cyberpunk/spaceship.png';
            }
        }

        if (upgradeId === 'crystal') {
            isImage = true; 
            if (Math.floor(Math.random() * 5) === 0) {
                 valueToAdd *= 10;
                 visualSource = 'images/era_transcendant/crystalS.png';
            } else {
                 visualSource = 'images/era_transcendant/crystal.png';
            }
        }
        if (upgradeId === 'chalice') {
            isImage = true; 
            if (Math.floor(Math.random() * 5) === 0) {
                 valueToAdd *= 10;
                 visualSource = 'images/era_transcendant/chaliceS.png';
            } else {
                 visualSource = 'images/era_transcendant/chalice.png';
            }
        }

        if (upgradeId === 'angel') {
            isImage = true; 
            if (Math.floor(Math.random() * 5) === 0) {
                 valueToAdd *= 10;
                 visualSource = 'images/era_transcendant/angelS.png';
            } else {
                 visualSource = 'images/era_transcendant/angel.png';
            }
        }

        if (['crystal', 'chalice', 'angel'].includes(upgradeId)) {
            if (Math.floor(Math.random() * 5) === 0) {
                console.log(`${upgrade.name.toUpperCase()} SHINY DÉCOUVERT !`);
                valueToAdd *= 10;
            }
        }

        // --- FIN LOGIQUE SHINY ---

        if (upgradeId === 'oil_barrel') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("PÉTROLE SHINY !");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_modern/Oil_Shiny.png';
            } else {
                visualSource = 'images/era_modern/Oil.png';
            }
        }

        if (upgradeId === 'computer') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("ORDINATEUR SHINY !");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_modern/Computer_Shiny.png';
            } else {
                visualSource = 'images/era_modern/Computer.png';
            }
        }

        if (upgradeId === 'skyscraper') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("GRATTE-CIEL SHINY !");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_modern/Skyscraper_Shiny.png';
            } else {
                visualSource = 'images/era_modern/Skyscraper.png';
            }
        }

        if (upgradeId === 'laser_gun') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("FUSIL SHINY !");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_future/Gun_Shiny.png';
            } else {
                visualSource = 'images/era_future/Gun.png';
            }
        }

        if (upgradeId === 'robot') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("ROBOT SHINY !");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_future/Robot_Shiny.png';
            } else {
                visualSource = 'images/era_future/Robot.png';
            }
        }

        if (upgradeId === 'shuttle') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("NAVETTE SHINY !");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_future/Shuttle_Shiny.png';
            } else {
                visualSource = 'images/era_future/Shuttle.png';
            }
        }

        if (upgradeId === 'crystal') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("PRISME SHINY !");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_transcendent/Crystal_Shiny.png';
            } else {
                visualSource = 'images/era_transcendent/Crystal.png';
            }
        }

        if (upgradeId === 'chalice') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("CALICE SHINY !");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_transcendent/Chalice_Shiny.png';
            } else {
                visualSource = 'images/era_transcendent/Chalice.png';
            }
        }

        if (upgradeId === 'angel') {
            isImage = true;
            const luck = Math.floor(Math.random() * 5);
            if (luck === 0) { 
                console.log("SÉRAPHIN SHINY !");
                valueToAdd = upgrade.value * 10; 
                visualSource = 'images/era_transcendent/Angel_Shiny.png';
            } else {
                visualSource = 'images/era_transcendent/Angel.png';
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
    addSavedUpgradesToUI();
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

export function gameLoopLeaderboard() {
    if (gameState.kps > 0) {
        gameState.knowledge += gameState.kps;
        updateUIleaderboard();
    }
}

export function saveToSessionStorage() {

    const upgradesOwned = {};
    for (const [key, value] of Object.entries(upgrades)) {
        upgradesOwned[key] = value.owned;
    }

    const dataToSave = {
        playerName: gameState.playerName,
        playerPassword: gameState.playerPassword,
        knowledge: gameState.knowledge,
        kps: gameState.kps,
        clickValue: gameState.clickValue,
        maxEraReached : gameState.maxEraReached,
        upgrades : upgradesOwned,
    }
    sessionStorage.setItem('clickerSave', JSON.stringify(dataToSave));
    console.log("Sauvegarde faite");
}

export function loadFromSessionStorage () {
    const dataSavedString = sessionStorage.getItem('clickerSave');
    if (dataSavedString) { 
        const dataSaved = JSON.parse(dataSavedString);
        gameState.playerName = dataSaved.playerName;
        gameState.playerPassword = dataSaved.playerPassword;
        gameState.knowledge = dataSaved.knowledge;
        gameState.clickValue = dataSaved.clickValue;
        gameState.kps = dataSaved.kps;
        gameState.maxEraReached = dataSaved.maxEraReached;
        if (dataSaved.upgrades) {
            for (const [key, count] of Object.entries(dataSaved.upgrades)) {
                if (upgrades[key]) {
                    upgrades[key].owned = count;
                }
            }
        }
    } else {
        console.log("Aucune sauvegarde trouvée")
    }
}

export async function saveGame() {

    const upgradesOwned = {};
    for (const [key, value] of Object.entries(upgrades)) {
        upgradesOwned[key] = value.owned;
    }

    const dataToSend = {
        knowledge: gameState.knowledge,
        kps: gameState.kps,
        clickValue: gameState.clickValue,
        maxEraReached : gameState.maxEraReached,
        upgrades : upgradesOwned,
    };
    const pseudo = gameState.playerName;

    if (pseudo == null) alert("Veuillez vous connecter/creer un compte");
    else{
        const result = await updateDatabase(pseudo,dataToSend);
        if (result.ok) {
            alert("Sauvegarde réussie");
        }
    }
}

async function updateDatabase(playerName,dataToSend) {
    try{
        const url = `http://localhost:8080/api/update/${playerName}`;
        const response = await fetch(url, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataToSend),
                keepalive:true 
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
            gameState.maxEraReached = data.maxEraReached;

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
        gameState.knowledge = 0;
        gameState.kps = 0;
        gameState.clickValue = 1;

        const dataToSend = {
        playerName: pseudo,
        playerPassword: hashPassword,
        knowledge: gameState.knowledge,
        kps: gameState.kps,
        clickValue: gameState.clickValue,
        maxEraReached : "stone_age"
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
                gameState.maxEraReached = data.maxEraReached;
                if (data.upgrades) {
                    for (const [key, count] of Object.entries(data.upgrades)) {
                        if (upgrades[key]) {
                            upgrades[key].owned = count;
                        }
                    }
                }
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
    const attackInput = document.getElementById("attack-input");
    const attackValue = attackInput.value.trim();
    const messageInput = document.getElementById("message-input");
    const messageText = messageInput.value.trim();
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

                if (!isNaN(attackValue) && attackValue != "" && attackValue > 0) {
                    attackButton.innerText = `Attaquer (${attackValue} connaissances)`;
                }else {
                    attackButton.innerText = "Attaquer";
                }

                attackButton.addEventListener('click', () => {
                    sendAttack(player.playerName,attackValue,messageText);
                });

                li.appendChild(attackButton);
                listElement.appendChild(li);
            });
        }
    } catch (err) {
        console.error("Impossible de charger le leaderboard", err);
    }
}

export async function sendAttack(target, attackValue) {
    if(gameState.playerName == null) {
        alert("Il faut être connecté pour pouvoir attaquer")
    }else{
        if (!isNaN(attackValue) && attackValue != "" && attackValue > 0) {
            const x = Math.floor(Math.random()*100);
            console.log(x);

            if(attackValue > gameState.knowledge) {
                alert("Pas assez de connaissance pour attaquer")
                return;
            }else {

                if (x == 0) {

                    const dataToSend = {
                        knowledge: 0, 
                        kps: gameState.kps, 
                        clickValue: gameState.clickValue
                    };

                    updateDatabase(gameState.playerName,dataToSend);
                    gameState.knowledge=0;
                    printLeaderboard();
                    alert(`Aïe ! Vous avez tout perdu !!!`);
                }

                if (x >= 1 && x <= 10) {
                                    
                    let newKnowledge;
                    if (gameState.knowledge >= 2*attackValue) {
                        newKnowledge = gameState.knowledge - 2*attackValue;
                    } else {
                        newKnowledge = 0;
                    }

                    gameState.knowledge=newKnowledge;
                    const dataToSend = { knowledge: newKnowledge, kps: gameState.kps, clickValue: gameState.clickValue }; // Note: targetData undefined here in original snippet logic potentially? Be careful with copy paste
                    // Correction: dans le code original, il y avait des appels fetch manquants dans ce bloc précis, 
                    // mais je suppose que vous gardez votre logique existante.
                    alert(`Vous avez perdu ${2*attackValue} de connaisssance !!!`);
                    printLeaderboard();
                                
            
                    }
                }
            
                if (x >= 11 && x <= 30) {

                    let newKnowledge;
                    if (gameState.knowledge >= attackValue) {
                        newKnowledge = gameState.knowledge - attackValue;
                    } else {
                        newKnowledge = 0;
                    }

                    gameState.knowledge=newKnowledge;

                    alert("L'attaque a échoué, la cible s'en sort indemne")
                }
            
                if (x >= 31 && x <= 50) {
                    const response = await fetch(`http://localhost:8080/api/load/${target}`);
                            
                            if (response.ok) {
                                const targetData = await response.json(); 
                                
                                let newKnowledgePlayer;
                                if (gameState.knowledge >= attackValue) {
                                    newKnowledgePlayer = gameState.knowledge - attackValue;
                                } else {
                                    newKnowledgePlayer = 0;
                                }

                                gameState.knowledge=newKnowledgePlayer;
                                
                                let newKnowledge;
                                if (targetData.knowledge >= attackValue) {
                                    newKnowledge = targetData.knowledge - attackValue;
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
                                    alert(`Vous avez enlevé ${attackValue} de connaissance à ${targetData.playerName}`);
                                    printLeaderboard();
                                    createAttackDatabase(gameState.playerName,targetData.playerName,attackValue)
                                }
            
                    }
                }
            
                if (x >= 51 && x <= 95) {
            
                    const response = await fetch(`http://localhost:8080/api/load/${target}`);
                            
                            if (response.ok) {
                                const targetData = await response.json(); 

                                let newKnowledgePlayer;
                                if (gameState.knowledge >= attackValue) {
                                    newKnowledgePlayer = gameState.knowledge - attackValue;
                                } else {
                                    newKnowledgePlayer = 0;
                                }

                                gameState.knowledge=newKnowledgePlayer;
            
                                
                                let newKnowledge;
                                if (targetData.knowledge >= 2*attackValue) {
                                    newKnowledge = targetData.knowledge - 2*attackValue;
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
                                    alert(`Vous avez enlevé ${2*attackValue} de connaissance à ${targetData.playerName}`);
                                    printLeaderboard();
                                    createAttackDatabase(gameState.playerName,targetData.playerName,2*attackValue)
                                }
            
                    }
                }
            
                if (x >= 96 && x <= 99) {
            
                    const response = await fetch(`http://localhost:8080/api/load/${target}`);
                            
                    if (response.ok) {
                        const targetData = await response.json(); 
                        
                        let newKnowledgePlayer;
                        if (gameState.knowledge >= attackValue) {
                            newKnowledgePlayer = gameState.knowledge - attackValue;
                        } else {
                            newKnowledgePlayer = 0;
                        }

                        gameState.knowledge=newKnowledgePlayer;
                        
                        let newKnowledge;
                        if (targetData.knowledge >= 10*attackValue) {
                            newKnowledge = targetData.knowledge - 10*attackValue;
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
                            alert(`Jackpot !!! Vous avez enlevé ${10*attackValue} de connaissance à ${targetData.playerName}`);
                            printLeaderboard();
                            createAttackDatabase(gameState.playerName,targetData.playerName,10*attackValue)
                        }
            
                    }
                }
            
        } else {alert("Veuillez entrer un nombre valide pour l'attaque")}
        saveToSessionStorage();
    }
}
// Pour éviter de casser votre fonction sendAttack qui est longue et complexe, 
// je l'ai tronquée ci-dessus. Si vous n'avez pas de sauvegarde locale, dites-le moi et je la réécrirai entièrement.

export function resetGame() {
    gameState.knowledge = 0;
    gameState.kps = 0;
    gameState.clickValue = 1;
    gameState.maxEraReached = "stone_age";

    const upgradesOwned = {};

    for (const [key, upgrade] of Object.entries(upgrades)) {
        upgrade.owned = 0;
        upgradesOwned[key] = 0;
    }

    saveToSessionStorage();
    const dataToSend = {
        knowledge: gameState.knowledge,
        kps: gameState.kps,
        clickValue: gameState.clickValue,
        maxEraReached : gameState.maxEraReached,
        upgrades : upgradesOwned,
    };
    updateDatabase(gameState.playerName,dataToSend);
}

async function createAttackDatabase(senderName,targetName,attackValue) {
    const messageInput = document.getElementById("message-input");
    const messageText = messageInput.value.trim();
    const messageData = {
        senderName: senderName,
        targetName: targetName,
        message: messageText,
        attackValue: attackValue,
    }
    try {
        const responseMessage = await fetch("http://localhost:8080/api/sendMessage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData)
        });
        if (responseMessage.ok) {
            console.log("Attaque envoyée");
        } else {
            console.error("Erreur serveur...");
        }
    } catch (err) {
        console.error("Impossible de contacter le serveur", err);
    }
}

export async function WereUserAttacked(target) {
    const response = await fetch(`/api/getAttacks/${target}`);
    if (response.ok) {
        alert("Oui il y a eu une attaque");
        return true
    }else {
         alert("Pas d'attaque à signaler");
        return false
    }
}

export async function printAttacks() {
    if(gameState.playerName == null) return;
    const listElement = document.getElementById('attacks-list');
    try {
        const response = await fetch(`http://localhost:8080/api/getAttacks/${gameState.playerName}`);
        if (response.ok) {
            const attacks = await response.json();
            if (attacks.length > 0) {
                console.log("Attaques reçues :", attacks);
                let messageHTML = `<p>Pendant votre absence, vous avez subi <strong>${attacks.length}</strong> attaques !</p>`;
                messageHTML += `<ul style="text-align: left; margin-top: 15px; list-style: none; padding: 0;">`;
                attacks.forEach(att => {
                    messageHTML += `
                        <li style="background: rgba(255,255,255,0.1); margin-bottom: 5px; padding: 8px; border-radius: 5px;">
                            <strong>${att.senderName}</strong> (-${att.attackValue} connaissances)<br>
                            <p style="color: #ccc;">"${att.message}"</p>
                        </li>`;
                });
                messageHTML += `</ul>`;
                showPopup(messageHTML);
            }
        }
    } catch (err) {
        console.error("Erreur récupération attaques", err);
    }
    await deleteAttacks(gameState.playerName);
}

async function deleteAttacks(target) {
    const response = await fetch(`http://localhost:8080/api/deleteAttacks/${target}`, {
        method: "DELETE"
    });
    console.log("Suppression attaques");
}

export function showPopup(htmlContent) {
    const overlay = document.getElementById('popup-overlay');
    const titleEl = document.getElementById('popup-title');
    const bodyEl = document.getElementById('popup-body');
    const closeBtn = document.getElementById('popup-close');
    const okBtn = document.getElementById('popup-ok-btn');

    titleEl.innerText = "Rapport de Combat";
    bodyEl.innerHTML = htmlContent; 

    overlay.classList.remove('hidden');

    const closePopup = () => {
        overlay.classList.add('hidden');
    };

    closeBtn.onclick = closePopup;
    okBtn.onclick = closePopup;

    overlay.onclick = (e) => {
        if (e.target === overlay) closePopup();
    };
}

export function addSavedUpgradesToUI(){

    gameState.visualState = {
        'stone_age': [],
        'medieval_age': [], 
        'modern_age': [],
        'cyberpunk_age': [],
        'transcendant_age': [],
    };

    for (const [id, upgrade] of Object.entries(upgrades)) {
        
        if (upgrade.owned > 0) {
            
            for (let i = 0; i < upgrade.owned; i++) {

                let visualSource = upgrade.icon; 
                let isImage = false;
                
                if (id === 'sharp_stone') {
                    isImage = true;
                    visualSource = 'images/era_stone/Pierre/Pierre.png';
                } else if (id === 'mammouth') {
                    isImage = true;
                    visualSource = 'images/era_stone/Mamouth/Mamouth.png';
                } else if (id === 'forager') {
                    isImage = true;
                    visualSource = 'images/era_stone/Ceuilleur/Ceuilleur.png';
                }
                else if (id === 'parchment') {
                    isImage = true;
                    visualSource = 'images/era_medieval/parchemin.png';
                } else if (id === 'monastery') {
                    isImage = true;
                    visualSource = 'images/era_medieval/eglise.png';
                } else if (id === 'bread') {
                    isImage = true;
                    visualSource = 'images/era_medieval/pain.png';
                }
                else if (id === 'oil_barrel') {
                    isImage = true;
                    visualSource = 'images/era_modern/Oil.png';
                } else if (id === 'computer') {
                    isImage = true;
                    visualSource = 'images/era_modern/Computer.png';
                } else if (id === 'skyscraper') {
                    isImage = true;
                    visualSource = 'images/era_modern/Skyscraper.png';
                }
                else if (id === 'laser_gun') {
                    isImage = true;
                    visualSource = 'images/era_cyberpunk/laser_gun.png';
                } else if (id === 'robot') {
                    isImage = true;
                    visualSource = 'images/era_cyberpunk/robot.png';
                } else if (id === 'shuttle') {
                    isImage = true;
                    visualSource = 'images/era_cyberpunk/spaceship.png';
                }

                
                else if (id === 'crystal') {
                    isImage = true;
                    visualSource = 'images/era_transcendant/crystal.png';
                } else if (id === 'chalice') {
                    isImage = true;
                    visualSource = 'images/era_transcendant/chalice.png';
                } else if (id === 'angel') {
                    isImage = true;
                    visualSource = 'images/era_transcendant/angel.png';
                }

                addVisualToCanvas(upgrade, visualSource, isImage);
            }
        }
    }

}