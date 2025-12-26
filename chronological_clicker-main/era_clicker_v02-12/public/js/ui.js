import { gameState, upgrades } from './state.js';
import { ERAS } from './constants.js';
import { formatNumber } from './utils.js';

// Références DOM
const knowledgeDisplay = document.getElementById('knowledge-display');
const kpsDisplay = document.getElementById('kps-display');
const eraDisplay = document.getElementById('era-display');
const clickValueDisplay = document.getElementById('click-value-display');
const mainClickButton = document.getElementById('main-click-button');
const upgradesContainer = document.getElementById('upgrades-container');
const advanceEraButton = document.getElementById('advance-era-button');
const visualCanvas = document.getElementById('visual-canvas');
const prevEraButton = document.getElementById('prev-era-button'); 
const nextEraButton = document.getElementById('next-era-button');
const saveButton = document.getElementById("save-button");
const loadButton = document.getElementById("load-button");

export function renderVisualCanvas() {
    visualCanvas.innerHTML = '';
    const eraVisuals = gameState.visualState[gameState.currentEra];
    
    eraVisuals.forEach(visual => {
        let element;

        if (visual.isImage) {
            element = document.createElement('img');
            element.src = visual.icon; 
            element.className = 'visual-upgrade-icon visual-image';
        } 

        element.title = visual.name;
        element.style.left = `${visual.x}%`;
        element.style.top = `${visual.y}%`;
        element.style.transform = `rotate(${visual.rotation}deg)`;
        
        visualCanvas.appendChild(element);
    });
}

export function addVisualToCanvas(upgrade, visualSource, isImage) {
    const finalIcon = visualSource || upgrade.icon;
    const finalIsImage = isImage || false;

    if (!finalIcon) return;

    let minX = 10, maxX = 90;
    let minY = 10, maxY = 90;

    if (gameState.currentEra === 'stone_age') {

        if (upgrade.name === 'Pierre taillée') {
            minX = 3;  maxX = 30;
            minY = 15; maxY = 40;
        } 
        else if (upgrade.name === 'Mammouth') {
            minX = 60; maxX = 85;
            minY = 15; maxY = 50;
        }
        else if (upgrade.name === 'Cueilleur') {
            minX = 5;  maxX = 85;
            minY = 60; maxY = 80;
        }
        else {
            minX = 20; maxX = 80;
            minY = 20; maxY = 80;
        }
    }

    // Position aléatoire DANS les limites définies
    const x = Math.random() * (maxX - minX) + minX;
    const y = Math.random() * (maxY - minY) + minY;
    
    gameState.visualState[gameState.currentEra].push({
        icon: finalIcon,
        name: upgrade.name,
        x: x,
        y: y,
        isImage: finalIsImage
    });
    
    renderVisualCanvas();
}

export function updateUI() {
    knowledgeDisplay.innerText = formatNumber(gameState.knowledge);
    kpsDisplay.innerText = formatNumber(gameState.kps);
    clickValueDisplay.innerText = formatNumber(gameState.clickValue);

    const currentEraData = ERAS[gameState.currentEra];
    eraDisplay.innerText = currentEraData.name;
    
    // On met à jour le texte sous le bouton principal au lieu du bouton lui-même
    // car le bouton est devenu une image vide
    const actionLabel = document.getElementById('action-label');
    if (actionLabel) {
        actionLabel.innerText = currentEraData.clickerText;
    }
    
    document.body.className = `era-${gameState.currentEra}`;

    // Bouton avancer
    if (gameState.currentEra === gameState.maxEraReached && currentEraData.nextEra) {
        advanceEraButton.style.display = 'block';
        const cost = currentEraData.nextEraCost;
        advanceEraButton.innerText = `Passer à l'Ère : ${ERAS[currentEraData.nextEra].name} (${formatNumber(cost)})`;
        advanceEraButton.disabled = gameState.knowledge < cost;
    } else {
        advanceEraButton.style.display = 'none';
    }

    // Boutons navigation
    prevEraButton.style.display = currentEraData.previousEra ? 'inline-block' : 'none';
    prevEraButton.innerText = `⬅️`;
    nextEraButton.style.display = (currentEraData.nextEra && gameState.currentEra !== gameState.maxEraReached) ? 'inline-block' : 'none';
    nextEraButton.innerText = `➡️`;
    saveButton.innerText = 'Sauvegarder'
    
    // Appel à React
    if (window.renderReactApp) {
        window.renderReactApp(upgrades, gameState.currentEra, gameState.knowledge);
    }
}