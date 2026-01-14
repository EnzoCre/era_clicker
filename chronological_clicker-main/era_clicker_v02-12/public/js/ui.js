import { gameState, upgrades } from './state.js';
import { ERAS } from './constants.js';
import { formatNumber } from './utils.js';

const knowledgeDisplay = document.getElementById('knowledge-display');
const kpsDisplay = document.getElementById('kps-display');
const eraDisplay = document.getElementById('era-display');
const clickValueDisplay = document.getElementById('click-value-display');
const visualCanvas = document.getElementById('visual-canvas');
const prevEraButton = document.getElementById('prev-era-button'); 
const nextEraButton = document.getElementById('next-era-button');
const advanceEraButton = document.getElementById('advance-era-button');
const saveButton = document.getElementById("save-button");

export function renderVisualCanvas() {
    visualCanvas.innerHTML = '';
    const eraVisuals = gameState.visualState[gameState.currentEra];
    
    if (!eraVisuals) return;

    eraVisuals.forEach(visual => {
        let element;

        if (visual.isImage) {
            element = document.createElement('img');
            element.src = visual.icon; 
            element.className = 'visual-upgrade-icon visual-image';
            
            if (visual.size) {
                element.style.width = `${visual.size}px`;
                element.style.height = `${visual.size}px`;
            }

        } else {
            element = document.createElement('div');
            element.innerText = visual.icon;
            element.className = 'visual-upgrade-icon';
            if (visual.size) {
                element.style.fontSize = `${visual.size / 2}px`; 
            }
        }

        element.title = visual.name;
        element.style.left = `${visual.x}%`;
        element.style.top = `${visual.y}%`;
        
        visualCanvas.appendChild(element);
    });
}

export function addVisualToCanvas(upgrade, visualSource, isImage = false) {
    const finalIcon = visualSource || upgrade.icon;
    if (!finalIcon) return;

    const targetEra = upgrade.requiredEra;


    const zones = {
        stone_age: { 
            'Silex Ancestral': [3, 30, 15, 40, 60], 
            'Mammouth Laineux': [60, 85, 15, 50, 120], 
            'Tribu Nomade': [10, 85, 60, 80, 80], 
            def: [20, 80, 20, 80, 90]
        },
        medieval_age: { 
            'Manuscrit Interdit': [3, 30, 15, 40, 60], 
            'Festin des Rois': [60, 85, 15, 30, 40],
            'Abbaye Fortifiée': [15, 75, 60, 80, 150], 
            def: [10, 90, 20, 80, 90]
        },
        modern_age: {
            'Or Noir Raffiné': [60, 85, 15, 30, 40], 
            'Supercalculateur IA': [3, 30, 15, 40, 60],  
            'Mégastructure Urbaine': [15, 75, 60, 80, 150], 
            def: [10, 90, 20, 80, 90]
        },
        cyberpunk_age: {
            'Désintégrateur Plasma': [60, 85, 15, 30, 70],   
            'Nanobots Réplicants': [3, 30, 15, 40, 100],   
            'Croiseur Stellaire': [15, 75, 60, 80, 130], 
            def: [10, 90, 20, 80, 90]
        },
        transcendant_age: {
            'Prisme de Réalité': [60, 85, 15, 30, 60],   
            'Source d\'Immortalité': [3, 30, 15, 40, 100],   
            'Archange Omniscient': [15, 75, 60, 80, 130],  
            def: [10, 90, 20, 80, 90]
        }
    };

    const currentZone = zones[targetEra] || {};
    const config = currentZone[upgrade.name] || currentZone.def || [10, 90, 10, 90, 90];
    
    const [minX, maxX, minY, maxY, size] = config;

    gameState.visualState[targetEra].push({
        icon: finalIcon, 
        name: upgrade.name, 
        isImage,
        x: Math.random() * (maxX - minX) + minX,
        y: Math.random() * (maxY - minY) + minY,
        size: size 
    });

    if (gameState.currentEra == targetEra) {
        renderVisualCanvas();
    }
}

export function updateUI() {
    knowledgeDisplay.innerText = formatNumber(gameState.knowledge);
    kpsDisplay.innerText = formatNumber(gameState.kps);
    clickValueDisplay.innerText = formatNumber(gameState.clickValue);

    const currentEraData = ERAS[gameState.currentEra];
    
    if (!currentEraData) {
        console.error("Erreur critique", gameState.currentEra);
        return;
    }

    eraDisplay.innerText = currentEraData.name;
    
    const actionLabel = document.getElementById('action-label');
    if (actionLabel) {
        actionLabel.innerText = currentEraData.clickerText;
    }
    
    document.body.className = `era-${gameState.currentEra}`;

    if (gameState.currentEra === gameState.maxEraReached && currentEraData.nextEra) {
        advanceEraButton.style.display = 'block';
        const cost = currentEraData.nextEraCost;
        if (ERAS[currentEraData.nextEra]) {
            const nextEraName = ERAS[currentEraData.nextEra].name;
            advanceEraButton.innerText = `Passer à l'Ère : ${nextEraName} (${formatNumber(cost)})`;
            advanceEraButton.disabled = gameState.knowledge < cost;
        }
    } else {
        advanceEraButton.style.display = 'none';
    }

    prevEraButton.style.display = currentEraData.previousEra ? 'inline-block' : 'none';
    prevEraButton.innerText = `⬅️`;
    
    nextEraButton.style.display = (currentEraData.nextEra && gameState.currentEra !== gameState.maxEraReached) ? 'inline-block' : 'none';
    nextEraButton.innerText = `➡️`;
    
    if (window.renderReactApp) {
        window.renderReactApp(upgrades, gameState.currentEra, gameState.knowledge);
    }
}

export function updateUIleaderboard() {
    knowledgeDisplay.innerText = formatNumber(gameState.knowledge);
}