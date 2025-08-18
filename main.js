// main.js

document.addEventListener('DOMContentLoaded', () => {
    // IndexedDB setup
    const DB_NAME = 'PetrolCalculatorDB';
    const STORE_NAME = 'petrolEntries';
    let db;

    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = (event) => {
        console.error('Database error:', event.target.errorCode);
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        objectStore.createIndex('date', 'date', { unique: false });
        console.log('Database setup complete.');
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        console.log('Database opened successfully.');
        loadHistory();
    };

    // Form submission handling
    const form = document.getElementById('calculator-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const mileage = parseFloat(document.getElementById('mileage').value);
        const pumpRon = document.getElementById('pumpRon').value;
        const litersPrice = parseFloat(document.getElementById('litersPrice').value);
        const pumpAmount = parseFloat(document.getElementById('pumpAmount').value);
        const durationDays = parseInt(document.getElementById('durationDays').value);

        // Calculation: (Mileage / (Pump Amount / Liters per RM))
        // or more simply: (Mileage / Liters) * (Liters / RM)
        const totalLiters = pumpAmount / litersPrice;
        const kmPerRM = mileage / pumpAmount;

        // Display results
        const resultsEl = document.getElementById('results');
        const kmPerRmEl = document.getElementById('km-per-rm');
        const resultsDetailsEl = document.getElementById('results-details');

        kmPerRmEl.textContent = `${kmPerRM.toFixed(2)} KM per RM`;
        resultsDetailsEl.textContent = `Based on a ${mileage} KM trip, using ${totalLiters.toFixed(2)} liters of ${pumpRon} at RM${litersPrice.toFixed(2)} per liter, for RM${pumpAmount.toFixed(2)} over ${durationDays} days.`;
        resultsEl.style.display = 'block';

        // Save to IndexedDB
        saveEntry({
            date: new Date().toISOString().slice(0, 10),
            mileageReading: mileage,
            fuelType: pumpRon,
            litersPrice: litersPrice,
            pumpAmount: pumpAmount,
            durationDays: durationDays,
            kmPerRM: kmPerRM.toFixed(2)
        });

        // Reset form
        form.reset();
    });

    // Save an entry to the database
    function saveEntry(entry) {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.add(entry);

        request.onsuccess = () => {
            console.log('Entry added successfully.');
            loadHistory(); // Reload history after saving
        };

        request.onerror = (event) => {
            console.error('Error adding entry:', event.target.error);
        };
    }

    // Load and display history
    function loadHistory() {
        const historyBody = document.getElementById('history-body');
        historyBody.innerHTML = ''; // Clear existing history
        
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.getAll();

        request.onsuccess = (event) => {
            let entries = event.target.result;
            // Display only the last 10 entries
            entries.slice(-10).reverse().forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-3 py-2 whitespace-nowrap">${entry.date}</td>
                    <td class="px-3 py-2 whitespace-nowrap">${entry.fuelType}</td>
                    <td class="px-3 py-2 whitespace-nowrap">RM${entry.litersPrice}</td>
                    <td class="px-3 py-2 whitespace-nowrap">${entry.kmPerRM}</td>
                `;
                historyBody.appendChild(row);
            });
        };
    }

    // Reset History Button
    const resetBtn = document.getElementById('reset-history');
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all history? This cannot be undone.')) {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(STORE_NAME);
            const clearRequest = objectStore.clear();
            
            clearRequest.onsuccess = () => {
                console.log('History cleared successfully.');
                loadHistory(); // Reload to show empty table
            };
        }
    });

    // View All History Button (Placeholder for future functionality)
    const viewAllBtn = document.getElementById('view-all-history');
    viewAllBtn.addEventListener('click', () => {
        alert('This feature will display your full history on a separate page.');
    });

});