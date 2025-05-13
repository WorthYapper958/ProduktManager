const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Ermittle das aktuelle Verzeichnis der JS-Datei
const BASE_DIR = path.dirname(__filename);
const PRODUKTLISTE_DIR = path.join(BASE_DIR, 'Produktliste');

// Stelle sicher, dass der Produktliste-Ordner existiert
if (!fs.existsSync(PRODUKTLISTE_DIR)) {
    fs.mkdirSync(PRODUKTLISTE_DIR, { recursive: true });
}

const BOOKS_FILE_PATH = path.join(PRODUKTLISTE_DIR, 'buecher.json');
const FOOD_FILE_PATH = path.join(PRODUKTLISTE_DIR, 'lebensmittel.json');

// Stelle sicher, dass die JSON-Dateien existieren
if (!fs.existsSync(BOOKS_FILE_PATH)) {
    fs.writeFileSync(BOOKS_FILE_PATH, '[]', 'utf8');
}
if (!fs.existsSync(FOOD_FILE_PATH)) {
    fs.writeFileSync(FOOD_FILE_PATH, '[]', 'utf8');
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function saveToJson(filePath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 4), (err) => {
            if (err) {
                console.error("Fehler beim Speichern der Datei:", err);
                reject(err);
            } else {
                console.log("Daten wurden erfolgreich gespeichert.\n");
                resolve();
            }
        });
    });
}

function loadFromJson(filePath) {
    if (fs.existsSync(filePath)) {
        const rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    }
    return [];
}

function convertToFloat(input) {
    return input.replace(',', '.').trim();
}

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createNutritionTable() {
    const hatNaehrwerte = (await askQuestion("Sind Nährwerte auf dem Produkt angegeben? (ja oder nein): ")).toLowerCase().trim();
    if (hatNaehrwerte !== "ja") return {};

    let nutritionTable = {};

    for (const menge of ["100ml/g", "250ml/g"]) {
        console.log(`\nGeben Sie die Nährwerte pro ${menge} ein:`);

        const kJ = parseFloat(convertToFloat(await askQuestion("Brennwert (kJ): ")));
        const kcal = parseFloat(convertToFloat(await askQuestion("Brennwert (kcal): ")));
        const fett = parseFloat(convertToFloat(await askQuestion("Fett (g): ")));
        const gesFett = parseFloat(convertToFloat(await askQuestion("davon gesättigte Fettsäuren (g): ")));
        const kh = parseFloat(convertToFloat(await askQuestion("Kohlenhydrate (g): ")));
        const zucker = parseFloat(convertToFloat(await askQuestion("davon Zucker (g): ")));
        const ballaststoffe = parseFloat(convertToFloat(await askQuestion("Ballaststoffe (g): ")));
        const eiweiss = parseFloat(convertToFloat(await askQuestion("Eiweiß (g): ")));
        const salz = parseFloat(convertToFloat(await askQuestion("Salz (g): ")));

        nutritionTable[menge] = {
            "Brennwert": { "kJ": kJ, "kcal": kcal },
            "Fett": fett,
            "davon gesättigte Fettsäuren": gesFett,
            "Kohlenhydrate": kh,
            "davon Zucker": zucker,
            "Ballaststoffe": ballaststoffe,
            "Eiweiß": eiweiss,
            "Salz": salz
        };
    }

    // Mineralstoffe
    const mineralienAntwort = (await askQuestion("\nSind Mineralstoffe auf dem Produkt angegeben? (ja oder nein): ")).toLowerCase().trim();
    if (mineralienAntwort === "ja") {
        let mineralstoffe = {};
        console.log("Geben Sie die Mineralstoffe einzeln ein. Drücken Sie Enter ohne Eingabe, um die Eingabe zu beenden:");
        while (true) {
            const name = await askQuestion("Mineralstoff: ");
            if (name.trim() === "") break;
            const menge = parseFloat(convertToFloat(await askQuestion(`Menge von ${name} (nur Zahl): `)));
            const einheit = await askQuestion(`Einheit für ${name} (mg oder µg): `);
            mineralstoffe[name] = `${menge} ${einheit}`;
        }
        nutritionTable["Mineralstoffe"] = mineralstoffe;
    }

    // Vitamine
    const vitamineAntwort = (await askQuestion("\nSind Vitamine auf dem Produkt angegeben? (ja oder nein): ")).toLowerCase().trim();
    if (vitamineAntwort === "ja") {
        let vitamine = {};
        console.log("Geben Sie die Vitamine einzeln ein. Drücken Sie Enter ohne Eingabe, um die Eingabe zu beenden:");
        while (true) {
            const name = await askQuestion("Vitamin: ");
            if (name.trim() === "") break;
            const menge = parseFloat(convertToFloat(await askQuestion(`Menge von ${name} (nur Zahl): `)));
            const einheit = await askQuestion(`Einheit für ${name} (mg oder µg): `);
            vitamine[name] = `${menge} ${einheit}`;
        }
        nutritionTable["Vitamine"] = vitamine;
    }

    return nutritionTable;
}

async function main() {
    while (true) {
        console.log("0 = Beenden");
        console.log("1 = Buch");
        console.log("2 = Lebensmittel/Getränk");
        const productType = await askQuestion("Geben Sie eine Zahl ein: ");

        if (productType === "0") {
            console.log("Programm beendet.");
            rl.close();
            break;
        }

        if (productType === "1") {
            let book = {};

            console.log("Geben Sie die Informationen ein (mit ? überspringen):");

            const titel = await askQuestion("Titel: ");
            if (titel !== "?") book["Titel"] = titel;

            const band = await askQuestion("Band: ");
            if (band !== "?") book["Band"] = band;

            const autor = await askQuestion("Autor: ");
            if (autor !== "?") book["Autor"] = autor;

            const verlag = await askQuestion("Verlag: ");
            if (verlag !== "?") book["Verlag"] = verlag;

            const genre = await askQuestion("Genre: ");
            if (genre !== "?") book["Genre"] = genre;

            const jahr = await askQuestion("Erscheinungsjahr: ");
            if (jahr !== "?") book["Erscheinungsjahr"] = parseInt(jahr);

            const sprache = await askQuestion("Sprache: ");
            if (sprache !== "?") book["Sprache"] = sprache;

            const isbn = await askQuestion("ISBN: ");
            if (isbn !== "?") book["ISBN"] = isbn;

            const preis = await askQuestion("Original-Preis (in €): ");
            if (preis !== "?") book["Original-Preis"] = parseFloat(convertToFloat(preis));

            let books = loadFromJson(BOOKS_FILE_PATH);
            books.push(book);
            books.sort((a, b) => (a.Titel || "").localeCompare(b.Titel || ""));
            await saveToJson(BOOKS_FILE_PATH, books);
        } else if (productType === "2") {
            const art = await askQuestion("Handelt es sich um ein Lebensmittel (1) oder ein Getränk (2)? ");
            if (art !== "1" && art !== "2") {
                console.log("Ungültige Eingabe!\n");
                continue;
            }
        
            let foods = loadFromJson(FOOD_FILE_PATH);
            let food = {
                "Kategorie": "Lebensmittel/Getränk",
                "Art des Produktes": art === "1" ? "Lebensmittel" : "Getränk",
                "Maßeinheit": art === "1" ? "Kilogramm" : "Liter"
            };
        
            console.log("Geben Sie die Informationen ein (mit ? überspringen):");
        
            const marke = await askQuestion("Markenname: ");
            if (marke !== "?") food["Markenname"] = marke;
        
            const bezeichnung = await askQuestion("Verkehrsbezeichnung: ");
            if (bezeichnung !== "?") food["Verkehrsbezeichnung"] = bezeichnung;
        
            const menge = await askQuestion(`Gewicht/Füllmenge (in ${food["Maßeinheit"]}): `);
            if (menge !== "?") food["Gewicht/Füllmenge"] = parseFloat(convertToFloat(menge));            
        
            let zutatenListe = [];
            console.log("Geben Sie die Zutaten einzeln ein. Drücken Sie Enter ohne Eingabe, um die Eingabe zu beenden:");
            while (true) {
                const zutat = await askQuestion("Zutat: ");
                if (zutat.trim() === "") break;
                if (zutat !== "?") {
                    zutatenListe.push(zutat.trim());
                }
            }
            if (zutatenListe.length > 0) {
                food["Zutaten"] = zutatenListe;
            }            
        
            const nutritionTable = await createNutritionTable();
            food["Nährwerttabelle"] = nutritionTable;
        
            const hersteller = await askQuestion("Herstellungsunternehmen (bei mehreren durch ; trennen): ");
            if (hersteller !== "?") {
                const unternehmen = hersteller.split(";").map(firma => firma.trim()).filter(firma => firma.length > 0);
                food["Herstellungsunternehmen"] = unternehmen;
            }            
        
            const strichcode = await askQuestion("Strichcode: ");
            if (strichcode !== "?") food["Strichcode"] = strichcode;
        
            if (art === "2") { // Nur bei Getränken
                const pfand = await askQuestion("Pfand vorhanden? (ja oder nein): ");
                if (pfand !== "?") {
                    food["Pfand vorhanden"] = pfand;
                    if (pfand.toLowerCase() === "ja") {
                        const pfandWert = await askQuestion("Pfand-Wert (in €): ");
                        if (pfandWert !== "?") food["Pfand-Wert"] = parseFloat(convertToFloat(pfandWert));
                    }
                }
            }            
        
            let nutriScore;
            while (true) {
                nutriScore = (await askQuestion("Nutri-Score (A, B, C, D oder E): ")).toUpperCase().trim();
                if (["A", "B", "C", "D", "E", "?", ""].includes(nutriScore)) break;
                console.log("Ungültige Eingabe. Bitte geben Sie A, B, C, D, E oder ? ein.");
            }
            if (["A", "B", "C", "D", "E"].includes(nutriScore)) {
                food["Nutri-Score"] = nutriScore;
            }
                        
            foods.push(food);
            foods.sort((a, b) => (a["Markenname"] || "").localeCompare(b["Markenname"] || ""));
            await saveToJson(FOOD_FILE_PATH, foods);
        }               
        else {
            console.log("Ungültige Eingabe.\n");
        }
    }
}

main().catch(err => console.error("Fehler:", err));
